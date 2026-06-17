# Render Deployment - Quick Reference

## 🚀 Quick Deploy (5 Steps)

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 2. Go to Render
- https://render.com/dashboard
- Click "New +" → "Blueprint"

### 3. Connect GitHub
- Click "Connect GitHub"
- Select your repository
- Approve the blueprint

### 4. Set Environment Variables
In Render Dashboard, set:
```
NODE_ENV=production
JWT_SECRET=generate-a-strong-secret
JWT_EXPIRES_IN=7d
VITE_API_URL=https://your-backend-url/api
```

### 5. Deploy
- Render automatically creates:
  - Backend service ✅
  - Frontend service ✅
  - PostgreSQL database ✅

**Done! Your app is live!** 🎉

---

## 📋 Files Created

| File | Purpose |
|------|---------|
| `render.yaml` | Infrastructure configuration |
| `Procfile` | Process file for deployment |
| `frontend/.env.development` | Frontend dev config |
| `frontend/.env.production` | Frontend prod config |
| `backend/.env.production` | Backend prod template |
| `.gitignore` | Prevent committing secrets |

---

## 🔑 Environment Variables to Set

### Backend Service
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
DATABASE_URL=auto-set-by-render
PORT=5000
```

### Frontend Service
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🔗 Key URLs After Deployment

- **Dashboard**: `https://your-frontend.onrender.com`
- **API**: `https://your-backend.onrender.com/api`
- **Database**: Managed by Render

---

## ⚡ What Happens During Deployment

```
Push to GitHub
    ↓
Render detects changes
    ↓
Installs dependencies (npm install)
    ↓
Backend: Generates Prisma client + starts server
    ↓
Frontend: Builds React app + serves static files
    ↓
PostgreSQL database created + schema applied
    ↓
Services connected and ready!
```

---

## ✅ Verify Deployment

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url/
   ```
   Should return: `{ success: true, message: "API is running" }`

2. **Frontend**
   - Open `https://your-frontend-url`
   - Should see login page
   - Login and test features

3. **Logs**
   - Check Render Dashboard → Logs
   - Look for any errors

---

## 🔄 Automatic Updates

When you push to GitHub:
- Render automatically deploys
- Services restart
- Database schema updates (if changed)
- No manual action needed!

---

## 📝 Notes

- Free tier services sleep after 15 min of inactivity
- Upgrade to Starter ($12/mo) for always-on services
- Database backups managed automatically by Render
- All services use HTTPS by default

---

## 🆘 Troubleshooting

**Backend won't connect?**
- Check environment variables in Render Dashboard
- Look at Logs tab for errors
- Verify JWT_SECRET is set

**Frontend shows blank page?**
- Check browser console (F12)
- Verify VITE_API_URL is correct
- Check that backend is running

**Database errors?**
- Verify DATABASE_URL is set
- Check database service is running
- Look at backend logs

---

For detailed help, see: **RENDER_DEPLOYMENT_GUIDE.md**
