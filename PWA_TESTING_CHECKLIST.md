# PWA Testing Checklist & Guide

## Pre-Testing Setup

### 1. Build for Production

```bash
cd frontend
npm install
npm run build
```

This creates the `dist` folder with optimized build.

### 2. Test Locally with HTTPS

Option A: Using local HTTPS
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Serve with HTTPS
npx serve -s dist -l 3000 --ssl-cert cert.pem --ssl-key key.pem
```

Option B: Using simple HTTP server
```bash
npx serve -s dist -l 3000
```

Then visit: `http://localhost:3000` or `https://localhost:3000`

### 3. Verify Build Output

Check that `dist` folder contains:
- ✅ `index.html`
- ✅ `manifest.json`
- ✅ `offline.html`
- ✅ `sw.js` (service worker)
- ✅ `assets/` folder with JS/CSS
- ✅ Ensure icons are included (optional for testing)

## Desktop Chrome/Chromium Testing

### Service Worker Registration

```
DevTools → Application → Service Workers
```

Verify:
- [ ] Service worker shows "activated and running" (green)
- [ ] Scope is `/`
- [ ] File is `sw.js`
- [ ] No error messages

### Manifest Validation

```
DevTools → Application → Manifest
```

Verify:
- [ ] All fields display without errors
- [ ] Name: "Business Management System"
- [ ] Short name: "BMS"
- [ ] Display mode: "standalone"
- [ ] All required icons listed (at least show as available)
- [ ] Start URL: `/`
- [ ] Status: All checkmarks green (✓)

### Installation

1. Look for **install button** in address bar (appears after several visits)
2. Click install button
3. Chrome shows "Install app?" dialog
4. Verify:
   - [ ] Icon displays correctly
   - [ ] App name shows correctly
   - [ ] Click "Install"
5. App should appear on:
   - [ ] Home screen
   - [ ] App drawer (Windows)
   - [ ] Applications menu (Linux)

### Installed App Experience

1. Open the installed app from home screen/menu
2. Verify:
   - [ ] Opens in standalone mode (no browser address bar)
   - [ ] Entire screen filled with app
   - [ ] Title bar shows "Business Management System"
   - [ ] No browser UI visible
   - [ ] Returns to home screen when closing

### Cache Storage

```
DevTools → Application → Cache Storage
```

Verify:
- [ ] Multiple caches exist (bms-v1, bms-runtime-v1, bms-api-v1)
- [ ] Content includes HTML, CSS, JS files
- [ ] Image assets cached
- [ ] Manifest cached
- [ ] Offline page cached

### Offline Testing

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Refresh page (should still load)
4. Verify:
   - [ ] App loads from cache
   - [ ] Layout looks correct
   - [ ] No white screen
   - [ ] Offline banner shows

### Update Testing

1. Make a small change to code (e.g., update version in App.jsx)
2. Rebuild: `npm run build`
3. Reload app in browser
4. Wait for service worker to check updates (< 1 minute)
5. Verify:
   - [ ] "Update Available" notification appears
   - [ ] Click "Update" button
   - [ ] App reloads automatically
   - [ ] New changes visible

### Network Throttling

```
DevTools → Network → Throttling
```

Test with different speeds:
- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Offline
- [ ] Custom: 50 KB/s

Verify app works acceptably at each speed.

### Lighthouse Audit

1. DevTools → Lighthouse
2. Select "PWA" category
3. Click "Analyze page load"
4. Verify score >= 90:
   - [ ] Installability
   - [ ] Offline support
   - [ ] User experience
   - [ ] PWA optimizations

### Console Logs

Open DevTools → Console

Verify logs show:
- [ ] `[PWA] Registering service worker...`
- [ ] `[PWA] Service Worker registered successfully`
- [ ] `[PWA] Claiming all clients`
- [ ] No errors or warnings (red X)

## Mobile Testing - Android Chrome

### Pre-requisite

- Android device or emulator
- Chrome browser installed
- Connect to same Wi-Fi as development machine or use Render deployment

### Visit App

1. On Android device, open Chrome
2. Navigate to your app URL
3. Verify:
   - [ ] App loads properly
   - [ ] Layout is responsive
   - [ ] No horizontal scrolling
   - [ ] Touch targets are >= 44x44px
   - [ ] Images load correctly

### Installation Prompt

1. Visit app several times (usually 5+ visits)
2. Look for "Install" prompt or menu option
3. Verify:
   - [ ] Install prompt appears
   - [ ] App icon displays
   - [ ] App name correct

### Install App

1. Tap "Install" button or menu option
2. Verify:
   - [ ] Installation dialog shows
   - [ ] Icon and name correct
   - [ ] Click "Install"

### Check Home Screen

1. Close Chrome
2. Open home screen
3. Verify:
   - [ ] App icon appears
   - [ ] App name correct
   - [ ] Tap to open app

### Installed App Experience

1. Open app from home screen
2. Verify:
   - [ ] No browser address bar visible
   - [ ] App fills entire screen
   - [ ] Standalone mode active
   - [ ] All content accessible

### Offline Testing

1. Settings → Network & Internet → Airplane Mode (toggle ON)
2. Refresh app or open existing page
3. Verify:
   - [ ] App still loads from cache
   - [ ] Offline banner shows
   - [ ] No white screen
   - [ ] Can navigate cached pages

### Turn Online

1. Airplane Mode (toggle OFF)
2. Verify:
   - [ ] Connection restored message shows
   - [ ] App syncs with server
   - [ ] Latest data loads

### Responsive Design

Test portrait and landscape modes:
- [ ] Portrait orientation: content fits properly
- [ ] Landscape orientation: content fits properly
- [ ] Rotate device: layout adapts smoothly
- [ ] Text is readable
- [ ] Buttons are tappable

### Screen Sizes

Test on different Android devices:
- [ ] Small phones (320-375px width)
- [ ] Standard phones (375-414px width)
- [ ] Large phones (414px+ width)

## Mobile Testing - iPhone/iPad

### Safari Browser

1. Open Safari on iOS device
2. Navigate to app URL
3. Verify:
   - [ ] App loads correctly
   - [ ] Layout is responsive
   - [ ] No horizontal scrolling

### Add to Home Screen

1. Tap Share button (box with arrow)
2. Select "Add to Home Screen"
3. Verify:
   - [ ] App name appears
   - [ ] Icon displays (if set via meta tags)
   - [ ] Tap "Add"

### Home Screen Launch

1. Close Safari
2. Tap app icon on home screen
3. Verify:
   - [ ] Opens full screen
   - [ ] No Safari UI visible
   - [ ] Splash screen shows (optional)

### Offline Testing

1. Enable Airplane Mode
2. Open app
3. Verify:
   - [ ] Cached content loads
   - [ ] Offline banner shows
   - [ ] App functional

## Functionality Testing

### All Modules Work

Test each module to ensure no PWA changes broke functionality:

#### Dashboard
- [ ] Page loads
- [ ] Data displays
- [ ] Cards show correctly
- [ ] Layout is responsive

#### Sales
- [ ] Page loads
- [ ] List displays
- [ ] Can add/edit/delete
- [ ] Forms work
- [ ] Offline handling works

#### Labour
- [ ] Page loads
- [ ] List displays
- [ ] Can navigate to details
- [ ] Details page works
- [ ] Forms functional

#### Medicine
- [ ] Page loads
- [ ] List displays
- [ ] Forms work
- [ ] Data persists

#### Expenses
- [ ] Page loads
- [ ] List displays
- [ ] Can add/edit expenses
- [ ] Forms functional

#### Reports
- [ ] Page loads
- [ ] Reports generate
- [ ] Export works
- [ ] Download functions

#### Authentication
- [ ] Login works
- [ ] Register works
- [ ] Logout works
- [ ] Protected routes work
- [ ] Token management works

### API Connectivity

- [ ] Online: API calls work
- [ ] Offline: Graceful failure
- [ ] Requests fail appropriately
- [ ] Error messages show
- [ ] Reconnection triggers data fetch

## Performance Testing

### Metrics

Use DevTools → Lighthouse for:

1. **First Contentful Paint (FCP)**
   - [ ] < 1.8s on Fast 3G

2. **Largest Contentful Paint (LCP)**
   - [ ] < 2.5s

3. **Cumulative Layout Shift (CLS)**
   - [ ] < 0.1

4. **Time to Interactive (TTI)**
   - [ ] < 3.8s

### Network Analysis

```
DevTools → Network tab
```

Monitor:
- [ ] Number of requests
- [ ] Total page size
- [ ] Load time
- [ ] Cache hits (size shows as "from cache")

### JavaScript Execution

```
DevTools → Performance tab
```

1. Click record
2. Interact with app
3. Stop recording
4. Verify:
   - [ ] Main thread activity smooth
   - [ ] No long tasks (> 50ms)
   - [ ] Frames per second > 60

## Security Testing

### HTTPS
- [ ] App uses HTTPS in production
- [ ] No mixed content warnings
- [ ] Certificate valid

### Authentication
- [ ] Auth tokens not in cache
- [ ] Sensitive data not cached
- [ ] Logout clears auth properly
- [ ] Protected routes protected

### Content Security Policy
- [ ] No CSP violation warnings
- [ ] External resources loaded safely
- [ ] Script execution controlled

### Storage
- [ ] No sensitive data in localStorage
- [ ] Cache doesn't leak user data
- [ ] Offline cache secure

## Update Testing

### Auto-Update Detection

1. Build and deploy new version
2. Change something visible (e.g., button text)
3. In browser:
   - [ ] Keep app open
   - [ ] Wait for update check (< 1 hour)
   - [ ] "Update Available" notification shows
   - [ ] Click "Update"
   - [ ] App reloads
   - [ ] New version visible

### Background Update Check

1. Close and reopen app
2. Service worker checks for updates
3. Verify:
   - [ ] Update detection works on restart
   - [ ] Notification appears if update available

### Manual Update Check

In browser console:
```javascript
if (navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.controller.update();
}
```

Verify:
- [ ] Check runs without errors
- [ ] Update detected if available

## Browser Compatibility

### Chrome
- [ ] Latest version
- [ ] Previous version
- [ ] Canary/Dev version

### Firefox
- [ ] Latest version
- [ ] PWA support (v98+)

### Edge
- [ ] Latest version
- [ ] Chromium-based Edge

### Safari
- [ ] Latest iOS
- [ ] Previous iOS version

### Samsung Internet
- [ ] Latest version
- [ ] PWA features work

## Error Handling

### Check for Console Errors

DevTools → Console

- [ ] No red error messages
- [ ] No "Uncaught" errors
- [ ] Warnings are acceptable

### Common Issues

Fix these if they appear:
- [ ] CORS errors → Configure CORS on backend
- [ ] 404 for assets → Check file paths
- [ ] Service worker failures → Check service worker syntax
- [ ] Cache errors → Clear cache and reload

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all controls
- [ ] Focus visible on all interactive elements
- [ ] Can operate entire app with keyboard

### Screen Reader (DevTools)
- [ ] All interactive elements labeled
- [ ] Images have alt text
- [ ] Form labels present
- [ ] Headings properly structured

### Color Contrast
- [ ] Text contrast >= 4.5:1 for normal text
- [ ] Links distinguishable

### Responsive Text
- [ ] Text readable without zooming
- [ ] Line spacing adequate
- [ ] Font size sufficient

## Final Checklist

Before deploying to production:

### Code Quality
- [ ] No console errors
- [ ] No build warnings
- [ ] All tests pass
- [ ] Code reviewed

### PWA Specific
- [ ] Service worker registers
- [ ] Manifest valid
- [ ] Icons included
- [ ] Offline page works
- [ ] Update detection works
- [ ] Installation works

### Functionality
- [ ] All modules work
- [ ] No broken links
- [ ] Forms submit correctly
- [ ] Authentication works
- [ ] APIs respond correctly

### Performance
- [ ] Lighthouse PWA score >= 90
- [ ] Lighthouse Performance >= 85
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

### Devices Tested
- [ ] Desktop Chrome
- [ ] Desktop Edge
- [ ] Android Chrome
- [ ] iPhone Safari
- [ ] Tablet (at least one)

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] API endpoints correct

### Documentation
- [ ] PWA docs created
- [ ] Deployment guide ready
- [ ] Update process documented
- [ ] Troubleshooting guide available

## Test Report Template

Create a file `PWA_TEST_REPORT.md`:

```markdown
# PWA Test Report

**Date**: [Date]
**Tester**: [Name]
**Build Version**: [Version]

## Environment
- OS: [e.g., Windows 11, macOS, Android 14]
- Browser: [e.g., Chrome 120]
- Device: [e.g., Desktop, iPhone 14, Samsung Galaxy S23]

## Test Results

### Service Worker
- [ ] Registering
- [ ] Cache contents
- [ ] Offline handling

### Installation
- [ ] Install prompt appears
- [ ] Installation succeeds
- [ ] App icon visible
- [ ] Standalone mode works

### Functionality
- [ ] All modules functional
- [ ] Forms work correctly
- [ ] Data displays properly
- [ ] No broken features

### Performance
- [ ] Lighthouse PWA: [score]
- [ ] Lighthouse Performance: [score]
- [ ] FCP: [ms]
- [ ] LCP: [ms]

### Issues Found
1. [Issue 1]
2. [Issue 2]

## Sign-off
- Approved: ☐ Yes ☐ No
- Ready for production: ☐ Yes ☐ No
```

## Continuous Testing

After deployment, regularly:
- [ ] Monitor error logs
- [ ] Check Lighthouse scores monthly
- [ ] Test on new device types
- [ ] Verify update delivery
- [ ] Monitor performance metrics
- [ ] Check user feedback

---

**Happy Testing! ✓**
