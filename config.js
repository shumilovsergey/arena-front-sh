/**
 * ⚠️ TELEGRAM WEB APP CONFIGURATION
 *
 * QUICK SETUP:
 * 1. Choose your configuration below (LOCAL_DEV or PRODUCTION)
 * 2. Replace YOUR_FLASK_PORT with your backend port (e.g., 5001, 8080, 9002)
 * 3. Replace your-backend-domain.com with your actual backend URL
 */

// ===== CHOOSE YOUR CONFIGURATION =====

// 🔧 LOCAL DEVELOPMENT - Use this when developing on localhost
const LOCAL_DEV = {
    api: {
        baseUrl: 'http://localhost:YOUR_FLASK_PORT/api', // ⚠️ CHANGE: Replace YOUR_FLASK_PORT (e.g., 5001, 8080, 9002)
        timeout: 10000,
        maxRetries: 3,
        retryDelay: 1000
    },
    app: {
        name: 'Telegram App Template - Dev',
        version: '1.0.0',
        debug: true,
        debugConsole: true,
        enableDevMode: true,  // Allows dev without Telegram authentication
        devAuthHeader: 'dev-user-bypass',
    },
    telegram: {
        autoExpand: true,
        hapticFeedback: true,
        showMainButton: false
    },
    ui: {
        loadingDuration: 500,
        errorDisplayDuration: 5000
    }
};

// 🚀 PRODUCTION - Use this for deployed app
const PRODUCTION = {
    api: {
        baseUrl: 'https://arena-back.sh-development.ru/api', // ⚠️ CHANGE: Replace with your actual backend URL
        timeout: 10000,
        maxRetries: 3,
        retryDelay: 1000
    },
    app: {
        name: 'Telegram App Template',
        version: '1.0.0',
        debug: true,
        debugConsole: true,
        enableDevMode: true,  // Disabled in production - Telegram auth required
        devAuthHeader: 'dev-user-bypass',
    },
    telegram: {
        autoExpand: true,
        hapticFeedback: true,
        showMainButton: false
    },
    ui: {
        loadingDuration: 500,
        errorDisplayDuration: 5000
    }
};

// 📚 WORKING EXAMPLE - Arena LoL (for reference)
const ARENA_EXAMPLE = {
    api: {
        baseUrl: window.location.hostname === 'localhost'
            ? 'http://localhost:9002/api'  // Arena uses port 9002
            : 'https://arena-back.sh-development.ru/api',
        timeout: 10000,
        maxRetries: 3,
        retryDelay: 1000
    },
    app: {
        name: 'Arena LoL',
        debug: window.location.hostname === 'localhost',
        debugConsole: window.location.hostname === 'localhost',
        enableDevMode: window.location.hostname === 'localhost',
        devAuthHeader: 'dev-user-bypass',
    },
    telegram: {
        autoExpand: true,
        hapticFeedback: true,
        showMainButton: false
    },
    ui: {
        loadingDuration: 500,
        errorDisplayDuration: 5000
    }
};

// ===== ACTIVATE YOUR CONFIGURATION =====

// 🔽 CHOOSE ONE: Uncomment the configuration you want to use
// window.AppConfig = LOCAL_DEV;        // ← Use this for local development
window.AppConfig = PRODUCTION;    // ← Use this for production deployment
// window.AppConfig = ARENA_EXAMPLE; // ← Use this for Arena LoL setup

// 💡 TIP: You can also auto-switch between dev/prod:
// window.AppConfig = window.location.hostname === 'localhost' ? LOCAL_DEV : PRODUCTION;

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

    if (config.api.baseUrl.includes('YOUR_FLASK_PORT')) {
        console.warn('⚠️ Please replace YOUR_FLASK_PORT with your actual backend port (e.g., 5001, 8080, 9002)');
    }

    // Log the configured backend URL for debugging
    console.log('🌐 Backend URL configured:', config.api.baseUrl);

    config.log('Configuration loaded:', config);
})();

// ⚠️ IMPORTANT: PORT CONFIGURATION REMINDER
// If you see "YOUR_FLASK_PORT" in the console log above:
// 1. Replace YOUR_FLASK_PORT with your actual backend port (e.g., 5001, 8080, 9002)
// 2. Make sure it matches the FLASK_PORT in your backend .env file
// 3. Choose an available port to avoid conflicts