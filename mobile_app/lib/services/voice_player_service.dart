import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:audioplayers/audioplayers.dart';

/// High-fidelity audio player service for Devbhoomi AI
/// Plays authentic Gemini Live Aoede (24kHz Studio WAV/MP3) base64 streams
class VoicePlayerService {
  static final AudioPlayer _player = AudioPlayer();
  static bool _isPlaying = false;
  static bool _initialized = false;
  static final Set<VoidCallback> _listeners = {};
  static VoidCallback? onStateChanged;

  static bool get isPlaying => _isPlaying;

  static void addListener(VoidCallback listener) {
    _listeners.add(listener);
  }

  static void removeListener(VoidCallback listener) {
    _listeners.remove(listener);
  }

  static void _notify() {
    onStateChanged?.call();
    for (final cb in _listeners.toList()) {
      try {
        cb();
      } catch (_) {}
    }
  }

  static void init() {
    if (_initialized) return;
    _initialized = true;

    _player.onPlayerStateChanged.listen((state) {
      _isPlaying = (state == PlayerState.playing);
      _notify();
    });

    _player.onPlayerComplete.listen((_) {
      _isPlaying = false;
      _notify();
    });
  }

  /// Plays base64 encoded audio (WAV, MP3, WebM) received from Gemini Live Voice Bridge
  static Future<bool> playBase64Audio(String base64String) async {
    try {
      if (base64String.isEmpty) return false;

      // Clean prefix if present (e.g., data:audio/wav;base64, or data:audio/mp3;base64,)
      String cleanBase64 = base64String;
      String detectedMime = 'audio/wav';
      if (cleanBase64.contains(',')) {
        final header = cleanBase64.split(',').first;
        if (header.contains('audio/mpeg') || header.contains('audio/mp3')) {
          detectedMime = 'audio/mpeg';
        } else if (header.contains('audio/webm')) {
          detectedMime = 'audio/webm';
        }
        cleanBase64 = cleanBase64.split(',').last;
      }
      cleanBase64 = cleanBase64.replaceAll(RegExp(r'\s+'), '');

      final Uint8List audioBytes = base64Decode(cleanBase64);
      if (audioBytes.isEmpty) return false;

      // Inspect binary magic numbers
      if (audioBytes.length > 4) {
        if (audioBytes[0] == 0x52 && audioBytes[1] == 0x49 && audioBytes[2] == 0x46 && audioBytes[3] == 0x46) {
          detectedMime = 'audio/wav';
        } else if (audioBytes[0] == 0xFF && (audioBytes[1] & 0xE0) == 0xE0) {
          detectedMime = 'audio/mpeg';
        } else if (audioBytes[0] == 0x49 && audioBytes[1] == 0x44 && audioBytes[2] == 0x33) {
          detectedMime = 'audio/mpeg';
        }
      }

      await _player.stop();
      await _player.play(BytesSource(audioBytes, mimeType: detectedMime));
      _isPlaying = true;
      _notify();
      return true;
    } catch (e) {
      debugPrint('[VoicePlayerService] Error playing audio: $e');
      _isPlaying = false;
      _notify();
      return false;
    }
  }

  /// Stops any currently playing audio
  static Future<void> stopAudio() async {
    try {
      await _player.stop();
      _isPlaying = false;
      _notify();
    } catch (e) {
      debugPrint('[VoicePlayerService] Error stopping audio: $e');
    }
  }

  static void dispose() {
    _player.dispose();
  }
}
