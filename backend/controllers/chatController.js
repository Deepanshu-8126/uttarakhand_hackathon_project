import Chat from '../models/Chat.js';
import { AgentRouter } from '../ai/workflows/agentRouter.js';

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user?._id || req.user?.id })
      .select('-messages')
      .sort({ updatedAt: -1 })
      .limit(50);
    
    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user?._id || req.user?.id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat' });
  }
};

export const createChat = async (req, res) => {
  try {
    const { tripId, title } = req.body;
    const chat = await Chat.create({
      userId: req.user?._id || req.user?.id,
      tripId: tripId || null,
      title: title || 'New Conversation'
    });
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create chat' });
  }
};

export const updateChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id || req.user?.id },
      { title },
      { new: true, runValidators: true }
    );
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update chat' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user?._id || req.user?.id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
};

/**
 * Real-time SSE streaming chat endpoint
 * Compatible with langchain-ai/agent-chat-ui event stream specifications
 */
export const streamChat = async (req, res) => {
  const { message, query, content, sessionId } = req.body || req.query;
  const userQuery = message || query || content;

  if (!userQuery) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    await AgentRouter.processChatStream({
      message: userQuery,
      sessionId: sessionId || req.headers['x-session-id'] || 'default_session',
      userId: req.user?._id || null,
      res
    });
  } catch (err) {
    console.error('[StreamChat Error]', err);
    if (!res.writableEnded) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

/**
 * Standard JSON Direct Chat
 */
export const handleDirectChat = async (req, res) => {
  try {
    const { message, query, content, sessionId } = req.body;
    const userQuery = message || query || content;

    if (!userQuery) {
      return res.status(400).json({
        success: false,
        message: 'Message or query is required'
      });
    }

    const result = await AgentRouter.processChatStream({
      message: userQuery,
      sessionId: sessionId || req.headers['x-session-id'] || 'default_session',
      userId: req.user?._id || null,
      res: null
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
      agent: result.agent,
      suggestions: result.suggestions,
      toolsUsed: result.toolsUsed
    });
  } catch (error) {
    console.error('[DirectChat Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process chat query'
    });
  }
};

export const sendMessage = async (req, res) => {
  return handleDirectChat(req, res);
};


