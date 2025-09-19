# Frontend API Integration Guide

Complete guide for setting up the frontend of your Telegram Web App with the backend API.

## Quick Start

### 1. Environment Setup

1. **Copy the template frontend folder** to your project
2. **Configure your environment** by editing `front/config.js`:

```javascript
// Choose your configuration by uncommenting one line:
window.AppConfig = LOCAL_DEV;     // ← For local development
// window.AppConfig = PRODUCTION; // ← For production deployment

// Update the URLs in LOCAL_DEV and PRODUCTION sections:
// - Replace YOUR_FLASK_PORT with your backend port (e.g., 5001, 8080, 9002)
// - Replace your-backend-domain.com with your actual backend URL
```

### 2. Deploy Frontend

Deploy the `front/` folder to any static hosting platform:

#### GitHub Pages
```bash
# 1. Push front/ folder contents to gh-pages branch
# 2. Enable GitHub Pages in repository settings
# 3. Your app will be available at: https://username.github.io/repository-name
```

#### Netlify
```bash
# 1. Drag and drop front/ folder to Netlify dashboard
# 2. Or connect GitHub repository and set build folder to "front"
```

#### Vercel
```bash
# 1. Install Vercel CLI: npm i -g vercel
# 2. Run: vercel --cwd front
```

### 3. Update Backend Configuration

Update your backend `.env` file with frontend URL:
```bash
FRONTEND_URL=https://yourusername.github.io/your-repo-name
```

## API Integration

### Authentication

The frontend automatically handles Telegram WebApp authentication:

```javascript
// Get authentication headers (automatic)
const headers = window.tgApp?.isInTelegram
    ? window.tgApp.getAuthHeaders()
    : { 'Content-Type': 'application/json' };
```

### API Endpoints

#### Get User Data
```javascript
const response = await fetch(AppConfig.getApiUrl('/get_data'), {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': window.Telegram.WebApp.initData
    },
    body: JSON.stringify({})
});

const result = await response.json();
const user = result.user;
```

#### Update User Data
```javascript
const updateData = {
    user_data: {
        level: 10,
        score: 1500,
        preferences: {
            theme: 'dark',
            notifications: true
        }
    }
};

const response = await fetch(AppConfig.getApiUrl('/up_data'), {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': window.Telegram.WebApp.initData
    },
    body: JSON.stringify(updateData)
});

const result = await response.json();
const updatedUser = result.user;
```

## Configuration Examples

### Simple Configuration

The new `config.js` has pre-built configurations you just need to activate:

```javascript
// front/config.js - Just uncomment the one you want:

window.AppConfig = LOCAL_DEV;     // ← For local development
// window.AppConfig = PRODUCTION; // ← For production

// Or auto-switch:
// window.AppConfig = window.location.hostname === 'localhost' ? LOCAL_DEV : PRODUCTION;
```

**LOCAL_DEV includes:**
- Debug mode enabled
- Visual debug console
- Dev user bypass for local development
- `http://localhost:YOUR_FLASK_PORT/api` URL

**PRODUCTION includes:**
- Debug mode disabled
- No debug console
- Telegram authentication required
- `https://your-backend-domain.com/api` URL

## Development Workflow

### 1. Local Development

1. **Start backend** (see back_api.md):
   ```bash
   cd back && docker-compose up --build
   ```

2. **Serve frontend locally**:
   ```bash
   cd front && python -m http.server 8000
   # or
   cd front && npx serve
   ```

3. **Activate LOCAL_DEV** configuration:
   ```javascript
   // In front/config.js - make sure this line is uncommented:
   window.AppConfig = LOCAL_DEV;

   // Update YOUR_FLASK_PORT in the LOCAL_DEV section
   ```

4. **Open in browser**: `http://localhost:8000`

### 2. Testing in Telegram

1. **Deploy frontend** to hosting platform
2. **Create Telegram Bot** via @BotFather
3. **Set WebApp URL** in bot settings:
   ```
   /newapp
   @your_bot_name
   My App
   App description
   https://yourusername.github.io/your-repo-name
   ```
4. **Test** by opening bot in Telegram

### 3. Production Deployment

1. **Switch to PRODUCTION** configuration:
   ```javascript
   // In front/config.js - comment LOCAL_DEV, uncomment PRODUCTION:
   // window.AppConfig = LOCAL_DEV;
   window.AppConfig = PRODUCTION;
   ```
2. **Update production URLs** in PRODUCTION section
3. **Deploy frontend** to hosting platform
4. **Update backend .env** with frontend URL

## Debugging

### Enable Debug Console

Set `debugConsole: true` in config.js to see visual debugging:

```javascript
app: {
    debugConsole: true,  // Shows debug console overlay
}
```

The debug console shows:
- 🚀 Application initialization logs
- 📱 Device and platform detection
- 🔐 Authentication flow details
- 📤 API request details
- 📥 API response data
- ❌ Error messages with stack traces

### Browser Developer Tools

1. **Open DevTools** (F12)
2. **Check Console** for log messages
3. **Check Network tab** for API requests
4. **Verify** X-Telegram-Init-Data header is present

### Common Issues

#### "Load failed" or Network Errors
```javascript
// Check if backend URL is correct
console.log('Backend URL:', AppConfig.api.baseUrl);

// Verify backend is accessible
fetch(AppConfig.api.baseUrl.replace('/api', '/health'))
    .then(r => r.json())
    .then(console.log);
```

#### CORS Errors
- Backend must have CORS properly configured
- Frontend and backend URLs must match .env configuration
- Use HTTPS for production

#### Authentication Errors
- Verify app is opened in Telegram (not browser)
- Check X-Telegram-Init-Data header is being sent
- Ensure bot token is correctly configured in backend

## API Client Class

Create a reusable API client:

```javascript
// front/api.js
class TelegramAPI {
    constructor() {
        this.baseUrl = AppConfig.api.baseUrl;
    }

    async request(endpoint, data = {}) {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add Telegram auth if available
        if (window.Telegram?.WebApp?.initData) {
            headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async getUserData() {
        const result = await this.request('/get_data');
        return result.user;
    }

    async updateUserData(userData) {
        const result = await this.request('/up_data', userData);
        return result.user;
    }

    async checkHealth() {
        const response = await fetch(`${this.baseUrl}/health`);
        return response.json();
    }
}

// Usage
const api = new TelegramAPI();

try {
    const user = await api.getUserData();
    console.log('User:', user);
} catch (error) {
    console.error('API Error:', error.message);
}
```

## React Integration

For React applications:

```javascript
// hooks/useUser.js
import { useState, useEffect } from 'react';

export function useUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const api = new TelegramAPI();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            setLoading(true);
            const userData = await api.getUserData();
            setUser(userData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData) => {
        try {
            const updatedUser = await api.updateUserData(userData);
            setUser(updatedUser);
            return updatedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return { user, loading, error, updateUser, reload: loadUser };
}

// Component usage
function UserProfile() {
    const { user, loading, error, updateUser } = useUser();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Hello, {user.first_name}!</h1>
            <button onClick={() => updateUser({ user_data: { timestamp: Date.now() } })}>
                Update Data
            </button>
        </div>
    );
}
```

## Deployment Checklist

Before deploying to production:

- [ ] Update `baseUrl` in config.js with production backend URL
- [ ] Set `debug: false` and `debugConsole: false`
- [ ] Test API connectivity with browser developer tools
- [ ] Verify backend CORS allows your frontend domain
- [ ] Confirm HTTPS is used for production (required by Telegram)
- [ ] Test authentication flow in actual Telegram app
- [ ] Monitor browser console for any errors

## Support

### Environment Files Reference

Check `front/env.js` for complete configuration examples.

### Working Examples

- **Arena LoL**: https://github.com/shumilovsergey/arena-front-sh
- **Backend**: https://github.com/shumilovsergey/arena-back-sh

### Common Hosting Platforms

| Platform | Deploy Command | Notes |
|----------|----------------|-------|
| GitHub Pages | Push to gh-pages branch | Free, automatic SSL |
| Netlify | Drag & drop front/ folder | Free tier, instant deployment |
| Vercel | `vercel --cwd front` | Free tier, excellent performance |
| Firebase Hosting | `firebase deploy` | Google infrastructure |

### Next Steps

1. Set up your frontend using this guide
2. Configure your backend using `back_api.md`
3. Test the integration locally
4. Deploy to production
5. Configure your Telegram bot with the WebApp URL