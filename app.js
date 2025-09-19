/**
 * Simple Telegram Web App - No page navigation, single view
 */

class App {
    constructor() {
        this.deviceType = 'unknown';
        this.platform = 'unknown';
        this.currentUser = null;
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

        // Initialize app
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
        const loadBtn = document.getElementById('load-btn');
        const updateBtn = document.getElementById('update-btn');

        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.handleLoadUser());
        }

        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.handleUpdateUser());
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
            this.debugLog('🚀 Initializing simple app...');
            this.debugLog('📱 Window tgApp:', !!window.tgApp);
            this.debugLog('🌐 Backend URL:', AppConfig.api.baseUrl);

            // Check if running in Telegram
            if (window.tgApp?.isInTelegram) {
                this.debugLog('✅ Running in Telegram WebApp');
                // Auto-load user data when in Telegram
                await this.handleLoadUser();
            } else {
                this.debugLog('⚠️ Not running in Telegram WebApp - manual load available');
                this.showMessage('Ready to test. Click "Load User Data" to test backend connection.');
            }
        } catch (error) {
            this.debugLog('❌ App initialization error:', error.message);
            console.error('App initialization error:', error);
            this.showError('Failed to initialize app: ' + error.message);
        }
    }

    async handleLoadUser() {
        try {
            this.debugLog('🔐 Loading user data...');
            this.showMessage('Loading user data...');

            const loadBtn = document.getElementById('load-btn');
            if (loadBtn) {
                loadBtn.textContent = 'Loading...';
                loadBtn.disabled = true;
            }

            // Get auth headers
            const headers = window.tgApp?.isInTelegram
                ? window.tgApp.getAuthHeaders()
                : { 'Content-Type': 'application/json' };

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
                const errorText = await response.text();
                this.debugLog('❌ Error response:', errorText);

                // Parse JSON error if possible
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // Keep the original error message if JSON parsing fails
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            this.debugLog('📥 Response data:', result);

            // Handle both response formats: {user: {...}} or direct user data
            this.currentUser = result.user || result;
            this.debugLog('✅ User loaded successfully');
            this.displayUserInfo();

            // Enable update button
            const updateBtn = document.getElementById('update-btn');
            if (updateBtn) {
                updateBtn.disabled = false;
            }

        } catch (error) {
            this.debugLog('❌ Load user error:', error.message);
            console.error('Failed to load user:', error);
            this.showError('Failed to load user data: ' + error.message);
        } finally {
            const loadBtn = document.getElementById('load-btn');
            if (loadBtn) {
                loadBtn.textContent = 'Load User Data';
                loadBtn.disabled = false;
            }
        }
    }

    async handleUpdateUser() {
        try {
            this.debugLog('📝 Updating user data...');

            const updateBtn = document.getElementById('update-btn');
            if (updateBtn) {
                updateBtn.textContent = 'Updating...';
                updateBtn.disabled = true;
            }

            // Get auth headers
            const headers = window.tgApp?.isInTelegram
                ? window.tgApp.getAuthHeaders()
                : { 'Content-Type': 'application/json' };

            // Add timestamp to user_data
            const updateData = {
                user_data: {
                    ...this.currentUser.user_data,
                    last_update: new Date().toISOString(),
                    update_count: (this.currentUser.user_data.update_count || 0) + 1
                }
            };

            this.debugLog('📤 Update data:', updateData);

            const url = AppConfig.getApiUrl('/user');
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(updateData)
            });

            this.debugLog('📥 Update response status:', response.status);

            if (!response.ok && response.status !== 201) {
                const errorText = await response.text();
                this.debugLog('❌ Update error response:', errorText);

                // Parse JSON error if possible
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // Keep the original error message if JSON parsing fails
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            this.debugLog('📥 Update response data:', result);

            // Handle both response formats
            this.currentUser = result.user || result;
            this.debugLog('✅ User updated successfully');
            this.displayUserInfo();

            if (window.tgApp?.isInTelegram) {
                window.tgApp.hapticFeedback('notification', 'success');
            }

        } catch (error) {
            this.debugLog('❌ Update user error:', error.message);
            console.error('Failed to update user:', error);
            this.showError('Failed to update user data: ' + error.message);

            if (window.tgApp?.isInTelegram) {
                window.tgApp.hapticFeedback('notification', 'error');
            }
        } finally {
            const updateBtn = document.getElementById('update-btn');
            if (updateBtn) {
                updateBtn.textContent = 'Update Data';
                updateBtn.disabled = false;
            }
        }
    }

    displayUserInfo() {
        const userInfoEl = document.getElementById('user-info');
        if (!userInfoEl || !this.currentUser) return;

        userInfoEl.innerHTML = `
            <h3>✅ User Data Loaded</h3>
            <div class="user-details">
                <p><strong>ID:</strong> ${this.currentUser.telegram_id}</p>
                <p><strong>Name:</strong> ${this.currentUser.first_name} ${this.currentUser.last_name || ''}</p>
                ${this.currentUser.username ? `<p><strong>Username:</strong> @${this.currentUser.username}</p>` : ''}
                <p><strong>Language:</strong> ${this.currentUser.language_code || 'Unknown'}</p>
                <p><strong>Created:</strong> ${new Date(this.currentUser.created_at).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> ${new Date(this.currentUser.updated_at).toLocaleDateString()}</p>

                <div class="user-data-section">
                    <h4>User Data:</h4>
                    <pre>${JSON.stringify(this.currentUser.user_data, null, 2)}</pre>
                </div>
            </div>
        `;
    }

    showMessage(message) {
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl) {
            userInfoEl.innerHTML = `<p>${message}</p>`;
        }
    }

    showError(message) {
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl) {
            userInfoEl.innerHTML = `
                <div class="error-message">
                    <h3>❌ Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // Debug Console Methods (same as before but simplified)
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
                max-height: 250px;
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
                max-height: 200px;
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

        const maxEntries = 30;
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
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Add additional CSS for the simplified UI
const additionalCSS = `
.main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    padding: 20px;
    text-align: center;
}

.user-info {
    margin: 20px 0;
    padding: 20px;
    background: var(--tg-theme-secondary-bg-color, #f8f9fa);
    border-radius: 12px;
    max-width: 100%;
    word-wrap: break-word;
}

.user-details {
    text-align: left;
    max-width: 500px;
}

.user-data-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--tg-theme-hint-color, #ccc);
}

.user-data-section pre {
    background: var(--tg-theme-bg-color, #fff);
    border: 1px solid var(--tg-theme-hint-color, #ccc);
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    overflow-x: auto;
    text-align: left;
}

.actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

.secondary-btn {
    background: var(--tg-theme-secondary-bg-color, #f0f0f0);
    color: var(--tg-theme-text-color, #333);
    border: 1px solid var(--tg-theme-button-color, #0088cc);
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.secondary-btn:hover:not(:disabled) {
    background: var(--tg-theme-button-color, #0088cc);
    color: var(--tg-theme-button-text-color, #fff);
}

.secondary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error-message {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    padding: 16px;
    color: #c33;
}

.error-message h3 {
    margin-top: 0;
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);