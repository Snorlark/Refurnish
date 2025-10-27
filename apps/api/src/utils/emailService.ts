import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  // Check if email credentials are configured
  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password') {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

export const sendProductApprovalEmail = async (userEmail: string, productName: string, shopName: string) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 Email service not configured - skipping approval email');
      return { success: false, error: 'Email service not configured' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@refurnish.com',
      to: userEmail,
      subject: '🎉 Your Product Has Been Approved! - Refurnish',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Product Approved!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Great news from Refurnish</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${shopName}!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We're excited to let you know that your product <strong>"${productName}"</strong> has been approved and is now live on Refurnish!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
              <ul style="color: #4b5563; padding-left: 20px;">
                <li>Your product is now visible to potential buyers</li>
                <li>You can track views and inquiries in your seller dashboard</li>
                <li>Be ready to respond to customer messages</li>
                <li>Keep your product information up to date</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://refurnish.vercel.app'}/seller-dashboard" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Your Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Thank you for being part of the Refurnish community!<br>
              The Refurnish Team
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Product approval email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending product approval email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendProductSoldEmail = async (userEmail: string, productName: string, shopName: string, buyerName: string) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 Email service not configured - skipping sold email');
      return { success: false, error: 'Email service not configured' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@refurnish.com',
      to: userEmail,
      subject: '💰 Your Product Has Been Sold! - Refurnish',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💰 Product Sold!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Congratulations from Refurnish</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Congratulations ${shopName}!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Great news! Your product <strong>"${productName}"</strong> has been sold to <strong>${buyerName}</strong>!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin-top: 0;">Next Steps:</h3>
              <ul style="color: #4b5563; padding-left: 20px;">
                <li>Check your seller dashboard for order details</li>
                <li>Prepare the item for shipping</li>
                <li>Coordinate delivery with the buyer</li>
                <li>Update your inventory</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://refurnish.vercel.app'}/seller-dashboard" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Thank you for your successful sale!<br>
              The Refurnish Team
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Product sold email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending product sold email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
