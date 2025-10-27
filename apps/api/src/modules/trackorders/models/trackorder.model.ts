import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  location?: string;
  category?: string;
}

export interface ITrackOrder extends Document {
  orderId: string;
  userId: string;
  items: IOrderItem[];
  status: 'Preparing to Ship' | 'Shipped out' | 'Out for Delivery' | 'Delivered' | 'To Rate' | 'Cancelled';
  totalAmount: number;
  shippingFee: number;
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
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
    required: true
  },
  name: {
    type: String,
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

const TrackOrderSchema = new Schema<ITrackOrder>({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  items: [OrderItemSchema],
  status: {
    type: String,
    required: true,
    enum: ['Preparing to Ship', 'Shipped out', 'Out for Delivery', 'Delivered', 'To Rate', 'Cancelled'],
    default: 'Preparing to Ship'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 150
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Cash on Delivery'
  },
  deliveryMethod: {
    type: String,
    required: true,
    default: 'LBC Express'
  },
  shippingAddress: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
TrackOrderSchema.index({ userId: 1 });
TrackOrderSchema.index({ orderId: 1 });
TrackOrderSchema.index({ status: 1 });

export default mongoose.model<ITrackOrder>('TrackOrder', TrackOrderSchema);

