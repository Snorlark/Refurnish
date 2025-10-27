import mongoose, { Schema, Document } from 'mongoose';

export interface ISwap extends Document {
  requesterId: mongoose.Schema.Types.ObjectId;
  sellerId: mongoose.Schema.Types.ObjectId;
  productId: string; // store as string for consistency with cart items
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const SwapSchema: Schema = new Schema<ISwap>({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<ISwap>('Swap', SwapSchema);


