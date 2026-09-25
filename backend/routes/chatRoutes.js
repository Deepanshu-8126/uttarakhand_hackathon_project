import express from 'express';
import {
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  sendMessage,
  handleDirectChat
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Direct Hybrid RAG AI chat endpoints (Public, No Auth Required)
router.post('/query', handleDirectChat);
router.post('/ask', handleDirectChat);

// Universal POST /api/chat or POST /api/chats:
// If request has message/query or lacks auth token, handle via Hybrid RAG immediately.
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
