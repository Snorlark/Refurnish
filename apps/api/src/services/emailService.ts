import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'larksigmuondbabao@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password' // Use App Password for Gmail
  }
});

// Admin email for OTP sending
const ADMIN_EMAIL = 'larksigmuondbabao@gmail.com';

export const sendOTPEmail = async (email: string, otp: string, type: 'registration' | 'login' | 'admin' = 'login') => {
  const subject = type === 'registration' 
    ? 'Verify Your Refurnish Account' 
    : type === 'admin'
    ? 'Admin Login Verification - Refurnish'
    : 'Login Verification - Refurnish';
    
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2d5a27; margin: 0;">Refurnish</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Your Furniture Marketplace</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #333; margin: 0 0 20px 0;">${type === 'registration' ? 'Verify Your Email Address' : 'Login Verification'}</h2>
        
        <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
          ${type === 'registration' 
            ? 'Thank you for registering with Refurnish! Please use the verification code below to complete your account setup.'
            : type === 'admin'
            ? 'Admin login attempt detected. Please use the verification code below to access the admin dashboard.'
            : 'A login attempt was made to your Refurnish account. Please use the verification code below to complete the login process.'
          }
        </p>
        
        <div style="background: #2d5a27; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">${otp}</h3>
        </div>
        
        <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
          This code will expire in 10 minutes. If you didn't request this ${type === 'registration' ? 'verification' : 'login'}, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>© 2024 Refurnish. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'larksigmuondbabao@gmail.com',
      to: email,
      subject,
      html
    });
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2d5a27; margin: 0;">Welcome to Refurnish!</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Your Furniture Marketplace</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${firstName}!</h2>
        
        <p style="color: #666; margin: 0 0 20px 0; line-height: 1.5;">
          Welcome to Refurnish! Your account has been successfully verified and you're now ready to start buying and selling pre-loved furniture.
        </p>
        
        <div style="background: #2d5a27; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Get Started</h3>
          <p style="margin: 0;">Browse furniture, create listings, and connect with other users!</p>
        </div>
        
        <p style="color: #666; margin: 20px 0 0 0;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'larksigmuondbabao@gmail.com',
      to: email,
      subject: 'Welcome to Refurnish!',
      html
    });
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
  }
};
