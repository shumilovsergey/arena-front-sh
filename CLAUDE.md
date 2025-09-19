# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Telegram Web App frontend with device detection and responsive design. It's designed as a single-page application that integrates with the Telegram WebApp API and communicates with a backend API. The app automatically detects device types (mobile/tablet/desktop) and platforms (iOS/Android/etc.) to apply appropriate styling and behavior.

## Quick Start Commands

```bash
# Serve locally for development (any static server works)
python -m http.server 8000
# or
npx serve .
# or use Live Server in VS Code

# Open in browser
open http://localhost:8000
```

## Project Structure

```
├── index.html              # Main entry point with device detection
├── app.js                  # Main application logic and API communication
├── config.js               # Centralized configuration (API URLs, debug settings)
├── telegram.js             # Telegram WebApp initialization and utilities
├── style.css               # Responsive styles with Telegram theme support
├── assets/                 # Welcome page assets (logo, icons)
│   └── logo.png           # App logo (80x80px recommended)
└── pages/                  # Page templates for multi-page apps
    └── main/               # Example page template
        ├── index.html      # Page HTML
        ├── app.js          # Page-specific logic
        └── style.css       # Page-specific styles
```

## Architecture

### Core Classes and Components

- **App class (app.js)**: Main application controller that handles device detection, platform detection, API communication, and user interface management
- **TelegramApp class (telegram.js)**: Handles Telegram WebApp integration, theme application, haptic feedback, and navigation buttons
- **AppConfig (config.js)**: Centralized configuration object with API settings, debug modes, and helper functions

### Key Features

1. **Device Detection**: Automatically detects mobile/tablet/desktop and applies appropriate CSS classes and styles
2. **Platform Detection**: Identifies iOS, Android, macOS, Windows, Linux with platform-specific adjustments
3. **Telegram Integration**: Complete WebApp API integration with theme support, haptic feedback, main button, and back button
4. **Responsive Design**: Fullscreen on mobile, windowed on desktop with Telegram theme colors
5. **API Communication**: RESTful API integration with authentication via Telegram WebApp init data
6. **Debug Console**: Visual debug console for development (configurable in config.js)

### Configuration System

The app uses a centralized configuration system in `config.js`:
- **API Configuration**: Backend URL (auto-switches between localhost and production), timeout, retry settings
- **Debug Settings**: Debug mode, visual debug console, logging
- **Telegram Settings**: Auto-expand, haptic feedback, main button visibility
- **UI Settings**: Animation durations, error display times

### API Integration

The app communicates with a backend API using:
- **Authentication**: Telegram WebApp init data sent in `X-Telegram-Init-Data` header
- **Base URL**: Configured in `config.js`, automatically switches between development and production
- **Endpoints**:
  - `GET /api/user` - Get or create user data
  - `POST /api/user` - Update user data
  - `GET /api/health` - API health check

## Development Workflow

### Configuration Updates

1. **Backend URL**: Update `config.js` line 11 with your backend URL
2. **Debug Settings**: Enable/disable debug console and logging in `config.js`
3. **App Metadata**: Update app name and version in `config.js`

### Adding New Features

1. **Single Page App**: Add functionality directly to `app.js`
2. **Multi-Page App**: Create new folders in `pages/` using `pages/main/` as template
3. **New API Endpoints**: Add methods to the App class for API communication
4. **Telegram Features**: Extend TelegramApp class in `telegram.js`

### Styling and Theming

- **Responsive Design**: Uses CSS classes `.device-mobile`, `.device-tablet`, `.device-desktop`
- **Platform Styles**: Uses CSS classes `.platform-ios`, `.platform-android`, etc.
- **Telegram Theme**: Uses CSS custom properties from Telegram WebApp API (e.g., `var(--tg-theme-bg-color)`)
- **Safe Areas**: Properly handles iOS safe areas with `env(safe-area-inset-*)`

### Testing and Debugging

- **Local Testing**: Serve files locally and test in browser
- **Telegram Testing**: Use Telegram WebApp test environment or deploy to hosting
- **Debug Console**: Enable in `config.js` for visual debugging interface
- **Device Simulation**: Use browser dev tools to simulate different devices

## Deployment

This is a static frontend that can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server

After deployment, update the backend URL in `config.js` to point to your production backend.

## Important Notes

- **No Build Process**: This is a vanilla JavaScript app with no build step required
- **Device Detection**: Happens automatically on app initialization
- **Telegram Theme**: Applied automatically when running in Telegram WebApp
- **API Authentication**: Uses Telegram WebApp init data for secure authentication
- **Responsive by Default**: Automatically adapts to device type and platform