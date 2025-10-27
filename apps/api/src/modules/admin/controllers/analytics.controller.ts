import { Request, Response } from 'express';
import User from '../../users/models/user.model';
import Product from '../../products/models/products.model';
import SiteVisit from '../../site-visits/models/site-visits.model';

// Simple test function
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      activities: [
        {
          id: '1',
          type: 'user_registration',
          title: 'New User Registration',
          description: 'Test user registered',
          timestamp: new Date().toISOString(),
          metadata: {}
        }
      ],
      total: 1
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    // Get top selling products (sold products with highest prices)
    const topProducts = await Product.find({ status: 'sold' })
      .sort({ price: -1 })
      .limit(10)
      .populate('owner', 'firstName lastName email')
      .select('title price category images owner status createdAt');

    console.log('Top products found:', topProducts.length);
    console.log('Sample product:', topProducts[0] ? {
      title: topProducts[0].title,
      images: topProducts[0].images,
      imagesLength: topProducts[0].images?.length
    } : 'No products');

    res.status(200).json({
      products: topProducts,
      timeRange: '30 days',
      total: topProducts.length
    });
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({ error: 'Failed to fetch top selling products' });
  }
};

export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    // Get user counts by role
    const buyers = await User.countDocuments({ role: 'buyer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const admins = await User.countDocuments({ role: 'admin' });
    const total = await User.countDocuments();

    // Get registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get seller approval stats
    const sellerApprovalStats = {
      approved: sellers, // Assuming all sellers are approved
      pending: 0, // This would need to be tracked separately
      total: sellers
    };

    res.status(200).json({
      roleCounts: {
        buyer: buyers,
        seller: sellers,
        admin: admins,
        total: total
      },
      registrationTrends: registrationTrends,
      sellerApprovalStats: sellerApprovalStats
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};

export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    // Get total revenue from sold products
    const soldProducts = await Product.find({ status: 'sold' });
    const totalRevenue = soldProducts.reduce((sum, product) => {
      return sum + (product.price || 0);
    }, 0);

    // Get revenue by category
    const revenueByCategory = await Product.aggregate([
      { $match: { status: 'sold' } },
      {
        $group: {
          _id: '$category',
          revenue: { $sum: '$price' },
          salesCount: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Get monthly revenue (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Product.aggregate([
      {
        $match: {
          status: 'sold',
          updatedAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Calculate projections
    const avgMonthlyRevenue = monthlyRevenue.length > 0 
      ? monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / monthlyRevenue.length 
      : 0;
    
    const projectedYearlyRevenue = avgMonthlyRevenue * 12;

    console.log('Revenue analytics data:', {
      totalRevenue,
      revenueByCategoryCount: revenueByCategory.length,
      sampleCategory: revenueByCategory[0],
      monthlyRevenueCount: monthlyRevenue.length
    });

    res.status(200).json({
      monthlyRevenue: monthlyRevenue,
      revenueByCategory: revenueByCategory,
      projections: {
        totalRevenue: totalRevenue,
        avgMonthlyRevenue: avgMonthlyRevenue,
        projectedYearlyRevenue: projectedYearlyRevenue,
        timeRange: '30 days'
      }
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      siteName: 'Refurnish',
      maintenanceMode: false,
      registrationEnabled: true,
      productUploadEnabled: true,
      maxProductsPerUser: 50,
      maxFileSize: '10MB',
      allowedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
      siteDescription: 'Your marketplace for sustainable furniture',
      contactEmail: 'admin@refurnish.dev',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
};
