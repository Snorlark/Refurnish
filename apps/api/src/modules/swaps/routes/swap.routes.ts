import { Router } from 'express';
import authMiddleware from '../../../middleware/auth';
import { createSwap, getMySwaps, getSwapsForSeller, deleteSwapAsSeller } from '../controllers/swap.controller';

const router = Router();

router.post('/', authMiddleware, createSwap);
router.get('/my', authMiddleware, getMySwaps);
router.get('/seller', authMiddleware, getSwapsForSeller);
router.delete('/seller/:swapId', authMiddleware, deleteSwapAsSeller);

export default router;


