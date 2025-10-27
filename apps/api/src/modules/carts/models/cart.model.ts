import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  location?: string;
  category?: string;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  }
});

const CartSchema = new Schema<ICart>({
  userId: {
    type: String,
    required: true,
    unique: true,
    sparse: true // Allow multiple null values
  },
  items: [CartItemSchema]
}, {
  timestamps: true
});

// Index for efficient queries - remove any conflicting indexes
CartSchema.index({ userId: 1 }, { unique: true, sparse: true });

export default mongoose.model<ICart>('Cart', CartSchema);
