import mongoose, { Document, Schema } from 'mongoose';

export interface ICarouselSlide extends Document {
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'advertisement' | 'discount' | 'sale';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  image?: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlashSaleSettings extends Document {
  isActive: boolean;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  featuredProducts: string[]; // Product IDs
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarouselSlideSchema = new Schema<ICarouselSlide>({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'advertisement', 'discount', 'sale'], default: 'info' },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  image: { type: String },
  link: { type: String }
}, { timestamps: true });

const FlashSaleSettingsSchema = new Schema<IFlashSaleSettings>({
  isActive: { type: Boolean, default: false },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  title: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

// Clear existing models to force recreation with updated schema
if (mongoose.models.Announcement) {
  delete mongoose.models.Announcement;
}

const CarouselSlide = mongoose.models.CarouselSlide || mongoose.model<ICarouselSlide>('CarouselSlide', CarouselSlideSchema);
const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
const FlashSaleSettings = mongoose.models.FlashSaleSettings || mongoose.model<IFlashSaleSettings>('FlashSaleSettings', FlashSaleSettingsSchema);

export { CarouselSlide, Announcement, FlashSaleSettings };
