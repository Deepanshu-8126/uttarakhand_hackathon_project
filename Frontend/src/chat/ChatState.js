/**
 * Devbhoomi Conversational AI - Chat State Manager
 * Inspired by langchain-ai/agent-chat-ui & voice-demo
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CHAT_STORAGE_KEY = 'devbhoomi_agent_chat_v3';

export function useChatState({ initialQuery = '', onTripContextChange = null } = {}) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `**नमस्ते! Pranam!** I am your **Devbhoomi AI Travel & Mountain Companion**.\n\nAsk me anything about **Char Dham shrines**, **high-altitude treks**, **mountain safety (AMS)**, **homestays**, **budget planning**, or **bike/car rentals** across Uttarakhand.`,
        agent: 'DestinationAgent',
        timestamp: new Date().toISOString(),
        suggestions: [
          '3-Day Kedarnath Itinerary & Altitude Safety',
          'Tungnath & Chopta Homestays with Mountain View',
          'Calculate trip budget for 2 travelers',
          'Royal Enfield rental rates in Rishikesh'
        ]
      }
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAgent, setActiveAgent] = useState('Devbhoomi Companion');
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [entities, setEntities] = useState({});
  const [sessionId, setSessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const abortControllerRef = useRef(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Initial query execution if provided (e.g. from destination cards)
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && messages.length <= 1) {
      sendMessage(initialQuery.trim());
    }
  }, [initialQuery]);

  const sendMessage = useCallback(async (userText) => {
    if (!userText || !userText.trim() || isLoading) return;
    const cleanText = userText.trim();

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setIsStreaming(true);
    setThinkingSteps([{ step: 1, thought: 'Consulting Devbhoomi multi-agent router...' }]);

    // Temporary streaming placeholder message
    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      agent: 'Routing...',
      thinking: [],
      timestamp: new Date().toISOString(),
      suggestions: []
    };
    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      // Tiered endpoint list: Local Node -> Local Python Bridge -> Cloud Render
      const candidateEndpoints = [
        { url: `${API_BASE}/agent/chat`, format: 'standard' },
        { url: `http://localhost:8765/api/chat`, format: 'bridge' },
        { url: `https://uttarakhand-hackathon-project.onrender.com/api/agent/chat`, format: 'standard' },
        { url: `${API_BASE}/chat/query`, format: 'legacy' },
      ];

      let lastError = null;
      for (const endpoint of candidateEndpoints) {
        try {
          const res = await fetch(endpoint.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify(
              endpoint.format === 'bridge'
                ? { message: cleanText, lang: 'en', history: messages.slice(-4) }
                : { message: cleanText, sessionId }
            ),
            signal: AbortSignal.any
              ? AbortSignal.any([abortControllerRef.current.signal, AbortSignal.timeout(7000)])
              : abortControllerRef.current.signal,
          });

          if (res.ok) {
            const resData = await res.json();
            const agentResp = resData.response || resData.data || resData;
            const replyText = agentResp.message || (typeof agentResp === 'string' ? agentResp : '');
            if (replyText) {
              const suggestions = (agentResp.suggestedActions || []).map(a => a.label || a).filter(Boolean);
              const agentName = agentResp.agent || agentResp.meta?.provider || (endpoint.format === 'bridge' ? 'Devbhoomi AI' : 'Devbhoomi Companion');
              if (agentResp.tripContext) setEntities(agentResp.tripContext);

              // Smooth word-by-word streaming animation
              const words = replyText.split(/(?<=\s)/);
              let built = '';
              for (const word of words) {
                built += word;
                const snap = built;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: snap, agent: agentName } : m
                  )
                );
                await new Promise((r) => setTimeout(r, 16));
              }

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: replyText, agent: agentName, suggestions, data: agentResp.data || null }
                    : m
                )
              );
              return;
            }
          }
        } catch (fetchErr) {
          if (fetchErr.name === 'AbortError') return;
          lastError = fetchErr;
        }
      }

      // If all tiers were unreachable
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Apologies, I am temporarily having trouble accessing the network. Please tap to retry.', agent: 'System', isError: true }
            : m
        )
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Network connection issue. Please check your connection or try again.', agent: 'System', isError: true }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [isLoading, sessionId]);

  const clearChat = useCallback(() => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        content: `Conversation reset. Namaste! Where would you like to travel in Devbhoomi Uttarakhand?`,
        agent: 'DestinationAgent',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Kedarnath Dham Route & Acclimatization',
          'Auli Skiing & Cable Car Guide',
          '3-Day Rishikesh & Chopta Trip',
          'Check Live Himalayan Weather'
        ]
      }
    ]);
    setThinkingSteps([]);
    setEntities({});
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    activeAgent,
    thinkingSteps,
    entities,
    sessionId,
    isVoiceOpen,
    setIsVoiceOpen,
    sendMessage,
    clearChat,
    stopGeneration
  };
}
