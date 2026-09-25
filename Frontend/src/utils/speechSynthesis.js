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

let cachedVoices = [];

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Speak text aloud using best available natural neural voice
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
    
    // Refresh voices if empty
    if (!cachedVoices || cachedVoices.length === 0) {
      loadVoices();
    }
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    
    // Check if text has Devanagari (Hindi) characters
    const hasHindi = /[\u0900-\u097F]/.test(clean);
    const targetLang = hasHindi ? 'hi-IN' : (lang || 'en-IN');

    // Rank voices by naturalness and language match
    let preferredVoice = null;
    
    if (hasHindi || targetLang.startsWith('hi')) {
      preferredVoice = voices.find(v => v.name.includes('Natural') && (v.lang.startsWith('hi') || v.name.includes('Hindi')))
        || voices.find(v => v.name.includes('Google') && (v.lang.startsWith('hi') || v.name.includes('Hindi')))
        || voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'))
        || voices.find(v => v.name.includes('Neerja') || v.name.includes('Swara') || v.name.includes('Madhur') || v.name.includes('Hemant'))
        || voices.find(v => v.name.includes('India'))
        || voices.find(v => v.lang === 'en-IN');
    } else {
      preferredVoice = voices.find(v => v.name.includes('Natural') && (v.lang === 'en-IN' || v.name.includes('India')))
        || voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
        || voices.find(v => v.lang === 'en-IN')
        || voices.find(v => v.lang.startsWith('en'));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = targetLang;
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
