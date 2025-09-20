// Arena LoL Main Application Logic

class ArenaApp {
    constructor() {
        this.currentUserData = null;
        this.debugLogs = [];

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        this.debugLog('Application initializing...');

        // Check if required dependencies are loaded
        if (!window.CONFIG) {
            console.error('Config not loaded! Make sure config.js is included before app.js');
            return;
        }

        if (!window.TelegramApp) {
            console.error('Telegram WebApp not loaded! Make sure telegram.js is included before app.js');
            return;
        }

        // Set up app title
        this.updateAppTitle();

        // Initialize the application
        this.loadUserData();

        this.debugLog('Application initialized successfully');
    }

    // Debug System
    debugLog(message) {
        if (!window.CONFIG.APP_CONFIG.ENABLE_DEBUG) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.debugLogs.push(logEntry);
        console.log(logEntry);
        this.updateDebugDisplay();
    }

    updateDebugDisplay() {
        const debugContent = document.getElementById('debug-content');
        if (debugContent) {
            debugContent.textContent = this.debugLogs.join('\n');
            debugContent.scrollTop = debugContent.scrollHeight;
        }
    }

    toggleDebug() {
        const debugInfo = document.getElementById('debug-info');
        const button = event.target;
        if (debugInfo.style.display === 'none') {
            debugInfo.style.display = 'block';
            button.textContent = 'Hide Debug';
        } else {
            debugInfo.style.display = 'none';
            button.textContent = 'Show Debug';
        }
    }

    // UI Management
    updateAppTitle() {
        const config = window.CONFIG.APP_CONFIG;
        const titleElement = document.querySelector('h1');
        if (titleElement) {
            titleElement.textContent = `${config.APP_EMOJI} ${config.APP_NAME}`;
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.style.display = 'block';

        // Auto-hide after configured delay
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, window.CONFIG.APP_CONFIG.AUTO_HIDE_STATUS_DELAY);
    }

    showLoading(show = true) {
        const loadingEl = document.getElementById('loading');
        const mainContentEl = document.getElementById('main-content');

        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }

        if (mainContentEl) {
            mainContentEl.style.display = show ? 'none' : 'block';
        }
    }

    showErrorState(errorMessage) {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                Failed to load user data.
                <br><br>
                <button class="button secondary" onclick="arenaApp.toggleDebug(); document.getElementById('debug-info').style.display='block';">Show Debug Info</button>
                <button class="button" onclick="arenaApp.loadUserData()">Try Again</button>
            `;
        }

        // Show debug section automatically on error
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.style.display = 'block';
        }
    }

    // API Communication
    async apiRequest(endpoint, data = {}) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: window.TelegramApp.getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.debugLog(`API Error: ${response.status} - ${errorText}`);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            this.debugLog(`API Request Failed: ${error.message}`);
            throw error;
        }
    }

    // User Data Management
    async loadUserData() {
        try {
            this.debugLog('Starting loadUserData...');
            this.showStatus('Loading user data...', 'info');
            this.showLoading(true);

            const endpoint = window.CONFIG.API_ENDPOINTS.GET_DATA;
            this.debugLog(`Making request to: ${endpoint}`);

            const responseData = await this.apiRequest(endpoint);
            const userData = responseData.user || responseData;

            if (!userData) {
                throw new Error('No user data in response');
            }

            this.currentUserData = userData;

            // Display user information
            this.displayUserInfo(userData);
            this.displayUserData(userData.user_data || {});

            // Show main content
            this.showLoading(false);
            this.showStatus('User data loaded successfully!', 'success');

            // Haptic feedback for success
            window.TelegramApp.hapticFeedback('success');

        } catch (error) {
            this.debugLog(`ERROR: ${error.message}`);
            console.error('Failed to load user:', error);
            this.showStatus('Failed to load user data: ' + error.message, 'error');
            this.showErrorState(error.message);

            // Haptic feedback for error
            window.TelegramApp.hapticFeedback('error');
        }
    }

    async updateUserData() {
        try {
            const input = document.getElementById('user-data-input');
            const inputValue = input.value.trim();

            if (!inputValue) {
                this.showStatus('Please enter some data to update', 'error');
                return;
            }

            // Try to parse JSON
            let newUserData;
            try {
                newUserData = JSON.parse(inputValue);
            } catch (e) {
                this.showStatus('Invalid JSON format: ' + e.message, 'error');
                return;
            }

            this.showStatus('Updating user data...', 'info');

            const updateData = {
                user_data: newUserData
            };

            const endpoint = window.CONFIG.API_ENDPOINTS.UPDATE_DATA;
            this.debugLog(`Updating data at: ${endpoint}`);

            const responseData = await this.apiRequest(endpoint, updateData);
            const updatedUserData = responseData.user || responseData;
            this.currentUserData = updatedUserData;

            // Update display
            this.displayUserInfo(updatedUserData);
            this.displayUserData(updatedUserData.user_data || {});

            // Clear input
            input.value = '';

            this.showStatus('User data updated successfully!', 'success');

            // Haptic feedback for success
            window.TelegramApp.hapticFeedback('success');

        } catch (error) {
            console.error('Failed to update user:', error);
            this.showStatus('Failed to update user data: ' + error.message, 'error');

            // Haptic feedback for error
            window.TelegramApp.hapticFeedback('error');
        }
    }

    // Display Methods
    displayUserInfo(userData) {
        const userInfoEl = document.getElementById('user-info');
        if (!userInfoEl) return;

        userInfoEl.innerHTML = `
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${userData.first_name} ${userData.last_name || ''}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Username:</span>
                <span class="info-value">@${userData.username || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Telegram ID:</span>
                <span class="info-value">${userData.telegram_id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Language:</span>
                <span class="info-value">${userData.language_code || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Created:</span>
                <span class="info-value">${new Date(userData.created_at).toLocaleString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Updated:</span>
                <span class="info-value">${new Date(userData.updated_at).toLocaleString()}</span>
            </div>
        `;
    }

    displayUserData(userData) {
        const userDataEl = document.getElementById('user-data-display');
        if (!userDataEl) return;

        userDataEl.textContent = JSON.stringify(userData, null, 2);
    }

    // Utility Methods
    getCurrentUserData() {
        return this.currentUserData;
    }

    getEnvironment() {
        return window.CONFIG.ENVIRONMENT;
    }

    refreshUserData() {
        this.loadUserData();
    }
}

// Initialize the application
const arenaApp = new ArenaApp();

// Export for global use
window.ArenaApp = arenaApp;

// Global functions for onclick handlers
window.loadUserData = () => arenaApp.loadUserData();
window.updateUserData = () => arenaApp.updateUserData();
window.toggleDebug = () => arenaApp.toggleDebug();