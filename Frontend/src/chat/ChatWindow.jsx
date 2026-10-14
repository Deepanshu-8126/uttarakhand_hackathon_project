import React, { useEffect, useRef } from 'react';
import { X, MessageSquare, Trash2 } from 'lucide-react';
import { useChatStore } from './ChatState';
import MessageRenderer from './MessageRenderer';
import AgentThinking from './AgentThinking';
import SuggestedActions from './SuggestedActions';
import ChatInput from './ChatInput';
import VoiceControls from './VoiceControls';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatWindow({ isOpen, onClose }) {
  const messagesEndRef = useRef(null);
  const {
    messages, isStreaming, streamingText, activeAgent, thinkingSteps,
    addMessage, startStreaming, appendStream, finishStreaming,
    addThinkingStep, clearThinkingSteps, clearMessages, setInputText,
  } = useChatStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = async (text) => {
    addMessage('user', text);
    clearThinkingSteps();
    startStreaming('Devbhoomi AI');

    try {
      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, stream: true }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const raw = line.slice(6).trim();
              if (raw === '[DONE]') continue;
              try {
                const parsed = JSON.parse(raw);
                const chunk = parsed.choices?.[0]?.delta?.content
                  || parsed.delta?.text
                  || parsed.text
                  || parsed.content
                  || '';
                if (chunk) appendStream(chunk);

                if (parsed.agent) addThinkingStep({ agent: parsed.agent, text: parsed.agent_step || parsed.agent });
              } catch {
                if (raw && raw !== '[DONE]') appendStream(raw);
              }
            }
          }
        }
      } else {
        const data = await res.json();
        const reply = data.response || data.answer || data.message || data.text || 'Sorry, no answer received.';
        appendStream(reply);
        if (data.agent) addThinkingStep({ agent: data.agent, text: data.agent_step || data.agent });
      }
    } catch (err) {
      appendStream(`I couldn't reach the server right now. Please check your connection and try again.\n\n_Error: ${err.message}_`);
    }

    finishStreaming();
  };

  const handleQuickPrompt = (text) => {
    setInputText('');
    handleSend(text);
  };

  const openVoice = () => {
    window.dispatchEvent(new CustomEvent('open-voice-call'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-md bg-stone-900 border border-stone-800 sm:rounded-3xl shadow-2xl flex flex-col text-white h-[92dvh] sm:h-[75vh] sm:max-h-[680px] overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare size={14} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">Devbhoomi AI</h3>
              <p className="text-[10px] text-stone-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Text · Voice · Fully Bilingual
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                title="Clear chat"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-stone-900 scrollbar-thumb-stone-700">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <MessageSquare size={24} className="text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm text-stone-200 mb-1">Namaste!</h4>
              <p className="text-[11px] text-stone-500 max-w-xs leading-relaxed">
                Ask me about treks, safety tips, stays, rentals, or festivals across the Himalayas.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageRenderer key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {isStreaming && streamingText && (
            <MessageRenderer role="assistant" content={streamingText} isStreaming />
          )}

          {isStreaming && !streamingText && (
            <AgentThinking steps={thinkingSteps} activeAgent={activeAgent} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Actions (only when empty) */}
        <SuggestedActions onSelect={handleQuickPrompt} />

        {/* Voice switcher */}
        <VoiceControls onOpenVoice={openVoice} />

        {/* Input */}
        <ChatInput onSend={handleSend} onVoice={openVoice} />
      </div>
    </div>
  );
}
