import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingText: '',
  activeAgent: null,
  thinkingSteps: [],
  isOpen: false,
  inputText: '',

  setOpen: (open) => set({ isOpen: open }),
  setInputText: (text) => set({ inputText: text }),

  addMessage: (role, content, meta = {}) => set((state) => ({
    messages: [...state.messages, { id: Date.now() + Math.random(), role, content, meta, timestamp: new Date() }]
  })),

  startStreaming: (agent = null) => set({ isStreaming: true, streamingText: '', activeAgent: agent }),

  appendStream: (chunk) => set((state) => ({ streamingText: state.streamingText + chunk })),

  finishStreaming: () => {
    const { streamingText, messages } = get();
    if (streamingText.trim()) {
      set({
        messages: [...messages, { id: Date.now(), role: 'assistant', content: streamingText, timestamp: new Date() }],
        streamingText: '',
        isStreaming: false,
        activeAgent: null,
      });
    } else {
      set({ isStreaming: false, streamingText: '', activeAgent: null });
    }
  },

  addThinkingStep: (step) => set((state) => ({ thinkingSteps: [...state.thinkingSteps, step] })),
  clearThinkingSteps: () => set({ thinkingSteps: [] }),

  clearMessages: () => set({ messages: [], thinkingSteps: [], streamingText: '', isStreaming: false }),
}));

export const QUICK_PROMPTS = [
  { label: 'Nainital 2-day plan', text: 'Suggest a detailed 2-day itinerary for Nainital with must-visit spots.' },
  { label: 'Kedarnath safety tips', text: 'What mountain safety precautions should I take for Kedarnath trek?' },
  { label: 'Rishikesh homestays', text: 'Recommend verified homestays near Rishikesh riverfront under ₹2000/night.' },
  { label: 'Dehradun bike rental', text: 'What are the best bike rental options in Dehradun for a 3-day hill trip?' },
  { label: 'Valley of Flowers timing', text: 'When is the best time to visit Valley of Flowers and how to reach it?' },
  { label: 'Altitude sickness', text: 'How to prevent and treat altitude sickness while trekking in Uttarakhand?' },
];
