# Discovery Uttarakhand — Voice Protocol Contract
**Source of Truth:** Terminal Implementation (`ai/voice_demo/cli.py`, `ai/voice_demo/gemini/agent.py`, `ai/web_bridge.py`)

This document defines the strict, bidirectional protocol between client frontends (Terminal CLI, Flutter Web/Mobile, React Web) and the Devbhoomi Gemini Live Voice Bridge (`ai/web_bridge.py` on port 8765).

---

## 1. Connection Topology & Environment Rules

### URLs & Handshake
- **Localhost Development:** `ws://localhost:8765/ws/live` (or `ws://localhost:8765/ws/voice`)
- **Production Secure Context:** `wss://<PRODUCTION_HOST>/ws/live` (or `/ws/voice`)
- **HTTP Fallback Endpoint:** `POST http://localhost:8765/api/voice/ask` or `/api/voice/audio_query`

### Browser Security Pre-requisites (Brave / Chrome / Edge)
1. **Secure Context:** Browser APIs (`navigator.mediaDevices.getUserMedia` and `AudioContext`) are only exposed over `localhost`, `127.0.0.1`, or `https://`.
2. **User Gesture Requirement:** Microphones and AudioContext instances cannot be initialized on page load. They must only initialize inside an explicit user gesture (button tap/click).
3. **No Mixed Content:** When loading from `https://`, browser clients MUST connect to `wss://` (never `ws://`). When running on `http://localhost:*`, connecting to `ws://localhost:8765` is allowed.
4. **AudioContext Resume:** In modern Chromium/Brave, any `AudioContext` initializes in a `'suspended'` state and requires `await audioCtx.resume()` inside the click handler.

---

## 2. Audio Pipeline Specification

### Input Audio (Microphone -> Server)
- **Audio Encoding:** Linear PCM (Pulse Code Modulation), 16-bit signed, Little-Endian (`pcm16le`).
- **Sample Rate:** `16,000 Hz` (16 kHz).
- **Channels:** `1` (Mono).
- **Chunk Duration:** ~100 ms to 200 ms chunks (1,600 to 3,200 samples = 3,200 to 6,400 bytes per chunk).
- **Transport Encoding:** Base64 string.
- **WebSocket Frame:**
  ```json
  {
    "type": "audio",
    "data": "<BASE64_PCM16LE_CHUNK>",
    "chunk": "<BASE64_PCM16LE_CHUNK>",
    "rate": 16000
  }
  ```
  *(Alternative accepted aliases by server: `type: "pcm_chunk"`, `type: "audio_chunk"`)*

### Output Audio (Server -> Speaker)
- **Audio Encoding:** Linear PCM, 16-bit signed, Little-Endian (`pcm16le`).
- **Sample Rate:** `24,000 Hz` (24 kHz) — studio quality native output of Google Gemini Live (Voice: `Aoede`).
- **Channels:** `1` (Mono).
- **Transport Encoding:** Base64 string in WebSocket frame.
- **Streaming Architecture:** Chunks must be scheduled continuously into an audio output buffer queue using `AudioContext.createBufferSource()` or gapless Web Audio scheduler. Players MUST NOT be stopped and restarted per chunk.
- **Interruption / Barge-In:** When the server emits an `interrupted` event, all queued audio in the client buffer must be immediately flushed/cleared.

---

## 3. WebSocket Message Exchange Protocol

### Client to Server Messages

| Type | Payload Fields | Description |
|------|----------------|-------------|
| `audio` | `data: string`, `rate: 16000` | Real-time 16kHz PCM16 chunk from microphone. |
| `query` / `text` | `query: string` or `text: string` | Text-based prompt injection for multimodal/text input. |
| `ping` | `{ "type": "ping" }` | Keepalive heartbeat (every 15–20 seconds). Server responds with `{"type": "pong"}`. |
| `stop` | `{ "type": "stop" }` | Client informs server that user ended the voice session. |

### Server to Client Messages

| Type | Payload Fields | Client Action |
|------|----------------|---------------|
| `connected` | `ready: bool`, `engine: "gemini_live"`, `voice: "Aoede"`, `model: string` | Client transitions UI to `ready` / `listening`. |
| `userText` | `text: string` | Live transcription of what the user is speaking. Client updates live transcript display. |
| `text` | `delta: string`, `text: string` | Streaming text tokens of the AI agent response. Client appends to agent message bubble. |
| `audio` | `data: string`, `rate: 24000` | Raw 24kHz PCM16 audio chunk from Gemini Live. Client queues chunk for gapless playback. |
| `interrupted` | `{ "type": "interrupted" }` | User spoke while AI was speaking (barge-in). Client stops active playback and clears buffer queue. |
| `turnComplete`| `{ "type": "turnComplete" }` | Agent has finished speaking its response turn. |
| `pong` | `{ "type": "pong" }` | Heartbeat acknowledgement. |
| `error` | `message: string` | Bridge error notification. |

---

## 4. Lifecycle State Machine

```
   [ IDLE ]
       │  (User clicks mic button)
       ▼
 [ REQUESTING_MIC ] ──(Denied)──► [ PERMISSION_DENIED ]
       │
       ▼  (Allowed + AudioContext Resumed)
 [ CONNECTING_WS ]
       │
       ▼  (Server emits "connected")
   [ LISTENING ] ◄───────────────────────────┐
       │ (User speaks, streaming PCM16)      │
       ▼                                     │
   [ THINKING ]                              │
       │ (Server returns audio/text chunks)  │
       ▼                                     │
   [ SPEAKING ] (Gapless 24kHz playback)     │
       │                                     │
       ├─► (User barges in: "interrupted") ──┤
       │                                     │
       └─► ("turnComplete" received) ────────┘
```

---

## 5. Parity Checklist vs Terminal Implementation

- [x] Send sample rate: 16,000 Hz Mono PCM16LE.
- [x] Receive sample rate: 24,000 Hz Mono PCM16LE.
- [x] Native Voice: `Aoede` (Google Gemini Live).
- [x] Autonomous tool execution (`lookup_weather`, `explore_uttarakhand_place`, `check_mountain_safety`, `find_homestays`) handled natively in bridge.
- [x] Interruption handling: `audio_out.clear()` on client side.
- [x] Zero transcoding loss: No lossy MP3/WebM recompression in streaming pipeline.
