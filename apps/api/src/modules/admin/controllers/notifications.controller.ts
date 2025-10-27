import { Request, Response } from 'express';
import User from '../../users/models/user.model';
import Product from '../../products/models/products.model';
import SellerProfile from '../../users/models/seller-profile.model';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // Get new seller requests (users with role 'seller' but no approved seller profile)
    const newSellerRequests = await User.countDocuments({
      role: 'seller',
      $or: [
        { 'sellerProfile': { $exists: false } },
        { 'sellerProfile.approved': { $ne: true } }
      ]
    });

    // Get pending products (products awaiting approval)
    const pendingProducts = await Product.countDocuments({
      status: 'pending'
    });

    // Get pending shop approvals (seller profiles with pending changes)
    const pendingShopApprovals = await SellerProfile.countDocuments({
      'pendingChanges': { $exists: true, $ne: null }
    });

    const totalNotifications = newSellerRequests + pendingProducts + pendingShopApprovals;

    res.status(200).json({
      newSellerRequests,
      pendingProducts,
      pendingShopApprovals,
      totalNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};
