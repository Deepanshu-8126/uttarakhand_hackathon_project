/**
 * Discovery Uttarakhand - Web Speech Synthesis Utility (Text-to-Speech)
 * Provides clean, natural voice output for AI responses in Hindi and Indian English.
 */

let activeUtterance = null;
let isAudioMuted = false;

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function cleanTextForSpeech(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    // Remove inline action blocks [ACTION: {...}]
    .replace(/\[ACTION:\s*\{[\s\S]*?\}\s*\]/g, '')
    // Remove markdown bold / italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove headings and markdown bullets
    .replace(/^#+\s+/gm, '')
    .replace(/^[\s*-]+\s+/gm, '')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean excessive whitespaces & emojis
    .replace(/[\r\n]+/g, '. ')
    .trim();
}

/**
 * Speak text aloud using browser Web Speech API
 */
export function speakText(text, { 
  lang = 'hi-IN', 
  rate = 1.0, 
  pitch = 1.0, 
  onStart, 
  onEnd, 
  onError 
} = {}) {
  if (!isSpeechSynthesisSupported()) {
    console.warn('[SpeechSynthesis] Web Speech API not supported in this browser.');
    if (onError) onError(new Error('Speech synthesis not supported'));
    return;
  }

  // Cancel any ongoing utterance first
  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(clean);
    
    // Select best available voice (Prefer Indian Hindi or English voice if available)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.lang === 'hi-IN' || v.lang.startsWith('hi')) || 
      (v.lang === 'en-IN') ||
      (v.name.includes('India') || v.name.includes('Hindi'))
    ) || voices.find(v => v.lang.startsWith('en')) || null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = lang;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      activeUtterance = utterance;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      console.warn('[SpeechSynthesis] Utterance error:', e);
      if (onError) onError(e);
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('[SpeechSynthesis] Error speaking text:', err);
    if (onError) onError(err);
  }
}

/**
 * Stop any active speech
 */
export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  activeUtterance = null;
}

/**
 * Check if browser is currently speaking
 */
export function isCurrentlySpeaking() {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
