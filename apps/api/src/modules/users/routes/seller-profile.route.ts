import { Router } from 'express';
import auth from '../../../middleware/auth';
import adminAuth from '../../../middleware/adminAuth';
import { getMySellerProfile, upsertMySellerProfile, approveSeller, uploadSellerDocument, getAllSellerProfiles, rejectSeller, getSellerStats, updateShopInformation, getPendingShopChanges, approveShopChanges, rejectShopChanges } from '../controllers/seller-profile.controller';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/me', auth, getMySellerProfile);
router.get('/stats', auth, getSellerStats);
router.put('/me', auth, upsertMySellerProfile);
router.post('/:id/approve', auth, adminAuth, approveSeller);
router.post('/:id/reject', auth, adminAuth, rejectSeller);
router.get('/all', auth, adminAuth, getAllSellerProfiles);
router.post('/document', auth, upload.single('document'), uploadSellerDocument);

// Shop information approval system
router.put('/shop-info', auth, updateShopInformation);
router.get('/pending-changes', auth, adminAuth, getPendingShopChanges);
router.post('/:id/approve-changes', auth, adminAuth, approveShopChanges);
router.post('/:id/reject-changes', auth, adminAuth, rejectShopChanges);

export default router;


