import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  location?: string;
  category?: string;
}

export interface IWishlist extends Document {
  userId: string;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  location: {
    type: String
  },
  category: {
    type: String
  }
});

const WishlistSchema = new Schema<IWishlist>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  items: [WishlistItemSchema]
}, {
  timestamps: true
});

// Index for efficient queries
WishlistSchema.index({ userId: 1 });

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
