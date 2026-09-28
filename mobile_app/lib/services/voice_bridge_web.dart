// ignore_for_file: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:js_util' as js_util;
import 'package:flutter/foundation.dart';
import 'voice_bridge_interface.dart';

class PlatformVoiceBridgeImpl implements VoicePlatformBridge {
  dynamic get _bridge => js_util.getProperty(html.window, 'DevbhoomiVoiceBridge');

  @override
  void initPlayback() {
    final b = _bridge;
    if (b != null) {
      js_util.callMethod(b, 'initPlayback', []);
    }
  }

  @override
  void setPlaybackFinishedCallback(VoidCallback cb) {
    final b = _bridge;
    if (b != null) {
      js_util.callMethod(b, 'setPlaybackFinishedCallback', [
        js_util.allowInterop(cb),
      ]);
    }
  }

  @override
  void startRecording({
    required void Function(String chunk) onChunk,
    required void Function(double vol) onVolume,
    required void Function() onReady,
    required void Function(String err) onError,
    void Function(String text, bool isFinal)? onSpeech,
  }) {
    final b = _bridge;
    if (b == null) {
      onError('Web Audio Voice Bridge not found.');
      return;
    }

    final callbacks = js_util.jsify({
      'onReady': js_util.allowInterop(() => onReady()),
      'onChunk': js_util.allowInterop((dynamic chunk) {
        if (chunk != null) onChunk(chunk.toString());
      }),
      'onVolume': js_util.allowInterop((dynamic vol) {
        if (vol is num) {
          onVolume(vol.toDouble());
        }
      }),
      'onSpeech': js_util.allowInterop((dynamic text, dynamic isFinal) {
        if (onSpeech != null && text != null) {
          onSpeech(text.toString(), isFinal == true);
        }
      }),
      'onError': js_util.allowInterop((dynamic err) {
        onError(err?.toString() ?? 'Microphone error');
      }),
    });

    js_util.callMethod(b, 'startRecording', [callbacks]);
  }

  @override
  void stopRecording() {
    final b = _bridge;
    if (b != null) {
      js_util.callMethod(b, 'stopRecording', []);
    }
  }

  @override
  void playPcm24Chunk(String base64Chunk) {
    final b = _bridge;
    if (b != null) {
      js_util.callMethod(b, 'playPcm24Chunk', [base64Chunk]);
    }
  }

  @override
  void clearAudioPlayback() {
    final b = _bridge;
    if (b != null) {
      js_util.callMethod(b, 'clearAudioPlayback', []);
    }
  }

  @override
  String resolveDefaultWsUrl() {
    try {
      final loc = html.window.location;
      final hostname = loc.hostname ?? 'localhost';

      // Local dev: use local bridge
      if (hostname == 'localhost' || hostname == '127.0.0.1') {
        return 'ws://localhost:8765/ws/voice';
      }

      // Production: point to dedicated Render voice bridge service
      // This is web_bridge.py deployed separately from the main backend
      return 'wss://devbhoomi-voice-bridge.onrender.com/ws/voice';
    } catch (_) {
      return 'ws://localhost:8765/ws/voice';
    }
  }

}

VoicePlatformBridge getVoicePlatformBridge() => PlatformVoiceBridgeImpl();
