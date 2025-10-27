import { Router } from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  getCartCount 
} from '../controllers/cart.controller';
import authMiddleware from '../../../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update item quantity
router.put('/item/:productId', updateCartItem);

// Remove item from cart
router.delete('/item/:productId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

// Get cart count
router.get('/count', getCartCount);

export default router;
