/**
 * Discovery Uttarakhand — Studio Quality Web Audio Voice Interop
 * Compatible with Brave, Chrome, Edge, Safari, Firefox.
 * 
 * Implements:
 * 1. 16kHz Mono PCM16 microphone recording with hardware resampler.
 * 2. Gapless 24kHz PCM16 streaming audio playback engine for Gemini Live (Aoede).
 * 3. Instant barge-in / interruption buffer flushing.
 * 4. User-gesture AudioContext resume handling (fixes Brave/Chromium autoplay block).
 */

(function () {
  'use strict';

  var audioContext = null;
  var micStream = null;
  var micSource = null;
  var scriptProcessor = null;
  var isRecording = false;

  // Playback scheduler state
  var playAudioContext = null;
  var nextPlayTime = 0;
  var activeSources = [];
  var onPlaybackFinishedCallback = null;

  function getAudioContext(desiredSampleRate) {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx(desiredSampleRate ? { sampleRate: desiredSampleRate } : undefined);
  }

  // Linear resampler: converts Float32Array from inSampleRate to outSampleRate
  function resampleFloat32(inputData, inRate, outRate) {
    if (inRate === outRate) return inputData;
    var ratio = inRate / outRate;
    var outLength = Math.round(inputData.length / ratio);
    var result = new Float32Array(outLength);
    for (var i = 0; i < outLength; i++) {
      var srcIndex = i * ratio;
      var i0 = Math.floor(srcIndex);
      var i1 = Math.min(i0 + 1, inputData.length - 1);
      var t = srcIndex - i0;
      result[i] = inputData[i0] * (1 - t) + inputData[i1] * t;
    }
    return result;
  }

  // Float32 [-1.0, 1.0] to PCM16 Int16Array
  function floatTo16BitPCM(float32Array) {
    var int16 = new Int16Array(float32Array.length);
    for (var i = 0; i < float32Array.length; i++) {
      var s = Math.max(-1, Math.min(1, float32Array[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }

  // Int16Array to Base64 String
  function pcm16ToBase64(int16Array) {
    var bytes = new Uint8Array(int16Array.buffer, int16Array.byteOffset, int16Array.byteLength);
    var binary = '';
    var len = bytes.byteLength;
    var chunkSize = 8192;
    for (var i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, len)));
    }
    return btoa(binary);
  }

  // Base64 to Float32Array for 24kHz PCM16 audio output
  function base64ToFloat32PCM(b64) {
    var binaryStr = atob(b64);
    var len = binaryStr.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    var int16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    var float32 = new Float32Array(int16.length);
    for (var j = 0; j < int16.length; j++) {
      float32[j] = int16[j] / 32768.0;
    }
    return float32;
  }

  window.DevbhoomiVoiceBridge = {
    isSupported: function () {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext));
    },

    // Start recording 16kHz PCM16 chunks
    startRecording: function (callbacks) {
      callbacks = callbacks || {};
      var onChunk = callbacks.onChunk;
      var onVolume = callbacks.onVolume;
      var onError = callbacks.onError;
      var onReady = callbacks.onReady;

      this.stopRecording();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (onError) onError('Microphone access is not supported on this browser context.');
        return;
      }

      navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }).then(function (stream) {
        micStream = stream;

        // Initialize AudioContext
        audioContext = getAudioContext();
        if (!audioContext) {
          if (onError) onError('AudioContext not supported');
          return;
        }

        // Resume AudioContext if suspended (Brave / Chromium requirement)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        var inSampleRate = audioContext.sampleRate;
        micSource = audioContext.createMediaStreamSource(stream);

        // 4096 buffer size @ 48kHz = ~85ms buffer. @ 44.1kHz = ~92ms
        var bufferSize = 4096;
        scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);

        scriptProcessor.onaudioprocess = function (e) {
          if (!isRecording) return;
          var channelData = e.inputBuffer.getChannelData(0);

          // Compute RMS volume
          var sum = 0;
          for (var i = 0; i < channelData.length; i++) {
            sum += channelData[i] * channelData[i];
          }
          var rms = Math.sqrt(sum / channelData.length);
          if (onVolume) {
            onVolume(Math.min(1.0, rms * 5.0)); // scaled normalized level
          }

          // Resample to 16,000 Hz for Gemini Live
          var resampled = resampleFloat32(channelData, inSampleRate, 16000);
          var pcm16 = floatTo16BitPCM(resampled);
          var b64 = pcm16ToBase64(pcm16);

          if (onChunk && b64) {
            onChunk(b64);
          }
        };

        micSource.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
        isRecording = true;

        if (onReady) onReady();
      }).catch(function (err) {
        console.error('[DevbhoomiVoiceBridge] getUserMedia error:', err);
        var message = 'Microphone permission denied or unavailable.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Microphone permission blocked. Please allow mic access in your browser.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = 'No hardware microphone detected on this device.';
        }
        if (onError) onError(message);
      });
    },

    stopRecording: function () {
      isRecording = false;
      if (scriptProcessor) {
        try { scriptProcessor.disconnect(); } catch (_) {}
        scriptProcessor.onaudioprocess = null;
        scriptProcessor = null;
      }
      if (micSource) {
        try { micSource.disconnect(); } catch (_) {}
        micSource = null;
      }
      if (audioContext && audioContext.state !== 'closed') {
        try { audioContext.close(); } catch (_) {}
        audioContext = null;
      }
      if (micStream) {
        try {
          micStream.getTracks().forEach(function (t) { t.stop(); });
        } catch (_) {}
        micStream = null;
      }
    },

    // Playback 24kHz PCM16 audio chunks gaplessly
    initPlayback: function () {
      if (!playAudioContext || playAudioContext.state === 'closed') {
        playAudioContext = getAudioContext(24000) || getAudioContext();
      }
      if (playAudioContext && playAudioContext.state === 'suspended') {
        playAudioContext.resume();
      }
      nextPlayTime = playAudioContext ? playAudioContext.currentTime : 0;
    },

    playPcm24Chunk: function (base64Chunk) {
      if (!base64Chunk) return;
      if (!playAudioContext || playAudioContext.state === 'closed') {
        this.initPlayback();
      }
      if (!playAudioContext) return;

      if (playAudioContext.state === 'suspended') {
        playAudioContext.resume();
      }

      var float32Data = base64ToFloat32PCM(base64Chunk);
      if (float32Data.length === 0) return;

      var buffer = playAudioContext.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      var source = playAudioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(playAudioContext.destination);

      var currentTime = playAudioContext.currentTime;
      var startTime = Math.max(currentTime, nextPlayTime);
      source.start(startTime);
      nextPlayTime = startTime + buffer.duration;

      activeSources.push(source);
      source.onended = function () {
        var idx = activeSources.indexOf(source);
        if (idx !== -1) activeSources.splice(idx, 1);
        if (activeSources.length === 0 && onPlaybackFinishedCallback) {
          onPlaybackFinishedCallback();
        }
      };
    },

    // Flush all playing and queued audio immediately (Barge-in / Interruption)
    clearAudioPlayback: function () {
      for (var i = 0; i < activeSources.length; i++) {
        try {
          activeSources[i].stop();
          activeSources[i].disconnect();
        } catch (_) {}
      }
      activeSources = [];
      if (playAudioContext) {
        nextPlayTime = playAudioContext.currentTime;
      }
    },

    setPlaybackFinishedCallback: function (cb) {
      onPlaybackFinishedCallback = cb;
    },

    isPlayingAudio: function () {
      return activeSources.length > 0;
    }
  };
})();
