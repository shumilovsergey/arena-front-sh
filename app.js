/**
 * Main application logic
 */

class App {
    constructor() {
        this.deviceType = 'unknown';
        this.platform = 'unknown';
        this.currentUser = null;
        this.currentPage = null;
        this.debugLogs = [];

        this.init();
    }

    init() {
        // Create debug console first
        this.createDebugConsole();

        this.debugLog('🚀 App initialization started');

        this.detectDevice();
        this.debugLog('📱 Device detected:', this.deviceType);

        this.detectPlatform();
        this.debugLog('💻 Platform detected:', this.platform);

        this.applyDeviceStyles();
        this.updateDeviceInfo();
        this.setupEventListeners();

        this.debugLog('⚙️ Basic setup complete');

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
            this.debugLog('🔄 Initializing app...');

            // Wait for Telegram to be ready
            if (window.tgApp?.isInTelegram) {
                this.debugLog('✅ Running in Telegram WebApp');
                await this.authenticateUser();
            } else {
                this.debugLog('❌ Not running in Telegram');
                console.log('This app must be opened from Telegram');
                this.showError('This app must be opened from Telegram');
            }
        } catch (error) {
            this.debugLog('💥 App initialization failed:', error.message);
            console.error('App initialization error:', error);
            this.showError('Failed to initialize app');
        }
    }

    async authenticateUser() {
        try {
            this.debugLog('🔐 Starting authentication...');

            // Check Telegram WebApp availability
            this.debugLog('📱 Telegram WebApp available:', !!window.tgApp);
            this.debugLog('📱 Is in Telegram:', window.tgApp?.isInTelegram);

            const userData = window.tgApp.getUserData();
            this.debugLog('👤 User data:', userData);

            const initData = window.tgApp.validateInitData();
            this.debugLog('🔑 Init data available:', !!initData);
            this.debugLog('🔑 Init data length:', initData?.length || 0);

            const headers = window.tgApp.getAuthHeaders();
            this.debugLog('📤 Request headers:', headers);

            const url = AppConfig.getApiUrl('/user');
            this.debugLog('🌐 Request URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            this.debugLog('📥 Response status:', response.status);
            this.debugLog('📥 Response ok:', response.ok);

            if (!response.ok && response.status !== 201) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.debugLog('✅ Response data:', result);
            this.debugLog('🔍 Response keys:', Object.keys(result));

            // Handle both response formats: {user: {...}} or direct user data
            this.currentUser = result.user || result;
            this.debugLog('👤 Current user set:', !!this.currentUser);

            this.showAuthenticatedState();
            this.debugLog('✅ Authentication successful!');

        } catch (error) {
            this.debugLog('❌ Authentication error:', error.message);
            this.debugLog('❌ Error stack:', error.stack);
            AppConfig.logError('Authentication failed:', error);
            this.showError(`Authentication failed: ${error.message}`);
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

    async navigateToPage(pageName) {
        try {
            const pageConfig = AppConfig.pages.paths[pageName];
            if (!pageConfig) {
                throw new Error(`Page '${pageName}' not found`);
            }

            AppConfig.log(`Navigating to page: ${pageName}`);

            // Load page HTML
            const htmlPath = `${pageConfig}index.html`;
            const htmlResponse = await fetch(htmlPath);
            if (!htmlResponse.ok) throw new Error(`Failed to load page HTML: ${htmlResponse.status}`);

            const htmlContent = await htmlResponse.text();

            // Extract content from body (remove html/head tags)
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const pageContent = doc.body.innerHTML;

            // Update app container
            const appEl = document.getElementById('app');
            if (appEl) {
                appEl.innerHTML = pageContent;
            }

            // Load page CSS
            const cssPath = `${pageConfig}style.css`;
            const existingPageCSS = document.getElementById('page-css');
            if (existingPageCSS) {
                existingPageCSS.remove();
            }

            const cssLink = document.createElement('link');
            cssLink.id = 'page-css';
            cssLink.rel = 'stylesheet';
            cssLink.href = cssPath;
            document.head.appendChild(cssLink);

            // Load page JavaScript
            const jsPath = `${pageConfig}app.js`;
            const existingPageJS = document.getElementById('page-js');
            if (existingPageJS) {
                existingPageJS.remove();
            }

            const script = document.createElement('script');
            script.id = 'page-js';
            script.src = jsPath;
            document.head.appendChild(script);

            this.currentPage = pageName;
            AppConfig.log(`Successfully loaded page: ${pageName}`);

        } catch (error) {
            AppConfig.logError(`Failed to navigate to page ${pageName}:`, error);
            this.showError(`Failed to load page: ${pageName}`);
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
        const url = AppConfig.getApiUrl(endpoint);
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

    // Utility method to go back to welcome page
    goHome() {
        location.reload();
    }

    // Get current user data
    getCurrentUser() {
        return this.currentUser;
    }

    // Get current page
    getCurrentPage() {
        return this.currentPage;
    }

    // Debug console methods
    createDebugConsole() {
        const debugConsole = document.createElement('div');
        debugConsole.id = 'debug-console';
        debugConsole.innerHTML = `
            <div class="debug-header">
                <span>🐛 Debug Console</span>
                <button onclick="window.app.toggleDebugConsole()" class="debug-toggle">Toggle</button>
                <button onclick="window.app.clearDebugLogs()" class="debug-clear">Clear</button>
            </div>
            <div class="debug-content" id="debug-content"></div>
        `;
        document.body.appendChild(debugConsole);

        // Add CSS for debug console
        this.addDebugStyles();

        this.debugLog('🚀 Debug console initialized');
    }

    debugLog(message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            time: timestamp,
            message: message,
            data: data
        };

        this.debugLogs.push(logEntry);

        // Also log to console
        if (data !== null) {
            console.log(`[${timestamp}] ${message}`, data);
        } else {
            console.log(`[${timestamp}] ${message}`);
        }

        this.updateDebugDisplay();
    }

    updateDebugDisplay() {
        const debugContent = document.getElementById('debug-content');
        if (!debugContent) return;

        debugContent.innerHTML = this.debugLogs.slice(-20).map(log => {
            const dataStr = log.data ? ` | ${JSON.stringify(log.data, null, 2)}` : '';
            return `<div class="debug-entry">[${log.time}] ${log.message}${dataStr}</div>`;
        }).join('');

        // Auto scroll to bottom
        debugContent.scrollTop = debugContent.scrollHeight;
    }

    toggleDebugConsole() {
        const debugConsole = document.getElementById('debug-console');
        if (debugConsole) {
            debugConsole.classList.toggle('debug-minimized');
        }
    }

    clearDebugLogs() {
        this.debugLogs = [];
        this.updateDebugDisplay();
    }

    addDebugStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #debug-console {
                position: fixed;
                bottom: 10px;
                left: 10px;
                right: 10px;
                max-height: 300px;
                background: rgba(0, 0, 0, 0.9);
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                border: 1px solid #333;
                border-radius: 8px;
                z-index: 10000;
                overflow: hidden;
            }

            .debug-header {
                background: #333;
                padding: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .debug-toggle, .debug-clear {
                background: #555;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                margin-left: 4px;
                cursor: pointer;
            }

            .debug-content {
                padding: 8px;
                max-height: 200px;
                overflow-y: auto;
            }

            .debug-entry {
                margin-bottom: 4px;
                word-break: break-all;
                white-space: pre-wrap;
            }

            .debug-minimized .debug-content {
                display: none;
            }

            .debug-minimized {
                max-height: 40px;
            }
        `;
        document.head.appendChild(style);
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