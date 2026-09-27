import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/chat_message.dart';
import '../models/destination.dart';
import '../services/api_service.dart';
import '../services/voice_player_service.dart';
import 'destination_detail_screen.dart';
import 'trip_planner_screen.dart';
import 'map_screen.dart';
import 'sos_safety_screen.dart';

class AiCopilotScreen extends StatefulWidget {
  const AiCopilotScreen({super.key});

  @override
  State<AiCopilotScreen> createState() => _AiCopilotScreenState();
}

const Map<String, List<String>> _kDestinationAliasMap = {
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

class _AiCopilotScreenState extends State<AiCopilotScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isTyping = false;
  late AnimationController _voicePulseController;
  List<Destination> _allDestinations = [];

  final List<String> _quickSuggestions = [
    'Kedarkantha snow trek (₹5,000 budget)',
    'Haldwani 1-day hidden spots (Sattal)',
    'Kedarnath altitude safety & AMS',
    'Rent bike & homestays in Rishikesh',
  ];

  @override
  void initState() {
    super.initState();
    VoicePlayerService.init();
    VoicePlayerService.addListener(_onVoicePlayerChanged);
    _voicePulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _loadDestinations();

    // Welcome message from Pahadi Copilot
    _messages.add(
      ChatMessage(
        text: 'Namaste! Main Discovery Uttarakhand ka Pahadi Copilot hoon.\n\nKisi bhi destination, snow trek, backpacker budget, road condition, dharamshala/stays ya verified bike rentals ke baare me puchiye, main real ground roadmap share karunga.',
        isUser: false,
        timestamp: DateTime.now(),
        suggestions: _quickSuggestions,
        toolsUsed: ['searchDestinations', 'getWeather', 'calculateBudget'],
        confidence: 'grounded',
      ),
    );
  }

  void _onVoicePlayerChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _loadDestinations() async {
    final d = await ApiService.getDestinations();
    if (mounted) {
      setState(() {
        _allDestinations = d;
      });
    }
  }

  @override
  void dispose() {
    VoicePlayerService.removeListener(_onVoicePlayerChanged);
    VoicePlayerService.stopAudio();
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

    // Context history for AI agent (last 4 conversation turns, trimmed to 500 chars)
    final existingMessages = _messages
        .where((m) => m.text.trim().isNotEmpty)
        .toList();
    final recentTurns = existingMessages.length > 4
        ? existingMessages.sublist(existingMessages.length - 4)
        : existingMessages;
    final List<Map<String, String>> historyPayload = recentTurns.map((m) {
      final trimmedText = m.text.length > 500 ? m.text.substring(0, 500) : m.text;
      return {
        'role': m.isUser ? 'user' : 'assistant',
        'content': trimmedText,
      };
    }).toList();

    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true, timestamp: DateTime.now()));
      _isTyping = true;
    });
    _scrollToBottom();

    try {
      final result = isVoice
          ? await ApiService.sendVoiceMessage(text, lang: 'en')
          : await ApiService.sendCopilotMessage(text, history: historyPayload, isVoice: isVoice);

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

        // Check for uiActions (Favorites Vault & Action Confirmation)
        if (result['uiActions'] != null && (result['uiActions'] as List).isNotEmpty) {
          final firstAction = (result['uiActions'] as List).first;
          final itemTitle = firstAction['item']?['title'] ?? 'Item';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.bookmark_added, color: Colors.greenAccent, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Saved to Favorites Vault: $itemTitle',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
              backgroundColor: const Color(0xFF0F3D2E),
              duration: const Duration(seconds: 3),
            ),
          );
        }
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
    String voiceState = 'idle'; // idle | listening | processing | speaking
    String liveTranscript = '';
    String lastReply = '';
    String lastAudioBase64 = '';
    String selectedLang = 'हिन्दी';
    final TextEditingController voiceInputController = TextEditingController();

    StateSetter? modalSetState;

    void modalVoiceListener() {
      if (mounted && modalSetState != null) {
        modalSetState!(() {
          if (!VoicePlayerService.isPlaying && voiceState == 'speaking') {
            voiceState = 'idle';
          }
        });
      }
    }

    VoicePlayerService.addListener(modalVoiceListener);
    _voicePulseController.repeat(reverse: true);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            modalSetState = setModalState;

            // Submit voice query
            Future<void> submit(String query) async {
              final q = query.trim();
              if (q.isEmpty) return;
              voiceInputController.clear();
              if (ctx.mounted) {
                setModalState(() {
                  voiceState = 'processing';
                  liveTranscript = q;
                  lastReply = '';
                  lastAudioBase64 = '';
                });
              }

              try {
                final langCode = selectedLang == 'English' ? 'en' : 'hi';
                final result = await ApiService.sendVoiceMessage(q, lang: langCode);
                final reply = (result['text'] as String?)?.trim() ?? 'Main aapki baat sun raha hoon.';
                final audioBase64 = (result['audio_base64'] as String?) ?? '';

                if (ctx.mounted) {
                  setModalState(() {
                    voiceState = audioBase64.isNotEmpty ? 'speaking' : 'idle';
                    lastReply = reply;
                    lastAudioBase64 = audioBase64;
                  });
                }

                // Play authentic Gemini Live Aoede Studio audio
                if (audioBase64.isNotEmpty) {
                  await VoicePlayerService.playBase64Audio(audioBase64);
                }

                // After receiving reply, add to main chat history
                if (mounted) {
                  setState(() {
                    _messages.add(ChatMessage(text: q, isUser: true, timestamp: DateTime.now()));
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
              } catch (e) {
                if (ctx.mounted) {
                  setModalState(() {
                    voiceState = 'idle';
                    lastReply = 'Network issue. Kripya dobara poochiye.';
                  });
                }
              }
            }

            final statusLabel = {
              'idle': 'Tap any question below or ask anything',
              'listening': 'Listening to your speech...',
              'processing': 'Gemini Live is thinking & generating Aoede voice...',
              'speaking': 'Gemini Aoede speaking (24kHz Studio Audio)',
            }[voiceState]!;

            return Container(
              height: MediaQuery.of(context).size.height * 0.90,
              decoration: const BoxDecoration(
                color: Color(0xFFFDFBF7),
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                children: [
                  // Top Drag Handle & Header
                  Container(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 14),
                    decoration: const BoxDecoration(
                      color: Color(0xFF0F3D2E),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                    ),
                    child: Column(
                      children: [
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.4)),
                                  ),
                                  alignment: Alignment.center,
                                  child: const Icon(Icons.graphic_eq, color: Color(0xFF00FF88), size: 20),
                                ),
                                const SizedBox(width: 10),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Text(
                                          'Gemini Live Aoede',
                                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15),
                                        ),
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF00FF88).withValues(alpha: 0.2),
                                            borderRadius: BorderRadius.circular(999),
                                            border: Border.all(color: const Color(0xFF00FF88)),
                                          ),
                                          child: const Text(
                                            '24kHz Studio',
                                            style: TextStyle(color: Color(0xFF00FF88), fontSize: 9, fontWeight: FontWeight.w900),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Text(
                                      'Authentic Google AI Voice Companion',
                                      style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 10.5, fontWeight: FontWeight.w500),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, color: Colors.white70, size: 22),
                              onPressed: () {
                                VoicePlayerService.stopAudio();
                                Navigator.pop(ctx);
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Main Content Scrollable
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                      child: Column(
                        children: [
                          // Glowing Center Mic & Wave Orb
                          AnimatedBuilder(
                            animation: _voicePulseController,
                            builder: (context, child) {
                              final isSpeaking = voiceState == 'speaking';
                              final isProcessing = voiceState == 'processing';
                              return Column(
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      if (isSpeaking) {
                                        VoicePlayerService.stopAudio();
                                        setModalState(() => voiceState = 'idle');
                                      } else {
                                        final userQuery = voiceInputController.text.trim();
                                        if (userQuery.isNotEmpty) {
                                          submit(userQuery);
                                        } else {
                                          submit('Nainital 2 din ka plan aur budget bataiye');
                                        }
                                      }
                                    },
                                    child: Container(
                                      width: 96,
                                      height: 96,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: RadialGradient(
                                          colors: [
                                            const Color(0xFF0F3D2E),
                                            (isSpeaking || isProcessing)
                                                ? const Color(0xFF059669)
                                                : const Color(0xFF144C3A),
                                          ],
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: (isSpeaking || isProcessing)
                                                ? const Color(0xFF00FF88).withValues(alpha: 0.35 + (_voicePulseController.value * 0.2))
                                                : const Color(0xFF0F3D2E).withValues(alpha: 0.2),
                                            blurRadius: 28,
                                            spreadRadius: 6 + (_voicePulseController.value * 4),
                                          ),
                                        ],
                                      ),
                                      alignment: Alignment.center,
                                      child: Icon(
                                        isSpeaking ? Icons.volume_up : (isProcessing ? Icons.hourglass_top : Icons.mic),
                                        color: isSpeaking ? const Color(0xFF00FF88) : Colors.white,
                                        size: 38,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 12),

                                  // Status Badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: isSpeaking ? const Color(0xFFECFDF5) : const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(999),
                                      border: Border.all(
                                        color: isSpeaking ? const Color(0xFF34D399) : const Color(0xFFCBD5E1),
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.circle,
                                          color: isSpeaking ? const Color(0xFF10B981) : const Color(0xFF64748B),
                                          size: 8,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          statusLabel,
                                          style: TextStyle(
                                            color: isSpeaking ? const Color(0xFF065F46) : const Color(0xFF334155),
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  const SizedBox(height: 10),

                                  // Animated Audio Equalizer Wave
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(11, (i) {
                                      final heights = [10.0, 16.0, 12.0, 22.0, 14.0, 26.0, 18.0, 24.0, 13.0, 19.0, 11.0];
                                      final isBouncing = isSpeaking || isProcessing;
                                      final h = isBouncing ? (heights[i] + (_voicePulseController.value * 8)) : 6.0;
                                      return Container(
                                        margin: const EdgeInsets.symmetric(horizontal: 2),
                                        width: 3.5,
                                        height: h,
                                        decoration: BoxDecoration(
                                          color: isSpeaking ? const Color(0xFF059669) : const Color(0xFF94A3B8),
                                          borderRadius: BorderRadius.circular(999),
                                        ),
                                      );
                                    }),
                                  ),
                                ],
                              );
                            },
                          ),

                          const SizedBox(height: 16),

                          // Live Question Transcript Card
                          if (liveTranscript.isNotEmpty)
                            Container(
                              width: double.infinity,
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                                boxShadow: [
                                  BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2)),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: const [
                                      Icon(Icons.record_voice_over, color: Color(0xFF0F3D2E), size: 14),
                                      SizedBox(width: 6),
                                      Text(
                                        'YOUR VOICE QUERY',
                                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 0.5),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    '“$liveTranscript”',
                                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF0F172A), fontStyle: FontStyle.italic),
                                  ),
                                ],
                              ),
                            ),

                          // AI Aoede Response Card
                          if (lastReply.isNotEmpty)
                            Container(
                              width: double.infinity,
                              margin: const EdgeInsets.only(bottom: 14),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0FDF4),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: const Color(0xFF86EFAC)),
                                boxShadow: [
                                  BoxShadow(color: const Color(0xFF10B981).withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, 3)),
                                ],
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
                                            padding: const EdgeInsets.all(4),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF0F3D2E),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: const Icon(Icons.auto_awesome, color: Color(0xFF00FF88), size: 12),
                                          ),
                                          const SizedBox(width: 8),
                                          const Text(
                                            'Devbhoomi Companion (Aoede)',
                                            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Color(0xFF0F3D2E)),
                                          ),
                                        ],
                                      ),
                                      if (lastAudioBase64.isNotEmpty)
                                        IconButton(
                                          icon: Icon(
                                            VoicePlayerService.isPlaying ? Icons.stop_circle : Icons.replay_circle_filled,
                                            color: const Color(0xFF059669),
                                            size: 24,
                                          ),
                                          tooltip: VoicePlayerService.isPlaying ? 'Stop' : 'Replay Voice',
                                          padding: EdgeInsets.zero,
                                          constraints: const BoxConstraints(),
                                          onPressed: () async {
                                            if (VoicePlayerService.isPlaying) {
                                              await VoicePlayerService.stopAudio();
                                              setModalState(() => voiceState = 'idle');
                                            } else {
                                              await VoicePlayerService.playBase64Audio(lastAudioBase64);
                                              setModalState(() => voiceState = 'speaking');
                                            }
                                          },
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    lastReply,
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF1E293B), height: 1.45, fontWeight: FontWeight.w500),
                                  ),
                                ],
                              ),
                            ),

                          // Quick Mountain Topics
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(bottom: 8),
                                child: Text(
                                  'POPULAR VOICE INQUIRIES',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 0.5),
                                ),
                              ),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  _buildVoiceTopicChip('🏔️ Kedarnath Weather & Route', 'Kedarnath Dham live weather aur trek status kya hai?', submit),
                                  _buildVoiceTopicChip('❄️ Chopta Tungnath Snow Trek', 'Chopta Tungnath Chandrashila trek snow status aur best homestays', submit),
                                  _buildVoiceTopicChip('🚣 Rishikesh Rafting & Camps', 'Rishikesh river rafting aur riverside camping prices aur booking', submit),
                                  _buildVoiceTopicChip('🌸 Valley of Flowers Season', 'Valley of Flowers trek ka best time aur entry permit details', submit),
                                  _buildVoiceTopicChip('⛷️ Auli Skiing & Cable Car', 'Auli cable car tickets aur skiing snow conditions abhi kaisa hai?', submit),
                                  _buildVoiceTopicChip('🛟 Mountain Altitude AMS Tips', 'High altitude mountain safety aur oxygen acclimatization tips', submit),
                                ],
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),

                          // Language Selector
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('VOICE DIALECT', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF64748B))),
                              SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Row(
                                  children: ['हिन्दी', 'English', 'गढ़वाली', 'कुमाऊँनी'].map((l) {
                                    final active = selectedLang == l;
                                    return GestureDetector(
                                      onTap: () => setModalState(() => selectedLang = l),
                                      child: Container(
                                        margin: const EdgeInsets.only(left: 6),
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: active ? const Color(0xFF0F3D2E) : Colors.white,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: active ? const Color(0xFF0F3D2E) : const Color(0xFFE2E8F0)),
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

                  // Bottom Custom Voice Question Input
                  Container(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: const Border(top: BorderSide(color: Color(0xFFF1F5F9))),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, -2)),
                      ],
                    ),
                    child: SafeArea(
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: TextField(
                                controller: voiceInputController,
                                textInputAction: TextInputAction.send,
                                onSubmitted: (val) => submit(val),
                                decoration: const InputDecoration(
                                  hintText: 'Type any voice question to speak...',
                                  hintStyle: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                  border: InputBorder.none,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          CircleAvatar(
                            backgroundColor: const Color(0xFF0F3D2E),
                            child: IconButton(
                              icon: const Icon(Icons.send, color: Colors.white, size: 18),
                              onPressed: () => submit(voiceInputController.text),
                            ),
                          ),
                          if (voiceState == 'speaking') ...[
                            const SizedBox(width: 8),
                            CircleAvatar(
                              backgroundColor: const Color(0xFFFEE2E2),
                              child: IconButton(
                                icon: const Icon(Icons.stop, color: Color(0xFFDC2626), size: 18),
                                tooltip: 'Stop Aoede Voice',
                                onPressed: () {
                                  VoicePlayerService.stopAudio();
                                  setModalState(() => voiceState = 'idle');
                                },
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    ).whenComplete(() {
      _voicePulseController.stop();
      _voicePulseController.reset();
      VoicePlayerService.removeListener(modalVoiceListener);
      voiceInputController.dispose();
    });
  }

  Widget _buildVoiceTopicChip(String label, String query, Function(String) onSelect) {
    return InkWell(
      onTap: () => onSelect(query),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 1)),
          ],
        ),
        child: Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0F3D2E)),
        ),
      ),
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

    for (final dest in _allDestinations) {
      final destKey = dest.id.toLowerCase();
      final nameLower = dest.name.toLowerCase();

      bool isMatch = false;
      for (final entry in _kDestinationAliasMap.entries) {
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
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.terrain, color: Colors.white54, size: 28),
                        const SizedBox(height: 4),
                        Text(
                          dest.name.isNotEmpty
                              ? dest.name.split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join()
                              : 'UK',
                          style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1),
                        ),
                      ],
                    ),
                  ),
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
                                icon: Icon(
                                  VoicePlayerService.isPlaying ? Icons.stop_circle : Icons.volume_up,
                                  size: 16,
                                  color: AppTheme.forestGreen,
                                ),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                tooltip: VoicePlayerService.isPlaying ? 'Stop voice' : 'Listen via Gemini Aoede Voice',
                                onPressed: () async {
                                  if (VoicePlayerService.isPlaying) {
                                    await VoicePlayerService.stopAudio();
                                    return;
                                  }
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Row(
                                        children: [
                                          Icon(Icons.graphic_eq, color: Color(0xFF00FF88), size: 18),
                                          SizedBox(width: 8),
                                          Text('Connecting to Gemini Aoede Studio Voice...'),
                                        ],
                                      ),
                                      backgroundColor: Color(0xFF0F3D2E),
                                      duration: Duration(seconds: 2),
                                    ),
                                  );
                                  final audio = await ApiService.synthesizeVoice(msg.text);
                                  if (audio != null && audio.isNotEmpty) {
                                    await VoicePlayerService.playBase64Audio(audio);
                                  } else {
                                    _openVoiceDialog();
                                  }
                                },
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
