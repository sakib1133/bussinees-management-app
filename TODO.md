- [x] Created initial TODO checklist for the update-notification audit/fix
- [ ] Rewrite update system to a single source of truth (version.json) and show popup only for installed PWA users
- [ ] Remove App.jsx APP_VERSION hardcoding and localStorage version reload logic that causes loops
- [ ] Refactor pwaUtils.js to remove SW update event dispatching and keep only SW registration + skipWaiting
- [ ] Fix UpdateNotification.jsx to rely only on deployed version + localStorage gating (no SW events)
- [ ] Fix sw.js staleWhileRevalidateStrategy Response.clone error by restructuring caching logic safely
- [ ] Ensure popup disappears permanently after successful update and never reappears until a newer version.json is deployed
- [ ] Run frontend build/lint to verify no syntax errors


