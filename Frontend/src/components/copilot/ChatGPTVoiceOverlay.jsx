import React from 'react';
import DevbhoomiVoiceStudioModal from './DevbhoomiVoiceStudioModal.jsx';

export default function ChatGPTVoiceOverlay({ 
  isOpen = false, 
  onClose = () => {},
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
