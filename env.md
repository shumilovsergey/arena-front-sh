# Environment Configuration

This document explains how to switch between development and production environments in the Arena LoL frontend application.

## Environment Switching

The `index.html` file uses a single environment constant to switch between development and production API routes.

### How to Switch Environments

1. Open `index.html` file
2. Locate the configuration section at the top of the `<script>` tag (around line 219)
3. Find this line:
   ```javascript
   const ENVIRONMENT = 'dev'; // Change to 'prod' for production routes
   ```

### Available Environments

#### Development Environment
```javascript
const ENVIRONMENT = 'dev';
```
- **Routes used**: `/dev/get_data` and `/dev/up_data`
- **Purpose**: Local development and testing
- **Authentication**: Relaxed authentication requirements
- **Usage**: Use this for local development work

#### Production Environment
```javascript
const ENVIRONMENT = 'prod';
```
- **Routes used**: `/user/get_data` and `/user/up_data`
- **Purpose**: Production deployment
- **Authentication**: Requires full Telegram Mini App authentication
- **Usage**: Use this for production deployment

## Quick Switch Instructions

### To Development Mode:
1. Change line to: `const ENVIRONMENT = 'dev';`
2. Save the file
3. Refresh your browser

### To Production Mode:
1. Change line to: `const ENVIRONMENT = 'prod';`
2. Save the file
3. Refresh your browser

## Verification

After switching environments, you can verify the change by:

1. Opening browser developer tools (F12)
2. Going to the Console tab
3. Looking for debug messages that show the API endpoint being used
4. You should see either:
   - `Making request to: https://arena-back.sh-development.ru/api/dev/get_data` (dev mode)
   - `Making request to: https://arena-back.sh-development.ru/api/user/get_data` (prod mode)

## Important Notes

- **Always use `dev` mode** for local development and testing
- **Only use `prod` mode** when deploying to production or testing with full Telegram Mini App context
- **Remember to switch to `prod`** before final deployment
- **The backend API must support** both `/dev/*` and `/user/*` endpoints for this to work properly

## File Structure

- `index.html` - Main application file with environment switching
- `prod.html` - Legacy production file (now redundant - use `index.html` with `ENVIRONMENT = 'prod'`)

## Troubleshooting

If you encounter issues:

1. **Check the environment setting** in `index.html`
2. **Verify the console logs** to see which endpoints are being called
3. **Ensure the backend** supports the endpoint you're trying to use
4. **For production mode**, make sure you're accessing the app through Telegram Mini App context