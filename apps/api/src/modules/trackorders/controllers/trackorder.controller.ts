import { Request, Response } from 'express';
import TrackOrder from '../models/trackorder.model';
import Cart from '../../carts/models/cart.model';
import Product from '../../products/models/products.model';
import { v4 as uuidv4 } from 'uuid';

// Create a new order from cart items
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { selectedItems, shippingAddress, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({ error: 'Selected items are required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Filter cart items to only include selected items
    const orderItems = cart.items.filter(item => 
      selectedItems.includes(item.productId)
    );

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No valid items selected for order' });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 150; // Fixed shipping fee
    const totalAmount = subtotal + shippingFee;

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create new order
    const newOrder = new TrackOrder({
      orderId,
      userId,
      items: orderItems,
      status: 'Preparing to Ship',
      totalAmount,
      shippingFee,
      paymentMethod: 'Cash on Delivery',
      deliveryMethod: 'LBC Express',
      shippingAddress,
      notes
    });

    await newOrder.save();

    // Remove ordered items from cart
    cart.items = cart.items.filter(item => 
      !selectedItems.includes(item.productId)
    );
    await cart.save();

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Server error placing order' });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const orders = await TrackOrder.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(orders);
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ error: 'Server error getting orders' });
  }
};

// Get specific order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const order = await TrackOrder.findOne({ orderId, userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Server error getting order' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Preparing to Ship', 'Shipped out', 'Out for Delivery', 'Delivered', 'To Rate', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await TrackOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.json({
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
};

// Get seller's orders (orders containing products owned by the seller)
export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First, get all products owned by this seller
    const sellerProducts = await Product.find({ owner: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(product => product._id.toString());

    if (sellerProductIds.length === 0) {
      return res.json([]);
    }

    // Find all orders that contain products owned by this seller
    const orders = await TrackOrder.find({
      'items.productId': { $in: sellerProductIds }
    })
      .sort({ createdAt: -1 })
      .select('-__v');

    // Filter orders to only include items that belong to this seller
    const sellerOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => 
        sellerProductIds.includes(item.productId)
      );
      
      return {
        ...order.toObject(),
        items: sellerItems
      };
    }).filter(order => order.items.length > 0);

    res.json(sellerOrders);
  } catch (error) {
    console.error('Error getting seller orders:', error);
    res.status(500).json({ error: 'Server error getting seller orders' });
  }
};

// Update order status (seller can update their orders)
export const updateSellerOrderStatus = async (req: Request, res: Response) => {
  try {
    const sellerId = req.user?._id;
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    if (!sellerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Preparing to Ship', 'To Ship', 'Shipped out', 'Out for Delivery', 'To Rate', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await TrackOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify that the seller owns products in this order
    const sellerProducts = await Product.find({ owner: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(product => product._id.toString());
    
    const hasSellerProducts = order.items.some(item => 
      sellerProductIds.includes(item.productId)
    );

    if (!hasSellerProducts) {
      return res.status(403).json({ error: 'You can only update orders containing your products' });
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    // If status is "To Rate", update product status to "sold" for seller's products
    if (status === 'To Rate') {
      const sellerItems = order.items.filter(item => 
        sellerProductIds.includes(item.productId)
      );
      
      for (const item of sellerItems) {
        await Product.findByIdAndUpdate(item.productId, { status: 'sold' });
      }
      
      console.log(`Updated ${sellerItems.length} products to "sold" status for order ${orderId}`);
    }

    res.json({
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating seller order status:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const orders = await TrackOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'firstName lastName email')
      .select('-__v');

    const total = await TrackOrder.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ error: 'Server error getting orders' });
  }
};

