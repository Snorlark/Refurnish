import { Router } from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  getWishlistCount,
  checkWishlistItem
} from '../controllers/wishlist.controller';
import authMiddleware from '../../../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(authMiddleware);

// Get user's wishlist
router.get('/', getWishlist);

// Add item to wishlist
router.post('/add', addToWishlist);

// Remove item from wishlist
router.delete('/item/:productId', removeFromWishlist);

// Clear entire wishlist
router.delete('/clear', clearWishlist);

// Get wishlist count
router.get('/count', getWishlistCount);

// Check if item is in wishlist
router.get('/check/:productId', checkWishlistItem);

export default router;
