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
      final protocol = loc.protocol == 'https:' ? 'wss:' : 'ws:';
      final hostname = loc.hostname ?? 'localhost';
      if (hostname == 'localhost' || hostname == '127.0.0.1') {
        return 'ws://localhost:8765/ws/live';
      }
      return '$protocol//$hostname:8765/ws/live';
    } catch (_) {
      return 'ws://localhost:8765/ws/live';
    }
  }
}

VoicePlatformBridge getVoicePlatformBridge() => PlatformVoiceBridgeImpl();
