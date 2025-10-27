import { Request, Response } from "express";
import cloudinary from "cloudinary";
import Product, { IProduct } from "../models/products.model";
import SiteVisit from "../../site-visits/models/site-visits.model";
import User from "../../users/models/user.model";
import SellerProfile from "../../users/models/seller-profile.model";
import { sendProductApprovalEmail, sendProductSoldEmail } from "../../../utils/emailService";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      io?: any;
    }
  }
}

// Helper function to emit admin notification updates
const emitAdminNotificationUpdate = async (io: any) => {
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
      status: 'for_approval'
    });

    // Get pending shop approvals (seller profiles with pending changes)
    const pendingShopApprovals = await SellerProfile.countDocuments({
      'pendingChanges': { $exists: true, $ne: null }
    });

    const totalNotifications = newSellerRequests + pendingProducts + pendingShopApprovals;

    // Emit to admin dashboard
    io.to('admin_dashboard').emit('admin_notification_update', {
      newSellerRequests,
      pendingProducts,
      pendingShopApprovals,
      totalNotifications
    });
  } catch (error) {
    console.error('Error emitting admin notification update:', error);
  }
};

export const uploadProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      quantity,
      condition,
      category,
      location,
      status,
      material,
      ageValue,
      ageUnit,
      listedAs,
      mode_of_payment,
      courier,
    } = req.body as any;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: "Image file is required." });
    }

    const effectiveStatus = status || "for_approval";
    if (effectiveStatus === "for_sale" && !price) {
      return res
        .status(400)
        .json({ error: "Price is required for a product for sale." });
    }

    const result = await cloudinary.v2.uploader.upload(image.path, {
      folder: "ecommerce-products",
      public_id: `${title.replace(/\s/g, "_")}-${new Date().getTime()}`,
    });

    const newProduct: IProduct = new Product({
      title,
      description,
      price:
        effectiveStatus === "for_sale" || effectiveStatus === "both"
          ? Number(price) || undefined
          : undefined,
      quantity: Number(quantity) || 1,
      condition,
      category: category ? category.toUpperCase() : category,
      location,
      images: [result.secure_url],
      owner: (req as any).user._id,
      status: effectiveStatus,
      material,
      age: {
        value: Number(ageValue) || 0,
        unit: ageUnit || "months",
      },
      listedAs: (listedAs === 'sale' || listedAs === 'swap') ? listedAs : 'sale',
      mode_of_payment: mode_of_payment || 'cash',
      courier: courier || 'J&T Express',
    } as any);

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product uploaded successfully!", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload product" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { status, search, category, location, listedAs } = req.query;
    const query: any = {};

    if (status && ["for_sale", "for_swap", "both", "listed"].includes(status as string)) {
      query.status = status;
    }
    if (listedAs && ["sale", "swap", "both"].includes(listedAs as string)) {
      query.listedAs = listedAs;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = location;
    }

    const products = await Product.find(query).populate("owner", "email");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const products = await Product.find({ owner: userId }).populate("owner", "email firstName lastName");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user products" });
  }
};

// --- Missing Controller Functions ---

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "firstName lastName email"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};


// Get total sales from sold products
export const getTotalSales = async (req: Request, res: Response) => {
  try {
    const soldProducts = await Product.find({ status: "sold" });
    
    const totalSales = soldProducts.reduce((total, product) => {
      return total + (product.price || 0);
    }, 0);

    res.status(200).json({
      totalSales,
      soldProductsCount: soldProducts.length,
      message: "Total sales calculated successfully"
    });
  } catch (err) {
    console.error("Error calculating total sales:", err);
    res.status(500).json({ error: "Failed to calculate total sales" });
  }
};

// Get site earnings for the current month (5% commission on sold items)
export const getMonthlyEarnings = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Consider products sold this month; use updatedAt to reflect status change time
    const soldThisMonth = await Product.find({
      status: 'sold',
      updatedAt: { $gte: monthStart, $lte: monthEnd },
    });

    const grossSales = soldThisMonth.reduce((total, product) => total + (product.price || 0), 0);
    const commission = grossSales * 0.05;

    const monthLabel = monthStart.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    res.status(200).json({
      month: monthLabel,
      grossSales,
      commission,
      soldCount: soldThisMonth.length,
    });
  } catch (err) {
    console.error('Error calculating monthly earnings:', err);
    res.status(500).json({ error: 'Failed to calculate monthly earnings' });
  }
};

// Get weekly analytics for sales (sold products) and visits
// Get products for approval (admin only)
export const getProductsForApproval = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ status: "for_approval" })
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products for approval:", err);
    res.status(500).json({ error: "Failed to fetch products for approval" });
  }
};

// Approve or reject product (admin only)
export const moderateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'" });
    }

    // Get the product with owner information before updating
    const product = await Product.findById(id).populate('owner', 'email firstName lastName');
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let updateData: any = {};
    
    if (action === "approve") {
      // Upon approval, mark as listed
      updateData.status = "listed";
    } else {
      // For reject, we could either delete or mark as rejected
      // For now, let's delete the product
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ message: "Product rejected and removed" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'email firstName lastName');

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Send email notification for approval
    if (action === "approve" && updatedProduct.owner) {
      try {
        const owner = updatedProduct.owner as any;
        const shopName = owner.firstName || 'Seller';
        const emailResult = await sendProductApprovalEmail(owner.email, updatedProduct.title, shopName);
        
        if (emailResult.success) {
          console.log(`✅ Approval email sent to ${owner.email} for product: ${updatedProduct.title}`);
        } else {
          console.log(`📧 Email service not configured - approval notification skipped for ${owner.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Emit WebSocket event for real-time updates
    if ((req as any).io) {
      const io = (req as any).io;
      const ownerId = updatedProduct.owner.toString();
      
      // Emit to the specific seller
      io.to(`seller_${ownerId}`).emit('product_status_update', {
        productId: updatedProduct._id,
        status: updatedProduct.status,
        action: action,
        message: `Your product "${updatedProduct.title}" has been ${action}d`
      });

      // Also emit to admin dashboard
      io.to('admin_dashboard').emit('product_moderation_update', {
        productId: updatedProduct._id,
        status: updatedProduct.status,
        action: action,
        product: updatedProduct
      });

      // Emit notification update to admin dashboard
      emitAdminNotificationUpdate(io);
    }

    res.status(200).json({
      message: `Product ${action}d successfully`,
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error moderating product:", err);
    res.status(500).json({ error: "Failed to moderate product" });
  }
};

// Get weekly analytics for sales (sold products) and visits
export const getWeeklyAnalytics = async (req: Request, res: Response) => {
  try {
    // Accept optional startDate (ISO string); default to the Monday of current week
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date();

    // Normalize to Monday 00:00:00
    const day = start.getDay(); // 0=Sun..6=Sat
    const diffToMonday = (day === 0 ? -6 : 1 - day); // move back to Monday
    const monday = new Date(start);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Build an array of day boundaries for mapping results to Mon..Sun
    const days: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Sales aggregation: sold products created or updated within range
    const salesAgg = await Product.aggregate([
      {
        $match: {
          status: 'sold',
          createdAt: { $gte: monday, $lte: sunday },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            d: { $dayOfMonth: '$createdAt' },
          },
          totalSales: { $sum: { $ifNull: ['$price', 0] } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Visits aggregation within range
    const visitsAgg = await SiteVisit.aggregate([
      { $match: { timestamp: { $gte: monday, $lte: sunday } } },
      {
        $group: {
          _id: {
            y: { $year: '$timestamp' },
            m: { $month: '$timestamp' },
            d: { $dayOfMonth: '$timestamp' },
          },
          visits: { $sum: 1 },
        },
      },
    ]);

    // Map aggregates into Mon..Sun arrays
    const formatKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const salesMap = new Map<string, { totalSales: number; count: number }>();
    for (const s of salesAgg) {
      const key = `${s._id.y}-${s._id.m}-${s._id.d}`;
      salesMap.set(key, { totalSales: s.totalSales, count: s.count });
    }
    const visitsMap = new Map<string, number>();
    for (const v of visitsAgg) {
      const key = `${v._id.y}-${v._id.m}-${v._id.d}`;
      visitsMap.set(key, v.visits);
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const chartData = days.map((d, i) => {
      const key = formatKey(d);
      const sale = salesMap.get(key) || { totalSales: 0, count: 0 };
      const visits = visitsMap.get(key) || 0;
      return { name: dayNames[i], sales: sale.totalSales, visits };
    });

    const rangeLabel = `${monday.toLocaleDateString('en-US', { month: 'long' })} ${monday.getDate()} - ${sunday.toLocaleDateString('en-US', { month: 'long' })} ${sunday.getDate()}`;

    res.status(200).json({
      range: { start: monday, end: sunday, label: rangeLabel },
      data: chartData,
    });
  } catch (err) {
    console.error('Error building weekly analytics:', err);
    res.status(500).json({ error: 'Failed to build weekly analytics' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    console.log('=== UPDATE PRODUCT REQUEST ===');
    console.log('Product ID:', req.params.id);
    console.log('User from request:', (req as any).user);
    console.log('User ID:', (req as any).user?._id);
    
    const { id } = req.params;
    const {
      title,
      description,
      price,
      quantity,
      condition,
      category,
      location,
      material,
      ageValue,
      ageUnit,
      listedAs,
      mode_of_payment,
      courier,
      swapWantedCategory,
      swapWantedDescription,
      images,
    } = req.body as any;

    const product = await Product.findById(id).populate('owner', 'email firstName lastName');
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user owns the product
    const productOwnerId = (product.owner as any)._id ? (product.owner as any)._id.toString() : product.owner.toString();
    const userId = (req as any).user._id.toString();
    console.log(`Product owner ID: ${productOwnerId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Owner match: ${productOwnerId === userId}`);
    
    if (productOwnerId !== userId) {
      console.log(`Authorization failed: Product owner ${productOwnerId} !== User ${userId}`);
      return res.status(403).json({ error: "Not authorized to update this product" });
    }

    // Store original status for comparison
    const originalStatus = product.status;
    console.log(`Original product status: ${originalStatus}`);
    console.log(`Product title: ${product.title}`);
    console.log(`Product ID: ${product._id}`);
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.quantity = quantity ? Number(quantity) : product.quantity;
    product.condition = condition || product.condition;
    product.category = category ? category.toUpperCase() : product.category;
    product.location = location || product.location;
    product.material = material || product.material;
    product.age = {
      value: ageValue ? Number(ageValue) : product.age.value,
      unit: ageUnit || product.age.unit,
    };
    product.listedAs = listedAs || product.listedAs;
    product.mode_of_payment = mode_of_payment || product.mode_of_payment;
    product.courier = courier || product.courier;
    (product as any).swapWantedCategory = swapWantedCategory ? swapWantedCategory.toUpperCase() : (product as any).swapWantedCategory;
    (product as any).swapWantedDescription = swapWantedDescription || (product as any).swapWantedDescription;
    
    // Update images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`Updating product images: ${images.length} new images`);
      product.images = images;
    }

    // If product was previously approved/listed, revert to for_approval when edited
    console.log(`Checking if status should change: originalStatus=${originalStatus}, should change=${originalStatus === 'listed' || originalStatus === 'sold'}`);
    if (originalStatus === 'listed' || originalStatus === 'sold') {
      product.status = 'for_approval';
      console.log(`Product ${product.title} status changed from ${originalStatus} to for_approval due to edit`);
    } else {
      console.log(`Product ${product.title} status remains ${originalStatus} (no change needed)`);
    }

    await product.save();
    console.log(`Product ${product.title} final status after save: ${product.status}`);

    // Send email notification to admin about product edit (if it was previously approved)
    if ((originalStatus === 'listed' || originalStatus === 'sold') && product.owner) {
      try {
        const owner = product.owner as any;
        const shopName = owner.firstName || 'Seller';
        // You can add a specific email for admin notifications here
        console.log(`Product "${product.title}" edited by ${shopName} - requires re-approval`);
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }
    }

    // Emit WebSocket event for real-time updates
    if ((req as any).io) {
      const io = (req as any).io;
      const ownerId = product.owner.toString();
      
      // Emit to the specific seller
      io.to(`seller_${ownerId}`).emit('product_status_update', {
        productId: product._id,
        status: product.status,
        action: 'edited',
        message: `Your product "${product.title}" has been updated and requires re-approval`
      });

      // Also emit to admin dashboard
      io.to('admin_dashboard').emit('product_moderation_update', {
        productId: product._id,
        status: product.status,
        action: 'edited',
        product: product,
        message: `Product "${product.title}" edited by seller - requires re-approval`
      });
    }

    const requiresReapproval = originalStatus === 'listed' || originalStatus === 'sold';
    console.log(`Response: requiresReapproval=${requiresReapproval}, originalStatus=${originalStatus}, finalStatus=${product.status}`);
    
    res.status(200).json({ 
      message: "Product updated successfully", 
      product,
      requiresReapproval: requiresReapproval
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user owns the product
    if (product.owner.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: "Image file is required." });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.mimetype)) {
      return res.status(400).json({ 
        error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." 
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (image.size > maxSize) {
      return res.status(400).json({ 
        error: "File too large. Maximum size is 5MB." 
      });
    }

    const result = await cloudinary.v2.uploader.upload(image.path, {
      folder: "ecommerce-products",
      public_id: `product-image-${new Date().getTime()}`,
      resource_type: "auto",
    });

    res.status(200).json({ 
      message: "Image uploaded successfully", 
      secure_url: result.secure_url 
    });
  } catch (err: any) {
    console.error('Error uploading image:', err);
    
    // Provide more specific error messages
    if (err.http_code === 400) {
      return res.status(400).json({ error: "Invalid image file or format." });
    } else if (err.http_code === 401) {
      return res.status(500).json({ error: "Cloudinary authentication failed. Please check configuration." });
    } else if (err.http_code === 403) {
      return res.status(500).json({ error: "Cloudinary access forbidden. Please check permissions." });
    } else {
      return res.status(500).json({ error: `Failed to upload image: ${err.message || 'Unknown error'}` });
    }
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      quantity,
      condition,
      category,
      location,
      material,
      ageValue,
      ageUnit,
      listedAs,
      mode_of_payment,
      courier,
      images,
      swapWantedCategory,
      swapWantedDescription,
    } = req.body as any;

    const effectiveStatus = "for_approval";
    // Note: Since effectiveStatus is always "for_approval", price validation is not needed here
    // Price validation will be handled during product approval process

    const newProduct: IProduct = new Product({
      title,
      description,
      price: Number(price) || undefined, // Store price if provided, will be validated during approval
      quantity: Number(quantity) || 1,
      condition,
      category: category ? category.toUpperCase() : category,
      location,
      images: images || [],
      owner: (req as any).user._id,
      status: effectiveStatus,
      material,
      age: {
        value: Number(ageValue) || 0,
        unit: ageUnit || "months",
      },
      listedAs: (listedAs === 'sale' || listedAs === 'swap') ? listedAs : 'sale',
      mode_of_payment: mode_of_payment || 'cash',
      courier: courier || 'J&T Express',
      swapWantedCategory: swapWantedCategory ? swapWantedCategory.toUpperCase() : swapWantedCategory || '',
      swapWantedDescription: swapWantedDescription || '',
    } as any);

    await newProduct.save();
    
    // Emit notification update to admin dashboard
    if ((req as any).io) {
      await emitAdminNotificationUpdate((req as any).io);
    }
    
    res.status(201).json({ message: "Product created successfully!", product: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Mark product as sold (for testing or admin use)
export const markProductAsSold = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { buyerName } = req.body;

    const product = await Product.findById(id).populate('owner', 'email firstName lastName');
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update product status to sold
    product.status = 'sold';
    await product.save();

    // Send email notification to seller
    if (product.owner) {
      try {
        const owner = product.owner as any;
        const shopName = owner.firstName || 'Seller';
        const emailResult = await sendProductSoldEmail(owner.email, product.title, shopName, buyerName || 'A buyer');
        
        if (emailResult.success) {
          console.log(`✅ Sold email sent to ${owner.email} for product: ${product.title}`);
        } else {
          console.log(`📧 Email service not configured - sold notification skipped for ${owner.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send sold email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Emit WebSocket event for real-time updates
    if ((req as any).io) {
      const io = (req as any).io;
      const ownerId = product.owner.toString();
      
      // Emit to the specific seller
      io.to(`seller_${ownerId}`).emit('product_sold_update', {
        productId: product._id,
        productName: product.title,
        buyerName: buyerName || 'A buyer',
        message: `Your product "${product.title}" has been sold!`
      });
    }

    res.status(200).json({
      message: "Product marked as sold successfully",
      product: product
    });
  } catch (err) {
    console.error('Error marking product as sold:', err);
    res.status(500).json({ error: "Failed to mark product as sold" });
  }
};