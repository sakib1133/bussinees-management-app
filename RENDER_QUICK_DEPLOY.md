# Render Deployment - Quick Reference

## 🚀 Quick Deploy (5 Steps)

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Render - v2.0 with Expenses & Reports"
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
Backend: Generates Prisma client + runs migrations + starts server
    ↓
Frontend: Builds React app + serves static files
    ↓
PostgreSQL database created + schema applied
    ↓
Services connected and ready!
```

---

## ✅ Verify Deployment

1. Check backend is running
   ```bash
   curl https://your-backend.onrender.com/api
   ```

2. Check frontend loads
   - Visit https://your-frontend.onrender.com
   - Should see login page

3. Login and verify all modules
   - Dashboard
   - Labour
   - Sales
   - Medicine
   - Expenses (NEW)
   - Reports (NEW)

4. Test a full flow
   - Create labour + salary records
   - Add expenses
   - View reports
   - Check dashboard updates

---

## 📊 What's Deployed

### Complete Application Stack
✅ **6 Modules**: Dashboard, Labour, Sales, Medicine, Expenses, Reports
✅ **Authentication**: JWT-based with secure tokens
✅ **Database**: PostgreSQL with automatic migrations
✅ **Real-time Calculations**: All metrics calculated from database
✅ **Export Features**: PDF and Print from Reports
✅ **Mobile Responsive**: Fully responsive on all devices
✅ **Secure API**: All endpoints protected with authentication

---

## 🆕 Version 2.0 Features (Deployed)

### New Modules
- **Expenses Management** - Track business expenses by category
- **Reports & Analytics** - Generate financial reports with exports

### Enhancements
- **Settings Dropdown** - Access user profile and logout from navbar
- **Improved Header** - Mobile-responsive navbar with three-dot menu
- **Enhanced Dashboard** - Includes all expense categories
- **Advanced Filtering** - Search and filter options on all pages
- **Export Functionality** - PDF and Print reports

---

## 🚨 Troubleshooting

### Build Failed
- Check `npm install` completes successfully
- Verify `render.yaml` syntax
- Check `.env` variables are set

### Database Connection Error
- DATABASE_URL should be auto-set by Render
- If not, check Render PostgreSQL service is created
- Verify migrations ran successfully

### API Not Responding
- Check backend service logs in Render dashboard
- Verify JWT_SECRET is set
- Ensure PORT=5000

### Frontend Shows 404
- Check frontend build completed (Publish path: `frontend/dist`)
- Verify VITE_API_URL points to correct backend URL
- Check browser console for errors

---

## 💾 Backup & Recovery

- Render PostgreSQL provides automatic daily backups
- Database backups available in Render dashboard
- Can restore from backup if needed

---

## 📞 Support

- Check Render documentation: https://render.com/docs
- Review application logs in Render dashboard
- Check environment variables are correctly set

**Ready to deploy!** 🚀

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
