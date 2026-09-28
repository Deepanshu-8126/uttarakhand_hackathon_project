import 'package:flutter/foundation.dart';
import 'voice_bridge_interface.dart';

/// Android / Desktop / Stub Voice Bridge
/// Routes to the live Render-deployed web_bridge.py on port 8765
/// WebSocket: wss://devbhoomi-voice.onrender.com/ws/voice
/// Fallback: ws://192.168.1.37:8765/ws/voice (LAN dev)
class PlatformVoiceBridgeImpl implements VoicePlatformBridge {
  // ─── Audio Playback ───────────────────────────────────────────

  @override
  void initPlayback() {
    // No-op on Android — PCM is played via VoicePlayerService (audioplayers)
  }

  @override
  void setPlaybackFinishedCallback(VoidCallback cb) {
    // Handled by platform audio player
  }

  @override
  void playPcm24Chunk(String base64Chunk) {
    // Handled by VoicePlayerService.playBase64Wav() in ai_copilot_screen.dart
    // This stub is intentionally empty — the screen handles PCM playback.
  }

  @override
  void clearAudioPlayback() {
    // Handled by VoicePlayerService.stop() in ai_copilot_screen.dart
  }

  // ─── Microphone Recording ─────────────────────────────────────
  @override
  void startRecording({
    required void Function(String chunk) onChunk,
    required void Function(double vol) onVolume,
    required void Function() onReady,
    required void Function(String err) onError,
    void Function(String text, bool isFinal)? onSpeech,
  }) {
    // On Android, microphone capture is handled natively via VoiceService
    // which uses the Android MediaRecorder path through web_socket_channel.
    // Signal ready immediately; actual mic pump is in VoiceService._startMicrophone()
    onReady();
  }

  @override
  void stopRecording() {
    // Handled by VoiceService.stopSession()
  }

  // ─── WebSocket URL Resolution ─────────────────────────────────
  /// Primary: Live Render deployment of web_bridge.py
  /// Fallback: LAN dev machine → emulator host → localhost
  @override
  String resolveDefaultWsUrl() {
    // Production Render URL for web_bridge.py
    // Replace this with your actual Render service URL once deployed
    const renderUrl = 'wss://devbhoomi-voice-bridge.onrender.com/ws/voice';

    // For development builds, try LAN first
    // ignore: dead_code
    if (kDebugMode) {
      // LAN IP of your dev machine (update if your IP changes)
      return 'ws://192.168.1.37:8765/ws/voice';
    }

    return renderUrl;
  }
}

VoicePlatformBridge getVoicePlatformBridge() => PlatformVoiceBridgeImpl();
