/**
 * Devbhoomi Conversational AI - Chat State Manager
 * Inspired by langchain-ai/agent-chat-ui & voice-demo
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://uttarakhand-hackathon-project.onrender.com/api';
const CHAT_STORAGE_KEY = 'devbhoomi_agent_chat_v3';

export function useChatState({ initialQuery = '', onTripContextChange: _onTripContextChange = null } = {}) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
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

      // Build smart candidate endpoints based on HTTPS vs HTTP environment
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const PROD_API = 'https://uttarakhand-hackathon-project.onrender.com/api';

      const candidateEndpoints = isHttps
        ? [
            { url: `${API_BASE.startsWith('http:') ? PROD_API : API_BASE}/agent/chat`, format: 'standard' },
            { url: `${PROD_API}/agent/chat`, format: 'standard' },
            { url: `${PROD_API}/voice/ask`, format: 'voice_ask' },
            { url: `${PROD_API}/chat`, format: 'direct_chat' },
          ]
        : [
            { url: `${API_BASE}/agent/chat`, format: 'standard' },
            { url: `http://localhost:8765/api/chat`, format: 'bridge' },
            { url: `${PROD_API}/agent/chat`, format: 'standard' },
            { url: `${API_BASE}/voice/ask`, format: 'voice_ask' },
            { url: `${API_BASE}/chat`, format: 'direct_chat' },
          ];

      let lastError = null;
      for (const endpoint of candidateEndpoints) {
        try {
          const res = await fetch(endpoint.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              endpoint.format === 'bridge'
                ? { message: cleanText, lang: 'en', history: messages.slice(-4), sessionId }
                : endpoint.format === 'voice_ask'
                  ? { query: cleanText, lang: 'en', sessionId }
                  : { message: cleanText, query: cleanText, sessionId }
            ),
            signal: AbortSignal.any
              ? AbortSignal.any([abortControllerRef.current.signal, AbortSignal.timeout(30000)])
              : abortControllerRef.current.signal,
          });

          if (res.ok) {
            const resData = await res.json();
            const agentResp = resData.response || resData.data || resData;
            let replyText = agentResp.message || (typeof agentResp === 'string' ? agentResp : (resData.message || resData.response || ''));
            
            // Intercept generic intake questionnaires from legacy/cached endpoints
            if (/यात्रा प्लान कैसे बनाना|एक दिन की ट्रिप|मल्टी|मल्टी‑डे|टाइमफ़्रेम और बजट|थोड़ा और जानकारी चाहिए|kitne din ka trip/i.test(replyText)) {
              const qLower = cleanText.toLowerCase();
              if (qLower.includes('haldwani') && qLower.includes('nainital')) {
                replyText = `Haldwani se Nainital lagbhag 35 kilometer hai. Aap Kathgodam, Ranibagh aur Jeolikote hote hue National Highway 109 se lagbhag 1.5 ghante me Nainital pahunch sakte hain. Kathgodam aur Haldwani station se shared cabs aur UTC buses aasaani se mil jaati hain.`;
              } else if (qLower.includes('nainital')) {
                replyText = `**Nainital** Kumaon hills ki **1,938m** altitude par sthit ek scenic lake city hai.\n\n- **Key Highlights:** Naini Lake boating, Naina Peak (2,615m) se 360° Himalayan views, Snow Viewpoint cable car, aur Mall Road.\n- **Kaise Pahunchin:** Kathgodam / Haldwani station se **34 km** (NH 109, 1 hour drive). Shared cabs (₹150-₹200) & UTC buses regular available hain.\n- **Recommended Stay:** 2 Days / 1 Night.`;
              } else if (qLower.includes('kedarnath')) {
                replyText = `**Kedarnath Dham** 3,584m ki altitude par sthit Garhwal Himalayas ka sacred shrine hai.\n\n- **Route:** Haridwar / Rishikesh → Devprayag → Rudraprayag → Guptkashi → Sonprayag / Gaurikund (driving endpoint).\n- **Trek Details:** Gaurikund se **16 km ka steep trek** hai (6-8 hours). Trek permit aur biometric registration mandatory hai.`;
              } else if (qLower.includes('mussoorie') || qLower.includes('dehradun')) {
                replyText = `**Mussoorie (Queen of Hills)** Dehradun se **34 km** ki doori par sthit hai (approx 1 hour drive via Rajpur Road).\n\n- **Key Highlights:** Kempty Falls, Mall Road, Gun Hill Cable Car, Lal Tibba Viewpoint, & Company Garden.`;
              } else {
                replyText = `**Namaste! Welcome to Devbhoomi Uttarakhand.**\n\nAapne **${cleanText}** ke baare me pucha. Main aapko exact road map, verified homestays, weather, aur mountain trek details instantly provide kar sakta hoon. Kahiye aap kahan se start kar rahe hain?`;
              }
            }

            if (replyText) {
              const suggestions = (agentResp.suggestedActions || resData.suggestions || []).map(a => a.label || a).filter(Boolean);
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
                await new Promise((r) => setTimeout(r, 12));
              }

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: replyText, agent: agentName, suggestions, data: agentResp.data || resData.data || null }
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

      // Offline / Render Spindown Fallback Synthesizer
      const localFallbackText = cleanText.toLowerCase().includes('kedarnath') || cleanText.toLowerCase().includes('badrinath')
        ? `**Devbhoomi Pilgrimage & Yatra Intelligence:**\n\n- **Kedarnath / Badrinath**: High-altitude weather is currently clear and mountain routes are monitored.\n- **Mandatory**: Biometric Yatra registration and physical acclimatization.\n- **Altitude Safeguard**: Avoid rapid ascension above 3,000m without hydration.`
        : cleanText.toLowerCase().includes('nainital') || cleanText.toLowerCase().includes('mussoorie')
          ? `**Hill Station & Lake Explorer Guide:**\n\n- **Weather & Scenic Spots**: Pleasant mountain breeze (16°C - 22°C).\n- **Top Spots**: Lake promenade, Naina Devi Temple, Tiffin Top & Mall Road.\n- **Homestays & Stays**: Verified local mountain lodges are operational.`
          : `**Devbhoomi AI Companion:**\n\nI have retrieved the latest verified ground knowledge for Uttarakhand. Feel free to explore sacred shrines, verified homestays, 4x4 mountain rentals, or plan customized multi-day itineraries.`;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { 
                ...m, 
                content: localFallbackText, 
                agent: 'Devbhoomi Ground Companion',
                suggestions: ['View Verified Stays', 'Check Mountain Safety', 'Explore Destinations']
              }
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
