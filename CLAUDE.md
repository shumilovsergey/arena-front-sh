# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arena LoL is a League of Legends champion tracking application built as a Telegram Web App. The main application (index.html) allows users to track their Arena challenge progress by marking champions as completed, with filtering and search capabilities. The project also includes a simpler user data management interface (test.html) for testing API interactions.

## Development Commands

Since this is a frontend-only project with no build process:

```bash
# Start development server (any static file server)
python3 -m http.server 8000
# or
npx serve .
# or use Live Server extension in VS Code

# Deploy to GitHub Pages (automatic on push to main)
git push origin main

# Force production environment in config
sed -i "s/const ENVIRONMENT = '[^']*'/const ENVIRONMENT = 'prod'/" config.js
```

## Architecture Overview

### Core Structure
- **index.html**: Main Arena challenge tracker with League of Legends champion grid
- **test.html**: Simple user data management interface for testing
- **app.js**: Main application logic and API communication
- **telegram.js**: Telegram Web App SDK integration and device management
- **config.js**: Environment configuration and API endpoints
- **style.css**: Responsive styling with Telegram theme support

### Key Architectural Patterns

**Single-Page Applications**: Both index.html and test.html are self-contained SPAs with embedded JavaScript. The main ArenaTracker logic is embedded directly in index.html for the champion tracking functionality.

**Telegram Web App Integration**:
- Uses official Telegram Web App SDK
- Implements device detection and optimal viewport mode selection
- Provides authentication headers for API calls
- Supports haptic feedback and theme integration

**API Communication**:
- Environment-based routing (dev/prod endpoints)
- Centralized authentication through Telegram init data
- RESTful endpoints for user data operations

**State Management**:
- Local state management in JavaScript classes (ArenaApp, ArenaTracker, TelegramWebApp)
- User progress stored remotely via API calls
- Local caching of champion data from Riot Games API

### Champion Data Integration
The application fetches champion data from Riot Games Data Dragon API:
- Dynamically loads latest game version
- Fetches champion metadata and images
- Implements client-side filtering by champion class and search
- Displays champion portraits in responsive grid layout

### Device Adaptation
- **Mobile**: Attempts fullscreen mode via `requestFullscreen()` with fallback to expand mode
- **Desktop**: Uses standard expand mode for optimal window size
- **Platform Detection**: Handles iOS, Android, macOS, Windows, and Linux platforms
- **Responsive Design**: CSS breakpoints adapt UI for different screen sizes

## Configuration Management

**Environment Switching**:
- `config.js` contains `ENVIRONMENT` variable ('dev' or 'prod')
- GitHub Actions automatically sets to 'prod' during deployment
- Controls API endpoint routing and feature flags

**API Endpoints**:
- Dev: `https://arena-back.sh-development.ru/api/dev/*`
- Prod: `https://arena-back.sh-development.ru/api/user/*`

**Feature Flags**:
- `ENABLE_DEBUG`: Console logging and debug UI
- `ENABLE_HAPTIC_FEEDBACK`: Telegram haptic feedback
- `ENABLE_THEME_PARAMS`: Telegram theme integration

## Key Integration Points

**Telegram Authentication**: All API calls include `X-Telegram-Init-Data` header with Telegram Web App initialization data for user authentication.

**Riot Games API**: Champion data fetched from `https://ddragon.leagueoflegends.com/` with version-aware URLs for champion metadata and images.

**GitHub Pages Deployment**: Automatic deployment via GitHub Actions workflow that forces production environment during build.

## Development Notes

- No package.json or build process - pure static files
- All dependencies loaded via CDN (Telegram Web App SDK)
- CSS uses Telegram theme CSS custom properties for dynamic theming
- Arena progress data structure: `{user_data: {arena_progress: [championId1, championId2, ...]}}`
- Champion filtering supports both class-based filtering and text search
- Viewport management crucial for proper Telegram Web App experience across devices