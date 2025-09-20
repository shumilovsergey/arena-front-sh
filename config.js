// Configuration file for Arena LoL Telegram WebApp

// Environment Configuration
const ENVIRONMENT = 'dev'; // Change to 'prod' for production routes

// API Configuration
const API_BASE_URL = 'https://arena-back.sh-development.ru/api';

// Route prefix based on environment
const ROUTE_PREFIX = ENVIRONMENT === 'prod' ? '/user' : '/dev';

// API Endpoints
const API_ENDPOINTS = {
    GET_DATA: API_BASE_URL + ROUTE_PREFIX + '/get_data',
    UPDATE_DATA: API_BASE_URL + ROUTE_PREFIX + '/up_data'
};

// App Configuration
const APP_CONFIG = {
    // App Info
    APP_NAME: 'Arena LoL',
    APP_EMOJI: '🎮',

    // UI Configuration
    AUTO_HIDE_STATUS_DELAY: 5000, // 5 seconds
    DEBUG_MAX_HEIGHT: '300px',

    // Default placeholders
    DEFAULT_JSON_PLACEHOLDER: '{"test": "test_data", "preferences": {"theme": "dark"}}',

    // Feature flags
    ENABLE_DEBUG: true,
    ENABLE_HAPTIC_FEEDBACK: true,
    ENABLE_AUTO_EXPAND: true
};

// Telegram WebApp Configuration
const TELEGRAM_CONFIG = {
    // Theme support
    ENABLE_THEME_PARAMS: true,

    // Haptic feedback types
    HAPTIC_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        LIGHT: 'light',
        MEDIUM: 'medium',
        HEAVY: 'heavy'
    }
};

// Export configuration for use in other files
window.CONFIG = {
    ENVIRONMENT,
    API_BASE_URL,
    ROUTE_PREFIX,
    API_ENDPOINTS,
    APP_CONFIG,
    TELEGRAM_CONFIG
};