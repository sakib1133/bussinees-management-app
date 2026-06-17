# 🔐 Forgot Password & Password Reset - Setup Guide

## ✨ Features Implemented

### 1. **Forgot Password Button** ✅
- Added "Forgot Password?" link on the Login page
- Opens a modal dialog where users can enter their email

### 2. **Forgot Password Modal** ✅
- User enters their email address
- Backend validates and sends reset email
- Shows success/error messages
- Auto-closes on success after 3 seconds

### 3. **Password Reset Email** ✅
- Professional HTML email template
- Contains reset link with token and email
- Link expires in 1 hour
- Email service integrated with Nodemailer

### 4. **Reset Password Page** ✅
- Dedicated page at `/reset-password`
- Token validation before showing form
- Users enter new password twice
- Password requirements: minimum 6 characters
- Secure token handling

### 5. **Backend Endpoints** ✅
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset password with valid token
- `GET /api/auth/verify-reset-token` - Verify token validity

### 6. **Security Features** ✅
- Tokens expire after 1 hour
- One-time use tokens (deleted after use)
- Email validation
- Password hashing with bcrypt
- Secure token generation using crypto

---

## 📋 Email Configuration Setup

### **Option 1: Gmail Setup (Recommended for Development)**

1. **Enable 2-Factor Authentication on Google Account**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password

3. **Update `.env` file in backend folder**
   ```bash
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   FRONTEND_URL=http://localhost:5173
   ```

### **Option 2: Mailtrap (Best for Testing)**

1. **Sign up at https://mailtrap.io**
   - Create a free account
   - Go to Settings → Email Credentials

2. **Get SMTP credentials from Mailtrap dashboard**
   - Copy Host, Port, Username, Password

3. **Update `.env` file**
   ```bash
   EMAIL_SERVICE=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_mailtrap_username
   EMAIL_PASSWORD=your_mailtrap_password
   FRONTEND_URL=http://localhost:5173
   ```

### **Option 3: SendGrid (Production)**

1. **Sign up at https://sendgrid.com**
   - Create an API key

2. **Update `.env` file**
   ```bash
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your_sendgrid_api_key
   FRONTEND_URL=https://your-production-domain.com
   ```

---

## 🔧 Installation & Setup Steps

### **1. Install Dependencies**

In the backend folder:
```bash
cd backend
npm install
```

This will install `nodemailer` that was added to package.json.

### **2. Run Database Migration**

```bash
# Create and run migration
npm run prisma:migrate

# Or use (if on Windows):
npx prisma migrate dev --name add_password_reset
```

This creates the `PasswordReset` table in your database.

### **3. Configure Environment Variables**

Create or update `.env` file in backend folder:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/khata_manager

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (choose one option above)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for reset link in emails)
FRONTEND_URL=http://localhost:5173
```

### **4. Restart Backend Server**

```bash
npm run dev
```

### **5. Test the Feature**

1. Go to http://localhost:5173/login
2. Click "Forgot Password?" button
3. Enter your test email address
4. Check your email inbox (or Mailtrap dashboard) for reset link
5. Click the link to open reset password page
6. Enter new password and confirm
7. Success! Redirect to login page
8. Log in with your new password

---

## 📧 Email Templates

### **Password Reset Email Includes:**
- Professional header with logo
- Clear instructions
- Direct link button
- Backup text link
- Expiration time (1 hour)
- Footer with branding

### **Email Styling:**
- Responsive HTML design
- Works on all email clients
- Mobile-friendly
- Professional appearance

---

## 🔐 Security Best Practices Implemented

### **1. Token Security**
✅ Random 32-byte tokens (64 character hex strings)
✅ Tokens expire after 1 hour
✅ One-time use only (deleted after use)
✅ Tokens are unique per user

### **2. Password Security**
✅ Minimum 6 characters required
✅ Confirmation password must match
✅ Passwords hashed with bcrypt (salt rounds: 10)
✅ Old password never exposed

### **3. API Security**
✅ Email validation on all endpoints
✅ Token validation before password reset
✅ Expiry check on tokens
✅ Email-token pair verification

### **4. Frontend Security**
✅ Token and email from URL params only
✅ Token verification before showing form
✅ Secure token handling (not stored in localStorage)
✅ Password visibility toggle for convenience

---

## 🧪 Testing Checklist

- [ ] Forgot Password button appears on login page
- [ ] Forgot Password modal opens on click
- [ ] Email input validation works
- [ ] Error handling for invalid emails
- [ ] Email sent successfully (check inbox/Mailtrap)
- [ ] Reset link is clickable
- [ ] Reset password page shows form
- [ ] Invalid token shows error message
- [ ] Expired token shows appropriate error
- [ ] Password mismatch error
- [ ] Too short password error
- [ ] Successful reset redirects to login
- [ ] Can login with new password
- [ ] Can't use same reset link twice
- [ ] Mobile responsive design works
- [ ] Email template displays correctly

---

## 🚨 Troubleshooting

### **Email Not Sending**
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Verify Gmail: Less secure app access may need to be enabled
- Check Gmail 2FA is enabled and app password is correct
- For Mailtrap: Verify credentials are correct
- Check console for error messages

### **Reset Link Not Working**
- Ensure `FRONTEND_URL` is set correctly in `.env`
- Check that token hasn't expired (1 hour max)
- Verify email matches between link and form
- Clear browser cache and try again

### **Can't Reset Password**
- Password must be at least 6 characters
- Passwords must match exactly
- Check for typos in email address
- Verify no special characters in email

### **Database Migration Failed**
- Ensure `DATABASE_URL` is set correctly
- Check database is running
- Try: `npx prisma migrate resolve --rolled-back add_password_reset`

---

## 📊 Database Schema

### **PasswordReset Table**
```sql
CREATE TABLE "PasswordReset" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## 📚 File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js       ← Added: forgotPassword, resetPassword, verifyResetToken
│   ├── routes/
│   │   └── authRoutes.js           ← Added: 3 new routes
│   └── utils/
│       └── emailService.js         ← NEW: Email sending service
├── prisma/
│   ├── schema.prisma               ← Added: PasswordReset model
│   └── migrations/
│       └── [new_migration]/        ← NEW: Create PasswordReset table
└── package.json                    ← Added: nodemailer dependency

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx               ← Updated: Added Forgot Password button
│   │   └── ResetPassword.jsx       ← NEW: Reset password page
│   ├── components/
│   │   └── ForgotPasswordModal.jsx ← NEW: Forgot password modal
│   └── App.jsx                     ← Updated: Added reset-password route
```

---

## 🌐 API Endpoints

### **1. Forgot Password**
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset link has been sent to your email."
}
```

### **2. Reset Password**
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "email": "user@example.com",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}

Response:
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

### **3. Verify Reset Token**
```bash
GET /api/auth/verify-reset-token?token=abc123...&email=user@example.com

Response:
{
  "success": true,
  "message": "Token is valid."
}
```

---

## ✅ Version Information

- **Added in**: v2.1
- **Status**: ✅ Production Ready
- **Dependencies**: nodemailer ^6.9.7
- **Database Migration**: add_password_reset

---

## 🎯 Next Optional Enhancements

- [ ] SMS-based password reset
- [ ] Multiple email verification
- [ ] Remember me functionality
- [ ] Session management
- [ ] Login attempt limits
- [ ] Account lockout after failed attempts
- [ ] Password change history
- [ ] Scheduled email cleanup

---

**Setup Complete!** 🎉

Your password reset system is now ready to use. Make sure to:
1. Install dependencies: `npm install`
2. Run migration: `npm run prisma:migrate`
3. Configure `.env` with email settings
4. Restart backend server
5. Test the flow end-to-end

For any issues, check the Troubleshooting section above.
