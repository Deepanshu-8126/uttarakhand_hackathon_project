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

      // Primary: /api/agent/chat — confirmed working on Render
      const response = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ message: cleanText, sessionId }),
        signal: abortControllerRef.current.signal
      });

      if (response.ok) {
        const resData = await response.json();
        const agentResp = resData.response || resData;
        const replyText = agentResp.message || agentResp.data?.message || '';
        const suggestions = (agentResp.suggestedActions || []).map(a => a.label || a).filter(Boolean);
        const agentName = agentResp.agent || agentResp.meta?.provider || 'Devbhoomi Companion';
        if (agentResp.tripContext) setEntities(agentResp.tripContext);

        // Simulate streaming word-by-word for premium feel
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
          await new Promise((r) => setTimeout(r, 18));
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

      throw new Error(`Agent API returned ${response.status}`);

    } catch (err) {
      if (err.name === 'AbortError') return;

      // Hard fallback: /api/chat/query (legacy route, may work on older deploy)
      try {
        const fallbackRes = await fetch(`${API_BASE}/chat/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
          body: JSON.stringify({ message: cleanText, sessionId })
        });
        if (fallbackRes.ok) {
          const resData = await fallbackRes.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: resData.message || resData.data?.message || 'How else can I assist your Uttarakhand travel?',
                    agent: resData.agent || 'DestinationAgent',
                    suggestions: resData.suggestions || [],
                    data: resData.data?.data || null
                  }
                : m
            )
          );
          return;
        }
      } catch (_) {}

      // All failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Apologies, I am temporarily having trouble accessing the network. Please tap to retry.', agent: 'System', isError: true }
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
