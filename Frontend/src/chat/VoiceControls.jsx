/**
 * Devbhoomi Conversational AI - Voice Controls
 * Connects directly to the Gemini Live Aoede / Multi-voice Studio session
 */

import React from 'react';
import DevbhoomiVoiceStudioModal from '../components/copilot/DevbhoomiVoiceStudioModal.jsx';

export default function VoiceControls({ 
  isOpen = false, 
  onClose = () => {}, 
  lang: _lang = 'hi', 
  initialVoice = 'Aoede',
  onTranscriptReceived = () => {} 
}) {
  if (!isOpen) return null;

  return (
    <DevbhoomiVoiceStudioModal
      isOpen={isOpen}
      onClose={onClose}
      initialVoice={initialVoice}
      onTranscriptReceived={onTranscriptReceived}
    />
  );
}
