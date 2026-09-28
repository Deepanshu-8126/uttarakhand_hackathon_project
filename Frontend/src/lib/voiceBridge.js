// src/lib/voiceBridge.js
/**
 * Devbhoomi Universal Voice Bridge (Web + Mobile)
 * 
 * Direct Hardware MediaRecorder -> Python Gemini Live Bridge (Port 8765)
 * ZERO reliance on browser's SpeechRecognition (works 100% in Brave, Chrome, Safari, Firefox, Vercel).
 */

const VOICE_URL_PRIMARY = import.meta.env.VITE_VOICE_URL || 'http://localhost:8765';
const BACKEND_API_FALLBACK = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let activeAudioElement = null;

/**
 * Convert Blob to raw base64 string (without data: URL prefix)
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result || '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Send recorded audio blob to Devbhoomi Gemini Voice Bridge
 * Returns: { user_transcript, response, audio_base64, engine }
 */
export async function sendVoiceAudio(audioBlob, lang = 'hi') {
  if (!audioBlob || audioBlob.size < 400) {
    return {
      user_transcript: '',
      response: 'No clear voice audio detected. Please tap mic and speak again.',
      audio_base64: ''
    };
  }

  const b64 = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/webm';

  const payload = JSON.stringify({
    audio_base64: b64,
    mime_type: mimeType,
    lang
  });

  // 1. Prioritize fast local endpoints on localhost
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const candidateUrls = isLocal
    ? [
        `${BACKEND_API_FALLBACK}/voice/audio_query`,
        'http://localhost:5000/api/voice/audio_query',
        'http://localhost:8765/api/voice/audio_query',
        `${VOICE_URL_PRIMARY}/api/voice/audio_query`,
        'https://uttarakhand-hackathon-project.onrender.com/api/voice/audio_query'
      ]
    : [
        'https://uttarakhand-hackathon-project.onrender.com/api/voice/audio_query',
        `${BACKEND_API_FALLBACK}/voice/audio_query`,
        `${VOICE_URL_PRIMARY}/api/voice/audio_query`
      ];

  for (const endpoint of candidateUrls) {
    try {
      const timeoutMs = endpoint.includes('localhost') ? 5000 : 12000;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          user_transcript: data.user_transcript || data.query || '',
          response: data.response || data.text || data.message || '',
          audio_base64: data.audio_base64 || '',
          engine: data.engine || 'gemini_live_bridge'
        };
      }
    } catch (_) {
      // Continue to next candidate URL
    }
  }

  return {
    user_transcript: '',
    response: 'Could not connect to voice server. Make sure python web_bridge.py is running on port 8765.',
    audio_base64: ''
  };
}

/**
 * Start an interactive hardware mic recording session with real-time volume analysis.
 * Returns a controller with a .stop() method that resolves with the recorded Blob.
 */
export async function startMicRecording({ onVolumeChange } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });

  let mimeType = 'audio/webm';
  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
    else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
    else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
    else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
  }

  const chunks = [];
  const recorder = new MediaRecorder(stream, { mimeType });
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.start(150);

  // Audio level analyzer
  let animId = null;
  let audioCtx = null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    try {
      audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume().catch(() => {});
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const track = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length / 255;
        if (onVolumeChange) onVolumeChange(avg);
        animId = requestAnimationFrame(track);
      };
      track();
    } catch (_) {}
  }

  return {
    stream,
    recorder,
    stop: () => {
      return new Promise((resolve) => {
        if (animId) cancelAnimationFrame(animId);
        if (audioCtx && audioCtx.state !== 'closed') {
          try { audioCtx.close(); } catch (_) {}
        }

        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const finalBlob = new Blob(chunks, { type: mimeType });
          resolve(finalBlob);
        };

        try {
          if (recorder.state !== 'inactive') recorder.stop();
          else {
            stream.getTracks().forEach((t) => t.stop());
            resolve(new Blob(chunks, { type: mimeType }));
          }
        } catch (_) {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: mimeType }));
        }
      });
    }
  };
}

/**
 * Record speech once for a fixed duration (default: 4 seconds)
 */
export async function recordOnce(durationMs = 4000) {
  const session = await startMicRecording();
  return new Promise((resolve) => {
    setTimeout(async () => {
      const blob = await session.stop();
      resolve(blob);
    }, durationMs);
  });
}

/**
 * Fetch Gemini Live Aoede voice audio for a text string directly from bridge
 * Returns: { response, audio_base64 }
 */
export async function fetchVoiceAudio(text, lang = 'hi') {
  if (!text || !text.trim()) {
    return { response: '', audio_base64: '' };
  }

  const payload = JSON.stringify({
    query: text.trim(),
    lang
  });

  const candidateUrls = [
    'https://uttarakhand-hackathon-project.onrender.com/api/voice/ask',
    `${VOICE_URL_PRIMARY}/api/voice/ask`,
    `${BACKEND_API_FALLBACK}/voice/ask`,
    'http://localhost:8765/api/voice/ask'
  ];

  for (const endpoint of candidateUrls) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: AbortSignal.timeout(30000)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          response: data.response || '',
          audio_base64: data.audio_base64 || ''
        };
      }
    } catch (_) {}
  }

  return { response: '', audio_base64: '' };
}

/**
 * Play base64 audio stream (Aoede Studio / WAV / MP3)
 */
export function playBase64Audio(b64, { mime = 'audio/wav', onStart, onEnd, onError } = {}) {
  stopAudioPlayback();
  if (!b64) {
    if (onEnd) onEnd();
    return null;
  }

  try {
    let formattedSrc = b64;
    if (!b64.startsWith('data:') && !b64.startsWith('http')) {
      const isWav = b64.startsWith('UklGR') || mime === 'audio/wav' || !b64.startsWith('SUQz');
      const detectedMime = isWav ? 'audio/wav' : 'audio/mpeg';
      formattedSrc = `data:${detectedMime};base64,${b64}`;
    }

    const audio = new Audio(formattedSrc);
    activeAudioElement = audio;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      activeAudioElement = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (err) => {
      activeAudioElement = null;
      if (onError) onError(err);
      else if (onEnd) onEnd();
    };

    audio.play().catch((err) => {
      activeAudioElement = null;
      if (onError) onError(err);
      else if (onEnd) onEnd();
    });

    return audio;
  } catch (err) {
    activeAudioElement = null;
    if (onError) onError(err);
    else if (onEnd) onEnd();
    return null;
  }
}

/**
 * Stop any playing audio immediately
 */
export function stopAudioPlayback() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (_) {}
    activeAudioElement = null;
  }
}

