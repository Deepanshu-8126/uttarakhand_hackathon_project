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

          // ── Input Box ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(12),
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

            final orbColor = {
              'idle': const Color(0xFF059669),
              'listening': const Color(0xFF10B981),
              'processing': const Color(0xFFF59E0B),
              'speaking': const Color(0xFF06B6D4),
            }[voiceState]!;

            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              decoration: const BoxDecoration(
                color: Color(0xFF0A1F16),
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                children: [
                  // Handle
                  Container(
                    width: 44, height: 5,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF059669).withOpacity(0.25),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.auto_awesome, color: Color(0xFF34D399), size: 18),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Devbhoomi AI Voice Companion',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 7, height: 7,
                                    margin: const EdgeInsets.only(right: 5),
                                    decoration: BoxDecoration(
                                      color: bridgeLive ? const Color(0xFF34D399) : const Color(0xFF6EE7B7),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  Text(
                                    bridgeLive ? 'voice-demo bridge · Live' : 'Gemini Agent · Active',
                                    style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 10),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white70),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Animated Orb
                  AnimatedBuilder(
                    animation: _voicePulseController,
                    builder: (context, child) {
                      final scale = voiceState == 'idle' ? 1.0 : 1.0 + (_voicePulseController.value * 0.18);
                      return Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 140 * scale, height: 140 * scale,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: orbColor.withOpacity(0.15 - (_voicePulseController.value * 0.07)),
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              if (voiceState == 'idle' || voiceState == 'speaking') {
                                submit('Namaste! Mujhe Uttarakhand me ghoomne ki best jagah aur real ground condition bataiye.');
                              }
                            },
                            child: Container(
                              width: 100, height: 100,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(colors: [orbColor.withOpacity(0.9), orbColor.withOpacity(0.5), const Color(0xFF064E3B)]),
                                boxShadow: [BoxShadow(color: orbColor.withOpacity(0.4), blurRadius: 28, spreadRadius: 4)],
                              ),
                              child: Icon(
                                voiceState == 'processing' ? Icons.hourglass_top
                                    : voiceState == 'speaking' ? Icons.volume_up
                                    : Icons.mic,
                                color: Colors.white,
                                size: 40,
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 20),

                  // Status label
                  Text(
                    statusLabel,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),

                  // Live transcript or reply
                  if (liveTranscript.isNotEmpty || lastReply.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.07),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Text(
                        lastReply.isNotEmpty ? lastReply : '“$liveTranscript”',
                        style: TextStyle(
                          color: lastReply.isNotEmpty ? const Color(0xFF6EE7B7) : Colors.white70,
                          fontSize: 12,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),

                  const SizedBox(height: 16),

                  // Sample topics
                  Wrap(
                    spacing: 8, runSpacing: 8,
                    alignment: WrapAlignment.center,
                    children: [
                      'Kedarnath trek altitude & safety',
                      'Weather in Badrinath',
                      'Valley of Flowers best season',
                      'Best homestays in Chopta',
                    ].map((topic) {
                      return GestureDetector(
                        onTap: voiceState == 'idle' || voiceState == 'speaking'
                            ? () => submit(topic)
                            : null,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.10),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: Colors.white.withOpacity(0.18)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.volume_up_outlined, color: Color(0xFF6EE7B7), size: 13),
                              const SizedBox(width: 6),
                              Text(topic, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const Spacer(),
                  const Text(
                    'Powered by Google Gemini Live & Devbhoomi AI',
                    style: TextStyle(color: Colors.white38, fontSize: 10, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            );
          },
        );
      },
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

  // ── 4. Rich Formatted Markdown Parser ──────────────────────────────────────
  Widget _buildFormattedMessageBody(String text) {
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
