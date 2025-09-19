# Backend Changes Required for Arena LoL

## Root Cause Analysis

The Arena backend has overly restrictive CORS configuration compared to the working Telegram Drive backend. The Telegram WebApp environment requires more permissive CORS settings to function properly.

## Comparison: Working vs Failing

### Working Telegram Drive Backend (`tg-drive-backend`)
```python
# In app/__init__.py
CORS(app)  # Simple, permissive CORS for entire app
```

### Failing Arena Backend (`arena-back-sh`)
```python
# In app/__init__.py
CORS(app,
     origins=["https://web.telegram.org", frontend_url],  # Too restrictive
     allow_headers=["Content-Type", "X-Telegram-Init-Data"],  # Limited headers
     methods=["GET", "POST", "OPTIONS"],  # Limited methods
     supports_credentials=True)
```

## Required Changes

### Change 1: Update CORS Configuration

**File:** `arena-back-sh/app/__init__.py`

**Replace this:**
```python
CORS(app,
     origins=["https://web.telegram.org", frontend_url],
     allow_headers=["Content-Type", "X-Telegram-Init-Data"],
     methods=["GET", "POST", "OPTIONS"],
     supports_credentials=True)
```

**With this (Option A - Simple):**
```python
CORS(app)  # Match working Telegram Drive backend
```

**Or this (Option B - More controlled):**
```python
CORS(app,
     origins=["*"],  # Allow all origins for Telegram WebApp compatibility
     allow_headers=["*"],  # Allow all headers (Telegram sends various headers)
     methods=["*"],  # Allow all methods
     supports_credentials=True)
```

**Or this (Option C - Telegram-specific):**
```python
CORS(app,
     origins=[
         "https://web.telegram.org",
         "https://shumilovsergey.github.io",
         "https://shumilovsergey.github.io/arena-front-sh",
         "*"  # Fallback for Telegram WebApp variations
     ],
     allow_headers=["*"],  # Critical: Telegram WebApp sends various headers
     methods=["*"],
     supports_credentials=True)
```

**Recommendation:** Start with Option A (simple `CORS(app)`) since it matches the working project.

### Change 2: Add Requirements (if needed)

**File:** `arena-back-sh/requirements.txt`

Ensure you have:
```
flask-cors>=4.0.0
```

### Change 3: Optional - Add JSONP Endpoint (if CORS still fails)

**File:** `arena-back-sh/app/routes.py`

Add this endpoint as a backup:
```python
import json
from flask import request

@bp.route('/user/get_data_jsonp', methods=['GET'])
def get_user_data_jsonp():
    """JSONP endpoint to bypass strict CSP in Telegram WebApp"""
    try:
        # Get callback function name
        callback = request.args.get('callback')
        if not callback:
            return "Error: No callback specified", 400

        # Get init data from URL parameter
        init_data = request.args.get('init_data', '')

        # Validate Telegram data (reuse existing validation)
        if not init_data:
            return f"{callback}({{'error': 'No init data provided'}})", 400

        try:
            # Use your existing validation function
            user_data = validate_telegram_data(init_data)
        except Exception as e:
            return f"{callback}({{'error': 'Invalid authentication data'}})", 400

        # Get or create user (reuse existing logic)
        user = get_or_create_user(user_data)

        # Return JSONP response
        response_data = {'user': user.to_dict()}
        jsonp_response = f"{callback}({json.dumps(response_data)})"

        return jsonp_response, 200, {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
        }

    except Exception as e:
        error_response = f"{callback}({{'error': 'Server error: {str(e)}'}})"
        return error_response, 500

@bp.route('/user/up_data_jsonp', methods=['GET'])
def update_user_data_jsonp():
    """JSONP endpoint for updating user data"""
    try:
        callback = request.args.get('callback')
        if not callback:
            return "Error: No callback specified", 400

        init_data = request.args.get('init_data', '')
        user_data_json = request.args.get('user_data', '{}')

        if not init_data:
            return f"{callback}({{'error': 'No init data provided'}})", 400

        try:
            user_data = validate_telegram_data(init_data)
            new_user_data = json.loads(user_data_json)
        except Exception as e:
            return f"{callback}({{'error': 'Invalid data'}})", 400

        # Update user data (reuse existing logic)
        user = update_user_data(user_data, new_user_data)

        response_data = {'user': user.to_dict()}
        jsonp_response = f"{callback}({json.dumps(response_data)})"

        return jsonp_response, 200, {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
        }

    except Exception as e:
        error_response = f"{callback}({{'error': 'Server error: {str(e)}'}})"
        return error_response, 500
```

## Deployment Steps

1. **Update CORS configuration** in `arena-back-sh/app/__init__.py`
2. **Commit and push** changes to your backend repository
3. **Redeploy backend** using Docker Compose:
   ```bash
   cd arena-back-sh
   docker-compose down
   docker-compose up -d --build
   ```
4. **Test the frontend** - it should now work with the existing API endpoints

## Testing

After backend changes:
1. Test your frontend at `https://shumilovsergey.github.io/arena-front-sh/`
2. Check browser dev tools for any remaining CORS errors
3. Verify API calls succeed

## Why This Fixes the Issue

- **Telegram WebApp environment** has specific requirements for CORS headers
- **Restrictive CORS policy** was blocking legitimate requests from Telegram
- **Working Telegram Drive backend** uses permissive CORS and works perfectly
- **This change aligns** your Arena backend with the proven working configuration

## Security Note

Using `CORS(app)` or `origins=["*"]` is less secure but necessary for Telegram WebApp compatibility. If security is a concern:
1. Keep the permissive CORS for now to get it working
2. Later, gradually restrict origins once you identify all the exact origins Telegram uses
3. Monitor logs to see what origins are making requests

## Rollback Plan

If changes cause issues:
```python
# Restore original restrictive CORS
CORS(app,
     origins=["https://web.telegram.org", frontend_url],
     allow_headers=["Content-Type", "X-Telegram-Init-Data"],
     methods=["GET", "POST", "OPTIONS"],
     supports_credentials=True)
```

## Expected Result

After these changes:
- ✅ Frontend API requests should succeed
- ✅ No more "Load failed" or "XHR Error: 0" errors
- ✅ User data loading and updating should work
- ✅ Telegram WebApp integration should be fully functional