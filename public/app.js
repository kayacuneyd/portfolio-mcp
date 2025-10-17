class InteractivePortfolio {
  constructor() {
    this.config = null;
    this.isLoading = false;
    this.currentLanguage = "tr";
    // Mock mode for local UI testing. Enable by adding ?mock=true to the URL.
    try {
      this.mockMode = new URLSearchParams(window.location.search).get('mock') === 'true';
    } catch (e) {
      this.mockMode = false;
    }

    this.init();
  }

  // Small helper to await delays (used for mock responses / typing simulation)
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async init() {
    try {
      await this.loadBootstrap();
      this.setupEventListeners();
      this.updateWelcomeTime();
      // Ensure composer padding is correct on startup
      this.updateComposerPadding();
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError(
        "Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin."
      );
    }
  }

  async loadBootstrap() {
    try {
      const response = await fetch("/api/bootstrap");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.config = await response.json();
      this.updateUI();
    } catch (error) {
      console.error("Bootstrap loading error:", error);
      throw error;
    }
  }

  updateUI() {
    if (!this.config) return;

    // Update profile card
    this.updateElement("profileName", this.config.profile.name);
    this.updateElement("profileTitle", this.config.profile.title);

    // Update profile image if available. Also support a default <img src="..."> in HTML
    const profileImage = document.getElementById("profileImage");
    const avatarPlaceholder = document.getElementById("avatarPlaceholder");
    if (profileImage && avatarPlaceholder) {
      const showImage = () => {
        profileImage.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
      };
      const hideImage = () => {
        profileImage.style.display = 'none';
        avatarPlaceholder.style.display = 'block';
      };

      profileImage.onerror = () => {
        console.warn('Profile image failed to load, keeping placeholder');
        hideImage();
      };

      // If server provided an image URL, set it and use onload to reveal
      if (this.config.profile.profile_image) {
        profileImage.onload = showImage;
        // set src last to trigger load events
        profileImage.src = this.config.profile.profile_image;
      } else if (profileImage.src) {
        // If an image src is already present in HTML (e.g., your preferred photo),
        // reveal it if loaded or wait for its onload.
        if (profileImage.complete && profileImage.naturalWidth > 0) {
          showImage();
        } else {
          profileImage.onload = showImage;
        }
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
    const container = document.getElementById("suggestedCommands");
    const scrollContainer = container.querySelector(".commands-scroll");

    scrollContainer.innerHTML = "";

    prompts.forEach((prompt, index) => {
      const chip = document.createElement("button");
      chip.className = "command-chip";
      chip.textContent = prompt;
      chip.setAttribute("role", "button");
      chip.setAttribute("aria-label", `Hazır komut: ${prompt}`);
      chip.setAttribute("tabindex", "0");

      // Click handler
      chip.addEventListener("click", () => this.selectCommand(prompt));

      // Keyboard handler
      chip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
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
    const messageInput = document.getElementById("messageInput");
    messageInput.value = text;
    messageInput.focus();
    this.updateSendButton();

    // Announce to screen readers
    this.announceToScreenReader(`Seçilen komut: ${text}`);
  }

  announceToScreenReader(message) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  setupEventListeners() {
    // Message input
    const messageInput = document.getElementById("messageInput");
    messageInput.addEventListener("input", () => {
      this.updateSendButton();
      this.updateComposerPadding();
    });
    messageInput.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Send button
    const sendButton = document.getElementById("sendButton");
    sendButton.addEventListener("click", () => this.sendMessage());

    // Keyboard support for send button
    sendButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleGlobalKeyDown(e));

    // Update composer padding on resize (debounced)
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.updateComposerPadding(), 150);
    });

    // Lead form
    const leadForm = document.getElementById("leadForm");
    leadForm.addEventListener("submit", (e) => this.handleLeadSubmit(e));

    // Modal controls
    const leadModal = document.getElementById("leadModal");
    const modalClose = document.getElementById("modalClose");
    const privacyModal = document.getElementById("privacyModal");
    const privacyModalClose = document.getElementById("privacyModalClose");
    const privacyLink = document.getElementById("privacyLink");

    modalClose.addEventListener("click", () => this.closeModal(leadModal));
    privacyModalClose.addEventListener("click", () =>
      this.closeModal(privacyModal)
    );
    privacyLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.openModal(privacyModal);
    });

    // Escape key for modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (leadModal.classList.contains("active")) {
          this.closeModal(leadModal);
        }
        if (privacyModal.classList.contains("active")) {
          this.closeModal(privacyModal);
        }
      }
    });

    // Close modal on backdrop click
    [leadModal, privacyModal].forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });
  }

  // Basic focus trap for modals: keep Tab within modal when open
  trapFocus(modal) {
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return null;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKey = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { // shift + tab
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else { // tab
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKey);
    return () => modal.removeEventListener('keydown', handleKey);
  }

  handleGlobalKeyDown(e) {
    // Focus message input with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const messageInput = document.getElementById("messageInput");
      messageInput.focus();
      this.announceToScreenReader("Mesaj yazma alanına odaklandı");
    }
  }

  updateSendButton() {
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const hasText = messageInput.value.trim().length > 0;

    sendButton.disabled = !hasText || this.isLoading;
  }

  handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!this.isLoading && e.target.value.trim()) {
        this.sendMessage();
      }
    }
  }

  async sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    const loadingIndicator = document.getElementById("loading-indicator");

    if (!message || this.isLoading) return;

    this.isLoading = true;
    this.updateSendButton();
    loadingIndicator.style.display = "flex";
    this.announceToScreenReader("Yanıt bekleniyor...");

    // Add user message to UI
    this.addMessage("user", message);
    messageInput.value = "";
    autoResizeTextarea(); // Textarea'yı sıfırla

    try {
      // If mockMode is enabled, simulate a typing placeholder and provide a canned response
      if (this.mockMode) {
        const typingEl = this.showTypingPlaceholder();
        // simulate network/processing delay
        await this.sleep(600 + Math.floor(Math.random() * 800));
        this.removeTypingPlaceholder(typingEl);
        const data = { text: 'Bu, yerel mock cevabıdır. Gerçek OpenAI çağrısı yapılmadı.', leadRequested: false };
        this.addMessage('assistant', data.text);
        if (data.leadRequested) {
          this.openLeadModal(data.leadData || {});
        }
        return;
      }

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
          lang: this.currentLanguage,
        }),
      });

      if (!response.ok) {
        // Try to parse JSON error from server for better UX
        let errorBody = null;
        try {
          errorBody = await response.json();
        } catch (e) {
          console.error("Failed to parse error body", e);
        }
        const serverMessage =
          (errorBody && (errorBody.error || errorBody.message)) ||
          `Sunucu hatası: ${response.status}`;
        console.error(
          "Server responded with error:",
          response.status,
          serverMessage,
          errorBody
        );
        // Show server message to user
        this.addMessage(
          "assistant",
          `Üzgünüm, bir hata oluştu: ${serverMessage}`,
          { isError: true }
        );
        return;
      }

      const data = await response.json();

      // Add assistant response
      this.addMessage("assistant", data.text);

      // Handle lead request
      if (data.leadRequested) {
        this.openLeadModal(data.leadData || {});
      }
    } catch (error) {
      console.error("Send message error:", error);
      this.addMessage(
        "assistant",
        "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        { isError: true }
      );
    } finally {
      this.isLoading = false;
      this.updateSendButton();
      loadingIndicator.style.display = "none";
    }
  }

  addMessage(type, content, options = {}) {
    const messageList = document.getElementById("message-list");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    if (options.isError) {
      messageDiv.classList.add("error");
    }

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    // Allow raw HTML when explicitly requested
    if (options.raw) {
      contentDiv.innerHTML = content;
    } else {
      // Sanitize content before adding to prevent XSS
      const sanitizedContent = this.escapeHtml(String(content));

      // Handle long messages with expand/collapse for assistant
      if (sanitizedContent.length > 300 && type === "assistant") {
        const shortContent = sanitizedContent.substring(0, 300) + "...";
        const fullContent = sanitizedContent;

        const shortSpan = document.createElement("span");
        shortSpan.className = "short-content";
        shortSpan.textContent = shortContent;

        const fullSpan = document.createElement("span");
        fullSpan.className = "full-content";
        fullSpan.style.display = "none";
        fullSpan.textContent = fullContent;

        const expandBtn = document.createElement("button");
        expandBtn.className = "expand-btn";
        expandBtn.textContent = "Devamını göster";
        expandBtn.onclick = function () {
          shortSpan.style.display = "none";
          fullSpan.style.display = "inline";
          this.style.display = "none";
        };

        contentDiv.appendChild(shortSpan);
        contentDiv.appendChild(fullSpan);
        contentDiv.appendChild(expandBtn);
      } else {
        contentDiv.innerHTML = sanitizedContent.replace(/\n/g, "<br>");
      }
    }

    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    timeDiv.textContent = this.formatTime(new Date());

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    messageList.appendChild(messageDiv);

    // Scroll to bottom smoothly but only if user is near bottom
    this.autoScrollToBottom(messageList);
    return messageDiv;
  }

  autoScrollToBottom(container) {
    try {
      const threshold = 150; // px from bottom to auto-scroll
      const distanceFromBottom =
        container.scrollHeight - container.clientHeight - container.scrollTop;
      if (distanceFromBottom < threshold) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    } catch (e) {
      // Fallback instant scroll
      container.scrollTop = container.scrollHeight;
    }
  }

  updateComposerPadding() {
    // With CSS Grid and sticky composer, runtime padding adjustments are unnecessary.
    // This method remains for backward compatibility and does nothing now.
    return;
  }

  openLeadModal(data = {}) {
    const modal = document.getElementById("leadModal");

    // Pre-fill form if data provided
    if (data.topic) {
      document.getElementById("leadTopic").value = data.topic;
    }
    if (data.message) {
      document.getElementById("leadMessage").value = data.message;
    }

    this.openModal(modal);
  }

  openModal(modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Focus first input if it's the lead modal and hide background from screen readers
    if (modal.id === "leadModal") {
      setTimeout(() => {
        const firstInput = modal.querySelector("input");
        if (firstInput) firstInput.focus();
      }, 100);
      const container = document.querySelector('.container');
      if (container) container.setAttribute('aria-hidden', 'true');
      // install focus trap
      this._removeTrap = this.trapFocus(modal);
    }
  }

  closeModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";

    // Clear form if it's the lead modal
    if (modal.id === "leadModal") {
      document.getElementById("leadForm").reset();
      const container = document.querySelector('.container');
      if (container) container.removeAttribute('aria-hidden');
      if (this._removeTrap) { this._removeTrap(); this._removeTrap = null; }
    }
  }

  async handleLeadSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const leadData = {
      name: formData.get("name") || undefined,
      email: formData.get("email"),
      topic: formData.get("topic") || undefined,
      message: formData.get("message") || undefined,
    };

    const submitBtn = e.target.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    const feedbackEl = document.getElementById('leadFormFeedback');

    // Basic client-side validation
    if (!leadData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadData.email)) {
      feedbackEl.textContent = 'Lütfen geçerli bir e-posta adresi girin.';
      feedbackEl.classList.add('error');
      feedbackEl.style.display = 'block';
      return;
    }

    // Show spinner + disable
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        let body = null;
        try { body = await response.json(); } catch (err) { /* ignore */ }
        const msg = (body && (body.error || body.message)) || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      this.closeModal(document.getElementById("leadModal"));
      this.addMessage(
        "assistant",
        "Teşekkürler! Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağım."
      );
      // show success feedback briefly
      feedbackEl.textContent = 'Mesajınız gönderildi.';
      feedbackEl.classList.remove('error');
      feedbackEl.style.display = 'block';
      setTimeout(() => { feedbackEl.style.display = 'none'; }, 3000);
    } catch (error) {
      console.error("Lead submission error:", error);
      feedbackEl.textContent = `Gönderilemedi: ${error.message || 'Sunucu hatası'}`;
      feedbackEl.classList.add('error');
      feedbackEl.style.display = 'block';
    } finally {
      // restore button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
    }
  }

  showError(message) {
    this.addMessage("assistant", `Hata: ${message}`, { isError: true });
  }

  updateWelcomeTime() {
    const welcomeTime = document.getElementById("welcomeTime");
    if (welcomeTime) {
      welcomeTime.textContent = this.formatTime(new Date());
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  showTypingPlaceholder() {
    const placeholderText = "Yazıyor...";
    // Use raw HTML so the dots animation can be rendered
    const el = this.addMessage(
      "assistant",
      `<span class="typing-dots"><span></span><span></span><span></span></span> ${placeholderText}`,
      { raw: true }
    );
    if (el) el.classList.add("typing");
    return el;
  }

  removeTypingPlaceholder(el) {
    try {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    } catch (e) {
      console.error("Failed to remove typing placeholder", e);
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-resize textarea
function autoResizeTextarea() {
  const textarea = document.getElementById("messageInput");
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}

// Initialize app when DOM is loaded
// Service card interactions
function initializeServiceCards() {
  const serviceButtons = document.querySelectorAll(".service-button");
  const serviceModals = document.querySelectorAll(".service-modal");
  const modalCloseButtons = document.querySelectorAll(".service-modal-close");

  // Yatay kaydırma işlevselliği
  let isDown = false;
  let startX;
  let scrollLeft;

  const servicesScroll = document.querySelector(".services-scroll");

  servicesScroll.addEventListener("mousedown", (e) => {
    isDown = true;
    servicesScroll.style.cursor = "grabbing";
    startX = e.pageX - servicesScroll.offsetLeft;
    scrollLeft = servicesScroll.scrollLeft;
  });

  servicesScroll.addEventListener("mouseleave", () => {
    isDown = false;
    servicesScroll.style.cursor = "grab";
  });

  servicesScroll.addEventListener("mouseup", () => {
    isDown = false;
    servicesScroll.style.cursor = "grab";
  });

  servicesScroll.addEventListener("mousemove", (e) => {
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
    const progressBar = document.querySelector(".scroll-progress-bar");
    const maxScroll = container.scrollWidth - container.clientWidth;
    const currentScroll = container.scrollLeft;
    const progress = (currentScroll / maxScroll) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Scroll eventi için progress bar güncelleme
  servicesScroll.addEventListener("scroll", () => {
    updateScrollProgress(servicesScroll);
  });

  // Modal kapatma fonksiyonu
  function closeAllModals() {
    serviceModals.forEach((modal) => modal.classList.remove("active"));
  }

  // Make the whole service card clickable and keyboard-accessible
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach((card) => {
    // Click handler: simulate selecting a ready question into the composer
    const activateCard = (e) => {
      // If the click originated from an interactive control inside the card (like a link), ignore
      const interactive = e && e.target && (e.target.closest('a') || e.target.closest('button'));
      if (interactive && e.type === 'click') return;

      const service = card.querySelector('.service-title')?.textContent || card.getAttribute('aria-label') || 'Hizmet';
      const messageInput = document.getElementById('messageInput');
      const sendButton = document.getElementById('sendButton');

      messageInput.value = `${service} hizmetiniz hakkında bilgi almak istiyorum.`;
      messageInput.focus();
      // Activate send button
      if (messageInput.value.trim() !== '') {
        sendButton.disabled = false;
      }
    };

    card.addEventListener('click', activateCard);

    // Keyboard accessibility: Enter or Space activates the card
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateCard(e);
      }
    });
  });

  // Modal kapatma butonları
  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAllModals);
  });

  // Modalın dışına tıklandığında kapanması
  serviceModals.forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeAllModals();
      }
    });
  });

  // ESC tuşu ile modalın kapanması
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });
}

// Hazır sorular için yatay kaydırma işlevselliği
function initializeCommandsScroll() {
  const commandsScroll = document.querySelector(".commands-scroll");
  let isDown = false;
  let startX;
  let scrollLeft;

  commandsScroll.addEventListener("mousedown", (e) => {
    isDown = true;
    commandsScroll.style.cursor = "grabbing";
    startX = e.pageX - commandsScroll.offsetLeft;
    scrollLeft = commandsScroll.scrollLeft;
  });

  commandsScroll.addEventListener("mouseleave", () => {
    isDown = false;
    commandsScroll.style.cursor = "grab";
  });

  commandsScroll.addEventListener("mouseup", () => {
    isDown = false;
    commandsScroll.style.cursor = "grab";
  });

  commandsScroll.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - commandsScroll.offsetLeft;
    const walk = (x - startX) * 2;
    commandsScroll.scrollLeft = scrollLeft - walk;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize service cards
  initializeServiceCards();
  const app = new InteractivePortfolio();

  // Primary CTA opens lead modal
  const primaryCta = document.getElementById('primaryCta');
  if (primaryCta) {
    primaryCta.addEventListener('click', () => app.openLeadModal());
  }

  // Initialize commands scroll
  initializeCommandsScroll();

  // Setup textarea auto-resize
  const messageInput = document.getElementById("messageInput");
  messageInput.addEventListener("input", autoResizeTextarea);
});

// Handle online/offline status
window.addEventListener("online", () => {
  console.log("Connection restored");
});

window.addEventListener("offline", () => {
  console.log("Connection lost");
  // Could show a notification to user
});
