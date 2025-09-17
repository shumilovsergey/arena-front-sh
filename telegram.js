/**
 * Telegram Web App initialization and utilities
 * This file handles all Telegram-specific functionality
 */

class TelegramApp {
    constructor() {
        this.webApp = window.Telegram?.WebApp;
        this.isInTelegram = !!this.webApp;
        this.user = null;
        this.initData = null;

        this.init();
    }

    init() {
        if (!this.isInTelegram) {
            console.warn('Not running in Telegram WebApp environment');
            return;
        }

        // Initialize Telegram WebApp
        this.webApp.ready();
        this.webApp.expand();

        // Get user data and init data
        this.user = this.webApp.initDataUnsafe?.user || null;
        this.initData = this.webApp.initData || null;

        // Apply Telegram theme
        this.applyTheme();

        // Set up main button if needed
        this.setupMainButton();

        // Handle back button
        this.setupBackButton();

        console.log('Telegram WebApp initialized', {
            user: this.user,
            version: this.webApp.version,
            platform: this.webApp.platform
        });
    }

    applyTheme() {
        if (!this.webApp) return;

        const theme = this.webApp.themeParams;
        const root = document.documentElement;

        // Apply Telegram theme colors
        if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
        if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
        if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
        if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
        if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
    }

    setupMainButton() {
        if (!this.webApp) return;

        this.webApp.MainButton.setText('Continue');
        this.webApp.MainButton.hide();
    }

    setupBackButton() {
        if (!this.webApp) return;

        this.webApp.BackButton.onClick(() => {
            // Handle back navigation
            window.history.back();
        });
    }

    showMainButton(text = 'Continue', onClick = null) {
        if (!this.webApp) return;

        this.webApp.MainButton.setText(text);
        this.webApp.MainButton.show();

        if (onClick) {
            this.webApp.MainButton.onClick(onClick);
        }
    }

    hideMainButton() {
        if (!this.webApp) return;
        this.webApp.MainButton.hide();
    }

    showBackButton() {
        if (!this.webApp) return;
        this.webApp.BackButton.show();
    }

    hideBackButton() {
        if (!this.webApp) return;
        this.webApp.BackButton.hide();
    }

    close() {
        if (!this.webApp) return;
        this.webApp.close();
    }

    hapticFeedback(type = 'impact', style = 'light') {
        if (!this.webApp?.HapticFeedback) return;

        switch (type) {
            case 'impact':
                this.webApp.HapticFeedback.impactOccurred(style); // light, medium, heavy
                break;
            case 'notification':
                this.webApp.HapticFeedback.notificationOccurred(style); // error, success, warning
                break;
            case 'selection':
                this.webApp.HapticFeedback.selectionChanged();
                break;
        }
    }

    openLink(url, options = {}) {
        if (!this.webApp) {
            window.open(url, '_blank');
            return;
        }

        this.webApp.openLink(url, options);
    }

    shareToStory(mediaUrl, options = {}) {
        if (!this.webApp?.shareToStory) {
            console.warn('Share to story not supported');
            return;
        }

        this.webApp.shareToStory(mediaUrl, options);
    }

    requestContact() {
        return new Promise((resolve, reject) => {
            if (!this.webApp?.requestContact) {
                reject(new Error('Contact request not supported'));
                return;
            }

            this.webApp.requestContact((result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error('Contact request cancelled'));
                }
            });
        });
    }

    // Validation helpers
    validateInitData() {
        if (!this.initData) {
            throw new Error('No init data available');
        }
        return this.initData;
    }

    getAuthHeaders() {
        return {
            'X-Telegram-Init-Data': this.initData || '',
            'Content-Type': 'application/json'
        };
    }

    // User information getters
    getUserId() {
        return this.user?.id || null;
    }

    getUserData() {
        return {
            id: this.user?.id,
            first_name: this.user?.first_name,
            last_name: this.user?.last_name,
            username: this.user?.username,
            language_code: this.user?.language_code,
            photo_url: this.user?.photo_url
        };
    }

    getPlatform() {
        return this.webApp?.platform || 'unknown';
    }

    getVersion() {
        return this.webApp?.version || 'unknown';
    }
}

// Initialize Telegram app
const tgApp = new TelegramApp();

// Export for use in other files
window.tgApp = tgApp;