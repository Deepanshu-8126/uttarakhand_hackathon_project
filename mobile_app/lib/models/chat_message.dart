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
}

