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
            const chip = document.createElement('button');
            chip.className = 'command-chip';
            chip.textContent = prompt;
            chip.setAttribute('role', 'button');
            chip.setAttribute('aria-label', `Hazır komut: ${prompt}`);
            chip.setAttribute('tabindex', '0');
            
            // Click handler
            chip.addEventListener('click', () => this.selectCommand(prompt));
            
            // Keyboard handler
            chip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectCommand(prompt);
                }
            });
            
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
        
        // Announce to screen readers
        this.announceToScreenReader(`Seçilen komut: ${text}`);
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    setupEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', () => this.updateSendButton());
        messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Send button
        const sendButton = document.getElementById('sendButton');
        sendButton.addEventListener('click', () => this.sendMessage());
        
        // Keyboard support for send button
        sendButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));

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

        // Escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (leadModal.classList.contains('active')) {
                    this.closeModal(leadModal);
                }
                if (privacyModal.classList.contains('active')) {
                    this.closeModal(privacyModal);
                }
            }
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

    handleGlobalKeyDown(e) {
        // Focus message input with Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const messageInput = document.getElementById('messageInput');
            messageInput.focus();
            this.announceToScreenReader('Mesaj yazma alanına odaklandı');
        }
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
        const loadingIndicator = document.getElementById('loading-indicator');
        
        if (!message || this.isLoading) return;

        this.isLoading = true;
        this.updateSendButton();
        loadingIndicator.style.display = 'flex';
        this.announceToScreenReader('Yanıt bekleniyor...');

        // Add user message to UI
        this.addMessage('user', message);
        messageInput.value = '';
        autoResizeTextarea(); // Textarea'yı sıfırla

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
            this.addMessage('assistant', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', { isError: true });
        } finally {
            this.isLoading = false;
            this.updateSendButton();
            loadingIndicator.style.display = 'none';
        }
    }

    addMessage(type, content, options = {}) {
        const messageList = document.getElementById('message-list');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        if (options.isError) {
            messageDiv.classList.add('error');
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Sanitize content before adding to prevent XSS
        const sanitizedContent = this.escapeHtml(content);

        // Handle long messages with expand/collapse
        if (sanitizedContent.length > 300 && type === 'assistant') {
            const shortContent = sanitizedContent.substring(0, 300) + '...';
            const fullContent = sanitizedContent;
            
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
            contentDiv.innerHTML = sanitizedContent.replace(/\n/g, '<br>');
        }

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(new Date());

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        messageList.appendChild(messageDiv);

        // Scroll to bottom
        messageList.scrollTop = messageList.scrollHeight;
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
        this.addMessage('assistant', `Hata: ${message}`, { isError: true });
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
// Service card interactions
function initializeServiceCards() {
    const serviceButtons = document.querySelectorAll('.service-button');
    const serviceModals = document.querySelectorAll('.service-modal');
    const modalCloseButtons = document.querySelectorAll('.service-modal-close');

    // Yatay kaydırma işlevselliği
    let isDown = false;
    let startX;
    let scrollLeft;

    const servicesScroll = document.querySelector('.services-scroll');
    
    servicesScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        servicesScroll.style.cursor = 'grabbing';
        startX = e.pageX - servicesScroll.offsetLeft;
        scrollLeft = servicesScroll.scrollLeft;
    });

    servicesScroll.addEventListener('mouseleave', () => {
        isDown = false;
        servicesScroll.style.cursor = 'grab';
    });

    servicesScroll.addEventListener('mouseup', () => {
        isDown = false;
        servicesScroll.style.cursor = 'grab';
    });

    servicesScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - servicesScroll.offsetLeft;
        const walk = (x - startX) * 2;
        servicesScroll.scrollLeft = scrollLeft - walk;
        
        // Progress bar güncelleme
        updateScrollProgress(servicesScroll);
    });
    
    // Progress bar fonksiyonu
    function updateScrollProgress(container) {
        const progressBar = document.querySelector('.scroll-progress-bar');
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;
        const progress = (currentScroll / maxScroll) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Scroll eventi için progress bar güncelleme
    servicesScroll.addEventListener('scroll', () => {
        updateScrollProgress(servicesScroll);
    });

    // Modal kapatma fonksiyonu
    function closeAllModals() {
        serviceModals.forEach(modal => modal.classList.remove('active'));
    }

    // Detaylı bilgi butonları
    serviceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.service-card');
            const service = card.querySelector('.service-title').textContent;
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            
            messageInput.value = `${service} hizmetiniz hakkında bilgi almak istiyorum.`;
            messageInput.focus();
            
            // Mesaj inputu dolu olduğunda send butonunu aktif et
            if (messageInput.value.trim() !== '') {
                sendButton.disabled = false;
            }
        });
    });

    // Modal kapatma butonları
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });

    // Modalın dışına tıklandığında kapanması
    serviceModals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });

    // ESC tuşu ile modalın kapanması
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Hazır sorular için yatay kaydırma işlevselliği
function initializeCommandsScroll() {
    const commandsScroll = document.querySelector('.commands-scroll');
    let isDown = false;
    let startX;
    let scrollLeft;

    commandsScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        commandsScroll.style.cursor = 'grabbing';
        startX = e.pageX - commandsScroll.offsetLeft;
        scrollLeft = commandsScroll.scrollLeft;
    });

    commandsScroll.addEventListener('mouseleave', () => {
        isDown = false;
        commandsScroll.style.cursor = 'grab';
    });

    commandsScroll.addEventListener('mouseup', () => {
        isDown = false;
        commandsScroll.style.cursor = 'grab';
    });

    commandsScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - commandsScroll.offsetLeft;
        const walk = (x - startX) * 2;
        commandsScroll.scrollLeft = scrollLeft - walk;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize service cards
    initializeServiceCards();
    new InteractivePortfolio();
    
    // Initialize commands scroll
    initializeCommandsScroll();
    
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
