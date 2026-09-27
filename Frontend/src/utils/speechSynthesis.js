/**
 * Discovery Uttarakhand - Web Speech Synthesis Utility (Text-to-Speech)
 * Studio-Grade Natural Voice Engine (Aoede / Microsoft Swara & Neerja Natural / Google Neural).
 */

let activeUtterance = null;
let activeAudio = null;
let cachedVoices = [];

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function cleanTextForSpeech(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    // Remove inline action blocks [ACTION: {...}]
    .replace(/\[ACTION:\s*\{[\s\S]*?\}\s*\]/g, '')
    // Remove markdown links [text](url) -> text
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    // Remove markdown bold / italic / strikethrough
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    // Replace arrows and dashes with natural pauses
    .replace(/→|->|=>/g, ' se ')
    .replace(/–|-/g, ' ')
    // Remove headings and markdown bullets
    .replace(/^#+\s+/gm, '')
    .replace(/^[\s*-]+\s+/gm, '')
    // Remove URLs and HTML tags
    .replace(/https?:\/\/\S+/g, '')
    .replace(/<[^>]*>/g, '')
    // Clean symbols and excessive whitespace
    .replace(/[•★◆✦\*\#\_\~`]/g, '')
    .replace(/[\r\n]+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

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
 * Rank voices to prioritize studio-quality natural neural voices
 * (Microsoft Swara / Madhur / Neerja Natural Online, Google Neural, Edge TTS).
 */
function getBestNeuralVoice(targetLang, hasHindi) {
  if (!cachedVoices || cachedVoices.length === 0) {
    loadVoices();
  }
  const voices = cachedVoices.length > 0 ? cachedVoices : (typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
  if (!voices || voices.length === 0) return null;

  // Filter out legacy robotic SAPI5 desktop voices
  const highQuality = voices.filter(v => !v.name.includes('Desktop') && !v.name.includes('David') && !v.name.includes('Zira') && !v.name.includes('Anna'));
  const candidatePool = highQuality.length > 0 ? highQuality : voices;

  if (hasHindi || targetLang.startsWith('hi')) {
    return (
      candidatePool.find(v => v.name.includes('Swara') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
      candidatePool.find(v => v.name.includes('Madhur') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
      candidatePool.find(v => v.name.includes('Google') && (v.lang.startsWith('hi') || v.name.includes('हिन्दी') || v.name.includes('Hindi'))) ||
      candidatePool.find(v => (v.name.includes('Natural') || v.name.includes('Neural')) && (v.lang.startsWith('hi') || v.name.includes('Hindi'))) ||
      candidatePool.find(v => v.name.includes('Neerja') && v.name.includes('Natural')) ||
      candidatePool.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi')) ||
      candidatePool.find(v => v.name.includes('India')) ||
      candidatePool.find(v => v.lang === 'en-IN') ||
      candidatePool[0]
    );
  }

  // English selection
  return (
    candidatePool.find(v => v.name.includes('Neerja') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
    candidatePool.find(v => v.name.includes('Prabhat') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
    candidatePool.find(v => (v.name.includes('Natural') || v.name.includes('Neural')) && (v.lang === 'en-IN' || v.name.includes('India'))) ||
    candidatePool.find(v => v.name.includes('Google UK English Female')) ||
    candidatePool.find(v => v.name.includes('Google US English')) ||
    candidatePool.find(v => (v.name.includes('Natural') || v.name.includes('Neural')) && v.lang.startsWith('en')) ||
    candidatePool.find(v => v.lang === 'en-IN') ||
    candidatePool.find(v => v.lang.startsWith('en')) ||
    candidatePool[0]
  );
}

/**
 * Play audio from base64 or audio URL directly (Studio Aoede / Neural Audio)
 */
export function playAudioStream(audioSrc, { onStart, onEnd, onError } = {}) {
  stopSpeaking();
  if (!audioSrc) {
    if (onEnd) onEnd();
    return;
  }
  try {
    let formattedSrc = audioSrc;
    if (!audioSrc.startsWith('data:') && !audioSrc.startsWith('http')) {
      // Auto-detect WAV (starts with UklGR for RIFF header) vs MP3
      const isWav = audioSrc.startsWith('UklGR') || !audioSrc.startsWith('SUQz');
      const mime = isWav ? 'audio/wav' : 'audio/mpeg';
      formattedSrc = `data:${mime};base64,${audioSrc}`;
    }
    const audio = new Audio(formattedSrc);
    activeAudio = audio;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      activeAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (err) => {
      activeAudio = null;
      if (onError) onError(err);
    };

    audio.play().catch(e => {
      activeAudio = null;
      if (onError) onError(e);
    });
  } catch (err) {
    activeAudio = null;
    if (onError) onError(err);
  }
}

/**
 * Speak text aloud using best available natural neural voice (Studio-quality)
 */
export function speakText(text, { 
  lang = 'hi-IN', 
  rate = 0.95, 
  pitch = 1.0,
  onStart, 
  onEnd, 
  onError 
} = {}) {

  // Cancel any ongoing utterance or audio stream
  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  if (!isSpeechSynthesisSupported()) {
    console.warn('[SpeechSynthesis] Web Speech API not supported in this browser.');
    if (onError) onError(new Error('Speech synthesis not supported'));
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(clean);
    
    // Check if text has Devanagari (Hindi) characters
    const hasHindi = /[\u0900-\u097F]/.test(clean);
    const targetLang = hasHindi ? 'hi-IN' : (lang || 'en-IN');

    // Rank voices by naturalness and language match
    const preferredVoice = getBestNeuralVoice(targetLang, hasHindi);

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
      // 'interrupted' or 'canceled' happens normally during new user speech or barge-in
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      if (onError) onError(e);
    };

    activeUtterance = utterance;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
      setTimeout(() => {
        try {
          window.speechSynthesis.resume();
          window.speechSynthesis.speak(utterance);
        } catch (_) {}
      }, 60);
    }

  } catch (err) {
    if (onError) onError(err);
  }
}

/**
 * Stop any active speech or audio stream immediately
 */
export function stopSpeaking() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (_) {}
    activeAudio = null;
  }

  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
  activeUtterance = null;
}

/**
 * Check if browser is currently speaking
 */
export function isCurrentlySpeaking() {
  if (activeAudio && !activeAudio.paused) return true;
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
