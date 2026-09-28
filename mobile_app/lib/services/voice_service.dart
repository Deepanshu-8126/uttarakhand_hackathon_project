import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'voice_bridge_selector.dart';
import 'voice_bridge_interface.dart';

enum VoiceState {
  idle,
  connecting,
  requestingMic,
  listening,
  processing,
  speaking,
  error,
}

class VoiceService {
  static final VoiceService _instance = VoiceService._internal();
  factory VoiceService() => _instance;
  VoiceService._internal() {
    _bridge = getPlatformVoiceBridge();
  }

  late final VoicePlatformBridge _bridge;

  WebSocketChannel? _channel;
  StreamSubscription? _channelSub;
  Timer? _pingTimer;

  VoiceState _state = VoiceState.idle;
  VoiceState get state => _state;

  String _userTranscript = '';
  String get userTranscript => _userTranscript;

  String _agentTranscript = '';
  String get agentTranscript => _agentTranscript;

  double _volume = 0.0;
  double get volume => _volume;

  // Listeners
  final List<void Function(VoiceState)> _stateListeners = [];
  final List<void Function(String)> _userTranscriptListeners = [];
  final List<void Function(String delta, String full)> _agentTranscriptListeners = [];
  final List<void Function(double)> _volumeListeners = [];
  final List<void Function(String)> _errorListeners = [];

  void addStateListener(void Function(VoiceState) l) => _stateListeners.add(l);
  void removeStateListener(void Function(VoiceState) l) => _stateListeners.remove(l);

  void addUserTranscriptListener(void Function(String) l) => _userTranscriptListeners.add(l);
  void removeUserTranscriptListener(void Function(String) l) => _userTranscriptListeners.remove(l);

  void addAgentTranscriptListener(void Function(String, String) l) => _agentTranscriptListeners.add(l);
  void removeAgentTranscriptListener(void Function(String, String) l) => _agentTranscriptListeners.remove(l);

  void addVolumeListener(void Function(double) l) => _volumeListeners.add(l);
  void removeVolumeListener(void Function(double) l) => _volumeListeners.remove(l);

  void addErrorListener(void Function(String) l) => _errorListeners.add(l);
  void removeErrorListener(void Function(String) l) => _errorListeners.remove(l);

  void _setState(VoiceState newState) {
    if (_state != newState) {
      _state = newState;
      for (final l in _stateListeners) {
        l(_state);
      }
    }
  }

  void _notifyUserTranscript(String text) {
    _userTranscript = text;
    for (final l in _userTranscriptListeners) {
      l(_userTranscript);
    }
  }

  void _notifyAgentTranscript(String delta) {
    _agentTranscript += delta;
    for (final l in _agentTranscriptListeners) {
      l(delta, _agentTranscript);
    }
  }

  void _notifyVolume(double vol) {
    _volume = vol;
    for (final l in _volumeListeners) {
      l(_volume);
    }
  }

  void _notifyError(String err) {
    _setState(VoiceState.error);
    for (final l in _errorListeners) {
      l(err);
    }
  }

  /// Start an end-to-end voice session
  Future<void> startSession({String? wsUrl}) async {
    await stopSession();

    _userTranscript = '';
    _agentTranscript = '';
    _setState(VoiceState.requestingMic);

    // 1. Initialize AudioContext on user gesture immediately
    _bridge.initPlayback();
    _bridge.setPlaybackFinishedCallback(() {
      if (_state == VoiceState.speaking) {
        _setState(VoiceState.listening);
      }
    });

    // 2. Connect to WebSocket
    _setState(VoiceState.connecting);
    final endpoint = wsUrl ?? _bridge.resolveDefaultWsUrl();

    try {
      final uri = Uri.parse(endpoint);
      final channel = WebSocketChannel.connect(uri);
      _channel = channel;
      
      // Catch errors on BOTH ready and sink.done to prevent unhandled zone exceptions
      channel.ready.then((_) {
        debugPrint('[VoiceService] WebSocket handshake successful');
      }).catchError((dynamic err) {
        debugPrint('[VoiceService] WebSocket connection failed: $err');
        _notifyError('Voice server offline on $endpoint. Please launch run_voice_agent.bat');
        _safeCloseSocket();
      });

      channel.sink.done.catchError((dynamic err) {
        debugPrint('[VoiceService] WebSocket sink done handled: $err');
      });

      _channelSub = channel.stream.listen(
        (dynamic rawMessage) {
          _handleServerMessage(rawMessage);
        },
        onError: (dynamic err) {
          debugPrint('[VoiceService] WebSocket error: $err');
          _notifyError('Voice server offline on $endpoint. Please launch run_voice_agent.bat');
          _safeCloseSocket();
        },
        onDone: () {
          debugPrint('[VoiceService] WebSocket closed');
          _safeCloseSocket();
          if (_state != VoiceState.idle && _state != VoiceState.error) {
            _setState(VoiceState.idle);
          }
        },
        cancelOnError: true,
      );

      // Start ping heartbeat
      _pingTimer?.cancel();
      _pingTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
        if (_channel != null) {
          try {
            _channel!.sink.add(jsonEncode({'type': 'ping'}));
          } catch (_) {
            _safeCloseSocket();
          }
        }
      });
    } catch (e) {
      _notifyError('Failed to establish connection: $e');
      _safeCloseSocket();
      return;
    }

    // 3. Start microphone capture
    _startMicrophone();
  }

  void _startMicrophone() {
    try {
      _bridge.startRecording(
        onReady: () {
          _setState(VoiceState.listening);
        },
        onChunk: (chunkB64) {
          if (_channel != null &&
              (_state == VoiceState.listening ||
                  _state == VoiceState.processing ||
                  _state == VoiceState.speaking)) {
            try {
              _channel?.sink.add(jsonEncode({
                'type': 'audio',
                'data': chunkB64,
                'chunk': chunkB64,
                'rate': 16000,
              }));
            } catch (e) {
              debugPrint('[VoiceService] Audio sink send error: $e');
              _safeCloseSocket();
            }
          }
        },
        onSpeech: (text, isFinal) {
          final clean = text.trim();
          if (clean.isEmpty) return;
          _userTranscript = clean;
          _notifyUserTranscript(clean);

          if (isFinal) {
            if (_state != VoiceState.speaking) {
              _setState(VoiceState.processing);
            }
            try {
              _channel?.sink.add(jsonEncode({
                'type': 'userSpeech',
                'text': clean,
                'isFinal': true,
              }));
            } catch (e) {
              debugPrint('[VoiceService] Speech sink send error: $e');
            }
          }
        },
        onVolume: (vol) {
          _notifyVolume(vol);
        },
        onError: (errMsg) {
          _notifyError(errMsg);
        },
      );
    } catch (e) {
      _notifyError('Microphone capture error: $e');
    }
  }

  void _handleServerMessage(dynamic rawMessage) {
    try {
      final Map<String, dynamic> msg = jsonDecode(rawMessage.toString());
      final type = msg['type'] as String?;

      switch (type) {
        case 'connected':
        case 'ready':
          if (_state == VoiceState.connecting) {
            _setState(VoiceState.listening);
          }
          break;

        case 'userText':
          final text = (msg['text'] as String?) ?? '';
          if (text.isNotEmpty) {
            _userTranscript = text;
            _notifyUserTranscript(text);
            if (_state != VoiceState.speaking) {
              _setState(VoiceState.processing);
            }
          }
          break;

        case 'text':
          final delta = (msg['delta'] as String?) ?? (msg['text'] as String?) ?? '';
          if (delta.isNotEmpty) {
            _notifyAgentTranscript(delta);
            _setState(VoiceState.speaking);
          }
          break;

        case 'audio':
        case 'pcm_chunk':
        case 'audio_chunk':
          final chunk = (msg['data'] as String?) ?? (msg['chunk'] as String?) ?? '';
          if (chunk.isNotEmpty) {
            _setState(VoiceState.speaking);
            _bridge.playPcm24Chunk(chunk);
          }
          break;

        case 'interrupted':
          // Barge-in: user interrupted the AI
          _bridge.clearAudioPlayback();
          _agentTranscript = '';
          _setState(VoiceState.listening);
          break;

        case 'turnComplete':
        case 'turn_complete':
          final completedText = (msg['text'] as String?) ?? '';
          if (completedText.isNotEmpty) {
            _notifyAgentTranscript(completedText);
          }
          final fallbackAudio = (msg['audio_base64'] as String?) ?? '';
          if (fallbackAudio.isNotEmpty) {
            _setState(VoiceState.speaking);
            _bridge.playPcm24Chunk(fallbackAudio);
          }
          break;

        case 'error':
          final err = (msg['message'] as String?) ?? 'Voice error';
          _notifyError(err);
          break;
      }
    } catch (e) {
      debugPrint('[VoiceService] Message parse error: $e');
    }
  }

  /// Send typed query into the voice WebSocket pipeline
  void sendTextQuery(String query) {
    if (query.trim().isEmpty) return;
    _userTranscript = query.trim();
    _agentTranscript = '';
    _notifyUserTranscript(_userTranscript);
    _setState(VoiceState.processing);

    if (_channel != null) {
      try {
        _channel!.sink.add(jsonEncode({
          'type': 'query',
          'query': query.trim(),
        }));
      } catch (e) {
        debugPrint('[VoiceService] Send query error: $e');
      }
    }
  }

  void _safeCloseSocket() {
    _pingTimer?.cancel();
    _pingTimer = null;

    try {
      _bridge.stopRecording();
    } catch (_) {}

    final channel = _channel;
    _channel = null;

    if (channel != null) {
      try {
        channel.sink.close();
      } catch (_) {}
    }

    try {
      _channelSub?.cancel();
    } catch (_) {}
    _channelSub = null;
  }

  /// Stop the session, microphone, audio playback and close socket
  Future<void> stopSession() async {
    _safeCloseSocket();

    try {
      _bridge.clearAudioPlayback();
    } catch (e) {
      debugPrint('[VoiceService] Stop audio playback error: $e');
    }

    _volume = 0.0;
    _notifyVolume(0.0);
    _setState(VoiceState.idle);
  }
}
