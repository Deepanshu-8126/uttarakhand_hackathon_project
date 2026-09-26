"""Standalone Web Testing Dashboard for langchain-ai/voice-demo.

Provides a rich visual UI for:
1. Microphone Hardware Testing (Audio Level VU Meter, Live Waveform Oscilloscope, Device Selection).
2. Live Voice Agent Session (Sub-second bidirectional audio streaming via Gemini Live Aoede voice).
3. Real-time Live Transcripts, Tool Execution, and Latency Metrics.
4. Terminal Quick-Start Guide.
"""

from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import os
import sys
import wave
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

# Load local .env
_HERE = Path(__file__).resolve().parent
for _candidate in (_HERE / ".env", _HERE.parent / ".env"):
    if _candidate.exists():
        load_dotenv(_candidate, override=False)
        break

from google import genai
from google.genai import types

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-demo-web-ui")

app = FastAPI(title="Voice-Demo Testing Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("ADK_LIVE_MODEL", "gemini-2.5-flash-native-audio-latest")
VOICE_NAME = os.getenv("GEMINI_VOICE_NAME", "Aoede")

SYSTEM_INSTRUCTION = (
    "You are a friendly, hyper-responsive voice assistant powered by Gemini Live. "
    "Keep replies brief, natural, conversational, and direct (1 to 2 spoken sentences). "
    "Never read out markdown asterisks or bullet points."
)


def _get_genai_client():
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set in .env")
    return genai.Client(api_key=GOOGLE_API_KEY)


# -----------------------------------------------------------------------------
# Web Dashboard HTML
# -----------------------------------------------------------------------------
DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voice-Demo Lab &bull; Mic & Live Audio Testing</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07090e;
      --card-bg: rgba(255, 255, 255, 0.03);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #10b981;
      --primary-glow: rgba(16, 185, 129, 0.3);
      --accent: #06b6d4;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Outfit', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-image: 
        radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 40%);
    }
    header {
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-blur: 12px;
      background: rgba(7, 9, 14, 0.8);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      font-size: 1.1rem;
      box-shadow: 0 0 20px var(--primary-glow);
    }
    .brand-text h1 { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.01em; }
    .brand-text p { font-size: 0.75rem; color: var(--text-muted); }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.02);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-muted);
    }
    .status-dot.active { background: var(--primary); box-shadow: 0 0 10px var(--primary); animation: pulse 1.5s infinite; }
    .status-dot.speaking { background: var(--accent); box-shadow: 0 0 10px var(--accent); animation: pulse 1s infinite; }
    .status-dot.error { background: var(--danger); box-shadow: 0 0 10px var(--danger); }

    main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      main { grid-template-columns: 1fr; }
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Mic Diagnostic section */
    .vu-meter-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .vu-meter-bar {
      height: 24px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      border: 1px solid var(--card-border);
    }
    .vu-meter-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #10b981 0%, #06b6d4 70%, #f59e0b 85%, #ef4444 100%);
      transition: width 0.05s ease-out;
      border-radius: 8px;
    }
    .vu-meter-stats {
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    canvas#oscilloscope {
      width: 100%;
      height: 90px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--card-border);
    }

    /* Live Voice Interaction */
    .orb-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      position: relative;
    }
    .voice-orb {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #34d399, #059669 60%, #047857 100%);
      box-shadow: 0 0 40px rgba(16, 185, 129, 0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border: 3px solid rgba(255, 255, 255, 0.2);
    }
    .voice-orb:hover {
      transform: scale(1.05);
      box-shadow: 0 0 60px rgba(16, 185, 129, 0.55);
    }
    .voice-orb.listening {
      animation: breathe 2s ease-in-out infinite;
      border-color: rgba(52, 211, 153, 0.8);
    }
    .voice-orb.speaking {
      background: radial-gradient(circle at 35% 35%, #22d3ee, #0891b2 60%, #0e7490 100%);
      box-shadow: 0 0 50px rgba(6, 182, 212, 0.6);
      animation: speakingPulse 1.2s ease-in-out infinite;
      border-color: rgba(34, 211, 238, 0.9);
    }
    .voice-orb.processing {
      background: radial-gradient(circle at 35% 35%, #fbbf24, #d97706 60%, #b45309 100%);
      box-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
      animation: spin 3s linear infinite;
    }
    .voice-orb-icon {
      font-size: 2rem;
      color: #fff;
    }

    /* Subtitles Card */
    .transcript-box {
      min-height: 140px;
      max-height: 220px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      border: 1px solid var(--card-border);
      padding: 1rem;
      font-size: 0.9rem;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .msg-user { color: #6ee7b7; font-weight: 500; }
    .msg-agent { color: #e2e8f0; font-weight: 400; }

    /* Button Controls */
    .btn {
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #059669);
      color: #fff;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
    }
    .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }

    .code-pill {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    @keyframes breathe {
      0%, 100% { transform: scale(1); box-shadow: 0 0 35px rgba(16, 185, 129, 0.35); }
      50% { transform: scale(1.08); box-shadow: 0 0 65px rgba(16, 185, 129, 0.65); }
    }
    @keyframes speakingPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(6, 182, 212, 0.4); }
      50% { transform: scale(1.1); box-shadow: 0 0 75px rgba(6, 182, 212, 0.75); }
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-icon">&#9658;</div>
      <div class="brand-text">
        <h1>Voice-Demo Testing Lab</h1>
        <p>Gemini Live Native Audio &bull; ADK Backend Engine</p>
      </div>
    </div>
    <div class="status-badge">
      <span class="status-dot" id="headerStatusDot"></span>
      <span id="headerStatusText">Disconnected</span>
    </div>
  </header>

  <main>
    <!-- Left Column: Mic Diagnostics -->
    <div class="card">
      <div class="card-title">
        <span>1. Microphone Hardware Test</span>
        <span id="micPermissionStatus" style="font-size: 0.75rem; color: var(--text-muted);">Not Tested</span>
      </div>

      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
        Test your physical microphone hardware before starting the voice agent. Speak into your mic to observe real-time decibels and waveform.
      </p>

      <button id="btnStartMicTest" class="btn btn-primary" onclick="toggleMicTest()">
        <span>Test My Microphone</span>
      </button>

      <div class="vu-meter-container">
        <div class="vu-meter-stats">
          <span>Live Audio Level (RMS)</span>
          <span id="rmsValue">0.0 dB</span>
        </div>
        <div class="vu-meter-bar">
          <div id="vuMeterFill" class="vu-meter-fill"></div>
        </div>
      </div>

      <div>
        <div class="vu-meter-stats" style="margin-bottom: 0.35rem;">
          <span>Live Oscilloscope Waveform</span>
          <span id="sampleRateLabel">44.1 kHz</span>
        </div>
        <canvas id="oscilloscope"></canvas>
      </div>

      <!-- Terminal Quick-Start -->
      <div style="margin-top: 1rem; border-top: 1px solid var(--card-border); padding-top: 1rem;">
        <div class="card-title" style="margin-bottom: 0.5rem;">
          <span>Terminal Mode (CLI)</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          Run in your terminal using hardware mic & speaker:
        </p>
        <div class="code-pill">
          <code>uv run voice-demo --backend adk</code>
        </div>
      </div>
    </div>

    <!-- Right Column: Live Voice Interaction -->
    <div class="card">
      <div class="card-title">
        <span>2. Live Voice Agent (Gemini Live Aoede)</span>
        <span id="liveModelBadge" style="font-size: 0.75rem; color: var(--primary);">gemini-2.5-flash-native-audio</span>
      </div>

      <div class="orb-stage">
        <div id="voiceOrb" class="voice-orb" onclick="toggleVoiceSession()">
          <span class="voice-orb-icon" id="orbIcon">&#127908;</span>
        </div>
        <p id="orbSubtitle" style="margin-top: 1.25rem; font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">
          Tap Orb to Connect
        </p>
      </div>

      <div class="card-title">
        <span>Live Subtitles & Conversation</span>
        <button onclick="clearTranscript()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem;">Clear</button>
      </div>
      <div class="transcript-box" id="transcriptBox">
        <p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; margin: auto;">
          Tap the green Orb to connect. Speak naturally in English or Hindi!
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;">
        <button id="btnDisconnectVoice" class="btn btn-danger" style="display: none;" onclick="disconnectVoiceSession()">
          Disconnect
        </button>
      </div>
    </div>
  </main>

  <script>
    // -------------------------------------------------------------
    // 1. Microphone Hardware Test Logic
    // -------------------------------------------------------------
    let testAudioContext = null;
    let testMediaStream = null;
    let testAnalyser = null;
    let testAnimFrame = null;
    let isTestingMic = false;

    async function toggleMicTest() {
      if (isTestingMic) {
        stopMicTest();
      } else {
        await startMicTest();
      }
    }

    async function startMicTest() {
      try {
        testMediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        testAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = testAudioContext.createMediaStreamSource(testMediaStream);
        testAnalyser = testAudioContext.createAnalyser();
        testAnalyser.fftSize = 256;
        source.connect(testAnalyser);

        document.getElementById('sampleRateLabel').innerText = (testAudioContext.sampleRate / 1000).toFixed(1) + ' kHz';
        document.getElementById('micPermissionStatus').innerText = 'Mic Active (Online)';
        document.getElementById('micPermissionStatus').style.color = 'var(--primary)';
        document.getElementById('btnStartMicTest').innerHTML = '<span>Stop Mic Test</span>';
        document.getElementById('btnStartMicTest').className = 'btn btn-danger';
        isTestingMic = true;

        drawOscilloscope();
      } catch (err) {
        console.error('Mic test error:', err);
        document.getElementById('micPermissionStatus').innerText = 'Access Denied';
        document.getElementById('micPermissionStatus').style.color = 'var(--danger)';
        alert('Could not access microphone: ' + err.message);
      }
    }

    function stopMicTest() {
      if (testAnimFrame) cancelAnimationFrame(testAnimFrame);
      if (testMediaStream) {
        testMediaStream.getTracks().forEach(t => t.stop());
        testMediaStream = null;
      }
      if (testAudioContext) {
        testAudioContext.close();
        testAudioContext = null;
      }
      isTestingMic = false;
      document.getElementById('btnStartMicTest').innerHTML = '<span>Test My Microphone</span>';
      document.getElementById('btnStartMicTest').className = 'btn btn-primary';
      document.getElementById('vuMeterFill').style.width = '0%';
      document.getElementById('rmsValue').innerText = '0.0 dB';
      document.getElementById('micPermissionStatus').innerText = 'Stopped';
      document.getElementById('micPermissionStatus').style.color = 'var(--text-muted)';
    }

    function drawOscilloscope() {
      if (!testAnalyser) return;
      const canvas = document.getElementById('oscilloscope');
      const ctx = canvas.getContext('2d');
      const bufferLength = testAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function render() {
        testAnimFrame = requestAnimationFrame(render);
        testAnalyser.getByteTimeDomainData(dataArray);

        // Calculate RMS Level for VU Meter
        let sumSquares = 0.0;
        for (let i = 0; i < bufferLength; i++) {
          const norm = (dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        const db = Math.max(-60, Math.round(20 * Math.log10(rms || 0.0001)));
        const percentage = Math.min(100, Math.max(0, (db + 60) * 1.66));

        document.getElementById('vuMeterFill').style.width = percentage + '%';
        document.getElementById('rmsValue').innerText = (rms > 0.01 ? db + ' dB' : '-inf dB');

        // Draw Waveform
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
      render();
    }

    // -------------------------------------------------------------
    // 2. Real-Time Gemini Live Voice Session via WebSocket
    // -------------------------------------------------------------
    let liveSocket = null;
    let liveAudioCtx = null;
    let liveMediaStream = null;
    let liveProcessor = null;
    let liveSilentGain = null;
    let nextChunkPlayTime = 0;
    let activeChunkSources = [];
    let isConnected = false;
    let isAudioPlaying = false;

    function setSessionState(state, text) {
      const orb = document.getElementById('voiceOrb');
      const dot = document.getElementById('headerStatusDot');
      const headerText = document.getElementById('headerStatusText');
      const subtitle = document.getElementById('orbSubtitle');

      orb.className = 'voice-orb ' + state;
      dot.className = 'status-dot ' + (state === 'listening' ? 'active' : (state === 'speaking' ? 'speaking' : ''));
      headerText.innerText = state.toUpperCase();
      subtitle.innerText = text;
    }

    // Downsample microphone Float32 buffer from source sampleRate (e.g. 48kHz/44.1kHz) to target (16kHz)
    function downsampleBuffer(buffer, inputSampleRate, outputSampleRate = 16000) {
      if (inputSampleRate === outputSampleRate) return buffer;
      if (inputSampleRate < outputSampleRate) return buffer;
      const sampleRateRatio = inputSampleRate / outputSampleRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      const result = new Float32Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }
        result[offsetResult] = count > 0 ? (accum / count) : buffer[offsetBuffer];
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result;
    }

    // Convert Float32Array [-1.0, 1.0] to 16-bit signed PCM Uint8Array
    function floatTo16BitPCM(float32Array) {
      const buffer = new ArrayBuffer(float32Array.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // true = Little-Endian
      }
      return new Uint8Array(buffer);
    }

    // Safe base64 encoding without exceeding stack limit
    function uint8ToBase64(bytes) {
      let binary = '';
      const len = bytes.byteLength;
      const chunkSize = 8192;
      for (let i = 0; i < len; i += chunkSize) {
        const sub = bytes.subarray(i, Math.min(i + chunkSize, len));
        binary += String.fromCharCode.apply(null, sub);
      }
      return btoa(binary);
    }

    // Convert Base64 16-bit PCM chunk to Float32Array safely
    function base64PcmToFloat32(base64Chunk) {
      const binary = atob(base64Chunk);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const numSamples = Math.floor(len / 2);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const float32 = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        float32[i] = dataView.getInt16(i * 2, true) / 32768.0; // Little-endian
      }
      return float32;
    }

    async function toggleVoiceSession() {
      if (isConnected) {
        disconnectVoiceSession();
      } else {
        await connectVoiceSession();
      }
    }

    async function connectVoiceSession() {
      if (isTestingMic) stopMicTest();

      setSessionState('processing', 'Connecting to Gemini Live...');
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/ws`;

      try {
        liveSocket = new WebSocket(wsUrl);

        liveSocket.onopen = async () => {
          isConnected = true;
          document.getElementById('btnDisconnectVoice').style.display = 'inline-flex';
          setSessionState('listening', 'Listening... Speak into your mic!');
          await startLiveAudioStreaming();
        };

        liveSocket.onmessage = async (e) => {
          const msg = JSON.parse(e.data);
          if (msg.type === 'audio_chunk') {
            setSessionState('speaking', 'Agent speaking...');
            playLiveChunk(msg.chunk);
          } else if (msg.type === 'user_transcript') {
            appendTranscript('User', msg.text);
          } else if (msg.type === 'transcript_delta') {
            appendAgentDelta(msg.delta);
          } else if (msg.type === 'turn_complete') {
            // Check remaining audio queue time before returning to listening state
            const now = liveAudioCtx ? liveAudioCtx.currentTime : 0;
            const remainingSec = Math.max(0, nextChunkPlayTime - now);
            setTimeout(() => {
              if (isConnected) {
                setSessionState('listening', 'Listening... Speak again!');
              }
            }, Math.round(remainingSec * 1000) + 100);
          }
        };

        liveSocket.onerror = (err) => {
          console.error('WebSocket error:', err);
          setSessionState('error', 'Connection error');
        };

        liveSocket.onclose = () => {
          disconnectVoiceSession();
        };
      } catch (err) {
        setSessionState('error', 'Failed to connect');
        alert('Connection error: ' + err.message);
      }
    }

    async function startLiveAudioStreaming() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      liveAudioCtx = new AudioCtx();
      if (liveAudioCtx.state === 'suspended') {
        await liveAudioCtx.resume();
      }

      liveMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const source = liveAudioCtx.createMediaStreamSource(liveMediaStream);
      // ScriptProcessor with 4096 buffer size
      liveProcessor = liveAudioCtx.createScriptProcessor(4096, 1, 1);

      // Connect through silent gain to prevent mic feedback loop to speakers
      liveSilentGain = liveAudioCtx.createGain();
      liveSilentGain.gain.value = 0.0;
      source.connect(liveProcessor);
      liveProcessor.connect(liveSilentGain);
      liveSilentGain.connect(liveAudioCtx.destination);

      const actualSampleRate = liveAudioCtx.sampleRate;

      liveProcessor.onaudioprocess = (e) => {
        if (!liveSocket || liveSocket.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // 1. Resample from hardware rate (48000/44100) down to 16000Hz
        const downsampled = downsampleBuffer(inputData, actualSampleRate, 16000);

        // 2. Convert to 16-bit PCM Little Endian
        const pcm16Bytes = floatTo16BitPCM(downsampled);

        // 3. Safe Base64 encode and send to Gemini Live
        const base64Chunk = uint8ToBase64(pcm16Bytes);
        liveSocket.send(JSON.stringify({ type: 'pcm_chunk', chunk: base64Chunk }));
      };
    }

    function playLiveChunk(base64Chunk) {
      if (!base64Chunk) return;
      if (!liveAudioCtx || liveAudioCtx.state === 'closed') {
        liveAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (liveAudioCtx.state === 'suspended') {
        liveAudioCtx.resume();
      }

      const float32 = base64PcmToFloat32(base64Chunk);
      if (float32.length === 0) return;

      // Create 24kHz buffer for studio Aoede output
      const buffer = liveAudioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = liveAudioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(liveAudioCtx.destination);

      const now = liveAudioCtx.currentTime;
      // 80ms adaptive jitter cushion on stream start
      if (nextChunkPlayTime < now) {
        nextChunkPlayTime = now + 0.08;
      }

      source.start(nextChunkPlayTime);
      nextChunkPlayTime += buffer.duration;
      activeChunkSources.push(source);
    }

    function disconnectVoiceSession() {
      if (liveSocket) {
        try { liveSocket.close(); } catch(e){}
        liveSocket = null;
      }
      if (liveProcessor) {
        try { liveProcessor.disconnect(); } catch(e){}
        liveProcessor = null;
      }
      if (liveSilentGain) {
        try { liveSilentGain.disconnect(); } catch(e){}
        liveSilentGain = null;
      }
      if (liveMediaStream) {
        liveMediaStream.getTracks().forEach(t => t.stop());
        liveMediaStream = null;
      }
      activeChunkSources.forEach(s => { try { s.stop(); } catch(e){} });
      activeChunkSources = [];
      nextChunkPlayTime = 0;
      isConnected = false;
      document.getElementById('btnDisconnectVoice').style.display = 'none';
      setSessionState('', 'Tap Orb to Connect');
    }

    function appendTranscript(sender, text) {
      const box = document.getElementById('transcriptBox');
      const p = document.createElement('p');
      p.className = sender === 'User' ? 'msg-user' : 'msg-agent';
      p.innerHTML = `<strong>${sender}:</strong> ${text}`;
      box.appendChild(p);
      box.scrollTop = box.scrollHeight;
    }

    let currentAgentP = null;
    function appendAgentDelta(delta) {
      const box = document.getElementById('transcriptBox');
      if (!currentAgentP) {
        currentAgentP = document.createElement('p');
        currentAgentP.className = 'msg-agent';
        currentAgentP.innerHTML = '<strong>Agent:</strong> ';
        box.appendChild(currentAgentP);
      }
      currentAgentP.innerHTML += delta;
      box.scrollTop = box.scrollHeight;
    }

    function clearTranscript() {
      document.getElementById('transcriptBox').innerHTML = '';
      currentAgentP = null;
    }
  </script>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    return HTMLResponse(content=DASHBOARD_HTML)


@app.websocket("/ws")
async def websocket_live_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("[ws] Client connected to Voice-Demo Lab session")

    client = _get_genai_client()
    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=VOICE_NAME)
            )
        ),
        system_instruction=types.Content(parts=[types.Part.from_text(text=SYSTEM_INSTRUCTION)]),
    )

    try:
        async with client.aio.live.connect(model=MODEL, config=config) as session:
            logger.info("[ws] Connected to Gemini Live backend session")

            async def pump_client_to_session():
                try:
                    while True:
                        msg_text = await websocket.receive_text()
                        msg = json.loads(msg_text)
                        if msg.get("type") == "pcm_chunk":
                            raw_b64 = msg.get("chunk")
                            pcm_data = base64.b64decode(raw_b64)
                            await session.send_realtime_input(
                                audio=types.Blob(
                                    data=pcm_data,
                                    mime_type="audio/pcm;rate=16000",
                                )
                            )
                except WebSocketDisconnect:
                    pass
                except Exception as exc:
                    logger.warning(f"[ws/in] pump error: {exc}")

            async def pump_session_to_client():
                try:
                    async for response in session.receive():
                        sc = response.server_content
                        if sc:
                            # Stream text delta
                            if getattr(sc, "output_transcription", None) and getattr(sc.output_transcription, "text", None):
                                await websocket.send_json({
                                    "type": "transcript_delta",
                                    "delta": sc.output_transcription.text,
                                })
                            # Stream audio chunks (24kHz PCM)
                            if sc.model_turn:
                                for part in sc.model_turn.parts:
                                    if part.inline_data and part.inline_data.data:
                                        chunk_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                                        await websocket.send_json({
                                            "type": "audio_chunk",
                                            "chunk": chunk_b64,
                                        })
                            if sc.turn_complete:
                                await websocket.send_json({"type": "turn_complete"})
                except Exception as exc:
                    logger.warning(f"[ws/out] session error: {exc}")

            in_task = asyncio.create_task(pump_client_to_session())
            out_task = asyncio.create_task(pump_session_to_client())
            await asyncio.gather(in_task, out_task, return_exceptions=True)

    except Exception as e:
        logger.error(f"[ws] Session connection error: {e}")
    finally:
        logger.info("[ws] Client disconnected")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  Voice-Demo Testing Lab Starting on http://localhost:8000")
    print("  Mic Testing & Live Voice Dashboard Ready!")
    print("=" * 60 + "\n")
    uvicorn.run("web_ui:app", host="0.0.0.0", port=8000, reload=False)
