import mongoose, { Schema, Document } from 'mongoose';

export interface ISellerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  address?: string;
  detailedAddress?: string;
  contactNumber?: string;
  governmentId1Front?: string;
  governmentId1Back?: string;
  governmentId2Front?: string;
  governmentId2Back?: string;
  transactionOptions?: string[];
  termsAccepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  // Pending changes for admin approval
  pendingChanges?: {
    shopName?: string;
    address?: string;
    detailedAddress?: string;
    contactNumber?: string;
    transactionOptions?: string[];
  };
  pendingStatus: 'none' | 'pending' | 'approved' | 'rejected';
  approvalHistory?: Array<{
    action: 'approved' | 'rejected';
    adminId: mongoose.Types.ObjectId;
    adminName: string;
    reason?: string;
    timestamp: Date;
    changes: any;
  }>;
}

const SellerProfileSchema = new Schema<ISellerProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, required: true, trim: true },
  address: { type: String },
  detailedAddress: { type: String },
  contactNumber: { type: String },
  governmentId1Front: { type: String },
  governmentId1Back: { type: String },
  governmentId2Front: { type: String },
  governmentId2Back: { type: String },
  transactionOptions: [{ type: String }],
  termsAccepted: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  // Pending changes for admin approval
  pendingChanges: {
    shopName: { type: String },
    address: { type: String },
    detailedAddress: { type: String },
    contactNumber: { type: String },
    transactionOptions: [{ type: String }]
  },
  pendingStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  approvalHistory: [{
    action: { type: String, enum: ['approved', 'rejected'], required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now },
    changes: { type: Schema.Types.Mixed }
  }]
}, { timestamps: true });

export default mongoose.model<ISellerProfile>('SellerProfile', SellerProfileSchema);


