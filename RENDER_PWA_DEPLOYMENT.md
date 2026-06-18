# Render Deployment Guide for PWA

## Overview

This guide explains how to deploy the Business Management System PWA to Render with automatic updates and proper service worker management.

## Prerequisites

- Render account (free tier available)
- Git repository with the project
- Built frontend (`dist` folder)

## Step-by-Step Deployment

### 1. Create Backend Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `bms-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Branch**: main
5. Add environment variables:
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```
6. Click "Create Web Service"

### 2. Create Frontend Service on Render

1. Click "New +" and select "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `bms-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Branch**: main
4. Click "Create Static Site"

### 3. Configure CORS and API Endpoints

Update your backend to accept requests from Render domain:

In `backend/src/app.js`:
```javascript
const cors = require('cors');

const allowedOrigins = [
  'https://bms-frontend.onrender.com', // Your Render frontend URL
  'http://localhost:3000', // Local development
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
}));
```

### 4. Update Frontend API URLs

In `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 
  'https://bms-backend.onrender.com/api';

// Or detect based on environment
const API_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:5000/api'
  : 'https://bms-backend.onrender.com/api';
```

### 5. Configure Service Worker for Render

The service worker is automatically deployed with your frontend. It will:
- Cache static assets from the CDN
- Detect new deployments
- Notify users of updates
- Auto-update after service worker activation

### 6. Deploy

1. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Add PWA support"
   git push origin main
   ```

2. Render will automatically:
   - Build the frontend: `npm run build`
   - Deploy the `dist` folder
   - Generate new asset hashes
   - Serve over HTTPS (✅ required for PWA)

## How PWA Updates Work on Render

### Deployment Cycle

1. **You push changes to GitHub**
   ```
   git push origin main
   ```

2. **Render detects the push**
   - Triggers automatic build
   - Runs: `cd frontend && npm install && npm run build`
   - Generates new asset hashes (timestamps in filenames)

3. **Service Worker detects changes**
   - Checks for updates every 1 hour
   - Detects new `sw.js` file
   - Installs new service worker in background
   - Triggers update notification in app

4. **User sees "Update Available" notification**
   - Appears when new version is detected
   - Shows: "New version available. Click Update to get the latest features."
   - User can click "Update Now" or "Later"

5. **Update is applied**
   - Service worker: `skipWaiting()` activated
   - Old cache cleared
   - New assets downloaded
   - App reloads automatically
   - User sees new version

### Automatic Update Flow

```
┌──────────────────────────────────────────┐
│ You push code to GitHub                  │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Render detects push & rebuilds           │
│ - Builds frontend                        │
│ - Generates new asset hashes             │
│ - Deploys to Render CDN (HTTPS ✅)       │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Service worker checks for updates        │
│ - Fetches new sw.js (has new hash)       │
│ - Detects changes                        │
│ - Installs new SW in background          │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ App shows "Update Available" notification│
│ - UpdateNotification component triggers  │
│ - User can update or dismiss             │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ User clicks "Update"                     │
│ - New SW takes over                      │
│ - Old cache cleared                      │
│ - App reloads                            │
│ - Latest version loads                   │
└──────────────────────────────────────────┘
```

## Service Worker Update Detection

The service worker checks for updates:
- **Every 1 hour** (automatic background check)
- **On app startup** (when user opens app)
- **User triggered** (when clicking update button)

Detection happens via:
```javascript
// In pwaUtils.js
swRegistration.update() // Checks for new sw.js
```

If new service worker found:
- `updatefound` event triggers
- `statechange` event monitors installation
- When installed and old SW is active → show notification
- User can click "Update" to activate new SW

## Handling Deployment Issues

### Service Worker Not Updating

1. **Check HTTPS**
   ```
   ✅ Render uses HTTPS by default
   ```

2. **Verify service worker registration**
   - Open DevTools → Application → Service Workers
   - Check status is "activated and running"

3. **Check cache**
   - Application → Cache Storage
   - Should see multiple cache entries
   - Old caches should be cleaned on update

4. **Force update check**
   ```javascript
   // In browser console
   navigator.serviceWorker.controller.controller.update()
   ```

### Users Not Seeing Update Notification

1. **Verify new deployment**
   - Check Render dashboard for successful build
   - Verify `dist` folder was updated
   - Check asset filenames have changed (should have new hashes)

2. **Service worker might be cached**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear cache and reload
   - Close and reopen app

3. **Check app logs**
   - Open DevTools → Console
   - Look for `[PWA]` logs
   - Check for update detection logs

### Rollback Issues

If you need to rollback to previous version:

1. **Revert code**: `git revert <commit-hash>`
2. **Push to Render**: `git push origin main`
3. **Render rebuilds** automatically
4. **Users get update notification** for rolled-back version

## Optimization Tips

### 1. Cache Static Assets Aggressively

Service worker uses "Cache First" for:
- HTML, CSS, JS files
- Images and fonts
- Manifest and icons

These are cached based on version in filename.

### 2. Network First for API

API calls use "Network First" strategy:
- Try network first
- Fall back to cache if offline
- Updates immediately when online

### 3. Minimize Initial Load

Vite automatically does:
- Code splitting
- CSS splitting
- Tree shaking
- Asset optimization

### 4. Monitor Performance

Use Lighthouse:
1. DevTools → Lighthouse
2. Audit categories: PWA, Performance, Accessibility
3. Target scores: >= 90 for PWA

## Monitoring Deployment

### Check Build Status

On Render Dashboard:
1. Go to your service
2. Watch build logs in real-time
3. Check for build errors
4. Verify deployment completed

### Monitor Service Worker

In browser DevTools:
1. Application → Service Workers
2. Check "Update on reload"
3. Observe update detection
4. Monitor cache contents

### Check User Updates

In browser Console:
```javascript
// See PWA logs
console.clear();
// Then interact with app and watch for [PWA] logs
```

## Troubleshooting Render Deployment

### Build Fails

**Error: npm install fails**
- Check `package.json` syntax
- Verify all dependencies are in npm registry
- Check lock file is committed

**Error: Build command timeout**
- Render has 30-minute timeout
- Optimize build process
- Clear Render build cache (in settings)

### Service Worker Issues

**SW not registering**
- Verify HTTPS (Render default ✅)
- Check `public/sw.js` exists
- Check `manifest.json` path
- Clear browser cache

**Updates not appearing**
- Wait up to 1 hour for background check
- Force update: Ctrl+Shift+R
- Check service worker in DevTools

**App stuck loading**
- Check internet connection
- Hard refresh (Ctrl+Shift+R)
- Clear all caches (DevTools → Application → Clear site data)
- Close and reopen app

### API Connection Issues

**CORS errors**
- Verify frontend/backend domains in CORS config
- Check API endpoint URL in frontend
- Verify backend is running

**API timeout**
- Check backend is deployed and running
- Verify network connectivity
- Check Render logs for backend errors

## Environment Variables

### Frontend (optional)
```
VITE_API_URL=https://bms-backend.onrender.com/api
```

### Backend (required)
```
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## Security Considerations

✅ **Render Deployment is Secure:**
- Automatic HTTPS (required for PWA)
- Free SSL certificates
- Render handles security headers
- No direct server access

⚠️ **Keep Secure:**
- Store secrets in environment variables
- Use JWT for authentication
- Enable CORS only for your domains
- Validate all API requests

## Performance Metrics

After deployment, check:

1. **Service Worker registration**: < 100ms
2. **First meaningful paint**: < 2s
3. **Time to interactive**: < 3s
4. **Cumulative layout shift**: < 0.1
5. **Cache hit ratio**: > 70%

## Cost Optimization

Render Free Tier includes:
- 750 hours/month compute
- SSL certificates
- Automatic deployments
- Build minutes: 100/month

Tips:
- Close stopped services
- Use auto-spin down for services
- Monitor build minutes
- Consolidate services if needed

## Example Render.yaml

Create `render.yaml` in root for infrastructure as code:

```yaml
services:
  - type: web
    name: bms-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    domains:
      - bms-backend.onrender.com
    envVars:
      - key: NODE_ENV
        value: production

  - type: static_site
    name: bms-frontend
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    domains:
      - bms-frontend.onrender.com
```

Then deploy:
```bash
# Push to GitHub
git push origin main

# Render detects render.yaml and deploys
```

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Render
3. ✅ Test app in production
4. ✅ Install on mobile device
5. ✅ Test offline functionality
6. ✅ Make a code change and verify update detection
7. ✅ Run Lighthouse audit
8. ✅ Monitor error logs

## Support

- [Render Documentation](https://render.com/docs)
- [Render Support](https://render.com/support)
- [PWA Builder](https://www.pwabuilder.com)
- [MDN PWA Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/)

---

**Deployment Ready! 🚀**
