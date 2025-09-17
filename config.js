/**
 * Centralized configuration for the Telegram App
 * Update this file to configure your backend URL and other settings
 */

window.AppConfig = {
    // API Configuration
    api: {
        baseUrl: window.location.hostname === 'localhost'
            ? 'http://localhost:5000/api'
            : 'https://arena-back.sh-development.ru/api', // ← Backend API URL

        // Request timeout in milliseconds
        timeout: 10000,

        // Retry configuration
        maxRetries: 3,
        retryDelay: 1000
    },

    // App Configuration
    app: {
        name: 'Telegram App Template',
        version: '1.0.0',

        // Debug mode (enables console logging)
        debug: window.location.hostname === 'localhost',

        // Page system configuration
        defaultPage: 'welcome',
        pageTransitionDuration: 300
    },

    // Telegram WebApp Configuration
    telegram: {
        // Auto-expand webapp on startup
        autoExpand: true,

        // Enable haptic feedback
        hapticFeedback: true,

        // Show main button by default
        showMainButton: false
    },

    // Pages configuration
    pages: {
        // Available pages in the app
        available: ['welcome', 'main'],

        // Page paths (relative to front/ directory)
        paths: {
            main: './pages/main/'
        }
    },

    // UI Configuration
    ui: {
        // Loading animation duration
        loadingDuration: 500,

        // Error display duration
        errorDisplayDuration: 5000
    }
};

// Helper functions for configuration
window.AppConfig.getApiUrl = function(endpoint = '') {
    return `${this.api.baseUrl}${endpoint}`;
};

window.AppConfig.isDebug = function() {
    return this.app.debug;
};

window.AppConfig.log = function(...args) {
    if (this.isDebug()) {
        console.log('[App]', ...args);
    }
};

window.AppConfig.logError = function(...args) {
    if (this.isDebug()) {
        console.error('[App Error]', ...args);
    }
};

// Validation on load
(function validateConfig() {
    const config = window.AppConfig;

    if (config.api.baseUrl.includes('your-backend-domain.com')) {
        console.warn('⚠️ Please update the backend URL in config.js');
    }

    config.log('Configuration loaded:', config);
})();