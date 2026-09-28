import 'package:flutter/foundation.dart';

abstract class VoicePlatformBridge {
  void initPlayback();
  void setPlaybackFinishedCallback(VoidCallback cb);
  void startRecording({
    required void Function(String chunk) onChunk,
    required void Function(double vol) onVolume,
    required void Function() onReady,
    required void Function(String err) onError,
  });
  void stopRecording();
  void playPcm24Chunk(String base64Chunk);
  void clearAudioPlayback();
  String resolveDefaultWsUrl();
}
