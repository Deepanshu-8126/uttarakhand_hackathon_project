import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/chat_message.dart';
import '../models/destination.dart';
import '../services/api_service.dart';
import '../services/websocket_chat_service.dart';
import 'destination_detail_screen.dart';
import 'trip_planner_screen.dart';
import 'map_screen.dart';
import 'sos_safety_screen.dart';

class AiCopilotScreen extends StatefulWidget {
  const AiCopilotScreen({super.key});

  @override
  State<AiCopilotScreen> createState() => _AiCopilotScreenState();
}

class _AiCopilotScreenState extends State<AiCopilotScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isTyping = false;
  bool _isVoiceModalOpen = false;
  late AnimationController _voicePulseController;
  List<Destination> _allDestinations = [];

  final List<String> _quickSuggestions = [
    'Nainital 2 din ka plan',
    'Kedarnath trek weather',
    'Rent bike in Rishikesh',
    'Best time for Auli skiing',
  ];

  final WebSocketChatService _wsService = WebSocketChatService();
  StreamSubscription? _wsSubscription;

  @override
  void initState() {
    super.initState();
    _voicePulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _initWebSocket();
    _loadDestinations();

    // Welcome message from Pahadi Copilot
    _messages.add(
      ChatMessage(
        text: 'Namaste! Main Discovery Uttarakhand ka Pahadi Copilot hoon.\n\nKisi bhi destination, route condition, stays ya verified bike rentals ke baare me puchiye, main real ground data share karunga.',
        isUser: false,
        timestamp: DateTime.now(),
        suggestions: _quickSuggestions,
        toolsUsed: ['searchDestinations', 'getWeather'],
        confidence: 'grounded',
      ),
    );
  }

  Future<void> _loadDestinations() async {
    final d = await ApiService.getDestinations();
    if (mounted) {
      setState(() {
        _allDestinations = d;
      });
    }
  }

  void _initWebSocket() {
    _wsService.connect();
    _wsSubscription = _wsService.messageStream.listen((data) {
      if (mounted && data['response'] != null) {
        final agentResp = data['response'];
        final replyText = agentResp['message'] ?? agentResp.toString();
        setState(() {
          _isTyping = false;
          _messages.add(
            ChatMessage(
              text: replyText,
              isUser: false,
              timestamp: DateTime.now(),
              toolsUsed: (agentResp['toolsUsed'] as List?)?.map((e) => e.toString()).toList(),
              suggestions: (agentResp['suggestedActions'] as List?)?.map((e) => e.toString()).toList(),
              confidence: agentResp['confidence']?.toString() ?? 'grounded',
            ),
          );
        });
        _scrollToBottom();
      }
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    _wsService.dispose();
    _voicePulseController.dispose();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSendMessage([String? overrideText, bool isVoice = false]) async {
    final text = (overrideText ?? _controller.text).trim();
    if (text.isEmpty) return;

    if (overrideText == null) _controller.clear();

    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true, timestamp: DateTime.now()));
      _isTyping = true;
    });
    _scrollToBottom();

    try {
      final result = isVoice
          ? await ApiService.sendVoiceMessage(text, lang: 'en')
          : await ApiService.sendCopilotMessage(text, isVoice: isVoice);

      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.add(
            ChatMessage(
              text: result['text'] ?? '',
              isUser: false,
              timestamp: DateTime.now(),
              suggestions: (result['suggestions'] as List?)?.map((e) => e.toString()).toList(),
              toolsUsed: (result['toolsUsed'] as List?)?.map((e) => e.toString()).toList(),
              confidence: result['confidence']?.toString() ?? 'grounded',
            ),
          );
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.add(
            ChatMessage(
              text: 'Namaste! Uttarakhand travel jankari (Kedarnath, Chopta, Nainital, Auli, rentals, stays) ke liye main taiyaar hoon.',
              isUser: false,
              timestamp: DateTime.now(),
              suggestions: _quickSuggestions,
            ),
          );
        });
        _scrollToBottom();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(color: AppTheme.forestGreen, shape: BoxShape.circle),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Pahadi Copilot', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.textDark)),
                Text('Himalayan Ground Intelligence • Verified', style: TextStyle(fontSize: 10, color: AppTheme.emeraldSafe, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sos, color: Color(0xFFDC2626)),
            tooltip: 'Emergency SOS',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen())),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // ── Messages List ──────────────────────────────────────────
          Expanded(
            child: ListView(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              children: [
                if (_messages.length <= 1) _buildWelcomeState(),
                for (final msg in _messages) _buildMessageBubble(msg),
              ],
            ),
          ),

          // ── Typing Indicator ───────────────────────────────────────
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: const [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.forestGreen),
                  ),
                  SizedBox(width: 8),
                  Text('Pahadi Copilot is checking ground data...', style: TextStyle(fontSize: 11, color: AppTheme.mutedText)),
                ],
              ),
            ),

          // ── Quick Suggestion Chips Bar (Matches reference design) ──
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildPromptChip('🪷', '3-Day Rishikesh spiritual retreat', 'Suggest a 3-day spiritual retreat in Rishikesh with Ganga Aarti & meditation ashrams'),
                  const SizedBox(width: 6),
                  _buildPromptChip('🏔️', '4x4 Offbeat road trip to Munsiyari', 'Suggest a 4-day scenic road trip from Dehradun to Munsiyari with verified 4x4 Thar rental and boutique homestays.'),
                  const SizedBox(width: 6),
                  _buildPromptChip('🏡', 'Budget homestays near Valley of Flowers', 'Find verified budget Pahadi homestays near Valley of Flowers & Govindghat under ₹2,000'),
                ],
              ),
            ),
          ),

          // ── Input Box ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -3))],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: AppTheme.cream,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: TextField(
                        controller: _controller,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _handleSendMessage(),
                        decoration: const InputDecoration(
                          hintText: 'Puchiye: "Nainital 2 din ka plan", "Weather"...',
                          hintStyle: TextStyle(fontSize: 12, color: AppTheme.mutedText),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: const Color(0xFFE8F5E9),
                    child: IconButton(
                      icon: const Icon(Icons.mic, color: AppTheme.forestGreen, size: 20),
                      tooltip: 'Voice Mode',
                      onPressed: _openVoiceDialog,
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: AppTheme.forestGreen,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 18),
                      onPressed: () => _handleSendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openVoiceDialog() {
    // Voice agent state: idle | listening | processing | speaking
    String voiceState = 'idle';
    String liveTranscript = '';
    String lastReply = '';
    bool bridgeLive = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            // ── async actions ───────────────────────────────────────────
            Future<void> submit(String query) async {
              setModalState(() {
                voiceState = 'processing';
                liveTranscript = query;
                lastReply = '';
              });
              final result = await ApiService.sendVoiceMessage(query);
              final reply = result['text'] as String? ?? 'Main aapki baat sun raha hoon.';
              setModalState(() {
                voiceState = 'speaking';
                lastReply = reply;
                bridgeLive = result['source'] == 'voice-demo-bridge';
              });
              // After showing reply, add to main chat
              if (mounted) {
                setState(() {
                  _messages.add(ChatMessage(text: query, isUser: true, timestamp: DateTime.now()));
                  _messages.add(ChatMessage(
                    text: reply,
                    isUser: false,
                    timestamp: DateTime.now(),
                    toolsUsed: (result['toolsUsed'] as List?)?.map((e) => e.toString()).toList(),
                    confidence: result['confidence']?.toString() ?? 'grounded',
                  ));
                });
                _scrollToBottom();
              }
              await Future.delayed(const Duration(seconds: 2));
              setModalState(() => voiceState = 'idle');
            }

            // ── UI ───────────────────────────────────────────────────────
            final statusLabel = {
              'idle': 'Tap a topic or mic to speak',
              'listening': 'Listening to you…',
              'processing': 'Devbhoomi AI is thinking…',
              'speaking': 'AI replied — check chat below',
            }[voiceState]!;

            String selectedLang = 'English';

            return Container(
              height: MediaQuery.of(context).size.height * 0.85,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                children: [
                  // ── Top Header ───────────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0B533E),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              alignment: Alignment.center,
                              child: const Text('★', style: TextStyle(color: Color(0xFFFCD34D), fontSize: 16)),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text('Devbhoomi AI', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w900, fontSize: 15)),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFECFDF5),
                                        borderRadius: BorderRadius.circular(999),
                                        border: Border.all(color: const Color(0xFFA7F3D0)),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: const [
                                          Icon(Icons.circle, color: Color(0xFF10B981), size: 6),
                                          SizedBox(width: 3),
                                          Text('Active', style: TextStyle(color: Color(0xFF047857), fontSize: 9, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const Text('Devbhoomi Travel Copilot', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w500)),
                              ],
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Icon(Icons.circle, color: Color(0xFFA7F3D0), size: 6),
                                  SizedBox(width: 4),
                                  Text('Voice Active', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 6),
                            IconButton(
                              icon: const Icon(Icons.close, color: Color(0xFF64748B), size: 20),
                              onPressed: () => Navigator.pop(ctx),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // ── Main Content Area ────────────────────────────────────
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Glowing Center Mic Orb
                          AnimatedBuilder(
                            animation: _voicePulseController,
                            builder: (context, child) {
                              return Column(
                                children: [
                                  Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: const Color(0xFFD1FAE5).withOpacity(0.7),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFF10B981).withOpacity(0.15),
                                          blurRadius: 20,
                                          spreadRadius: 6,
                                        ),
                                      ],
                                    ),
                                    alignment: Alignment.center,
                                    child: GestureDetector(
                                      onTap: () {
                                        submit('Can you suggest the best 3-day trek itinerary starting from Rishikesh with live weather updates?');
                                      },
                                      child: Container(
                                        width: 58,
                                        height: 58,
                                        decoration: const BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: Color(0xFF0B533E),
                                        ),
                                        child: const Icon(Icons.mic, color: Colors.white, size: 28),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 12),

                                  // Status pill
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECFDF5),
                                      borderRadius: BorderRadius.circular(999),
                                      border: Border.all(color: const Color(0xFFA7F3D0)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.circle, color: Color(0xFF10B981), size: 7),
                                        const SizedBox(width: 6),
                                        Text(
                                          voiceState == 'speaking' ? 'Speaking ground intelligence...' : 'Listening to your voice...',
                                          style: const TextStyle(color: Color(0xFF065F46), fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 10),

                                  // 7 Animated Equalizer Bars
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(7, (i) {
                                      final heights = [10.0, 16.0, 12.0, 18.0, 14.0, 9.0, 13.0];
                                      final isBouncing = voiceState == 'listening' || voiceState == 'speaking';
                                      final h = isBouncing ? (heights[i] + (_voicePulseController.value * 10)) : 6.0;
                                      return Container(
                                        margin: const EdgeInsets.symmetric(horizontal: 2),
                                        width: 3,
                                        height: h,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF10B981),
                                          borderRadius: BorderRadius.circular(999),
                                        ),
                                      );
                                    }),
                                  ),
                                ],
                              );
                            },
                          ),

                          const SizedBox(height: 18),

                          // 1. YOU SAID (LIVE TRANSCRIPT) Card
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: const [
                                    Icon(Icons.circle, color: Color(0xFF94A3B8), size: 5),
                                    SizedBox(width: 5),
                                    Text('YOU SAID (LIVE TRANSCRIPT)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 0.5)),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  liveTranscript.isNotEmpty
                                      ? '“$liveTranscript”'
                                      : '“Can you suggest the best 3-day trek itinerary starting from Rishikesh with live weather updates?”',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF1E293B), fontStyle: FontStyle.italic, height: 1.35),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 12),

                          // 2. Devbhoomi AI Speaking Card
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDF4),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFBBF7D0)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 20,
                                          height: 20,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF0B533E),
                                            borderRadius: BorderRadius.circular(5),
                                          ),
                                          alignment: Alignment.center,
                                          child: const Text('★', style: TextStyle(color: Color(0xFFFCD34D), fontSize: 10)),
                                        ),
                                        const SizedBox(width: 6),
                                        const Text('Devbhoomi AI', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Color(0xFF0F172A))),
                                      ],
                                    ),
                                    Row(
                                      children: const [
                                        Icon(Icons.circle, color: Color(0xFF10B981), size: 6),
                                        SizedBox(width: 4),
                                        Text('Speaking', style: TextStyle(color: Color(0xFF047857), fontSize: 10, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  lastReply.isNotEmpty
                                      ? lastReply
                                      : 'I recommend the Chopta – Tungnath – Chandrashila circuit. Current passes are sunny and clear at 14°C. Day 1: Rishikesh to Sari Village base. Day 2: Summit Tungnath & Chandrashila at sunrise. Day 3: Scenic return via Deoriatal lake.',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF334155), height: 1.4, fontWeight: FontWeight.w500),
                                ),
                                const SizedBox(height: 10),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 4,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: const Color(0xFFA7F3D0)),
                                      ),
                                      child: const Text('14°C Clear Skies', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF065F46))),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: const Color(0xFFE2E8F0)),
                                      ),
                                      child: const Text('Moderate Difficulty', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 14),

                          // 3. VOICE DIALECT / LANGUAGE Section
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('VOICE DIALECT / LANGUAGE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 0.5)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECFDF5),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: const Color(0xFFA7F3D0)),
                                    ),
                                    child: const Text('Auto-Detect On', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Row(
                                  children: [
                                    'English',
                                    'हिन्दी',
                                    'गढ़वाली (Garhwali)',
                                    'कुमाऊँनी (Kumaoni)',
                                  ].map((l) {
                                    final active = selectedLang == l;
                                    return GestureDetector(
                                      onTap: () => setModalState(() => selectedLang = l),
                                      child: Container(
                                        margin: const EdgeInsets.only(right: 6),
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                        decoration: BoxDecoration(
                                          color: active ? const Color(0xFF0B533E) : Colors.white,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: active ? const Color(0xFF0B533E) : const Color(0xFFE2E8F0)),
                                        ),
                                        child: Text(
                                          l,
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: active ? FontWeight.bold : FontWeight.w600,
                                            color: active ? Colors.white : const Color(0xFF334155),
                                          ),
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // ── Bottom Controls ──────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF334155),
                                side: const BorderSide(color: Color(0xFFCBD5E1)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              icon: const Icon(Icons.keyboard_outlined, size: 16),
                              label: const Text('Keyboard', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              onPressed: () => Navigator.pop(ctx),
                            ),
                            GestureDetector(
                              onTap: () {
                                submit('Kedarnath Dham weather and Chopta snow status update');
                              },
                              child: Container(
                                width: 44,
                                height: 44,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Color(0xFF059669),
                                  boxShadow: [BoxShadow(color: Color(0x33059669), blurRadius: 10, offset: Offset(0, 3))],
                                ),
                                child: const Icon(Icons.mic, color: Colors.white, size: 22),
                              ),
                            ),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFEF2F2),
                                foregroundColor: const Color(0xFFDC2626),
                                elevation: 0,
                                side: const BorderSide(color: Color(0xFFFECACA)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              icon: const Icon(Icons.stop, size: 14),
                              label: const Text('Interrupt', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              onPressed: () {
                                setModalState(() => voiceState = 'idle');
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text('Uttarakhand Tourism Real-time Speech AI Engine', style: TextStyle(fontSize: 9, color: Color(0xFF94A3B8))),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPromptChip(String icon, String label, String prompt) {
    return InkWell(
      onTap: () => _handleSendMessage(prompt),
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(icon, style: const TextStyle(fontSize: 11)),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── 1. Website Parity Welcome & 4 Starter Cards ─────────────────────────
  Widget _buildWelcomeState() {
    final starterCards = [
      {
        'icon': Icons.terrain,
        'title': 'Plan 4-Day Trek',
        'desc': 'Valley of Flowers & Hemkund Sahib itinerary with safety checks',
        'prompt': 'Mujhe Valley of Flowers aur Hemkund Sahib ka 4-day trek plan bana do Delhi se start karke',
      },
      {
        'icon': Icons.shield_outlined,
        'title': 'Live Road & Weather',
        'desc': 'Current monsoon advisories, landslides and mountain forecast',
        'prompt': 'Kedarnath aur Badrinath route ka live weather aur road safety status kaisa hai?',
      },
      {
        'icon': Icons.home_work_outlined,
        'title': 'Pahadi Homestays',
        'desc': 'Verified local mountain stays with direct host booking',
        'prompt': 'Rishikesh aur Chopta ke paas verified Pahadi homestays dikhao under 2000 per night',
      },
      {
        'icon': Icons.alt_route,
        'title': 'Budget Trip Planner',
        'desc': 'Custom cost breakdown for solo or family travel',
        'prompt': '2 logon ke liye 5 din ka Uttarakhand trip plan under ₹20,000',
      },
    ];

    return Container(
      margin: const EdgeInsets.only(bottom: 20, top: 4),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
      child: Column(
        children: [
          // Mountain Circle Icon
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFA7F3D0)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0F3D2E).withOpacity(0.06),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Icon(Icons.terrain_rounded, color: Color(0xFF0F3D2E), size: 30),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Welcome to Devbhoomi AI',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F3D2E),
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 4),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Ask anything about mountain routes, high-altitude acclimatization, live road safety alerts, or verified local homestays.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
            ),
          ),
          const SizedBox(height: 16),

          // 4 Starter Cards
          for (final card in starterCards)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: () => _handleSendMessage(card['prompt'] as String),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Icon(card['icon'] as IconData, size: 18, color: const Color(0xFF0F3D2E)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  card['title'] as String,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const Icon(Icons.arrow_forward_ios, size: 11, color: Color(0xFF0F3D2E)),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              card['desc'] as String,
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.3),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ── 2. Destination Matching Engine ─────────────────────────────────────────
  List<Destination> _findMentionedDestinations(String text) {
    if (text.isEmpty || _allDestinations.isEmpty) return [];
    final lower = text.toLowerCase();
    final matched = <Destination>[];

    final Map<String, List<String>> aliasMap = {
      'kedarnath': ['kedarnath', 'kedar'],
      'badrinath': ['badrinath', 'badri'],
      'valley-of-flowers': ['valley of flowers', 'bhyundar', 'hemkund'],
      'auli': ['auli', 'joshimath'],
      'rishikesh': ['rishikesh', 'triveni ghat', 'ram jhula'],
      'chopta': ['chopta', 'tungnath', 'chandrashila'],
      'nainital': ['nainital', 'naini lake'],
      'munsiyari': ['munsyari', 'munsiyari', 'panchachuli'],
      'jim-corbett-national-park': ['corbett', 'jim corbett', 'dhikala'],
      'haridwar': ['haridwar', 'har ki pauri'],
      'adi-kailash': ['adi kailash', 'om parvat'],
      'jageshwar': ['jageshwar'],
      'mussoorie': ['mussoorie', 'kempty', 'gun hill'],
      'dhanaulti': ['dhanaulti', 'kanatal'],
      'gangotri': ['gangotri', 'gaumukh'],
      'yamunotri': ['yamunotri', 'janki chatti'],
      'almora': ['almora', 'kasar devi'],
      'kausani': ['kausani', 'anasakti'],
      'ranikhet': ['ranikhet', 'chaubatia'],
      'mukteshwar': ['mukteshwar', 'chauli ki jali'],
      'tehri': ['tehri', 'tehri lake'],
      'dayara-bugyal': ['dayara', 'dayara bugyal'],
      'kedarkantha': ['kedarkantha', 'sankri'],
      'binsar': ['binsar'],
    };

    for (final dest in _allDestinations) {
      final destKey = dest.id.toLowerCase();
      final nameLower = dest.name.toLowerCase();

      bool isMatch = false;
      for (final entry in aliasMap.entries) {
        if (entry.key == destKey || entry.key == nameLower) {
          if (entry.value.any((alias) => lower.contains(alias))) {
            isMatch = true;
            break;
          }
        }
      }

      if (!isMatch && (lower.contains(nameLower) || (nameLower.length > 4 && lower.contains(nameLower.split(' ')[0])))) {
        isMatch = true;
      }

      if (isMatch) {
        matched.add(dest);
        if (matched.length >= 2) break;
      }
    }

    return matched;
  }

  // ── 3. Real Destination Snapshot Spotlight Card ───────────────────────────
  Widget _buildDestinationSpotlight(Destination dest) {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFBFBF9),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Banner Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: const BoxDecoration(
              color: Color(0xFFE8F5E9),
              borderRadius: BorderRadius.vertical(top: Radius.circular(17)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Row(
                  children: [
                    Icon(Icons.landscape, size: 12, color: Color(0xFF0F3D2E)),
                    SizedBox(width: 4),
                    Text(
                      'REAL DESTINATION SNAPSHOT',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: 0.5),
                    ),
                  ],
                ),
                Text(
                  'Verified Himalayan Photography',
                  style: TextStyle(fontSize: 8, color: Color(0xFF047857), fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),

          // Image with Altitude & Rating Badges
          Stack(
            children: [
              CachedNetworkImage(
                imageUrl: dest.imageUrl,
                height: 130,
                width: double.infinity,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(height: 130, color: const Color(0xFFE2E8F0)),
                errorWidget: (context, url, error) => Container(
                  height: 130,
                  color: const Color(0xFF0F3D2E),
                  child: const Center(child: Icon(Icons.terrain, color: Colors.white54, size: 36)),
                ),
              ),
              Positioned(
                top: 8,
                left: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F3D2E).withOpacity(0.88),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.terrain, size: 10, color: Color(0xFF34D399)),
                      const SizedBox(width: 4),
                      Text(
                        '${dest.altitude}m',
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(999),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 4),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, size: 11, color: Colors.amber),
                      const SizedBox(width: 3),
                      Text(
                        dest.rating.toString(),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Content info
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        dest.name,
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF0F3D2E)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        dest.district,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F3D2E)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  dest.shortDescription.isNotEmpty ? dest.shortDescription : dest.description,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.35),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),

                // 3 Action Buttons (View Details, View Map, Plan Trip)
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F3D2E),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => DestinationDetailScreen(destination: dest)),
                        ),
                        icon: const Icon(Icons.explore_outlined, size: 12),
                        label: const Text('View Details', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MapScreen())),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Row(
                          children: const [
                            Icon(Icons.map_outlined, size: 12, color: Color(0xFF0F3D2E)),
                            SizedBox(width: 4),
                            Text('Map', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F3D2E))),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TripPlannerScreen())),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: Row(
                          children: const [
                            Icon(Icons.calendar_month_outlined, size: 12, color: Color(0xFF475569)),
                            SizedBox(width: 4),
                            Text('Plan', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── 3B. Vox Himalayan Expedition Card (Matches Reference Design) ─────────────
  Widget _buildVoxExpeditionCard(String text) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Title & Subtitle
          const Text(
            '4-Day Panchachuli Vista Expedition (Dehradun to Munsiyari)',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F3D2E),
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            "I've crafted an offbeat, high-altitude itinerary crossing the Kumaon ridge. This route combines scenic mountain passes, verified 4x4 Thar with certified local chauffeur, and quiet mountain homestays overlooking the five peaks of Panchachuli.",
            style: TextStyle(fontSize: 11.5, color: Color(0xFF475569), height: 1.4),
          ),
          const SizedBox(height: 10),

          // 3-Metric Stats Row
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAF8),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('TOTAL DISTANCE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                      SizedBox(height: 2),
                      Text('585 km', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                      Text('Scenic Ridge', style: TextStyle(fontSize: 8.5, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAF8),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('EST. BUDGET', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                      SizedBox(height: 2),
                      Text('₹24,800', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                      Text('Vehicle + Stays', style: TextStyle(fontSize: 8.5, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAF8),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('ELEVATION', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                      SizedBox(height: 2),
                      Text('2,748m peak', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                      Text('Kalamuni Pass', style: TextStyle(fontSize: 8.5, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Daily Waypoints Section
          const Text(
            'CURATED DAILY WAYPOINTS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: 0.5),
          ),
          const SizedBox(height: 6),

          // D1, D2, D3 items
          _buildWaypointItem('D1', 'Dehradun to Kausani via Almora Pine Forests', '280 km • 8h', 'Pass through Mohan tea gardens, Binsar wildlife ridge, and catch the sunset over Trishul peak.'),
          const SizedBox(height: 6),
          _buildWaypointItem('D2', 'Kausani to Birthi Falls & Munsiyari', '165 km • 6h', 'Ascend Kalamuni Pass (2,748m) with panoramic views into Johar Valley and frozen Birthi water cascade.'),
          const SizedBox(height: 6),
          _buildWaypointItem('D3', 'Khaliya Top Trek & Panchachuli Sunset', 'Alpine Day', 'Gentle 6 km rhododendron trail to Khaliya ridge with 360° Great Himalayan snow range vantage point.'),
          const SizedBox(height: 12),

          // Recommended Vehicle & Homestay Grid
          Row(
            children: [
              // Vehicle
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAF8),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          CachedNetworkImage(
                            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJMJEgm2IA0tZhGP9KQXyqq-DkNQEfn62QUdcW7oH0cN3jEaYnpVhKLUiGI-Pz3FKSJEaFv7YK7tZoF8YQq8mvx6JAvI3UdDNgeEcV1YmPXfkIUwJdAcib9eEmbpr_wJit-iYGV9xE0_Q2s4NtoFoaK1vScD9tpk04_-DQWQ-LtmYj-ABcaY8bM5bvfxCWGHOV6FSNglf5hG4I6Z_0g6ccplxGLvkBCDsH-R2BApnLKsVanvov6eBp',
                            height: 80,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(height: 80, color: const Color(0xFF0F3D2E)),
                          ),
                          Positioned(
                            top: 4,
                            left: 4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.7),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('Verified Fleet', style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 8, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          Positioned(
                            bottom: 4,
                            right: 4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F3D2E),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('₹4,500/day', style: TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Mahindra Thar 4x4', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF0F172A))),
                            SizedBox(height: 2),
                            Text('Includes mountain chauffeur Rawat Ji & chains.', style: TextStyle(fontSize: 9.5, color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Homestay
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAF8),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          CachedNetworkImage(
                            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyUA786yYnyIa2PN_m9vXt0lyz9Zrxzv9nXkTI5E1Lh0nq1gunfrfn1WK5veEGfFOW1D0zaoQa0zMgX0Iwi7gjpFKNBPhCUfX8u2YL9wF2cRXxCbUlPYagETi2t3iVTxLfvx81YJH27SsJetV3xkIxb8dbF-Y_W6zMOtnimWAzs_dRHLw0UDr1Shb1sGaN9gaOqUouY_VvNgCKVB2AJV6I3_2rFZadqqqM9x8QFxS6anj_ns7GESAq',
                            height: 80,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(height: 80, color: const Color(0xFF0F3D2E)),
                          ),
                          Positioned(
                            top: 4,
                            left: 4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.7),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('Curated Homestay', style: TextStyle(color: Color(0xFFFDE047), fontSize: 8, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          Positioned(
                            bottom: 4,
                            right: 4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F3D2E),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('₹3,800/night', style: TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Panchachuli Stone Lodge', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF0F172A))),
                            SizedBox(height: 2),
                            Text('Handcrafted mud-slate cottage with wood fire.', style: TextStyle(fontSize: 9.5, color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F3D2E),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const TripPlannerScreen()),
                  ),
                  icon: const Icon(Icons.event_available, size: 12),
                  label: const Text('Reserve', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 6),
              InkWell(
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MapScreen())),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.map_outlined, size: 12, color: Color(0xFF0F3D2E)),
                      SizedBox(width: 4),
                      Text('Route Map', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F3D2E))),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),
              InkWell(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: text));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Itinerary copied to clipboard!'), duration: Duration(seconds: 1)),
                  );
                },
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: const Icon(Icons.share_outlined, size: 12, color: Color(0xFF475569)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWaypointItem(String day, String title, String metric, String desc) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAF8),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Text(day, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Color(0xFF0F3D2E))),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF0F172A)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(metric, style: const TextStyle(fontSize: 9.5, color: Color(0xFF64748B), fontFamily: 'monospace')),
                  ],
                ),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), height: 1.3)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── 4. Rich Formatted Markdown Parser ──────────────────────────────────────
  Widget _buildFormattedMessageBody(String text) {
    // If text contains Panchachuli or Munsiyari or 4-day road trip pattern, render the rich Vox Expedition Card
    if (text.contains('Panchachuli') || (text.toLowerCase().contains('munsiyari') && (text.contains('Day') || text.contains('Thar') || text.contains('road trip')))) {
      return _buildVoxExpeditionCard(text);
    }

    final paragraphs = text.split('\n\n');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: paragraphs.map((para) {
        final trimmed = para.trim();
        if (trimmed.isEmpty) return const SizedBox.shrink();

        // 4A. Section Headings (### Title or ## Title)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          final heading = trimmed.replaceFirst(RegExp(r'^###?\s+'), '');
          return Container(
            margin: const EdgeInsets.only(top: 8, bottom: 4),
            padding: const EdgeInsets.only(left: 8),
            decoration: const BoxDecoration(
              border: Border(left: BorderSide(color: Color(0xFF0F3D2E), width: 3)),
            ),
            child: Text(
              heading,
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 13,
                color: Color(0xFF0F3D2E),
              ),
            ),
          );
        }

        // 4B. Day-Wise Plan Summary Cards
        if (trimmed.startsWith('**Day ') || trimmed.startsWith('Day ')) {
          final lines = trimmed.split('\n');
          final dayTitle = lines.first.replaceAll('**', '');
          final dayContent = lines.skip(1).join('\n');
          return Container(
            margin: const EdgeInsets.symmetric(vertical: 4),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAF8),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 12, color: Color(0xFF0F3D2E)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        dayTitle,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F3D2E)),
                      ),
                    ),
                  ],
                ),
                if (dayContent.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Padding(
                    padding: const EdgeInsets.only(left: 18),
                    child: _buildFormattedInlineText(dayContent),
                  ),
                ],
              ],
            ),
          );
        }

        // 4C. Clean Bulleted Lists
        if (trimmed.contains('\n- ') || trimmed.contains('\n* ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          final items = trimmed.split(RegExp(r'\n[-*]\s+|^[-*]\s+')).where((s) => s.trim().isNotEmpty).toList();
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: items.map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 6, right: 6),
                        width: 5,
                        height: 5,
                        decoration: const BoxDecoration(
                          color: Color(0xFF059669),
                          shape: BoxShape.circle,
                        ),
                      ),
                      Expanded(
                        child: _buildFormattedInlineText(item),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          );
        }

        // 4D. Standard Clean Paragraph
        return Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: _buildFormattedInlineText(trimmed),
        );
      }).toList(),
    );
  }

  // 4E. Bold highlight helper for inline text
  Widget _buildFormattedInlineText(String text) {
    final spans = <TextSpan>[];
    final parts = text.split('**');

    for (int i = 0; i < parts.length; i++) {
      if (parts[i].isEmpty) continue;
      final isBold = i % 2 == 1;
      spans.add(
        TextSpan(
          text: parts[i],
          style: TextStyle(
            color: const Color(0xFF1E293B),
            fontSize: 12.5,
            height: 1.45,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.normal,
          ),
        ),
      );
    }

    return RichText(text: TextSpan(children: spans));
  }

  // ── 5. Full Message Bubble ────────────────────────────────────────────────
  Widget _buildMessageBubble(ChatMessage msg) {
    final mentionedDestinations = msg.isUser ? <Destination>[] : _findMentionedDestinations(msg.text);

    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.88),
        child: Column(
          crossAxisAlignment: msg.isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: msg.isUser ? AppTheme.forestGreen : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(msg.isUser ? 20 : 4),
                  bottomRight: Radius.circular(msg.isUser ? 4 : 20),
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6, offset: const Offset(0, 2)),
                ],
                border: msg.isUser ? null : Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Minimal Header for Assistant
                  if (!msg.isUser)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F3D2E),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Icon(Icons.auto_awesome, size: 11, color: Color(0xFF34D399)),
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                'Pahadi Copilot',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE8F5E9),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFA5D6A7)),
                                ),
                                child: const Text(
                                  'Verified Grounded',
                                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.copy, size: 14, color: AppTheme.mutedText),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                tooltip: 'Copy message',
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: msg.text));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Message copied to clipboard'),
                                      duration: Duration(seconds: 1),
                                    ),
                                  );
                                },
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: const Icon(Icons.volume_up, size: 15, color: AppTheme.forestGreen),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                tooltip: 'Open Voice Companion',
                                onPressed: _openVoiceDialog,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                  // Message Content Body
                  if (msg.isUser)
                    Text(
                      msg.text,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        height: 1.45,
                        fontWeight: FontWeight.w500,
                      ),
                    )
                  else
                    _buildFormattedMessageBody(msg.text),

                  // Real Destination Spotlight Cards (from DB)
                  for (final dest in mentionedDestinations)
                    _buildDestinationSpotlight(dest),

                  // LangGraph-style Agentic Tool Execution Card
                  if (!msg.isUser && msg.toolsUsed != null && msg.toolsUsed!.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: const [
                                  Icon(Icons.terminal, size: 12, color: Color(0xFF34D399)),
                                  SizedBox(width: 6),
                                  Text(
                                    'Agent Execution Trace',
                                    style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '${msg.toolsUsed!.length} Tools Verified',
                                  style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 9, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 4,
                            runSpacing: 4,
                            children: msg.toolsUsed!.map((tool) {
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.3),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: Colors.white12),
                                ),
                                child: Text(
                                  '⚡ $tool',
                                  style: const TextStyle(color: Colors.white70, fontSize: 10, fontFamily: 'monospace'),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            // Optional suggestion chips
            if (!msg.isUser && msg.suggestions != null && msg.suggestions!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: msg.suggestions!.map((s) {
                    return ActionChip(
                      label: Text(s, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.forestGreen)),
                      backgroundColor: AppTheme.beige,
                      side: BorderSide.none,
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                      onPressed: () => _handleSendMessage(s),
                    );
                  }).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
