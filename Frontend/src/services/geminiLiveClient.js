/**
 * Gemini Live WebSocket Client Manager for Discovery Uttarakhand
 * Production HTTPS (WSS) + Localhost (WS) + Seamless HTTP Voice Failover
 */

export class GeminiLiveClient {
  constructor() {
    this.ws = null;
    this.callbacks = null;
    this.isConnected = false;
    this.activeHostIndex = 0;
    this.pingInterval = null;

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const envWs = import.meta.env.VITE_WS_URL || '';

    // Smart priority: localhost dev uses local bridge on port 8765 first; HTTPS/prod uses secure WSS
    if (envWs) {
      this.candidateHosts = [envWs];
    } else if (isLocalhost) {
      this.candidateHosts = [
        'ws://localhost:8765/ws/live',
        'ws://localhost:8765/ws/voice',
        'wss://uttarakhand-hackathon-project.onrender.com/ws/voice'
      ];
    } else {
      this.candidateHosts = [
        'wss://uttarakhand-hackathon-project.onrender.com/ws/voice',
        'ws://localhost:8765/ws/live'
      ];
    }
  }

  active() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  sendAudioChunk(base64Pcm) {
    if (!this.active()) return;
    try {
      this.ws.send(JSON.stringify({
        type: 'audio',
        data: base64Pcm,
        chunk: base64Pcm,
        rate: 16000
      }));
    } catch (e) {
      console.warn('[GeminiLiveClient] Failed to send audio chunk:', e);
    }
  }

  connect(config = {}, callbacks = {}) {
    this.callbacks = callbacks;
    this.disconnect();

    const apiKey = config.apiKey || '';
    const voice = config.voice || 'Aoede';
    const model = config.model || 'gemini-3.1-flash-live-preview';
    const systemPrompt = config.systemPrompt ||
      'You are Devbhoomi Companion, the expert AI voice travel guide, mountain safety expert, and local Pahadi friend for Uttarakhand, India, powered by Discover Uttarakhand. ' +
      'You have authentic, street-smart knowledge of Garhwal & Kumaon tourism, Char Dham pilgrimages, hidden gems, high-altitude treks, weather, transport routes, and backpacker budgeting. ' +
      'Rules: 1. Warm, encouraging & street-smart spoken voice in friendly Hindi, English, or conversational Hinglish. ' +
      '2. Low budget DIY backpacker problem solver: never say a trip is impossible for tight budgets (e.g. ₹5,000 for Kedarkantha, Chopta) - give the smart DIY roadmap (UTC early morning 5:30 AM ordinary bus from Dehradun Hill Bus Stand to Sankri ~₹380, train ~₹140, Sankri homestay dorm bed ₹400-₹600, microspikes ₹150, local dhaba meals ₹80-₹100). ' +
      '3. High-impact spoken responses: keep spoken answers concise (2 to 4 spoken sentences). No raw markdown, asterisks, hashtags, bullet points, or emojis in spoken voice. ' +
      '4. Mention AMS protocols and mountain elevation safety.';

    const params = new URLSearchParams({
      apiKey,
      voice,
      model,
      system_prompt: systemPrompt
    });

    const tryConnect = (hostIdx) => {
      if (hostIdx >= this.candidateHosts.length) {
        // Smoothly fall back to browser Web Speech API & Express REST without errors
        this.callbacks?.onFallbackReady?.();
        return;
      }

      let host = this.candidateHosts[hostIdx].replace(/\/ws(\/live|\/voice)?$/, '');
      const wsPath = this.candidateHosts[hostIdx].includes('/ws/voice') ? '/ws/voice' : '/ws/live';
      const wsUrl = `${host}${wsPath}?${params.toString()}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.activeHostIndex = hostIdx;
          this.isConnected = true;
          this.callbacks?.onConnected?.();

          // 20-second Keepalive Ping
          if (this.pingInterval) clearInterval(this.pingInterval);
          this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 20000);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'pong') return;

            if (data.type === 'connected' || data.type === 'ready') {
              this.isConnected = true;
              this.callbacks?.onConnected?.();
            } else if (data.type === 'audio' || data.type === 'audio_chunk') {
              const audioB64 = data.data || data.chunk;
              if (audioB64) {
                this.callbacks?.onAudioData?.(audioB64, data.mimeType);
              }
            } else if (data.type === 'text' || data.type === 'transcript_delta') {
              const text = data.text || data.delta || '';
              if (text) {
                this.callbacks?.onTextData?.(text);
              }
            } else if (data.type === 'userText' || data.type === 'user_transcript') {
              const text = data.text || '';
              if (text) {
                this.callbacks?.onUserTextData?.(text);
              }
            } else if (data.type === 'turnComplete' || data.type === 'turn_complete') {
              this.callbacks?.onTurnComplete?.();
            } else if (data.type === 'interrupted') {
              this.callbacks?.onInterrupted?.();
            } else if (data.type === 'error') {
              this.callbacks?.onError?.(data.message || 'WebSocket Error');
            }
          } catch (e) {
            console.warn('[GeminiLiveClient] Message parse note:', e);
          }
        };

        this.ws.onerror = () => {
          if (!this.isConnected && hostIdx + 1 < this.candidateHosts.length) {
            try { this.ws?.close(); } catch (e) {}
            tryConnect(hostIdx + 1);
          } else {
            this.callbacks?.onFallbackReady?.();
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
          }
          this.callbacks?.onDisconnected?.();
        };

      } catch (err) {
        if (hostIdx + 1 < this.candidateHosts.length) {
          tryConnect(hostIdx + 1);
        } else {
          this.callbacks?.onFallbackReady?.();
        }
      }
    };

    tryConnect(0);
  }

  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'stop' }));
        }
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const liveClient = new GeminiLiveClient();
