import 'package:flutter/foundation.dart';
import 'voice_bridge_interface.dart';

class PlatformVoiceBridgeImpl implements VoicePlatformBridge {
  @override
  void initPlayback() {}

  @override
  void setPlaybackFinishedCallback(VoidCallback cb) {}

  @override
  void startRecording({
    required void Function(String chunk) onChunk,
    required void Function(double vol) onVolume,
    required void Function() onReady,
    required void Function(String err) onError,
  }) {
    onReady();
  }

  @override
  void stopRecording() {}

  @override
  void playPcm24Chunk(String base64Chunk) {}

  @override
  void clearAudioPlayback() {}

  @override
  String resolveDefaultWsUrl() {
    return 'ws://localhost:8765/ws/live';
  }
}

VoicePlatformBridge getVoicePlatformBridge() => PlatformVoiceBridgeImpl();
