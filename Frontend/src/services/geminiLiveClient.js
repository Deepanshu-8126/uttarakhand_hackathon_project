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
    const envWs = import.meta.env.VITE_WS_URL || '';

    // Production WSS first on HTTPS; localhost WS in local dev
    this.candidateHosts = isHttps
      ? [
          envWs,
          'wss://uttarakhand-hackathon-project.onrender.com',
          'wss://uttarakhand-hackathon-project.onrender.com/ws',
        ].filter(Boolean)
      : [
          envWs,
          'ws://127.0.0.1:8765',
          'ws://localhost:8765',
          'ws://127.0.0.1:8008',
          'ws://localhost:8008',
          'wss://uttarakhand-hackathon-project.onrender.com'
        ].filter(Boolean);
  }

  active() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  sendAudioChunk(base64Pcm) {
    if (!this.active()) return;
    try {
      this.ws.send(JSON.stringify({
        type: 'audio_chunk',
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
    const model = config.model || 'models/gemini-3.1-flash-live-preview';
    const systemPrompt = config.systemPrompt || 'You are Devbhoomi AI, an intelligent, low-latency, warm Himalayan mountain guide.';

    const params = new URLSearchParams({
      apiKey,
      voice,
      model,
      system_prompt: systemPrompt
    });

    const tryConnect = (hostIdx) => {
      if (hostIdx >= this.candidateHosts.length) {
        console.log('[GeminiLiveClient] WebSockets unavailable on remote network. Ready for Universal HTTP Voice Fallback.');
        this.callbacks?.onFallbackReady?.();
        return;
      }

      let host = this.candidateHosts[hostIdx].replace(/\/ws(\/live|\/voice)?$/, '');
      const wsUrl = `${host}/ws/live?${params.toString()}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log(`[GeminiLiveClient] ✅ Connected to ${host}`);
          this.activeHostIndex = hostIdx;
          this.isConnected = true;
          this.callbacks?.onConnected?.();

          // 20-second Keepalive Ping for Render
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
            console.error('[GeminiLiveClient] Message parse error:', e);
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
