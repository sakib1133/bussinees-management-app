const nodemailer = require('nodemailer');

// Create email transporter - configure with your email service
const createTransporter = () => {
  // For production with Gmail, use app-specific password
  // For development, use Mailtrap or similar service
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'smtp.mailtrap.io' for Mailtrap
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-specific-password'
    }
    // Alternative for Mailtrap:
    // host: 'smtp.mailtrap.io',
    // port: 2525,
    // auth: {
    //   user: process.env.MAILTRAP_USER,
    //   pass: process.env.MAILTRAP_PASSWORD
    // }
  });

  return transporter;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@khatamanager.com',
      to: email,
      subject: 'Password Reset Request - Village Khata Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello,
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              We received a request to reset the password for your Village Khata Manager account. 
              If you didn't make this request, you can ignore this email.
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 30px 0;">
              Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="
                display: inline-block;
                background-color: #3498db;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
              ">Reset Password</a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Or copy and paste this link in your browser:
            </p>
            
            <p style="color: #3498db; font-size: 14px; word-break: break-all;">
              ${resetLink}
            </p>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              This link will expire in 1 hour.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Village Khata Manager - Business Management System<br>
              © 2024 All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.response);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
};

// Send welcome email (optional)
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@khatamanager.com',
      to: email,
      subject: 'Welcome to Village Khata Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Welcome to Village Khata Manager, ${name}!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your account has been successfully created. You can now log in and start managing your business.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for using our service!
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, message: 'Failed to send email' };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  createTransporter
};
