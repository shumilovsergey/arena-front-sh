/**
 * Main application logic
 */

class App {
    constructor() {
        this.deviceType = 'unknown';
        this.platform = 'unknown';
        // Configure API base URL for GitHub Pages deployment
        this.apiBaseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000/api'
            : 'https://arena-back.sh-development.ru/api';  // Replace with your backend URL

        this.init();
    }

    init() {
        this.detectDevice();
        this.detectPlatform();
        this.applyDeviceStyles();
        this.updateDeviceInfo();
        this.setupEventListeners();

        // Initialize app after device detection
        this.initializeApp();
    }

    detectDevice() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

        if (window.innerWidth <= 768 || isMobile) {
            this.deviceType = 'mobile';
        } else if (isTablet) {
            this.deviceType = 'tablet';
        } else {
            this.deviceType = 'desktop';
        }

        // Override with Telegram platform if available
        if (window.tgApp?.webApp?.platform) {
            const tgPlatform = window.tgApp.webApp.platform;
            if (['ios', 'android'].includes(tgPlatform)) {
                this.deviceType = 'mobile';
            } else if (tgPlatform === 'web') {
                this.deviceType = 'desktop';
            }
        }
    }

    detectPlatform() {
        const userAgent = navigator.userAgent;

        if (/iPhone|iPad|iPod/i.test(userAgent)) {
            this.platform = 'ios';
        } else if (/Android/i.test(userAgent)) {
            this.platform = 'android';
        } else if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent)) {
            this.platform = 'macos';
        } else if (/Windows/i.test(userAgent)) {
            this.platform = 'windows';
        } else if (/Linux/i.test(userAgent)) {
            this.platform = 'linux';
        }

        // Override with Telegram platform if available
        if (window.tgApp?.webApp?.platform) {
            this.platform = window.tgApp.webApp.platform;
        }
    }

    applyDeviceStyles() {
        document.body.className = `device-${this.deviceType} platform-${this.platform}`;

        // Apply fullscreen for mobile
        if (this.deviceType === 'mobile') {
            document.documentElement.style.height = '100%';
            document.body.style.height = '100%';
        }
    }

    updateDeviceInfo() {
        const deviceTypeEl = document.getElementById('device-type');
        const platformEl = document.getElementById('platform');

        if (deviceTypeEl) deviceTypeEl.textContent = this.deviceType;
        if (platformEl) platformEl.textContent = this.platform;
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.handleStart());
        }

        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectDevice();
                this.applyDeviceStyles();
                this.updateDeviceInfo();
            }, 100);
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.detectDevice();
            this.applyDeviceStyles();
            this.updateDeviceInfo();
        });
    }

    async initializeApp() {
        try {
            // Wait for Telegram to be ready
            if (window.tgApp?.isInTelegram) {
                await this.authenticateUser();
            } else {
                console.log('This app must be opened from Telegram');
                this.showError('This app must be opened from Telegram');
            }
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Failed to initialize app');
        }
    }

    async authenticateUser() {
        try {
            const userData = window.tgApp.getUserData();
            const initData = window.tgApp.validateInitData();

            const response = await fetch(`${this.apiBaseUrl}/user`, {
                method: 'GET',
                headers: window.tgApp.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('User authenticated:', result);

            this.currentUser = result.user;
            this.showAuthenticatedState();

        } catch (error) {
            console.error('Authentication failed:', error);
            this.showError('Authentication failed');
        }
    }

    async handleStart() {
        if (window.tgApp?.isInTelegram) {
            window.tgApp.hapticFeedback('impact', 'light');

            // Navigate to main app (you can customize this)
            this.navigateToPage('main');
        } else {
            // Not in Telegram - should not happen as we check earlier
            this.showError('This app must be opened from Telegram');
        }
    }

    navigateToPage(pageName) {
        // This is where you'd implement navigation to different pages
        // For now, just show a placeholder
        const appEl = document.getElementById('app');
        if (appEl) {
            appEl.innerHTML = `
                <div class="page-container">
                    <h1>Page: ${pageName}</h1>
                    <p>This is where the ${pageName} page content would go.</p>
                    <button onclick="location.reload()" class="primary-btn">Back to Home</button>
                </div>
            `;
        }
    }

    showAuthenticatedState() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.textContent = 'Enter App';
            startBtn.style.background = 'var(--tg-theme-button-color, #00a651)';
        }
    }


    showError(message) {
        const appEl = document.getElementById('app');
        if (appEl) {
            appEl.innerHTML = `
                <div class="error-container">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="primary-btn">Retry</button>
                </div>
            `;
        }
    }

    // API helper methods
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const defaultHeaders = window.tgApp?.isInTelegram
            ? window.tgApp.getAuthHeaders()
            : { 'Content-Type': 'application/json' };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }

    async updateUserData(data) {
        return this.apiRequest('/user', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Add CSS for error and page states
const additionalCSS = `
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px 20px;
    text-align: center;
}

.error-container h2 {
    color: #dc3545;
    margin-bottom: 16px;
}

.page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px 20px;
    text-align: center;
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);