import { Router } from 'express';
import { 
  placeOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus, 
  getAllOrders,
  getSellerOrders,
  updateSellerOrderStatus
} from '../controllers/trackorder.controller';
import authMiddleware from '../../../middleware/auth';
import adminAuthMiddleware from '../../../middleware/adminAuth';

const router = Router();

// Place order (authenticated users)
router.post('/place-order', authMiddleware, placeOrder);

// Get user's orders (authenticated users)
router.get('/my-orders', authMiddleware, getUserOrders);

// Get specific order by ID (authenticated users)
router.get('/:orderId', authMiddleware, getOrderById);

// Seller endpoints
router.get('/seller/orders', authMiddleware, getSellerOrders);
router.put('/seller/:orderId/status', authMiddleware, updateSellerOrderStatus);

// Update order status (admin only)
router.put('/:orderId/status', adminAuthMiddleware, updateOrderStatus);

// Get all orders (admin only)
router.get('/', adminAuthMiddleware, getAllOrders);

export default router;

