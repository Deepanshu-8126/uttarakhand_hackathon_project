import express from 'express';
import {
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  sendMessage,
  handleDirectChat,
  streamChat
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Real-time SSE streaming chat (Compatible with langchain-ai/agent-chat-ui)
router.get('/stream', streamChat);
router.post('/stream', streamChat);

// Direct AI Agent chat endpoints
router.post('/query', handleDirectChat);
router.post('/ask', handleDirectChat);

// Universal POST /api/chat
router.post('/', (req, res, next) => {
  if (req.body.message || req.body.query || (!req.headers.authorization && !req.cookies?.token)) {
    return handleDirectChat(req, res, next);
  }
  return protect(req, res, () => createChat(req, res, next));
});


// 2. Authenticated user chat session history
router.get('/', protect, getChats);

router.route('/:id')
  .get(protect, getChatById)
  .patch(protect, updateChat)
  .delete(protect, deleteChat);

router.post('/:id/messages', protect, sendMessage);

export default router;
