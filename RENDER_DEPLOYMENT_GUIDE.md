# Render Deployment Guide - Village Khata Manager

## Overview
This guide covers deploying the Village Khata Manager application to Render using the `render.yaml` Infrastructure as Code configuration.

---

## 📋 Prerequisites

1. **GitHub Repository**
   - Push your entire project to GitHub (public or private)
   - Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO.git`

2. **Render Account**
   - Sign up at https://render.com
   - Create account and verify email

3. **Project Structure**
   ```
   labour-app/
   ├── backend/
   │   ├── package.json
   │   ├── .env
   │   ├── prisma/
   │   │   └── schema.prisma
   │   └── src/
   │       └── server.js
   ├── frontend/
   │   ├── package.json
   │   ├── vite.config.js
   │   └── src/
   │       └── main.jsx
   ├── render.yaml         (NEW)
   ├── Procfile           (NEW)
   └── .gitignore         (NEW)
   ```

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code for Production

1. **Update Environment Files**
   - Ensure `.env` is in `.gitignore`
   - Create `.env.production` with template values
   - Update `frontend/src/services/api.js` to use `VITE_API_URL` ✅ (Already done)

2. **Backend Configuration**
   - Ensure `prisma/schema.prisma` is properly configured
   - `package.json` includes `postinstall` hook for Prisma generation ✅ (Already done)
   - Remove any hardcoded localhost URLs

3. **Frontend Configuration**
   - `vite.config.js` properly configured ✅ (Already done)
   - API service uses environment variables ✅ (Already done)
   - Build output path is `dist/` ✅ (Already done)

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Create Render Blueprint

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Choose **"Connect GitHub"**
4. Authorize Render to access your GitHub account
5. Select your repository
6. Render will automatically detect `render.yaml`
7. Review the configuration
8. Click **"Create Services"**

### Step 4: Configure Environment Variables

After blueprint deployment, configure these in Render Dashboard:

**For Backend Service:**
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here-change-this
JWT_EXPIRES_IN=7d
DATABASE_URL=<automatically set by Render PostgreSQL>
PORT=5000
```

**For Database:**
- Name: `village_khata_manager_db`
- User: `khata_user`
- Plan: Free tier (or paid for production)

**For Frontend Service:**
```
VITE_API_URL=https://your-backend-service.onrender.com/api
```

### Step 5: Update Frontend API URL

Once backend is deployed and you have the URL:

1. Copy your backend service URL (e.g., `https://village-khata-manager-backend.onrender.com`)
2. In Render Dashboard → Frontend Service → Environment
3. Update `VITE_API_URL=https://your-backend-url/api`
4. Render will automatically redeploy frontend

### Step 6: Deploy Database Schema

When backend first deploys:

1. Go to Backend Service in Render Dashboard
2. Check the **Logs** tab
3. Should see: `Database connected successfully`
4. Database schema will be created automatically via Prisma migration

---

## 📊 Understanding render.yaml

The configuration defines:

### Backend Service
```yaml
- type: web                           # Web service for Node.js
  name: village-khata-manager-backend # Service name
  env: node                           # Environment: Node.js
  plan: starter                       # Starter tier (free)
  buildCommand: ...                   # Install deps + generate Prisma client
  startCommand: npm start             # Run production server
```

### Frontend Service
```yaml
- type: static-site                   # Static file hosting
  name: village-khata-manager-frontend # Service name
  buildCommand: npm install && npm run build  # Build React app
  staticPublishPath: frontend/dist    # Serve from dist folder
```

### Database
```yaml
- name: village_khata_manager_db      # Database name
  databaseName: village_khata_manager  # Database schema name
  plan: free                          # Free PostgreSQL database
```

---

## 🔒 Security Best Practices

1. **JWT Secret**
   - Generate a strong JWT secret: `openssl rand -base64 32`
   - Set in Render Dashboard (NOT in code)
   - Never commit to repository

2. **Database Credentials**
   - Use Render-managed PostgreSQL add-on
   - Credentials automatically managed
   - Never commit `.env` files

3. **CORS Configuration**
   - Backend `CORS` already allows frontend domain
   - Update if frontend domain changes

4. **HTTPS**
   - All Render services use HTTPS by default
   - Certificates managed automatically

---

## 📁 File Changes Summary

### New Files Created:
- ✅ `render.yaml` - Infrastructure as Code configuration
- ✅ `Procfile` - Process file for Render
- ✅ `frontend/.env.development` - Frontend dev environment
- ✅ `frontend/.env.production` - Frontend prod environment
- ✅ `backend/.env.production` - Backend prod environment template
- ✅ `.gitignore` - Git ignore rules

### Files Modified:
- ✅ `backend/package.json` - Added `build` and `postinstall` scripts
- ✅ `frontend/src/services/api.js` - Added environment variable support

---

## 🧪 Testing Deployment

### After Deployment:

1. **Test Backend API**
   ```bash
   curl https://your-backend-url/
   # Should return: { success: true, message: "API is running" }
   ```

2. **Test Frontend**
   - Open: `https://your-frontend-url`
   - Should load login page
   - Login with your credentials
   - Test navigation and features

3. **Check Logs**
   - Render Dashboard → Service → Logs
   - Look for errors or warnings
   - Check database connection status

---

## ⚙️ Database Management

### Access Database

1. **Via Render Dashboard**
   - Database service → Database credentials
   - Can see connection string

2. **Via Prisma Studio** (Development only)
   ```bash
   npm run prisma:studio
   ```

3. **Via CLI**
   - Use Render-provided connection string
   - Connect with pgAdmin or similar tools

### Backup Database

1. Render automatically backs up databases
2. Access backups in Database service settings
3. Can restore from snapshots

---

## 🔄 Continuous Deployment (Auto-Deploy)

When using Render Blueprint with GitHub:

1. Push to `main` branch
2. Render automatically:
   - Detects changes
   - Builds services
   - Deploys updates
   - Updates database schema (if changed)

**No manual deployment needed!**

---

## 📈 Scaling & Performance

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after idle will take ~30 seconds
- Perfect for development/testing

### Upgrade for Production:
- Starter plan: $12/month
- Standard plan: $25/month
- Services always running
- Better performance

---

## 🆘 Troubleshooting

### Backend won't start
1. Check logs in Render Dashboard
2. Verify environment variables set
3. Check `DATABASE_URL` is correct
4. Look for Prisma generation errors

### Frontend shows API errors
1. Check `VITE_API_URL` environment variable
2. Verify backend service is running
3. Check CORS settings in backend
4. Look at browser console for errors

### Database connection fails
1. Verify database service is running
2. Check `DATABASE_URL` format
3. Look for PostgreSQL connection errors
4. Try restarting database service

### Cannot deploy changes
1. Check git push was successful
2. Verify `.gitignore` excludes large files
3. Check `package.json` has all dependencies
4. Review build logs in Render Dashboard

---

## 📚 Useful Links

- **Render Docs**: https://render.com/docs
- **Render Pricing**: https://render.com/pricing
- **Prisma Deploy Guide**: https://www.prisma.io/docs/deploy
- **Vite Production Build**: https://vitejs.dev/guide/build.html

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `.env` added to `.gitignore`
- [ ] `render.yaml` in repository root
- [ ] `Procfile` in repository root
- [ ] Environment variables configured in Render Dashboard
- [ ] JWT_SECRET set to strong value
- [ ] Frontend VITE_API_URL points to backend
- [ ] Services deployed successfully
- [ ] Backend API responding
- [ ] Frontend loads and connects to API
- [ ] Can login and use features
- [ ] Logs show no errors

---

## 🎉 You're Done!

Your Village Khata Manager is now live on Render! 🚀

Share your live URL:
```
Frontend: https://your-frontend-url
Backend API: https://your-backend-url/api
```

---

## 📞 Support

For issues:
1. Check Render Logs in Dashboard
2. Review this guide's Troubleshooting section
3. Check Render Documentation
4. Contact Render Support at support@render.com
