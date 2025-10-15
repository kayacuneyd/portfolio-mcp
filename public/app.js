class InteractivePortfolio {
    constructor() {
        this.config = null;
        this.isLoading = false;
        this.currentLanguage = 'tr';
        
        this.init();
    }

    async init() {
        try {
            await this.loadBootstrap();
            this.setupEventListeners();
            this.updateWelcomeTime();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.');
        }
    }

    async loadBootstrap() {
        try {
            const response = await fetch('/api/bootstrap');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.config = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Bootstrap loading error:', error);
            throw error;
        }
    }

    updateUI() {
        if (!this.config) return;

        // Update profile card
        this.updateElement('profileName', this.config.profile.name);
        this.updateElement('profileTitle', this.config.profile.title);
        
        // Update profile image if available
        if (this.config.profile.profile_image) {
            const profileImage = document.getElementById('profileImage');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            if (profileImage && avatarPlaceholder) {
                profileImage.src = this.config.profile.profile_image;
                profileImage.style.display = 'block';
                avatarPlaceholder.style.display = 'none';
            }
        }

        // Update suggested commands
        this.updateSuggestedCommands(this.config.prompts);

        // Update theme
        this.updateTheme(this.config.theme);
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    updateSuggestedCommands(prompts) {
        const container = document.getElementById('suggestedCommands');
        const scrollContainer = container.querySelector('.commands-scroll');
        
        scrollContainer.innerHTML = '';
        
        prompts.forEach((prompt, index) => {
            const chip = document.createElement('div');
            chip.className = 'command-chip';
            chip.textContent = prompt;
            chip.addEventListener('click', () => this.selectCommand(prompt));
            scrollContainer.appendChild(chip);
        });
    }

    updateTheme(theme) {
        if (theme.colors) {
            const root = document.documentElement;
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value);
            });
        }
    }

    selectCommand(text) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value = text;
        messageInput.focus();
        this.updateSendButton();
    }

    setupEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', () => this.updateSendButton());
        messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Send button
        const sendButton = document.getElementById('sendButton');
        sendButton.addEventListener('click', () => this.sendMessage());

        // Lead form
        const leadForm = document.getElementById('leadForm');
        leadForm.addEventListener('submit', (e) => this.handleLeadSubmit(e));

        // Modal controls
        const leadModal = document.getElementById('leadModal');
        const modalClose = document.getElementById('modalClose');
        const privacyModal = document.getElementById('privacyModal');
        const privacyModalClose = document.getElementById('privacyModalClose');
        const privacyLink = document.getElementById('privacyLink');

        modalClose.addEventListener('click', () => this.closeModal(leadModal));
        privacyModalClose.addEventListener('click', () => this.closeModal(privacyModal));
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal(privacyModal);
        });

        // Close modal on backdrop click
        [leadModal, privacyModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const hasText = messageInput.value.trim().length > 0;
        
        sendButton.disabled = !hasText || this.isLoading;
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.isLoading && e.target.value.trim()) {
                this.sendMessage();
            }
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isLoading) return;

        // Clear input and disable send button
        messageInput.value = '';
        this.updateSendButton();
        this.isLoading = true;

        // Add user message to UI
        this.addMessage('user', message);

        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message,
                    lang: this.currentLanguage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // Add assistant response
            this.addMessage('assistant', data.text);

            // Handle lead request
            if (data.leadRequested) {
                this.openLeadModal(data.leadData || {});
            }

        } catch (error) {
            console.error('Send message error:', error);
            this.addMessage('assistant', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            this.isLoading = false;
            this.updateSendButton();
        }
    }

    addMessage(type, content) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Handle long messages with expand/collapse
        if (content.length > 300) {
            const shortContent = content.substring(0, 300) + '...';
            const fullContent = content;
            
            const shortSpan = document.createElement('span');
            shortSpan.className = 'short-content';
            shortSpan.textContent = shortContent;
            
            const fullSpan = document.createElement('span');
            fullSpan.className = 'full-content';
            fullSpan.style.display = 'none';
            fullSpan.textContent = fullContent;
            
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.textContent = 'Devamını göster';
            expandBtn.onclick = function() {
                shortSpan.style.display = 'none';
                fullSpan.style.display = 'inline';
                this.style.display = 'none';
            };
            
            contentDiv.appendChild(shortSpan);
            contentDiv.appendChild(fullSpan);
            contentDiv.appendChild(expandBtn);
        } else {
            contentDiv.textContent = content;
        }

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(new Date());

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    openLeadModal(data = {}) {
        const modal = document.getElementById('leadModal');
        
        // Pre-fill form if data provided
        if (data.topic) {
            document.getElementById('leadTopic').value = data.topic;
        }
        if (data.message) {
            document.getElementById('leadMessage').value = data.message;
        }

        this.openModal(modal);
    }

    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input if it's the lead modal
        if (modal.id === 'leadModal') {
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear form if it's the lead modal
        if (modal.id === 'leadModal') {
            document.getElementById('leadForm').reset();
        }
    }

    async handleLeadSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const leadData = {
            name: formData.get('name') || undefined,
            email: formData.get('email'),
            topic: formData.get('topic') || undefined,
            message: formData.get('message') || undefined
        };

        try {
            const response = await fetch('/api/lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.closeModal(document.getElementById('leadModal'));
            this.addMessage('assistant', 'Teşekkürler! Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağım.');

        } catch (error) {
            console.error('Lead submission error:', error);
            alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    showError(message) {
        this.addMessage('assistant', `Hata: ${message}`);
    }

    updateWelcomeTime() {
        const welcomeTime = document.getElementById('welcomeTime');
        if (welcomeTime) {
            welcomeTime.textContent = this.formatTime(new Date());
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InteractivePortfolio();
    
    // Setup textarea auto-resize
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', autoResizeTextarea);
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    // Could show a notification to user
});
