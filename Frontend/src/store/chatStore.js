import { create } from 'zustand';
import * as chatApi from '../api/chatApi';
import { streamAgentMessage } from '../api/agentApi';
import { executeAgentAction, setActiveRequestId } from '../utils/agentActionExecutor';

const SESSIONS_STORAGE_KEY = "du_copilot_sessions_v2";

function generateUniqueId(prefix = '') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return prefix ? `${prefix}_${crypto.randomUUID()}` : crypto.randomUUID();
  }
  return `${prefix ? `${prefix}_` : ''}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getLocalSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(s => {
          const sessId = s.id || s._id || generateUniqueId('sess');
          return {
            _id: sessId,
            id: sessId,
            title: s.title || (s.destination ? `${s.destination} Trip` : 'Pahadi Travel Plan'),
            destination: s.destination,
            tripId: s.tripContext?.tripId || null,
            createdAt: s.updatedAt || new Date().toISOString(),
            updatedAt: s.updatedAt || new Date().toISOString(),
            messages: (s.messages || []).map((m, idx) => {
              const msgId = m.id || m._id || `msg_${idx}`;
              return {
                _id: msgId,
                id: msgId,
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.text || m.content || '',
                suggestedActions: m.suggestedActions || [],
                toolsUsed: m.toolsUsed || [],
                citations: m.citations || [],
                createdAt: s.updatedAt || new Date().toISOString()
              };
            })
          };
        });
      }
    }
  } catch (e) {
    console.error("Failed to parse local copilot sessions:", e);
  }
  return [];
}

function saveLocalSession(sessionObj) {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    
    const sessId = sessionObj.id || sessionObj._id;
    if (!sessId) return;

    const normalizedSession = {
      ...sessionObj,
      id: sessId,
      _id: sessId
    };

    const idx = list.findIndex(s => s.id === sessId || s._id === sessId);
    if (idx >= 0) {
      list[idx] = normalizedSession;
    } else {
      list = [normalizedSession, ...list];
    }
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
    sessionStorage.setItem("du_active_session_id", sessId);
  } catch (e) {}
}

function isValidJwt(token) {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch (e) {
    localStorage.removeItem('token');
    return false;
  }
}

const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  loading: false,
  error: null,
  sending: false,
  agentSessionId: sessionStorage.getItem('agentSessionId') || null,
  agentStatus: null,
  agentStreaming: false,
  streamAbortController: null,

  fetchChats: async () => {
    set({ loading: true, error: null });
    const localChats = getLocalSessions();
    const token = localStorage.getItem('token');

    // If user is not logged in or token is expired, rely solely on local guest sessions without triggering 401 error
    if (!token || !isValidJwt(token)) {
      set({ chats: localChats, loading: false });
      const activeId = sessionStorage.getItem("du_active_session_id");
      if (activeId && !get().activeChat) {
        const found = localChats.find(c => c._id === activeId);
        if (found) {
          set({ activeChat: found });
        }
      }
      return;
    }

    try {
      const res = await chatApi.getChats();
      const apiChats = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      
      const apiIds = new Set(apiChats.map(c => c._id));
      const combined = [...apiChats, ...localChats.filter(lc => !apiIds.has(lc._id))];
      set({ chats: combined, loading: false });

      const activeId = sessionStorage.getItem("du_active_session_id");
      if (activeId && !get().activeChat) {
        const found = combined.find(c => c._id === activeId);
        if (found) {
          set({ activeChat: found });
        }
      }
    } catch (error) {
      set({ chats: localChats, error: null, loading: false });
      const activeId = sessionStorage.getItem("du_active_session_id");
      if (activeId && !get().activeChat) {
        const found = localChats.find(c => c._id === activeId);
        if (found) {
          set({ activeChat: found });
        }
      }
    }
  },

  fetchChatById: async (id) => {
    set({ loading: true, error: null });
    
    if (typeof id === 'string' && id.startsWith('sess_')) {
      const localChats = getLocalSessions();
      const found = localChats.find(c => c._id === id);
      if (found) {
        sessionStorage.setItem("du_active_session_id", id);
        set({ activeChat: found, loading: false });
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token || !isValidJwt(token)) {
      const localChats = getLocalSessions();
      const found = localChats.find(c => c._id === id);
      if (found) {
        sessionStorage.setItem("du_active_session_id", id);
        set({ activeChat: found, loading: false });
      } else {
        set({ loading: false });
      }
      return;
    }

    try {
      const res = await chatApi.getChatById(id);
      const chatObj = res?.data || res || null;
      if (chatObj) {
        sessionStorage.setItem("du_active_session_id", id);
      }
      set({ activeChat: chatObj, loading: false });
    } catch (error) {
      const localChats = getLocalSessions();
      const found = localChats.find(c => c._id === id);
      if (found) {
        sessionStorage.setItem("du_active_session_id", id);
        set({ activeChat: found, loading: false });
      } else {
        set({ error: error.message || 'Failed to fetch chat', loading: false });
      }
    }
  },

  setActiveChat: (chat) => {
    if (chat?._id) {
      sessionStorage.setItem("du_active_session_id", chat._id);
    }
    set({ activeChat: chat });
  },

  clearActiveChat: () => {
    set({ activeChat: null });
  },

  createChat: async (tripId, title) => {
    set({ loading: true, error: null });
    try {
      const { data } = await chatApi.createChat(tripId, title);
      if (data?._id) {
        sessionStorage.setItem("du_active_session_id", data._id);
      }
      set((state) => ({ chats: [data, ...state.chats], activeChat: data, loading: false }));
      return data;
    } catch (error) {
      // Local fallback
      const newLocalId = generateUniqueId('sess');
      const newLocal = {
        _id: newLocalId,
        id: newLocalId,
        title: title || 'New Trip Plan',
        tripId: tripId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      saveLocalSession(newLocal);
      set((state) => ({ chats: [newLocal, ...state.chats], activeChat: newLocal, loading: false }));
      return newLocal;
    }
  },

  updateChatTitle: async (id, title) => {
    try {
      const { data } = await chatApi.updateChat(id, title);
      set((state) => ({
        chats: state.chats.map(c => (c._id === id || c.id === id) ? data : c),
        activeChat: (state.activeChat?._id === id || state.activeChat?.id === id) ? { ...state.activeChat, title: data.title } : state.activeChat
      }));
    } catch (error) {
      set((state) => ({
        chats: state.chats.map(c => (c._id === id || c.id === id) ? { ...c, title } : c),
        activeChat: (state.activeChat?._id === id || state.activeChat?.id === id) ? { ...state.activeChat, title } : state.activeChat
      }));
    }
  },

  deleteChat: async (id) => {
    try {
      await chatApi.deleteChat(id);
    } catch (error) {}
    
    // Also remove from local storage using unified id/_id match
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw).filter(s => (s.id !== id && s._id !== id));
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {}

    set((state) => ({
      chats: state.chats.filter(c => c._id !== id && c.id !== id),
      activeChat: (state.activeChat?._id === id || state.activeChat?.id === id) ? null : state.activeChat
    }));
  },

  sendMessage: async (chatId, content, tripId, pageContext) => {
    set({ sending: true, error: null, agentStatus: 'Thinking...', agentStreaming: true });

    const reqId = "req_" + Date.now();
    setActiveRequestId(reqId);

    const activeSessId = chatId || sessionStorage.getItem("du_active_session_id") || generateUniqueId('sess');
    sessionStorage.setItem("du_active_session_id", activeSessId);

    const tempUserMsgId = generateUniqueId('msg');
    const tempUserMsg = {
      _id: tempUserMsgId,
      id: tempUserMsgId,
      role: 'user',
      content,
      provenance: 'USER',
      createdAt: new Date().toISOString()
    };
    
    const tempAssistantMsgId = generateUniqueId('msg');
    const initialAssistantMsg = {
      _id: tempAssistantMsgId,
      id: tempAssistantMsgId,
      role: 'assistant',
      content: '',
      provenance: 'GROUNDED',
      createdAt: new Date().toISOString()
    };

    const persistLocal = (targetChat, tripContext = null) => {
      if (!targetChat || !activeSessId) return;
      saveLocalSession({
        id: activeSessId,
        _id: activeSessId,
        title: targetChat.title || content.slice(0, 36),
        destination: tripContext?.destination || targetChat.destination || "Uttarakhand",
        updatedAt: new Date().toISOString(),
        messages: (targetChat.messages || []).map(m => ({
          id: m._id || m.id,
          _id: m._id || m.id,
          role: m.role === 'assistant' ? 'agent' : m.role,
          text: m.content,
          content: m.content,
          suggestedActions: m.suggestedActions || [],
          toolsUsed: m.toolsUsed || [],
          citations: m.citations || []
        })),
        tripContext: tripContext || targetChat.tripContext || null
      });
    };

    set((state) => {
      const currentMsgs = state.activeChat?.messages || [];
      const updatedChat = {
        ...(state.activeChat || { _id: activeSessId, id: activeSessId, title: content.slice(0, 36), createdAt: new Date().toISOString() }),
        _id: activeSessId,
        id: activeSessId,
        title: state.activeChat?.title || content.slice(0, 36),
        updatedAt: new Date().toISOString(),
        messages: [...currentMsgs, tempUserMsg, initialAssistantMsg]
      };
      
      const existingIdx = state.chats.findIndex(c => (c._id === activeSessId || c.id === activeSessId));
      let updatedChats = [...state.chats];
      if (existingIdx >= 0) {
        updatedChats[existingIdx] = updatedChat;
      } else {
        updatedChats = [updatedChat, ...updatedChats];
      }

      // Persist immediately so unclosed user questions remain cached even if tab is closed early
      persistLocal(updatedChat);

      return {
        activeChat: updatedChat,
        chats: updatedChats
      };
    });

    try {
      const controller = new AbortController();
      set({ streamAbortController: controller });

      // RequestAnimationFrame chunk batching to eliminate lag on high-frequency streaming tokens
      let pendingBuffer = '';
      let rafId = null;

      const flushBuffer = () => {
        if (!pendingBuffer) return;
        const textToAppend = pendingBuffer;
        pendingBuffer = '';
        set((state) => {
          const msgs = [...(state.activeChat?.messages || [])];
          const last = msgs[msgs.length - 1];
          if (last && last.role === 'assistant') {
            msgs[msgs.length - 1] = {
              ...last,
              content: (last.content || '') + textToAppend
            };
          }
          return { activeChat: { ...state.activeChat, messages: msgs } };
        });
      };

      await streamAgentMessage({
        message: content,
        chatId: (activeSessId.startsWith('sess_')) ? null : activeSessId,
        tripId: tripId || null,
        pageContext: pageContext || {
          currentRoute: window.location?.pathname || '/copilot',
          currentPage: 'COPILOT',
          pageType: 'COPILOT'
        },
        signal: controller.signal,
        onEvent: (event) => {
          if (event.type === 'status') {
            set({ agentStatus: event.message });
          } else if (event.type === 'chunk') {
            pendingBuffer += event.text || '';
            if (!rafId && typeof requestAnimationFrame !== 'undefined') {
              rafId = requestAnimationFrame(() => {
                flushBuffer();
                rafId = null;
              });
            } else if (typeof requestAnimationFrame === 'undefined') {
              flushBuffer();
            }
          } else if (event.type === 'action') {
            if (event.action) {
              executeAgentAction(event.action, { requestId: reqId });
            }
          } else if (event.type === 'final') {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
            flushBuffer();

            set((state) => {
              const msgs = [...(state.activeChat?.messages || [])];
              const last = msgs[msgs.length - 1];
              if (last && last.role === 'assistant') {
                const finalContent = last.content || event.response?.message || 'I have planned your request.';
                msgs[msgs.length - 1] = {
                  ...last,
                  content: finalContent,
                  provenance: event.response?.confidence === 'grounded' ? 'GROUNDED' : 'FALLBACK',
                  suggestedActions: event.response?.suggestedActions || [],
                  toolsUsed: event.response?.toolsUsed || [],
                  citations: event.response?.citations || []
                };
              }

              const finalizedChat = { ...state.activeChat, messages: msgs };
              persistLocal(finalizedChat, event.response?.tripContext);

              return {
                activeChat: finalizedChat,
                sending: false,
                agentStatus: null,
                agentStreaming: false,
                streamAbortController: null
              };
            });
          } else if (event.type === 'error') {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
            flushBuffer();

            set((state) => {
              const msgs = [...(state.activeChat?.messages || [])];
              const last = msgs[msgs.length - 1];
              if (last && last.role === 'assistant') {
                msgs[msgs.length - 1] = {
                  ...last,
                  content: event.message || 'Sorry, something went wrong. Please try again.',
                  isError: true
                };
              }
              const errChat = { ...state.activeChat, messages: msgs };
              persistLocal(errChat);
              return { activeChat: errChat, sending: false, agentStatus: null, agentStreaming: false, streamAbortController: null };
            });
          } else if (event.type === 'aborted') {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
            flushBuffer();

            set((state) => {
              persistLocal(state.activeChat);
              return { sending: false, agentStatus: null, agentStreaming: false, streamAbortController: null };
            });
          }
        }
      });
    } catch (error) {
      if (error.name === 'AbortError') return;
      set((state) => {
        persistLocal(state.activeChat);
        return { error: error.message || 'Failed to send message', sending: false, agentStatus: null, agentStreaming: false, streamAbortController: null };
      });
    }
  },

  abortStream: () => {
    const { streamAbortController } = get();
    if (streamAbortController) {
      streamAbortController.abort();
    }
  }
}));

export default useChatStore;
