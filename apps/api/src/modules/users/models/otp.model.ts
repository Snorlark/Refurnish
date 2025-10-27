import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string;
  type: 'registration' | 'login' | 'admin';
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true 
  },
  otp: { 
    type: String, 
    required: true,
    length: 6
  },
  type: {
    type: String,
    required: true,
    enum: ['registration', 'login', 'admin'],
    default: 'login'
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  attempts: { 
    type: Number, 
    default: 0,
    max: 3
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for efficient queries
OTPSchema.index({ email: 1, type: 1, isUsed: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

export default mongoose.model<IOTP>("OTP", OTPSchema);
