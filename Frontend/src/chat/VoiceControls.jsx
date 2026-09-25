/**
 * Devbhoomi Conversational AI - Voice Controls
 * Connects directly to the Gemini Live Aoede studio voice session
 */

import React, { useState } from 'react';
import { Mic, MicOff, Radio, Volume2, Sparkles, X } from 'lucide-react';
import ChatGPTVoiceOverlay from '../components/copilot/ChatGPTVoiceOverlay.jsx';

export default function VoiceControls({ isOpen = false, onClose = () => {}, lang = 'hi', onSpeechTranscript = null }) {
  if (!isOpen) return null;

  return (
    <ChatGPTVoiceOverlay
      isOpen={isOpen}
      onClose={onClose}
      initialLang={lang}
    />
  );
}
