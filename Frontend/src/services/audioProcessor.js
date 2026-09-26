/**
 * High-precision Audio processing utilities for Devbhoomi Gemini Live Voice
 * Mic Capture: Native Hardware AudioContext -> Linear Interpolation Resampler -> 16kHz PCM Int16
 * AI Playback: 24kHz PCM Int16 (Little Endian) -> 24kHz Float32 -> Dedicated 24kHz Playback Context
 */

export class AudioProcessor {
  constructor() {
    this.micCtx = null;
    this.playbackCtx = null;
    this.micStream = null;
    this.processorNode = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.outputAnalyserNode = null;
    this.nextPlayTime = 0;
    this.isPlayingAudio = false;
  }

  initPlaybackContext() {
    if (!this.playbackCtx || this.playbackCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.playbackCtx = new AudioCtxClass({ sampleRate: 24000 });
    }
    if (this.playbackCtx.state === 'suspended') {
      this.playbackCtx.resume().catch(() => {});
    }
    return this.playbackCtx;
  }

  initContext() {
    return this.initPlaybackContext();
  }

  getAnalyser() {
    return this.analyserNode;
  }

  getOutputAnalyser() {
    return this.outputAnalyserNode;
  }

  // Start Mic Capture using native hardware rate, then cleanly downsample to 16kHz
  async startMicCapture(onPcmChunk) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    this.micCtx = new AudioCtxClass();
    if (this.micCtx.state === 'suspended') {
      await this.micCtx.resume();
    }

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });

    this.sourceNode = this.micCtx.createMediaStreamSource(this.micStream);
    this.analyserNode = this.micCtx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.sourceNode.connect(this.analyserNode);

    const inSampleRate = this.micCtx.sampleRate;
    const targetSampleRate = 16000;

    // Use modern AudioWorklet to avoid ScriptProcessorNode deprecation warnings
    let workletSuccess = false;
    if (this.micCtx.audioWorklet) {
      try {
        const workletCode = `
          class MicCaptureProcessor extends AudioWorkletProcessor {
            process(inputs, outputs, parameters) {
              const input = inputs[0];
              if (input && input[0]) {
                this.port.postMessage(input[0]);
              }
              return true;
            }
          }
          registerProcessor('mic-capture-processor', MicCaptureProcessor);
        `;
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);
        await this.micCtx.audioWorklet.addModule(workletUrl);
        URL.revokeObjectURL(workletUrl);

        this.workletNode = new AudioWorkletNode(this.micCtx, 'mic-capture-processor');
        this.workletNode.port.onmessage = (event) => {
          const inputData = event.data;
          const samples16k = this.downsampleTo16kHz(inputData, inSampleRate, targetSampleRate);
          const pcm16 = this.floatTo16BitPCM(samples16k);
          const base64Chunk = this.arrayBufferToBase64(pcm16.buffer);
          if (typeof onPcmChunk === 'function') {
            onPcmChunk(base64Chunk);
          }
        };

        this.analyserNode.connect(this.workletNode);
        this.workletNode.connect(this.micCtx.destination);
        workletSuccess = true;
      } catch (e) {
        workletSuccess = false;
      }
    }

    if (!workletSuccess) {
      this.processorNode = this.micCtx.createScriptProcessor(2048, 1, 1);
      this.analyserNode.connect(this.processorNode);
      this.processorNode.connect(this.micCtx.destination);
      this.processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const samples16k = this.downsampleTo16kHz(inputData, inSampleRate, targetSampleRate);
        const pcm16 = this.floatTo16BitPCM(samples16k);
        const base64Chunk = this.arrayBufferToBase64(pcm16.buffer);
        if (typeof onPcmChunk === 'function') {
          onPcmChunk(base64Chunk);
        }
      };
    }

    return this.analyserNode;
  }

  stopMicCapture() {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.micCtx && this.micCtx.state !== 'closed') {
      this.micCtx.close().catch(() => {});
      this.micCtx = null;
    }
  }

  // Play incoming PCM 24kHz Audio chunk smoothly with Little-Endian DataView decoding
  playPcmChunk(base64Data) {
    const ctx = this.initPlaybackContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!this.outputAnalyserNode) {
      this.outputAnalyserNode = ctx.createAnalyser();
      this.outputAnalyserNode.fftSize = 256;
      this.outputAnalyserNode.smoothingTimeConstant = 0.8;
      this.outputAnalyserNode.connect(ctx.destination);
    }

    try {
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Convert 16-bit PCM (Little-Endian) to Float32
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const numSamples = Math.floor(bytes.byteLength / 2);
      if (numSamples === 0) return;

      const float32Array = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Array[i] = int16 / 32768.0;
      }

      // Create AudioBuffer (24000 Hz, 1 channel)
      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAnalyserNode);
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime + 0.01;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.isPlayingAudio = true;

      source.onended = () => {
        if (ctx.currentTime >= this.nextPlayTime - 0.02) {
          this.isPlayingAudio = false;
        }
      };
    } catch (e) {
      console.error("[AudioProcessor] Failed to decode and play PCM chunk:", e);
    }
  }

  resetPlayback() {
    if (this.playbackCtx) {
      this.nextPlayTime = this.playbackCtx.currentTime;
    }
    this.isPlayingAudio = false;
  }

  isSpeaking() {
    return this.isPlayingAudio;
  }

  // Linear interpolation resampler for clear, natural speech transmission
  downsampleTo16kHz(buffer, inSampleRate, outSampleRate) {
    if (inSampleRate === outSampleRate) {
      return buffer;
    }
    const sampleRateRatio = inSampleRate / outSampleRate;
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
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  // Convert Float32 to Int16 PCM
  floatTo16BitPCM(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  destroy() {
    this.stopMicCapture();
    if (this.playbackCtx && this.playbackCtx.state !== 'closed') {
      this.playbackCtx.close().catch(() => {});
      this.playbackCtx = null;
    }
  }
}

export const audioProcessor = new AudioProcessor();
export default audioProcessor;
