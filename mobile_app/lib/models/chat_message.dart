class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final List<String>? suggestions;
  final List<String>? toolsUsed;
  final String? confidence;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.suggestions,
    this.toolsUsed,
    this.confidence,
  });

  Map<String, dynamic> toJson() => {
    'text': text,
    'isUser': isUser,
    'timestamp': timestamp.toIso8601String(),
    'suggestions': suggestions,
    'toolsUsed': toolsUsed,
    'confidence': confidence,
  };

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    text: json['text'] as String? ?? '',
    isUser: json['isUser'] as bool? ?? false,
    timestamp: json['timestamp'] != null ? (DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()) : DateTime.now(),
    suggestions: (json['suggestions'] as List?)?.map((e) => e.toString()).toList(),
    toolsUsed: (json['toolsUsed'] as List?)?.map((e) => e.toString()).toList(),
    confidence: json['confidence'] as String?,
  );
}

class ChatSession {
  final String id;
  final String title;
  final DateTime timestamp;
  final List<ChatMessage> messages;

  ChatSession({
    required this.id,
    required this.title,
    required this.timestamp,
    required this.messages,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'timestamp': timestamp.toIso8601String(),
    'messages': messages.map((m) => m.toJson()).toList(),
  };

  factory ChatSession.fromJson(Map<String, dynamic> json) => ChatSession(
    id: json['id'] as String? ?? 'sess_${DateTime.now().millisecondsSinceEpoch}',
    title: json['title'] as String? ?? 'Himalayan Conversation',
    timestamp: json['timestamp'] != null ? (DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()) : DateTime.now(),
    messages: ((json['messages'] as List?) ?? [])
        .map((m) => ChatMessage.fromJson(Map<String, dynamic>.from(m as Map)))
        .toList(),
  );
}
