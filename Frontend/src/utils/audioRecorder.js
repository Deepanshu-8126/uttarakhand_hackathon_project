/**
 * Universal Hardware Audio Recorder & Gemini Voice Pipeline
 * 
 * Works 100% across Brave, Chrome, Edge, Safari, Firefox, and Mobile.
 * Bypasses blocked browser SpeechRecognition by capturing hardware mic PCM/WebM 
 * directly and processing with Gemini Live & Whisper AI STT engines.
 */

import { playAudioStream } from './speechSynthesis.js';

let activeMediaStream = null;
let activeMediaRecorder = null;
let recordedChunks = [];
let audioContext = null;
let analyserNode = null;
let animFrameId = null;

/**
 * Convert Blob to Base64 String
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Start recording hardware microphone with live volume tracking
 */
export async function startAudioRecording({ onVolumeChange } = {}) {
  stopAudioRecording();
  recordedChunks = [];

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
  activeMediaStream = stream;

  // Determine best supported container format
  let mimeType = '';
  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
    else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
    else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
    else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
  }

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  recorder.start(200); // 200ms slice
  activeMediaRecorder = recorder;

  // Audio level visualizer
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx) {
    const ctx = new AudioCtx();
    audioContext = ctx;
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyserNode = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const track = () => {
      if (!analyserNode) return;
      analyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length / 255;
      if (onVolumeChange) onVolumeChange(avg);
      animFrameId = requestAnimationFrame(track);
    };
    track();
  }

  return stream;
}

/**
 * Stop recording and return the raw audio Blob
 */
export function stopAudioRecording() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = null;

  if (analyserNode) analyserNode = null;
  if (audioContext && audioContext.state !== 'closed') {
    try { audioContext.close(); } catch (_) {}
    audioContext = null;
  }

  if (activeMediaStream) {
    activeMediaStream.getTracks().forEach(t => t.stop());
    activeMediaStream = null;
  }

  let finalBlob = null;
  if (activeMediaRecorder) {
    try {
      if (activeMediaRecorder.state !== 'inactive') {
        activeMediaRecorder.stop();
      }
    } catch (_) {}
    const mimeType = activeMediaRecorder.mimeType || 'audio/webm';
    if (recordedChunks.length > 0) {
      finalBlob = new Blob(recordedChunks, { type: mimeType });
    }
    activeMediaRecorder = null;
  }

  return finalBlob;
}

/**
 * Send recorded audio blob to Devbhoomi Gemini Bridge or Node Backend
 */
export async function sendAudioToVoiceBridge(audioBlob, { lang = 'hi' } = {}) {
  if (!audioBlob || audioBlob.size < 500) {
    return {
      success: false,
      user_transcript: '',
      response: 'No audio detected. Please tap mic and speak again.',
      audio_base64: ''
    };
  }

  const rawDataUrl = await blobToBase64(audioBlob);
  const cleanBase64 = rawDataUrl.includes(',') ? rawDataUrl.split(',')[1] : rawDataUrl;
  const mimeType = audioBlob.type || 'audio/webm';

  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  // 1. First candidate: Local Python Voice Bridge (port 8765) — only tried on localhost
  if (isLocal) {
    try {
      const bridgeRes = await fetch('http://localhost:8765/api/voice/audio_query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_base64: cleanBase64,
          mime_type: mimeType,
          lang
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (bridgeRes.ok) {
        const data = await bridgeRes.json();
        return {
          success: true,
          user_transcript: data.user_transcript || data.query || '',
          response: data.response || data.text || data.message || '',
          audio_base64: data.audio_base64 || '',
          engine: data.engine || 'gemini_live_bridge'
        };
      }
    } catch (_) {
      // Python bridge not running -> fallback to Express Backend
    }
  }

  // 2. Second candidate: Node.js Express Backend (/api/voice/audio_query)
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  try {
    const backendRes = await fetch(`${apiBase}/voice/audio_query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: cleanBase64,
        mimeType: mimeType,
        lang
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return {
        success: true,
        user_transcript: data.user_transcript || '',
        response: data.response || data.message || '',
        audio_base64: data.audio_base64 || '',
        engine: data.engine || 'devbhoomi_backend'
      };
    }
  } catch (bErr) {
    console.warn('[AudioBridge Fallback Error]', bErr);
  }

  return {
    success: false,
    user_transcript: '',
    response: 'Could not connect to voice server. Please check your network or python bridge.',
    audio_base64: ''
  };
}
