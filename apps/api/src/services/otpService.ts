import OTP from '../modules/users/models/otp.model';
import { sendOTPEmail } from './emailService';

// Admin email for OTP sending
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@refurnish.dev';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOTP = async (email: string, type: 'registration' | 'login' | 'admin' = 'login'): Promise<string> => {
  try {
    // For admin OTPs, store against admin email but send to secure email
    const storeEmail = email.toLowerCase();
    const sendEmail = type === 'admin' ? ADMIN_EMAIL : email.toLowerCase();
    
    // Clean up any existing unused OTPs for this email and type
    await OTP.deleteMany({ 
      email: storeEmail, 
      type, 
      isUsed: false 
    });

    const otp = generateOTP();
    
    // Create new OTP record (store against the login email)
    const otpRecord = new OTP({
      email: storeEmail,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otpRecord.save();

    // Send OTP via email (to secure email for admin)
    await sendOTPEmail(sendEmail, otp, type);

    return otp;
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw new Error('Failed to create OTP');
  }
};

export const verifyOTP = async (email: string, otp: string, type: 'registration' | 'login' | 'admin' = 'login'): Promise<boolean> => {
  try {
    // Check against the login email (not the secure email)
    const targetEmail = email.toLowerCase();
    
    const otpRecord = await OTP.findOne({
      email: targetEmail,
      otp,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      // Increment attempts for any existing OTP for this email
      await OTP.updateMany(
        { email: targetEmail, type, isUsed: false },
        { $inc: { attempts: 1 } }
      );
      return false;
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

export const checkOTPAttempts = async (email: string, type: 'registration' | 'login' | 'admin' = 'login'): Promise<boolean> => {
  try {
    // Check against the login email (not the secure email)
    const targetEmail = email.toLowerCase();
    
    const recentOTP = await OTP.findOne({
      email: targetEmail,
      type,
      isUsed: false,
      attempts: { $gte: 3 }
    });

    return !recentOTP; // Return true if no OTP with 3+ attempts found
  } catch (error) {
    console.error('Error checking OTP attempts:', error);
    return true; // Allow if error checking
  }
};

export const cleanupExpiredOTPs = async (): Promise<void> => {
  try {
    await OTP.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log('Expired OTPs cleaned up');
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};
