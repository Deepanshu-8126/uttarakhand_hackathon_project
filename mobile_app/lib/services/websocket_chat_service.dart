import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class WebSocketChatService {
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  bool _isConnected = false;
  Timer? _pingTimer;

  final StreamController<Map<String, dynamic>> _messageController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;
  bool get isConnected => _isConnected;

  // Candidate WebSocket Hosts (Local Node, Python Voice Bridge, Render)
  static final List<String> candidateWsUrls = [
    'ws://10.0.2.2:5000/ws/chat',
    'ws://127.0.0.1:5000/ws/chat',
    'ws://10.0.2.2:8765/ws/voice',
    'ws://127.0.0.1:8765/ws/voice',
    'wss://uttarakhand-hackathon-project.onrender.com/ws/chat',
  ];

  Future<bool> connect([String? specificUrl]) async {
    final urls = specificUrl != null ? [specificUrl] : candidateWsUrls;

    for (final url in urls) {
      try {
        final uri = Uri.parse(url);
        _channel = WebSocketChannel.connect(uri);
        
        await _channel!.ready.timeout(const Duration(seconds: 3));
        
        _isConnected = true;
        _setupListener();
        _startPingTimer();
        debugPrint('[WebSocket] Connected successfully to $url');
        return true;
      } catch (e) {
        debugPrint('[WebSocket] Failed connecting to $url: $e');
        _disconnectInternal();
      }
    }
    return false;
  }

  void _setupListener() {
    _subscription = _channel?.stream.listen(
      (data) {
        try {
          if (data is String) {
            final jsonMap = json.decode(data) as Map<String, dynamic>;
            _messageController.add(jsonMap);
          }
        } catch (err) {
          debugPrint('[WebSocket] Parse error: $err');
        }
      },
      onError: (error) {
        debugPrint('[WebSocket] Stream error: $error');
        _isConnected = false;
      },
      onDone: () {
        debugPrint('[WebSocket] Stream closed');
        _isConnected = false;
      },
    );
  }

  void _startPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(const Duration(seconds: 25), (_) {
      if (_isConnected && _channel != null) {
        try {
          _channel!.sink.add(json.encode({'type': 'ping', 'timestamp': DateTime.now().toIso8601String()}));
        } catch (_) {}
      }
    });
  }

  bool sendMessage({
    required String text,
    String? sessionId,
    String? destination,
    bool isVoice = false,
  }) {
    if (!_isConnected || _channel == null) {
      return false;
    }

    try {
      final payload = {
        'type': isVoice ? 'voice_query' : 'chat_message',
        'message': text,
        'sessionId': sessionId ?? 'sess_mobile_${DateTime.now().millisecondsSinceEpoch}',
        'pageContext': {
          'platform': 'FLUTTER_MOBILE_APP',
          if (destination != null) 'destinationName': destination,
        },
        'timestamp': DateTime.now().toIso8601String(),
      };

      _channel!.sink.add(json.encode(payload));
      return true;
    } catch (e) {
      debugPrint('[WebSocket] Send failed: $e');
      return false;
    }
  }

  void disconnect() {
    _disconnectInternal();
  }

  void _disconnectInternal() {
    _pingTimer?.cancel();
    _subscription?.cancel();
    _subscription = null;
    try {
      _channel?.sink.close(status.goingAway);
    } catch (_) {}
    _channel = null;
    _isConnected = false;
  }

  void dispose() {
    disconnect();
    _messageController.close();
  }
}
