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
        this.debugConsoleVisible = false;

        this.init();
    }

    init() {
        this.detectDevice();
        this.detectPlatform();
        this.applyDeviceStyles();
        this.updateDeviceInfo();
        this.setupEventListeners();

        // Create debug console if enabled
        if (AppConfig.app.debugConsole) {
            this.createDebugConsole();
        }

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
            this.debugLog('🚀 Initializing app...');
            this.debugLog('📱 Window tgApp:', !!window.tgApp);

            // Wait for Telegram to be ready
            if (window.tgApp?.isInTelegram) {
                this.debugLog('✅ Running in Telegram WebApp');
                await this.authenticateUser();
            } else {
                this.debugLog('❌ Not running in Telegram WebApp');
                console.log('This app must be opened from Telegram');
                this.showError('This app must be opened from Telegram');
            }
        } catch (error) {
            this.debugLog('❌ App initialization error:', error.message);
            console.error('App initialization error:', error);
            this.showError('Failed to initialize app');
        }
    }

    async authenticateUser() {
        try {
            this.debugLog('🔐 Starting authentication...');
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
            this.debugLog('📥 Response status text:', response.statusText);

            if (!response.ok && response.status !== 201) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.debugLog('📥 Response data:', result);
            AppConfig.log('User authenticated:', result);

            // Handle both response formats: {user: {...}} or direct user data
            this.currentUser = result.user || result;
            this.debugLog('✅ Authentication successful');
            this.debugLog('👤 Current user:', this.currentUser);
            this.showAuthenticatedState();

        } catch (error) {
            this.debugLog('❌ Authentication error:', error.message);
            this.debugLog('❌ Error stack:', error.stack);
            AppConfig.logError('Authentication failed:', error);
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

    async navigateToPage(pageName) {
        try {
            this.debugLog(`🔄 Navigating to page: ${pageName}`);

            const pageConfig = AppConfig.pages.paths[pageName];
            if (!pageConfig) {
                throw new Error(`Page '${pageName}' not found`);
            }

            this.debugLog('📄 Page config:', pageConfig);
            AppConfig.log(`Navigating to page: ${pageName}`);

            // Load page HTML
            const htmlPath = `${pageConfig}index.html`;
            this.debugLog('📄 Loading HTML from:', htmlPath);

            const htmlResponse = await fetch(htmlPath);
            if (!htmlResponse.ok) throw new Error(`Failed to load page HTML: ${htmlResponse.status}`);

            const htmlContent = await htmlResponse.text();
            this.debugLog('📄 HTML content loaded, length:', htmlContent.length);

            // Extract content from body (remove html/head tags)
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const pageContent = doc.body.innerHTML;

            // Update app container
            const appEl = document.getElementById('app');
            if (appEl) {
                appEl.innerHTML = pageContent;
                this.debugLog('📄 HTML content injected into app container');
            }

            // Load page CSS
            const cssPath = `${pageConfig}style.css`;
            const existingPageCSS = document.getElementById('page-css');
            if (existingPageCSS) {
                existingPageCSS.remove();
                this.debugLog('🎨 Removed existing page CSS');
            }

            const cssLink = document.createElement('link');
            cssLink.id = 'page-css';
            cssLink.rel = 'stylesheet';
            cssLink.href = cssPath;
            document.head.appendChild(cssLink);
            this.debugLog('🎨 Page CSS loaded:', cssPath);

            // Load page JavaScript
            const jsPath = `${pageConfig}app.js`;
            const existingPageJS = document.getElementById('page-js');
            if (existingPageJS) {
                existingPageJS.remove();
                this.debugLog('📜 Removed existing page JS');
            }

            const script = document.createElement('script');
            script.id = 'page-js';
            script.src = jsPath;
            document.head.appendChild(script);
            this.debugLog('📜 Page JS loaded:', jsPath);

            this.currentPage = pageName;
            this.debugLog('✅ Page navigation completed:', pageName);
            AppConfig.log(`Successfully loaded page: ${pageName}`);

        } catch (error) {
            this.debugLog('❌ Page navigation error:', error.message);
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

    // Debug Console Methods
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
        this.addDebugStyles();

        this.debugLog('🚀 Debug console initialized');
        this.debugLog('📱 Device type: ' + this.deviceType);
        this.debugLog('📱 Platform: ' + this.platform);
    }

    addDebugStyles() {
        const debugCSS = `
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
                transition: all 0.3s ease;
            }

            .debug-header {
                background: rgba(0, 0, 0, 0.8);
                padding: 8px;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
            }

            .debug-toggle, .debug-clear {
                background: #333;
                color: #00ff00;
                border: 1px solid #555;
                padding: 4px 8px;
                font-size: 10px;
                border-radius: 4px;
                cursor: pointer;
                margin-left: 4px;
            }

            .debug-toggle:hover, .debug-clear:hover {
                background: #555;
            }

            .debug-content {
                padding: 8px;
                max-height: 250px;
                overflow-y: auto;
                line-height: 1.4;
            }

            .debug-entry {
                margin-bottom: 4px;
                word-wrap: break-word;
            }

            .debug-time {
                color: #666;
                font-size: 10px;
            }

            .debug-message {
                color: #00ff00;
            }

            .debug-data {
                color: #ffff00;
                font-size: 11px;
                margin-left: 16px;
                white-space: pre-wrap;
            }

            .debug-minimized .debug-content {
                display: none;
            }

            .debug-minimized {
                max-height: 40px;
            }
        `;

        const style = document.createElement('style');
        style.textContent = debugCSS;
        document.head.appendChild(style);
    }

    debugLog(message, data = null) {
        if (!AppConfig.app.debugConsole) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { time: timestamp, message: message, data: data };

        this.debugLogs.push(logEntry);

        // Also log to console for development
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

        const maxEntries = 50; // Limit entries to prevent memory issues
        const recentLogs = this.debugLogs.slice(-maxEntries);

        debugContent.innerHTML = recentLogs.map(entry => {
            const dataStr = entry.data !== null
                ? `\n${typeof entry.data === 'object' ? JSON.stringify(entry.data, null, 2) : entry.data}`
                : '';

            return `
                <div class="debug-entry">
                    <span class="debug-time">[${entry.time}]</span>
                    <span class="debug-message">${entry.message}</span>
                    ${dataStr ? `<div class="debug-data">${dataStr}</div>` : ''}
                </div>
            `;
        }).join('');

        // Auto-scroll to bottom
        debugContent.scrollTop = debugContent.scrollHeight;
    }

    toggleDebugConsole() {
        const debugConsole = document.getElementById('debug-console');
        if (!debugConsole) return;

        this.debugConsoleVisible = !this.debugConsoleVisible;
        debugConsole.classList.toggle('debug-minimized', !this.debugConsoleVisible);
    }

    clearDebugLogs() {
        this.debugLogs = [];
        this.updateDebugDisplay();
        this.debugLog('🧹 Debug logs cleared');
    }\n\n    // API helper methods
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

        if (!response.ok && response.status !== 201) {
            throw new Error(`API request failed: ${response.status}: ${response.statusText}`);
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