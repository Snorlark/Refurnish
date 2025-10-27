import { Request, Response } from 'express';
import SellerProfile from '../models/seller-profile.model';
import User from '../models/user.model';
import Product from '../../products/models/products.model';
import cloudinary from 'cloudinary';

export const getMySellerProfile = async (req: Request, res: Response) => {
  try {
    const profile = await SellerProfile.findOne({ userId: (req as any).user._id });
    if (!profile) return res.status(404).json({ message: 'No seller profile' });
    return res.status(200).json(profile);
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to fetch seller profile' });
  }
};

export const upsertMySellerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const data = req.body;
    const existing = await SellerProfile.findOne({ userId });
    if (existing && existing.status !== 'rejected') {
      return res.status(409).json({ message: 'Seller profile already submitted', profile: existing });
    }
    const profile = await SellerProfile.findOneAndUpdate(
      { userId },
      { ...data, userId, status: 'pending' },
      { new: true, upsert: true }
    );
    return res.status(200).json({ message: 'Seller profile submitted', profile });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to submit seller profile' });
  }
};

export const approveSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // seller profile id
    const profile = await SellerProfile.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!profile) return res.status(404).json({ message: 'Seller profile not found' });
    await User.findByIdAndUpdate(profile.userId, { role: 'seller' });
    return res.status(200).json({ message: 'Seller approved', profile });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to approve seller' });
  }
};

export const uploadSellerDocument = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'refurnish-seller-docs',
      public_id: `seller_${(req as any).user._id}_${Date.now()}`,
      overwrite: true,
    });
    return res.status(200).json({ url: result.secure_url });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to upload document' });
  }
};

export const getAllSellerProfiles = async (req: Request, res: Response) => {
  try {
    const profiles = await SellerProfile.find()
      .populate('userId', 'firstName lastName email profilePicture role')
      .sort({ createdAt: -1 });
    return res.status(200).json(profiles);
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to fetch seller profiles' });
  }
};

export const rejectSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await SellerProfile.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!profile) return res.status(404).json({ message: 'Seller profile not found' });
    return res.status(200).json({ message: 'Seller rejected', profile });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to reject seller' });
  }
};

export const getSellerStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    // Get total products
    const totalProducts = await Product.countDocuments({ owner: userId });
    
    // Get total sales (sum of all sold products)
    const soldProducts = await Product.find({ 
      owner: userId, 
      status: 'sold' 
    }).select('price quantity');
    
    const totalSales = soldProducts.reduce((sum: number, product: any) => {
      return sum + ((product.price || 0) * (product.quantity || 1));
    }, 0);
    
    // Get active orders (products with status 'for_sale' or 'both')
    const activeOrders = await Product.countDocuments({ 
      owner: userId, 
      status: { $in: ['for_sale', 'both', 'for_approval'] } 
    });
    
    // For now, return mock rating data (in a real app, you'd have a reviews/ratings system)
    const averageRating = 4.5; // Mock data
    
    return res.status(200).json({
      totalProducts,
      totalSales,
      activeOrders,
      averageRating
    });
  } catch (e: any) {
    console.error('Error fetching seller stats:', e);
    return res.status(500).json({ message: 'Failed to fetch seller stats' });
  }
};

// Update shop information (creates pending changes for admin approval)
export const updateShopInformation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { shopName, address, detailedAddress, contactNumber, transactionOptions } = req.body;
    
    const profile = await SellerProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }
    
    if (profile.status !== 'approved') {
      return res.status(400).json({ message: 'Seller profile must be approved to update shop information' });
    }
    
    // Create pending changes
    const pendingChanges = {
      shopName: shopName || profile.shopName,
      address: address || profile.address,
      detailedAddress: detailedAddress || profile.detailedAddress,
      contactNumber: contactNumber || profile.contactNumber,
      transactionOptions: transactionOptions || profile.transactionOptions
    };
    
    // Update profile with pending changes
    const updatedProfile = await SellerProfile.findByIdAndUpdate(
      profile._id,
      { 
        pendingChanges,
        pendingStatus: 'pending'
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: 'Shop information update submitted for admin approval',
      profile: updatedProfile
    });
  } catch (e: any) {
    console.error('Error updating shop information:', e);
    res.status(500).json({ message: 'Failed to update shop information' });
  }
};

// Admin: Get all pending shop information changes
export const getPendingShopChanges = async (req: Request, res: Response) => {
  try {
    const profiles = await SellerProfile.find({ 
      pendingStatus: 'pending',
      status: 'approved' // Only approved sellers can have pending changes
    })
    .populate('userId', 'firstName lastName email profilePicture')
    .sort({ updatedAt: -1 });
    
    res.status(200).json(profiles);
  } catch (e: any) {
    console.error('Error getting pending shop changes:', e);
    res.status(500).json({ message: 'Failed to get pending shop changes' });
  }
};

// Admin: Approve shop information changes
export const approveShopChanges = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // seller profile id
    const { reason } = req.body;
    const adminId = (req as any).user._id;
    const adminName = `${(req as any).user.firstName} ${(req as any).user.lastName}`;
    
    const profile = await SellerProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }
    
    if (profile.pendingStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending changes to approve' });
    }
    
    // Apply pending changes to main fields
    const changes = { ...profile.pendingChanges };
    const updatedProfile = await SellerProfile.findByIdAndUpdate(
      id,
      {
        shopName: changes.shopName,
        address: changes.address,
        detailedAddress: changes.detailedAddress,
        contactNumber: changes.contactNumber,
        transactionOptions: changes.transactionOptions,
        pendingStatus: 'approved',
        $push: {
          approvalHistory: {
            action: 'approved',
            adminId,
            adminName,
            reason,
            changes
          }
        }
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: 'Shop information changes approved',
      profile: updatedProfile
    });
  } catch (e: any) {
    console.error('Error approving shop changes:', e);
    res.status(500).json({ message: 'Failed to approve shop changes' });
  }
};

// Admin: Reject shop information changes
export const rejectShopChanges = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // seller profile id
    const { reason } = req.body;
    const adminId = (req as any).user._id;
    const adminName = `${(req as any).user.firstName} ${(req as any).user.lastName}`;
    
    const profile = await SellerProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }
    
    if (profile.pendingStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending changes to reject' });
    }
    
    // Clear pending changes and mark as rejected
    const changes = { ...profile.pendingChanges };
    const updatedProfile = await SellerProfile.findByIdAndUpdate(
      id,
      {
        pendingChanges: {},
        pendingStatus: 'rejected',
        $push: {
          approvalHistory: {
            action: 'rejected',
            adminId,
            adminName,
            reason,
            changes
          }
        }
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: 'Shop information changes rejected',
      profile: updatedProfile
    });
  } catch (e: any) {
    console.error('Error rejecting shop changes:', e);
    res.status(500).json({ message: 'Failed to reject shop changes' });
  }
};


