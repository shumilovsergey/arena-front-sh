/**
 * Main page application logic
 */

class MainPage {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();

        // Show back button in Telegram
        if (window.tgApp?.isInTelegram) {
            window.tgApp.showBackButton();
        }
    }

    setupEventListeners() {
        const updateBtn = document.getElementById('update-btn');
        const backBtn = document.getElementById('back-btn');

        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.handleUpdate());
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => this.handleBack());
        }
    }

    async loadUserData() {
        try {
            // Try to get user from main app first
            if (window.app && window.app.getCurrentUser()) {
                this.user = window.app.getCurrentUser();
                this.displayUserInfo();
                return;
            }

            // If not available, fetch from API
            const headers = window.tgApp?.isInTelegram
                ? window.tgApp.getAuthHeaders()
                : { 'Content-Type': 'application/json' };

            const response = await fetch(AppConfig.getApiUrl('/user'), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            this.user = result.user;
            this.displayUserInfo();

        } catch (error) {
            AppConfig.logError('Failed to load user data:', error);
            this.showError('Failed to load user data');
        }
    }

    displayUserInfo() {
        const userInfoEl = document.getElementById('user-info');
        if (!userInfoEl || !this.user) return;

        userInfoEl.innerHTML = `
            <h3>User Information</h3>
            <p><strong>ID:</strong> ${this.user.telegram_id}</p>
            <p><strong>Name:</strong> ${this.user.first_name} ${this.user.last_name || ''}</p>
            ${this.user.username ? `<p><strong>Username:</strong> @${this.user.username}</p>` : ''}
            <p><strong>Language:</strong> ${this.user.language_code || 'Unknown'}</p>
            <p><strong>Created:</strong> ${new Date(this.user.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> ${new Date(this.user.updated_at).toLocaleString()}</p>

            <div class="user-data">
${JSON.stringify(this.user.user_data, null, 2)}
            </div>
        `;
    }

    async handleUpdate() {
        try {
            if (window.tgApp?.isInTelegram) {
                window.tgApp.hapticFeedback('impact', 'light');
            }

            const updateBtn = document.getElementById('update-btn');
            if (updateBtn) {
                updateBtn.textContent = 'Updating...';
                updateBtn.disabled = true;
            }

            // Example update - add a timestamp to user_data
            const updateData = {
                user_data: {
                    ...this.user.user_data,
                    last_action: new Date().toISOString(),
                    action_count: (this.user.user_data.action_count || 0) + 1
                }
            };

            const headers = window.tgApp?.isInTelegram
                ? window.tgApp.getAuthHeaders()
                : { 'Content-Type': 'application/json' };

            const response = await fetch(AppConfig.getApiUrl('/user'), {
                method: 'POST',
                headers,
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            this.user = result.user;
            this.displayUserInfo();

            if (window.tgApp?.isInTelegram) {
                window.tgApp.hapticFeedback('notification', 'success');
            }

        } catch (error) {
            AppConfig.logError('Failed to update user data:', error);
            this.showError('Failed to update user data');

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

    handleBack() {
        if (window.tgApp?.isInTelegram) {
            window.tgApp.hapticFeedback('impact', 'light');
            window.tgApp.hideBackButton();
        }

        // Go back to main app
        if (window.app) {
            window.app.goHome();
        } else {
            window.history.back();
        }
    }

    showError(message) {
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl) {
            userInfoEl.innerHTML = `
                <div class="error-message">
                    <p style="color: #dc3545;"><strong>Error:</strong> ${message}</p>
                </div>
            `;
        }
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mainPage = new MainPage();
});