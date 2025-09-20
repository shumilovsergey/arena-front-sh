// Telegram WebApp Integration
// Based on official Telegram WebApp documentation

class TelegramWebApp {
    constructor() {
        this.webApp = null;
        this.initData = null;
        this.user = null;
        this.isInitialized = false;

        this.init();
    }

    init() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.webApp = window.Telegram.WebApp;
            this.initData = this.webApp.initData;
            this.user = this.webApp.initDataUnsafe?.user;

            // Initialize WebApp
            this.webApp.ready();

            // Set viewport mode based on device type
            this.setOptimalViewportMode();

            this.isInitialized = true;

            // Setup theme
            this.setupTheme();

            console.log('Telegram WebApp initialized successfully');
            console.log('User:', this.user);
            console.log('Platform:', this.getPlatform());
            console.log('Version:', this.getVersion());
            console.log('Fullscreen Available:', this.isFullscreenAvailable());
            console.log('Current Expanded State:', this.isExpanded());
            console.log('Viewport mode set based on device type');
        } else {
            console.warn('Telegram WebApp not available - running in browser mode');
        }
    }

    // Theme Management
    setupTheme() {
        if (!this.isInitialized || !window.CONFIG?.TELEGRAM_CONFIG?.ENABLE_THEME_PARAMS) return;

        const themeParams = this.webApp.themeParams;
        if (themeParams) {
            // Apply Telegram theme colors to CSS custom properties
            document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#ffffff');
            document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000');
            document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999');
            document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#2481cc');
            document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#2481cc');
            document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
            document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color || '#f1f1f1');
        }
    }

    // Authentication
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.initData) {
            headers['X-Telegram-Init-Data'] = this.initData;
        }

        return headers;
    }

    // User Information
    getUserInfo() {
        return this.user;
    }

    getInitData() {
        return this.initData;
    }

    isReady() {
        return this.isInitialized;
    }

    // Haptic Feedback
    hapticFeedback(type = 'light') {
        if (!this.isInitialized || !window.CONFIG?.APP_CONFIG?.ENABLE_HAPTIC_FEEDBACK) return;

        if (this.webApp.HapticFeedback) {
            const hapticTypes = window.CONFIG.TELEGRAM_CONFIG.HAPTIC_TYPES;

            switch (type) {
                case hapticTypes.SUCCESS:
                case hapticTypes.ERROR:
                case hapticTypes.WARNING:
                    this.webApp.HapticFeedback.notificationOccurred(type);
                    break;
                case hapticTypes.LIGHT:
                case hapticTypes.MEDIUM:
                case hapticTypes.HEAVY:
                    this.webApp.HapticFeedback.impactOccurred(type);
                    break;
                default:
                    this.webApp.HapticFeedback.impactOccurred('light');
            }
        }
    }

    // Main Button Management
    showMainButton(text, onClick) {
        if (!this.isInitialized) return;

        this.webApp.MainButton.setText(text);
        this.webApp.MainButton.onClick(onClick);
        this.webApp.MainButton.show();
    }

    hideMainButton() {
        if (!this.isInitialized) return;

        this.webApp.MainButton.hide();
    }

    // Back Button Management
    showBackButton(onClick) {
        if (!this.isInitialized) return;

        this.webApp.BackButton.onClick(onClick);
        this.webApp.BackButton.show();
    }

    hideBackButton() {
        if (!this.isInitialized) return;

        this.webApp.BackButton.hide();
    }

    // Popup Management
    showAlert(message) {
        if (!this.isInitialized) {
            alert(message);
            return;
        }

        this.webApp.showAlert(message);
    }

    showConfirm(message, callback) {
        if (!this.isInitialized) {
            const result = confirm(message);
            callback(result);
            return;
        }

        this.webApp.showConfirm(message, callback);
    }

    showPopup(params) {
        if (!this.isInitialized) {
            alert(params.message || 'Popup not supported in browser mode');
            return;
        }

        this.webApp.showPopup(params);
    }

    // Device Detection and Viewport Management
    isMobileDevice() {
        // Check user agent for mobile indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];

        // Also check screen width as backup
        const isMobileScreen = window.innerWidth <= 768;

        // Check if any mobile keyword is found in user agent
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));

        return isMobileUA || isMobileScreen;
    }

    isDesktopDevice() {
        // Check for desktop platforms
        const platform = this.getPlatform();
        const userAgent = navigator.userAgent.toLowerCase();

        // Desktop platforms in Telegram
        const desktopPlatforms = ['macos', 'windows', 'linux'];
        const isDesktopPlatform = desktopPlatforms.includes(platform);

        // Desktop user agent indicators
        const desktopKeywords = ['windows', 'macintosh', 'linux', 'x11'];
        const isDesktopUA = desktopKeywords.some(keyword => userAgent.includes(keyword));

        // Large screen indicator
        const isDesktopScreen = window.innerWidth > 768;

        return isDesktopPlatform || (isDesktopUA && isDesktopScreen);
    }

    setOptimalViewportMode() {
        if (!this.isInitialized) return;

        try {
            const platform = this.getPlatform();
            const userAgent = navigator.userAgent.toLowerCase();

            // Better mobile detection
            const isMobilePlatform = platform === 'android' || platform === 'ios' || platform === 'mobile';
            const isMobileUA = /mobile|android|iphone|ipad|ipod/.test(userAgent);
            const isDesktopPlatform = platform === 'web' || platform === 'macos' || platform === 'windows' || platform === 'linux';

            // Force mobile treatment for iOS/Android regardless of other factors
            const isMobile = isMobilePlatform || isMobileUA;
            const isDesktop = isDesktopPlatform && !isMobile;

            console.log('Platform detected:', platform);
            console.log('User Agent:', userAgent);
            console.log('Is Mobile Platform:', isMobilePlatform);
            console.log('Is Mobile UA:', isMobileUA);
            console.log('Final - Is Mobile:', isMobile);
            console.log('Final - Is Desktop:', isDesktop);

            if (isMobile) {
                // Mobile devices: Always try fullscreen mode
                console.log('Mobile device detected: Attempting fullscreen mode');

                // Try multiple approaches for fullscreen
                let fullscreenAttempted = false;

                // Method 1: Modern requestFullscreen (Telegram 8.0+)
                if (this.webApp.isVersionAtLeast && this.webApp.isVersionAtLeast('8.0') && this.webApp.requestFullscreen) {
                    console.log('Telegram version 8.0+: Using requestFullscreen()');
                    this.webApp.requestFullscreen();
                    fullscreenAttempted = true;

                    // Add event listeners for fullscreen state changes
                    this.webApp.onEvent('fullscreenChanged', () => {
                        console.log('Fullscreen state changed:', this.webApp.isFullscreen);
                    });

                    this.webApp.onEvent('fullscreenFailed', () => {
                        console.log('Fullscreen failed, falling back to expand');
                        this.webApp.expand();
                    });
                }

                // Method 2: Force expand if fullscreen not available or failed
                if (!fullscreenAttempted) {
                    console.log('Fullscreen not available, using expand() with forced mobile styling');
                    this.webApp.expand();

                    // Force mobile viewport behavior
                    setTimeout(() => {
                        this.forceMobileViewport();
                    }, 100);
                }

            } else if (isDesktop) {
                // Desktop devices: Use expand for fullsize window behavior
                console.log('Desktop device detected: Using expand() for fullsize mode');
                this.webApp.expand();
            } else {
                // Unknown platform: Assume mobile for safety
                console.log('Unknown platform type:', platform, '- Assuming mobile, using fullscreen');
                if (this.webApp.requestFullscreen) {
                    this.webApp.requestFullscreen();
                } else {
                    this.webApp.expand();
                    setTimeout(() => {
                        this.forceMobileViewport();
                    }, 100);
                }
            }
        } catch (error) {
            console.warn('Failed to set optimal viewport mode:', error);
            // Fallback to basic expand
            this.webApp.expand();
        }
    }

    // Force mobile viewport behavior with CSS
    forceMobileViewport() {
        console.log('Forcing mobile viewport behavior');

        // Set viewport meta tag for mobile
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }

        // Add mobile-specific styles
        const style = document.createElement('style');
        style.textContent = `
            html, body {
                height: 100vh !important;
                height: 100dvh !important;
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .container {
                height: 100vh !important;
                height: 100dvh !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Hide mobile browser UI */
            @media screen and (max-width: 768px) {
                html, body {
                    height: 100vh !important;
                    height: 100dvh !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Utility Methods
    close() {
        if (this.isInitialized) {
            this.webApp.close();
        }
    }

    expand() {
        if (this.isInitialized) {
            this.webApp.expand();
        }
    }

    // Request specific viewport modes
    requestFullscreen() {
        if (this.isInitialized && this.webApp.requestFullscreen) {
            console.log('Manually requesting fullscreen mode');
            this.webApp.requestFullscreen();
        } else {
            console.log('requestFullscreen not available, using expand fallback');
            this.webApp.expand();
        }
    }

    requestFullsize() {
        if (this.isInitialized) {
            console.log('Manually requesting fullsize mode (using expand)');
            this.webApp.expand();
        }
    }

    // Check if fullscreen is available
    isFullscreenAvailable() {
        return this.isInitialized &&
               this.webApp.isVersionAtLeast &&
               this.webApp.isVersionAtLeast('8.0') &&
               typeof this.webApp.requestFullscreen === 'function';
    }

    // Get current fullscreen state
    isFullscreen() {
        return this.isInitialized && this.webApp.isFullscreen;
    }

    // Device Info
    getVersion() {
        return this.isInitialized ? this.webApp.version : null;
    }

    getPlatform() {
        return this.isInitialized ? this.webApp.platform : 'unknown';
    }

    getColorScheme() {
        return this.isInitialized ? this.webApp.colorScheme : 'light';
    }

    // Viewport Info
    getViewportHeight() {
        return this.isInitialized ? this.webApp.viewportHeight : window.innerHeight;
    }

    getViewportStableHeight() {
        return this.isInitialized ? this.webApp.viewportStableHeight : window.innerHeight;
    }

    isExpanded() {
        return this.isInitialized ? this.webApp.isExpanded : false;
    }
}

// Initialize Telegram WebApp
const telegramApp = new TelegramWebApp();

// Export for global use
window.TelegramApp = telegramApp;