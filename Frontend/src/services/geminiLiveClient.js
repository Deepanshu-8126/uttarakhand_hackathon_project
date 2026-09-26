/**
 * Gemini Live WebSocket Client Manager for Discovery Uttarakhand
 * Multi-port failover support (8765 -> 8008 -> 5000) with automatic reconnection
 */

export class GeminiLiveClient {
  constructor() {
    this.ws = null;
    this.callbacks = null;
    this.isConnected = false;
    this.activeHostIndex = 0;
    this.candidateHosts = [
      'ws://127.0.0.1:8765',
      'ws://localhost:8765',
      'ws://127.0.0.1:8008',
      'ws://localhost:8008'
    ];
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
        callbacks.onError?.('Could not connect to Live Voice WebSocket server. Please ensure start_bridge.bat is running.');
        return;
      }

      const host = this.candidateHosts[hostIdx];
      const wsUrl = `${host}/ws/live?${params.toString()}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log(`[GeminiLiveClient] Connected to ${host}`);
          this.activeHostIndex = hostIdx;
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

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

        this.ws.onerror = (err) => {
          // If first host failed, try next candidate
          if (!this.isConnected && hostIdx + 1 < this.candidateHosts.length) {
            this.ws?.close();
            tryConnect(hostIdx + 1);
          } else {
            this.callbacks?.onError?.('Voice WebSocket connection issue. Falling back to local synthesizer.');
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.callbacks?.onDisconnected?.();
        };
      } catch (err) {
        if (hostIdx + 1 < this.candidateHosts.length) {
          tryConnect(hostIdx + 1);
        } else {
          callbacks.onError?.(err?.message || 'WebSocket connection error');
        }
      }
    };

    tryConnect(0);
  }

  sendAudioChunk(base64Pcm) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'audio',
        data: base64Pcm,
        chunk: base64Pcm
      }));
    }
  }

  sendText(text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text',
        text: text,
        query: text
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  active() {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

export const liveClient = new GeminiLiveClient();
export default liveClient;
