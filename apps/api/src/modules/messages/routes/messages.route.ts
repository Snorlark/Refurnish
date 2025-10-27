import { Router } from 'express';
import auth from '../../../middleware/auth';
import { listConversations, getMessages, sendMessage, createConversation } from '../controllers/messages.controller';

const router = Router();

router.get('/conversations', auth, listConversations);
router.get('/conversations/:id/messages', auth, getMessages);
router.post('/messages', auth, sendMessage);
router.post('/conversations', auth, createConversation);

export default router;


