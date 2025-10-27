import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Define schemas directly in the controller to avoid TypeScript issues
const CarouselSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

const FlashSaleSettingsSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  title: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const CarouselSlide = mongoose.models.CarouselSlide || mongoose.model('CarouselSlide', CarouselSlideSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
const FlashSaleSettings = mongoose.models.FlashSaleSettings || mongoose.model('FlashSaleSettings', FlashSaleSettingsSchema);

// Carousel Management
export const getCarouselSlides = async (req: Request, res: Response) => {
  try {
    const slides = await (CarouselSlide as any).find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.status(200).json(slides);
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    res.status(500).json({ error: 'Failed to fetch carousel slides' });
  }
};

export const getAllCarouselSlides = async (req: Request, res: Response) => {
  try {
    const slides = await (CarouselSlide as any).find()
      .sort({ order: 1, createdAt: -1 });
    res.status(200).json(slides);
  } catch (error) {
    console.error('Error fetching all carousel slides:', error);
    res.status(500).json({ error: 'Failed to fetch carousel slides' });
  }
};

export const createCarouselSlide = async (req: Request, res: Response) => {
  try {
    const { title, description, image, link, order } = req.body;
    
    const slide = new (CarouselSlide as any)({
      title,
      description,
      image,
      link,
      order: order || 0,
      isActive: true
    });
    
    await slide.save();
    res.status(201).json(slide);
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    res.status(500).json({ error: 'Failed to create carousel slide' });
  }
};

export const updateCarouselSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const slide = await (CarouselSlide as any).findByIdAndUpdate(id, updateData, { new: true });
    if (!slide) {
      return res.status(404).json({ error: 'Carousel slide not found' });
    }
    
    res.status(200).json(slide);
  } catch (error) {
    console.error('Error updating carousel slide:', error);
    res.status(500).json({ error: 'Failed to update carousel slide' });
  }
};

export const deleteCarouselSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const slide = await (CarouselSlide as any).findByIdAndDelete(id);
    if (!slide) {
      return res.status(404).json({ error: 'Carousel slide not found' });
    }
    
    res.status(200).json({ message: 'Carousel slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting carousel slide:', error);
    res.status(500).json({ error: 'Failed to delete carousel slide' });
  }
};

// Announcements Management
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const announcements = await (Announcement as any).find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await (Announcement as any).find()
      .sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, message, type, startDate, endDate, image, link } = req.body;
    
    // Use raw MongoDB collection to bypass schema validation
    const db = (Announcement as any).db;
    const collection = db.collection('announcements');
    
    const announcementData = {
      title,
      message,
      type: type || 'info',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      image: image || undefined,
      link: link || undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(announcementData);
    const announcement = await collection.findOne({ _id: result.insertedId });
    
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    
    const announcement = await (Announcement as any).findByIdAndUpdate(id, updateData, { new: true });
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.status(200).json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const announcement = await (Announcement as any).findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

// Flash Sale Settings Management
export const getFlashSaleSettings = async (req: Request, res: Response) => {
  try {
    let settings = await (FlashSaleSettings as any).findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new (FlashSaleSettings as any)({
        isActive: false,
        discountPercentage: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        featuredProducts: [],
        title: 'Flash Sale',
        description: 'Limited time offer!'
      });
      await settings.save();
    }
    
    // Populate featured products
    const populatedSettings = await (FlashSaleSettings as any).findById(settings._id)
      .populate('featuredProducts', 'title price images');
    
    res.status(200).json(populatedSettings);
  } catch (error) {
    console.error('Error fetching flash sale settings:', error);
    res.status(500).json({ error: 'Failed to fetch flash sale settings' });
  }
};

export const updateFlashSaleSettings = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    
    let settings = await (FlashSaleSettings as any).findOne();
    
    if (!settings) {
      settings = new (FlashSaleSettings as any)(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    
    await settings.save();
    
    // Populate featured products
    const populatedSettings = await (FlashSaleSettings as any).findById(settings._id)
      .populate('featuredProducts', 'title price images');
    
    res.status(200).json(populatedSettings);
  } catch (error) {
    console.error('Error updating flash sale settings:', error);
    res.status(500).json({ error: 'Failed to update flash sale settings' });
  }
};

// Get available products for flash sale
export const getAvailableProducts = async (req: Request, res: Response) => {
  try {
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}));
    const products = await (Product as any).find({ status: 'approved' })
      .select('_id title price images category')
      .limit(50);
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching available products:', error);
    res.status(500).json({ error: 'Failed to fetch available products' });
  }
};