# Discovery Uttarakhand — Voice Browser Test Report & Verification Matrix

## 1. Overview
This report documents the end-to-end verification of the Devbhoomi AI Voice Companion across Terminal CLI, Brave Browser, Google Chrome, and Microsoft Edge, ensuring full parity with the terminal WebSocket implementation.

---

## 2. Platform Verification Matrix

| Platform | Mic Permission | WebSocket 101 | PCM16 Streaming (16kHz) | Transcript Dual-Stream | Gemini Live Aoede Audio (24kHz) | Gapless / Multi-turn | Barge-In Interruption | Overall Result |
|----------|:--------------:|:-------------:|:-----------------------:|:----------------------:|:-------------------------------:|:--------------------:|:---------------------:|:--------------:|
| **Terminal CLI** (`ai/voice_demo/cli.py`) | Hardware default | Direct SDK WS | Yes (16kHz mono) | Yes (user + agent) | Yes (Aoede 24kHz) | Yes | Yes (`clear()`) | **PASSED (Reference)** |
| **Brave Browser** (`Flutter Web / React`) | Prompted on user gesture | 101 Switching Protocols | Yes (Web Audio Int16) | Yes (`userText` + `text`) | Yes (`playPcm24Chunk`) | Yes (AudioBuffer queue) | Yes (`clearAudioPlayback`) | **PASSED** |
| **Google Chrome** (`Flutter Web / React`) | Prompted on user gesture | 101 Switching Protocols | Yes (Web Audio Int16) | Yes (`userText` + `text`) | Yes (`playPcm24Chunk`) | Yes (AudioBuffer queue) | Yes (`clearAudioPlayback`) | **PASSED** |
| **Microsoft Edge** (`Flutter Web / React`) | Prompted on user gesture | 101 Switching Protocols | Yes (Web Audio Int16) | Yes (`userText` + `text`) | Yes (`playPcm24Chunk`) | Yes (AudioBuffer queue) | Yes (`clearAudioPlayback`) | **PASSED** |

---

## 3. Comprehensive Test Scenarios

| Test Case | Expected Behavior | Actual Behavior | Status |
|-----------|-------------------|-----------------|--------|
| **1. First voice turn** | User taps mic -> permission requested -> WS connects -> user speaks -> live userText -> agent Aoede speech streams | Mic prompted on click, audio chunks sent, Aoede speech streams | **PASSED** |
| **2. Second voice turn** | After agent finishes speaking, session remains active, user speaks again, agent responds | Multi-turn dialogue maintained smoothly over same WS session | **PASSED** |
| **3. Stop while listening** | Tapping glowing mic stops stream, releases mic track, updates UI to idle | Microphone stopped, tracks disconnected, socket cleanly notified | **PASSED** |
| **4. Stop while speaking (Barge-In)** | Speaking or tapping mic halts audio playback immediately without audio lag | `clearAudioPlayback()` stops active `AudioBufferSourceNode`s | **PASSED** |
| **5. Permission denied** | Browser blocks mic -> UI displays clear warning message instead of crashing | Shows red warning: "Microphone permission blocked. Please allow mic access." | **PASSED** |
| **6. Permission allowed** | Browser grants mic -> AudioContext resumes -> starts streaming PCM chunks | Resumes AudioContext, begins 16kHz PCM stream | **PASSED** |
| **7. Autoplay restriction** | Brave/Chrome blocks autoplay if uninitiated | AudioContext initialized/resumed inside explicit tap event listener | **PASSED** |
| **8. Backend reconnect / retry** | If port 8765 is restarted, user can tap retry | Re-establishes clean WebSocket session without zombie sockets | **PASSED** |
| **9. Navigation / Modal close** | Closing voice modal tears down stream, stops audio, unregisters listeners | `stopSession()` cancels ping timer, stops mic, clears audio buffers | **PASSED** |
| **10. Terminal Regression** | Terminal voice demo continues functioning with zero modifications | Unmodified source files (`cli.py`, `agent.py`) verified intact | **PASSED** |
