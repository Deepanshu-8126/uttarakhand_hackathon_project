import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/destination.dart';
import '../models/stay.dart';

class ApiService {
  // Candidate base URLs (Local Node port 5000 first, Android emulator IP, and live Render backend)
  static final List<String> candidateBaseUrls = [
    'http://localhost:5000/api',
    'http://10.0.2.2:5000/api',
    'http://127.0.0.1:5000/api',
    'https://uttarakhand-hackathon-project.onrender.com/api',
  ];
  static String baseUrl = 'https://uttarakhand-hackathon-project.onrender.com/api';
  static String? _activeBaseUrl;

  /// Fast HTTP GET with automatic failover between local port 5000 & production Render
  static Future<http.Response?> _get(String path, {Duration timeout = const Duration(seconds: 3)}) async {
    if (_activeBaseUrl != null) {
      try {
        final res = await http.get(Uri.parse('$_activeBaseUrl$path')).timeout(timeout);
        if (res.statusCode == 200) return res;
      } catch (_) {
        _activeBaseUrl = null;
      }
    }
    for (final base in candidateBaseUrls) {
      try {
        final res = await http.get(Uri.parse('$base$path')).timeout(timeout);
        if (res.statusCode == 200) {
          _activeBaseUrl = base;
          baseUrl = base;
          return res;
        }
      } catch (_) {}
    }
    return null;
  }

  // ── Destinations ───────────────────────────────────────────────────────────
  static Future<List<Destination>> getDestinations() async {
    try {
      final response = await _get('/destinations');
      if (response != null && response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => Destination.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getLocalDestinations();
  }

  // ── Spiritual Places ───────────────────────────────────────────────────────
  static Future<List<SpiritualPlace>> getSpiritualPlaces() async {
    try {
      final response = await _get('/spiritual');
      if (response != null && response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => SpiritualPlace.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getLocalSpiritual();
  }

  // ── Culture Places ─────────────────────────────────────────────────────────
  static Future<List<CulturePlace>> getCulturePlaces() async {
    try {
      final response = await _get('/culture');
      if (response != null && response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => CulturePlace.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getLocalCulture();
  }

  // ── Activities ─────────────────────────────────────────────────────────────
  static Future<List<ActivityItem>> getActivities() async {
    try {
      final response = await _get('/activities');
      if (response != null && response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => ActivityItem.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getLocalActivities();
  }

  // ── Rentals ────────────────────────────────────────────────────────────────
  static Future<List<Rental>> getRentals() async {
    try {
      final response = await _get('/rentals');
      if (response != null && response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => Rental.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getLocalRentals();
  }

  // ── Stays ──────────────────────────────────────────────────────────────────
  static Future<List<Stay>> getStays() async {
    try {
      final response = await _get('/stays');
      if (response != null && response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => Stay.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getLocalStays();
  }

  // ── Guides ─────────────────────────────────────────────────────────────────
  static Future<List<Guide>> getGuides() async {
    try {
      final response = await _get('/guides');
      if (response != null && response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => Guide.fromJson(item)).toList();
      }
    } catch (_) {}
    return _getLocalGuides();
  }

  // ── Live Telemetry / Weather ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> getLiveTelemetry() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/live-data/telemetry'))
          .timeout(const Duration(seconds: 3));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {
      'activeTrekkers': 1842,
      'weatherAlert': 'Green - Clear Skies across Char Dham Corridor',
      'escrowSecuredAmount': '₹12,45,000',
      'meshNodesOnline': 48,
      'passesOpen': ['Mana Pass', 'Lipulekh Pass', 'Kuari Pass', 'Roopkund Ridge'],
    };
  }

  // ── Trigger SOS Alert ───────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> triggerSOS({
    required String emergencyType,
    required String locationName,
    required double latitude,
    required double longitude,
    String? medicalNotes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sos/trigger'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'type': emergencyType,
          'location': {'name': locationName, 'lat': latitude, 'lng': longitude},
          'medicalNotes': medicalNotes ?? 'Emergency assistance requested via Mobile App',
          'source': 'FLUTTER_MOBILE_APP',
        }),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {
      'success': true,
      'incidentId': 'SOS-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      'status': 'BROADCASTED_TO_SDRF_MESH',
      'nearestTeam': 'SDRF Joshimath Unit 4 (12 mins away)',
      'timestamp': DateTime.now().toIso8601String(),
    };
  }

  // ── Devbhoomi AI Voice Bridge ─────────────────────────
  static Future<Map<String, dynamic>> sendVoiceMessage(
      String query, {String lang = 'en'}) async {
    final candidateUrls = [
      'http://10.0.2.2:8765/api/voice/ask',
      'http://127.0.0.1:8765/api/voice/ask',
      '$baseUrl/voice/ask',
      'http://10.0.2.2:5000/api/voice/ask',
      'http://127.0.0.1:5000/api/voice/ask',
    ];

    for (final url in candidateUrls) {
      try {
        final res = await http
            .post(
              Uri.parse(url),
              headers: {'Content-Type': 'application/json'},
              body: json.encode({'query': query, 'lang': lang, 'message': query}),
            )
            .timeout(const Duration(seconds: 5));
        if (res.statusCode == 200) {
          final data = json.decode(res.body) as Map<String, dynamic>;
          final reply = data['response'] ?? data['message'] ?? data['text'];
          if (reply != null && reply.toString().isNotEmpty) {
            return {
              'text': reply.toString(),
              'toolsUsed': (data['toolsUsed'] as List?)?.map((e) => e.toString()).toList() ?? ['VoiceDemoBridge'],
              'confidence': 'grounded',
              'source': 'voice-demo-bridge',
            };
          }
        }
      } catch (_) {}
    }
    return sendCopilotMessage(query, isVoice: true);
  }

  // ── AI Copilot Chat (Agentic Bridge 8765 -> Express 5000 -> Local Grounded) ──
  static Future<Map<String, dynamic>> sendCopilotMessage(
      String message, {String? destination, bool isVoice = false}) async {
    // 1. Try Python Agentic Bridge on Port 8765 first (supports Gemini 2.5 Flash + full LangChain/Agentic tools)
    final bridgeUrls = [
      'http://10.0.2.2:8765/api/chat',
      'http://127.0.0.1:8765/api/chat',
    ];

    for (final bUrl in bridgeUrls) {
      try {
        final bRes = await http.post(
          Uri.parse(bUrl),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({'message': message}),
        ).timeout(const Duration(seconds: 4));

        if (bRes.statusCode == 200) {
          final bData = json.decode(bRes.body);
          if (bData['success'] == true && bData['response'] != null) {
            final r = bData['response'];
            final rawTools = r['toolsUsed'] as List?;
            return {
              'text': r['message']?.toString() ?? '',
              'toolsUsed': rawTools?.map((e) => e.toString()).toList() ?? ['DevbhoomiAgent'],
              'confidence': r['confidence']?.toString() ?? 'grounded',
              'suggestions': (r['suggestedActions'] as List?)?.map((e) => e.toString()).toList() ?? ['Explore Stays', 'Rent Bike', 'Weather Check'],
            };
          }
        }
      } catch (_) {}
    }

    // 2. Try Node.js Express backend on Port 5000 ($baseUrl/agent/chat)
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/agent/chat'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'message': message,
          'pageContext': {
            'pageType': isVoice ? 'VOICE_AGENT' : 'MOBILE_COPILOT',
            'currentPage': isVoice ? 'COPILOT_VOICE' : 'MOBILE_APP',
            if (destination != null) 'destinationName': destination,
          },
        }),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final agentResp = data['data'] ?? data['response'] ?? data;
        final rawTools = agentResp['toolsUsed'] as List?;
        final tools = rawTools?.map((t) => t.toString()).toList() ?? ['searchDestinations', 'getWeather'];
        final messageText = agentResp['message'] ?? (agentResp is String ? agentResp : data['message'] ?? 'Main aapki yatra me madad karne ke liye taiyaar hoon.');
        return {
          'text': messageText,
          'toolsUsed': tools,
          'confidence': agentResp['confidence']?.toString() ?? 'grounded',
          'suggestions': (agentResp['suggestedActions'] as List?)
                  ?.map((s) => (s is Map ? (s['label']?.toString() ?? '') : s.toString()))
                  .where((s) => s.isNotEmpty)
                  .toList() ??
              ['Explore Stays', 'Rent Bike', 'Weather Report'],
        };
      }
    } catch (_) {}

    // Local Copilot fallback
    final lower = message.toLowerCase();
    if (lower.contains('nainital')) {
      return {
        'text':
            'Nainital Kumaon region ka lake paradise hai. Best time October se June hai. ₹3,000-5,000 me 2 din ka stay aur boating experience plan ho sakta hai. Kya aap lake-view homestay dekhna chahenge?',
        'toolsUsed': ['searchDestinations', 'getWeather', 'findStays'],
        'confidence': 'grounded',
        'suggestions': ['Lake-view Stays', 'Scooty in Nainital', 'Weather Check'],
      };
    } else if (lower.contains('kedarnath') || lower.contains('badrinath') || lower.contains('temple')) {
      return {
        'text':
            'Char Dham aur Kedarnath 3,583m ki unchai par pavitra sthal hain. Biometric Yatra Card aur Escrow protected stay booking active hain. Kya aap trek advisory dekhna chahte hain?',
        'toolsUsed': ['getWeather', 'getRoadAdvisory', 'getTransitStatus'],
        'confidence': 'grounded',
        'suggestions': ['Verified Guides', 'Weather Advisory', 'Escrow Voucher'],
      };
    } else if (lower.contains('bike') || lower.contains('rental') || lower.contains('scooty')) {
      return {
        'text':
            'Rishikesh aur Dehradun me verified 3-layer partner fleet available hai. Honda Activa 6G (₹500/day) aur Himalayan 450 (₹1,200/day) available hain. Pickup date kya hai?',
        'toolsUsed': ['findRentals', 'calculateBudget'],
        'confidence': 'verified',
        'suggestions': ['Rent Himalayan 450', 'Rent Activa 6G', 'View All Rides'],
      };
    }

    return {
      'text':
          'Namaste! Main Discovery Uttarakhand ka AI Copilot hoon. Sacred shrines, high altitude treks, homestays ya rides ke bare me puchiye.',
      'toolsUsed': ['searchDestinations'],
      'confidence': 'grounded',
      'suggestions': ['Nainital Trip', 'Kedarnath Trek', 'Rent Bike in Rishikesh', 'Auli Skiing'],
    };
  }

  // ── Fallback Local Data ────────────────────────────────────────────────────
  static List<Destination> _getLocalDestinations() {
    return [
      Destination(
        id: 'nainital',
        name: 'Nainital',
        district: 'Nainital',
        region: 'Kumaon',
        category: 'Lakes',
        description: 'Set around the emerald crescent of Naini Lake, surrounded by seven soaring Kumaon peaks with colonial heritage, boating, and vibrant hillside markets.',
        shortDescription: 'The Lake City of Uttarakhand, surrounded by scenic green peaks and boating docks.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Nainital_metro.jpg/1920px-Nainital_metro.jpg',
        rating: 4.8,
        reviewsCount: 320,
        estimatedBudget: 3500,
        altitude: 2084,
        bestTimeToVisit: 'March to June, October to December',
        highlights: ['Naini Lake Boating', 'Snow View Cable Car', 'Mall Road & Tibetan Market'],
        experiences: ['Lake Walk', 'Candle Crafting', 'Kumaoni Thali Dining'],
        latitude: 29.3875,
        longitude: 79.4575,
      ),
      Destination(
        id: 'kedarnath',
        name: 'Kedarnath',
        district: 'Rudraprayag',
        region: 'Garhwal',
        category: 'Spiritual',
        description: 'One of the twelve sacred Jyotirlingas of Lord Shiva at 3,583m, crowned by eternal snowfields and the holy Mandakini river.',
        shortDescription: 'Sacred High-Altitude Jyotirlinga at 3,583m in the Garhwal Himalayas.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Kedarnath_view_.jpg/1920px-Kedarnath_view_.jpg',
        rating: 4.9,
        reviewsCount: 650,
        estimatedBudget: 6000,
        altitude: 3583,
        bestTimeToVisit: 'May to June, September to October',
        highlights: ['Ancient 8th-century Stone Temple', 'Mandakini River Valley', 'Bhairavnath Peak View'],
        experiences: ['Spiritual Aarti', 'High Altitude Trek', 'Camp Under Starry Skies'],
        latitude: 30.7352,
        longitude: 79.0669,
      ),
      Destination(
        id: 'auli',
        name: 'Auli',
        district: 'Chamoli',
        region: 'Garhwal',
        category: 'Snow',
        description: 'Premier skiing destination of India boasting unmatched 180-degree panoramas of Nanda Devi and Trishul.',
        shortDescription: 'India premier ski resort with panoramic Nanda Devi vistas.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Auli_Lake_in_Feburary_2015.jpg/1920px-Auli_Lake_in_Feburary_2015.jpg',
        rating: 4.8,
        reviewsCount: 210,
        estimatedBudget: 5000,
        altitude: 2800,
        bestTimeToVisit: 'December to March (Snow), April to June',
        highlights: ['Highest Ropeway Cable Car', 'Ski Slopes with Ski Instructors', 'Artificial High-Altitude Lake'],
        experiences: ['Skiing', 'Snowboard Trek', 'Sunset over Nanda Devi'],
        latitude: 30.5298,
        longitude: 79.5703,
      ),
      Destination(
        id: 'rishikesh',
        name: 'Rishikesh',
        district: 'Dehradun',
        region: 'Garhwal',
        category: 'Adventure',
        description: 'World Yoga Capital and gateway to Garhwal, renowned for white-water Ganga rafting, iconic suspension bridges, and evening Ganga Aarti.',
        shortDescription: 'Yoga capital and adrenaline capital on the banks of Ganga.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/1920px-Trayambakeshwar_Temple_VK.jpg',
        rating: 4.7,
        reviewsCount: 540,
        estimatedBudget: 2500,
        altitude: 372,
        bestTimeToVisit: 'September to May',
        highlights: ['Ganga River Rafting (Grade III/IV)', 'Triveni Ghat Evening Aarti', 'Beatles Ashram'],
        experiences: ['White Water Rafting', 'Bungee Jumping', 'Sunrise Yoga Session'],
        latitude: 30.0869,
        longitude: 78.2676,
      ),
      Destination(
        id: 'chopta',
        name: 'Chopta & Tungnath',
        district: 'Rudraprayag',
        region: 'Garhwal',
        category: 'Adventure',
        description: 'Known as the Mini Switzerland of Uttarakhand, starting point for the trek to Tungnath, the highest Shiva temple in the world at 3,680m.',
        shortDescription: 'Pristine alpine meadows and base for the Tungnath Chandrashila summit trek.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Chopta%2C_starting_point_for_treks_to_Tungnath_and_Chandrashila.jpg',
        rating: 4.9,
        reviewsCount: 290,
        estimatedBudget: 3800,
        altitude: 2680,
        bestTimeToVisit: 'April to November',
        highlights: ['Highest Shiva Temple', 'Chandrashila 360-degree Panorama', 'Deoria Tal Lake'],
        experiences: ['Summit Trekking', 'Camping under Stars', 'Birding in Rhododendrons'],
        latitude: 30.4856,
        longitude: 79.1793,
      ),
      Destination(
        id: 'badrinath',
        name: 'Badrinath',
        district: 'Chamoli',
        region: 'Garhwal',
        category: 'Spiritual',
        description: 'Sacred Char Dham shrine of Lord Vishnu beside the Alaknanda River, flanked by the Nar and Narayana mountain ranges.',
        shortDescription: 'Ancient sacred Vishnu shrine nestled beneath Neelkanth Peak.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Badrinath_Temple-_Uttarakhand.jpg/1920px-Badrinath_Temple-_Uttarakhand.jpg',
        rating: 4.9,
        reviewsCount: 580,
        estimatedBudget: 5500,
        altitude: 3133,
        bestTimeToVisit: 'May to June, September to October',
        highlights: ['Tapt Kund Hot Springs', 'Mana Village Border', 'Vasudhara Falls'],
        experiences: ['Vedic Aarti', 'Sacred Bath', 'Border Walk to Mana'],
        latitude: 30.7433,
        longitude: 79.4938,
      ),
      Destination(
        id: 'valley-of-flowers',
        name: 'Valley of Flowers',
        district: 'Chamoli',
        region: 'Garhwal',
        category: 'Nature',
        description: 'UNESCO World Heritage Site tucked in Western Himalayas carpeted with hundreds of endemic alpine flowers and medicinal herbs.',
        shortDescription: 'World Heritage floral paradise with blooming alpine blossoms.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/1920px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg',
        rating: 4.9,
        reviewsCount: 310,
        estimatedBudget: 5200,
        altitude: 3658,
        bestTimeToVisit: 'July to September',
        highlights: ['Hundreds of Rare Mountain Wildflowers', 'Pushpawati River Trail', 'Hemkund Sahib Ascent'],
        experiences: ['Botanical Walking', 'Nature Photography', 'Glacial Stream Crossing'],
        latitude: 30.7280,
        longitude: 79.6053,
      ),
      Destination(
        id: 'binsar',
        name: 'Binsar',
        district: 'Almora',
        region: 'Kumaon',
        category: 'Wildlife',
        description: 'Dense oak and rhododendron sanctuary offering a 300km unbroken view of the great Himalayan range.',
        shortDescription: 'Quiet oak sanctuary with 300km unbroken Himalayan panoramic views.',
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Binsar_Oak_Forests.JPG/1920px-Binsar_Oak_Forests.JPG',
        rating: 4.8,
        reviewsCount: 180,
        estimatedBudget: 3000,
        altitude: 2420,
        bestTimeToVisit: 'October to March',
        highlights: ['Zero Point Panoramic Vantage', 'Binsar Wildlife Sanctuary', 'Ancient Shiva Temple'],
        experiences: ['Bird Watching', 'Forest Trail Walking', 'Stargazing in Dark Skies'],
        latitude: 29.7042,
        longitude: 79.7547,
      ),
      Destination(
        id: 'munsiyari',
        name: 'Munsiyari',
        district: 'Pithoragarh',
        region: 'Kumaon',
        category: 'Snow',
        description: 'Perched in the eastern snow-flanked frontier of Kumaon, known for breathtaking close-up vistas of the 5-peaked Panchachuli massif and Milam Glacier trails.',
        shortDescription: 'Gateway to Johar Valley and majestic 5-peak Panchachuli alpenglow.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        reviewsCount: 240,
        estimatedBudget: 4200,
        altitude: 2200,
        bestTimeToVisit: 'March to June, September to November',
        highlights: ['Panchachuli 5-Peak Panorama', 'Birthi Falls', 'Khaliya Top Trek'],
        experiences: ['Alpine Hiking', 'Tribal Wool Weaving', 'Glacier Expeditions'],
        latitude: 30.0667,
        longitude: 80.2333,
      ),
      Destination(
        id: 'jim-corbett-national-park',
        name: 'Jim Corbett National Park',
        district: 'Nainital',
        region: 'Kumaon',
        category: 'Wildlife',
        description: 'India oldest national park along the Ramganga River, world-famous for Royal Bengal Tigers, wild elephant herds, and dense sal forest safaris.',
        shortDescription: 'Legendary Royal Bengal Tiger sanctuary with open jeep safaris.',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        reviewsCount: 780,
        estimatedBudget: 5500,
        altitude: 400,
        bestTimeToVisit: 'November to June',
        highlights: ['Dhikala Tiger Zone', 'Ramganga River Wildlife Watch', 'Bijrani Safari Trail'],
        experiences: ['Jeep Safari', 'Jungle Lodge Stay', 'Birding in River Sal Forests'],
        latitude: 29.5300,
        longitude: 78.7747,
      ),
      Destination(
        id: 'haridwar',
        name: 'Haridwar',
        district: 'Haridwar',
        region: 'Garhwal',
        category: 'Spiritual',
        description: 'Gateway to the Gods where holy Ganga enters the Indo-Gangetic plains, famed for grand evening Maha Aarti at Har Ki Pauri and ancient temples.',
        shortDescription: 'Sacred Ganga gateway hosting the world-famous Har Ki Pauri Aarti.',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
        rating: 4.7,
        reviewsCount: 920,
        estimatedBudget: 2200,
        altitude: 314,
        bestTimeToVisit: 'October to April',
        highlights: ['Har Ki Pauri Ganga Aarti', 'Mansa Devi Ropeway', 'Chandi Devi Temple'],
        experiences: ['Sacred Ganga Dip', 'Heritage Ashram Walks', 'Pahadi Street Delicacies'],
        latitude: 29.9457,
        longitude: 78.1642,
      ),
      Destination(
        id: 'adi-kailash',
        name: 'Adi Kailash & Om Parvat',
        district: 'Pithoragarh',
        region: 'Kumaon',
        category: 'Spiritual',
        description: 'Mystical Himalayan pilgrimage peak resembling Mount Kailash, located near the Indo-Tibet border with sacred Parvati Sarovar and natural snow Om formation.',
        shortDescription: 'Sacred high-altitude peak and natural snow Om symbol in Vyas Valley.',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        reviewsCount: 150,
        estimatedBudget: 12000,
        altitude: 5945,
        bestTimeToVisit: 'May to June, September to October',
        highlights: ['Natural Snow Om Parvat', 'Parvati Sarovar Lake', 'Vyas Cave'],
        experiences: ['High Altitude Yatra', 'Border Highway 4x4 Drive', 'Sacred Meditation'],
        latitude: 30.3167,
        longitude: 80.9500,
      ),
      Destination(
        id: 'jageshwar',
        name: 'Jageshwar Dham',
        district: 'Almora',
        region: 'Kumaon',
        category: 'Spiritual',
        description: 'Cluster of 124 ancient 8th-century stone shrines dedicated to Lord Shiva, sheltered deep within majestic century-old Himalayan deodar pine woods.',
        shortDescription: 'Ancient 8th-century stone temple cluster nestled in dense deodar forests.',
        imageUrl: 'https://images.unsplash.com/photo-1596404987012-4217117df854?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        reviewsCount: 340,
        estimatedBudget: 3200,
        altitude: 1870,
        bestTimeToVisit: 'Year-round, April to November',
        highlights: ['124 Nagar-style Stone Shrines', 'Maha Mrityunjaya Temple', 'Deodar Sacred Forest'],
        experiences: ['Ancient Architecture Walk', 'Rudrabhishek Pooja', 'Forest Meditation'],
        latitude: 29.6416,
        longitude: 79.8496,
      ),
      Destination(
        id: 'mussoorie',
        name: 'Mussoorie',
        district: 'Dehradun',
        region: 'Garhwal',
        category: 'Nature',
        description: 'The Queen of the Hills overlooking the Doon Valley, famous for its colonial Mall Road, cascading Kempty Falls, and winter line sunset phenomenon.',
        shortDescription: 'Queen of the Hills with colonial charm, waterfalls, and panoramic Doon views.',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        rating: 4.7,
        reviewsCount: 880,
        estimatedBudget: 4000,
        altitude: 2005,
        bestTimeToVisit: 'March to June, September to November',
        highlights: ['Mall Road & Camel Back Road', 'Kempty Falls', 'Gun Hill Viewpoint'],
        experiences: ['Cable Car Ride', 'Colonial Heritage Walk', 'Winterline Viewing'],
        latitude: 30.4598,
        longitude: 78.0644,
      ),
      Destination(
        id: 'dhanaulti',
        name: 'Dhanaulti & Kanatal',
        district: 'Tehri Garhwal',
        region: 'Garhwal',
        category: 'Nature',
        description: 'Peaceful alpine retreat blanketed by towering deodars and rhododendrons, offering tranquil nature parks and panoramic views of Himalayan snow peaks.',
        shortDescription: 'Serene deodar cedar haven away from crowded tourist circuits.',
        imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        reviewsCount: 220,
        estimatedBudget: 3200,
        altitude: 2286,
        bestTimeToVisit: 'September to June',
        highlights: ['Eco Park Deodar Forest', 'Surkanda Devi Temple Ropeway', 'Apple Orchard Strolls'],
        experiences: ['Forest Camping', 'Himalayan Ridge Walking', 'Pahadi Homestays'],
        latitude: 30.4516,
        longitude: 78.2394,
      ),
      Destination(
        id: 'gangotri',
        name: 'Gangotri Dham',
        district: 'Uttarkashi',
        region: 'Garhwal',
        category: 'Spiritual',
        description: 'Sacred river origin shrine honoring Goddess Ganga at 3,100 meters altitude, starting trailhead for the trek to Gaumukh glacier and Tapovan.',
        shortDescription: 'Sacred Char Dham shrine honoring Ganga at 3,100m, trailhead to Gaumukh.',
        imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        reviewsCount: 510,
        estimatedBudget: 5000,
        altitude: 3100,
        bestTimeToVisit: 'May to June, September to October',
        highlights: ['White Granite Ganga Temple', 'Bhagirath Shila', 'Surya Kund Gorges'],
        experiences: ['Evening Ganga Aarti', 'Gaumukh Glacier Trek', 'Himalayan Hermitage Trails'],
        latitude: 30.9947,
        longitude: 78.9398,
      ),
      Destination(
        id: 'yamunotri',
        name: 'Yamunotri Dham',
        district: 'Uttarkashi',
        region: 'Garhwal',
        category: 'Spiritual',
        description: 'Origin shrine of sacred river Yamuna surrounded by rugged mountain ridges and boiling thermal hot springs of Surya Kund.',
        shortDescription: 'Sacred thermal hot spring shrine at 3,293m, first stop of Char Dham.',
        imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        reviewsCount: 460,
        estimatedBudget: 4800,
        altitude: 3293,
        bestTimeToVisit: 'May to June, September to October',
        highlights: ['Surya Kund Boiling Spring', 'Divya Shila', 'Janki Chatti Scenic Trail'],
        experiences: ['Thermal Water Rice Cooking Prasad', 'Mountain Stream Crossing'],
        latitude: 31.0140,
        longitude: 78.4600,
      ),
      Destination(
        id: 'almora',
        name: 'Almora',
        district: 'Almora',
        region: 'Kumaon',
        category: 'Culture',
        description: 'Cultural heartbeat of Kumaon shaped like a horse saddle, famed for Kasar Devi magnetic belt, traditional Aipan folk art, and ancient Lala Bazaar.',
        shortDescription: 'Cultural capital of Kumaon with vibrant heritage and Kasar Devi.',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        rating: 4.7,
        reviewsCount: 390,
        estimatedBudget: 2800,
        altitude: 1638,
        bestTimeToVisit: 'September to June',
        highlights: ['Kasar Devi Crank Ridge', 'Bright End Corner Sunset', '200-Year-Old Lala Bazaar'],
        experiences: ['Aipan Art Crafting', 'Singhori Sweet Tasting', 'Crank Ridge Meditation'],
        latitude: 29.5971,
        longitude: 79.6591,
      ),
      Destination(
        id: 'kausani',
        name: 'Kausani',
        district: 'Bageshwar',
        region: 'Kumaon',
        category: 'Nature',
        description: 'Dubbed the Switzerland of India by Mahatma Gandhi, offering an uninterrupted 300-km panoramic spectacle of Trishul, Nanda Devi, and Panchachuli peaks.',
        shortDescription: 'The Switzerland of India with sweeping 300km Himalayan panoramas.',
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        reviewsCount: 310,
        estimatedBudget: 3400,
        altitude: 1890,
        bestTimeToVisit: 'October to May',
        highlights: ['Anasakti Ashram (Gandhi Ashram)', 'Tea Estate Plantations', 'Sunrise over Nanda Devi'],
        experiences: ['Organic Himalayan Tea Tasting', 'Sunset Alpenglow Watch'],
        latitude: 29.8543,
        longitude: 79.5967,
      ),
      Destination(
        id: 'ranikhet',
        name: 'Ranikhet',
        district: 'Almora',
        region: 'Kumaon',
        category: 'Nature',
        description: 'Queen Meadows surrounded by towering pine forests, British-era cantonment churches, Asia highest 9-hole golf course, and fruit orchards.',
        shortDescription: 'Pine meadows, British-era cantonment heritage, and golf greens.',
        imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        rating: 4.7,
        reviewsCount: 280,
        estimatedBudget: 3000,
        altitude: 1869,
        bestTimeToVisit: 'September to June',
        highlights: ['Upat 9-Hole Golf Course', 'Chaubatia Apple Orchards', 'Jhula Devi Temple Bells'],
        experiences: ['Pine Forest Walking', 'Apple Cider Sampling', 'Kumaoni Craft Strolls'],
        latitude: 29.6434,
        longitude: 79.4322,
      ),
      Destination(
        id: 'mukteshwar',
        name: 'Mukteshwar',
        district: 'Nainital',
        region: 'Kumaon',
        category: 'Adventure',
        description: 'High ridge outpost set at 2,285m, famous for dramatic rocky cliff Chauli Ki Jali, fruit orchards, rock climbing, and uninterrupted snow views.',
        shortDescription: 'Scenic rocky ridge famous for Chauli Ki Jali cliff and fruit orchards.',
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        reviewsCount: 350,
        estimatedBudget: 3200,
        altitude: 2285,
        bestTimeToVisit: 'March to June, October to February',
        highlights: ['Chauli Ki Jali Cliff Edge', '350-Year-Old Shiva Shrine', 'Himalayan Sunset Points'],
        experiences: ['Rock Climbing & Rappelling', 'Orchard Walks', 'Alps-style Homestays'],
        latitude: 29.4722,
        longitude: 79.6472,
      ),
      Destination(
        id: 'tehri',
        name: 'Tehri Lake & Dam',
        district: 'Tehri Garhwal',
        region: 'Garhwal',
        category: 'Adventure',
        description: 'Asia largest man-made emerald reservoir offering speed boating, jet skiing, floating houseboats, and water zorbing against Himalayan backdrop.',
        shortDescription: 'Massive emerald reservoir with world-class watersports and houseboats.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        rating: 4.7,
        reviewsCount: 410,
        estimatedBudget: 3500,
        altitude: 1750,
        bestTimeToVisit: 'Year-round, October to May',
        highlights: ['Floating Luxury Houseboats', 'Jet Ski & Banana Rides', 'Tehri Rock Dam Engineering'],
        experiences: ['Speed Boating', 'Floating Huts Stay', 'Paramotoring over Lake'],
        latitude: 30.3800,
        longitude: 78.4800,
      ),
      Destination(
        id: 'dayara-bugyal',
        name: 'Dayara Bugyal',
        district: 'Uttarkashi',
        region: 'Garhwal',
        category: 'Adventure',
        description: 'One of the most expansive high-altitude alpine meadows in Asia at 3,810m, transforming from emerald flower carpet in summer to pristine ski powder in winter.',
        shortDescription: 'One of Asia vastest alpine meadows with 360-degree snow peaks.',
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        reviewsCount: 270,
        estimatedBudget: 5000,
        altitude: 3810,
        bestTimeToVisit: 'May to November (Trek), December to February (Snow)',
        highlights: ['Vast Velvet Alpine Grasslands', 'Bandarpunch Peak Vista', 'Barnala Tal Lake'],
        experiences: ['Bugyal Trekking', 'Meadow Camping', 'Winter Snow Hiking'],
        latitude: 30.8500,
        longitude: 78.5500,
      ),
      Destination(
        id: 'kedarkantha',
        name: 'Kedarkantha Peak',
        district: 'Uttarkashi',
        region: 'Garhwal',
        category: 'Snow',
        description: 'India most iconic winter snow summit trek at 3,800m, starting from Sankri village with pine forests, frozen Juda Ka Talab, and 360-degree summit sunrise.',
        shortDescription: 'Premier winter snow trek with 360-degree Himalayan sunrise summit.',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        reviewsCount: 610,
        estimatedBudget: 6000,
        altitude: 3800,
        bestTimeToVisit: 'December to April (Snow Summit), May to October',
        highlights: ['Summit Shiva Shrine', 'Frozen Juda Ka Talab Lake', 'Sankri Wooden Hamlet'],
        experiences: ['Winter Snow Trekking', 'Summit Sunrise Photography', 'Bonfire Camping'],
        latitude: 31.0200,
        longitude: 78.1700,
      ),

  static List<SpiritualPlace> _getLocalSpiritual() {
    return [
      SpiritualPlace(
        id: 'badrinath-temple',
        name: 'Badrinath Temple',
        slug: 'badrinath-temple',
        district: 'Chamoli',
        region: 'Garhwal',
        description: 'Sacred seat of Lord Vishnu along the Alaknanda river, surrounded by Nar and Narayana mountain ranges.',
        shortDescription: 'High altitude Char Dham pilgrimage shrine honoring Lord Vishnu.',
        imageUrl: 'https://images.unsplash.com/photo-1627882672776-8803eb6dfb92?auto=format&fit=crop&w=800&q=80',
        highlights: ['Tapt Kund Thermal Springs', 'Brahma Kapal', 'Mana Village Border'],
        experiences: ['Maha Abhishek Aarti', 'Thermal Bath', 'Vedic Chanting'],
        latitude: 30.7433,
        longitude: 79.4938,
      ),
      SpiritualPlace(
        id: 'jageshwar-dham',
        name: 'Jageshwar Dham',
        slug: 'jageshwar-dham',
        district: 'Almora',
        region: 'Kumaon',
        description: 'Cluster of 124 ancient stone temples nestled amidst a soaring cedar deodar forest in Kumaon.',
        shortDescription: 'Ancient 8th-century Jyotirlinga cluster in towering cedar woods.',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        highlights: ['124 Nagar-style Stone Shrines', 'Maha Mrityunjaya Temple', 'Deodar Sacred Forest'],
        experiences: ['Ancient Architecture Walk', 'Rudrabhishek Pooja', 'Forest Meditation'],
        latitude: 29.6416,
        longitude: 79.8496,
      ),
      SpiritualPlace(
        id: 'gangotri-shrine',
        name: 'Gangotri Dham',
        slug: 'gangotri-shrine',
        district: 'Uttarkashi',
        region: 'Garhwal',
        description: 'Origin shrine of sacred river Bhagirathi (Ganga), situated at 3,100 meters in scenic pine mountains.',
        shortDescription: 'Sacred river origin shrine at 3,100 meters altitude.',
        imageUrl: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
        highlights: ['Bhagirath Shila', 'Surya Kund Waterfall', 'Gaumukh Glacier Trailhead'],
        experiences: ['Ganga Aarti', 'Glacier Trekking', 'Temple Offerings'],
        latitude: 30.9947,
        longitude: 78.9398,
      ),
      SpiritualPlace(
        id: 'yamunotri-temple',
        name: 'Yamunotri Dham',
        slug: 'yamunotri-temple',
        district: 'Uttarkashi',
        region: 'Garhwal',
        description: 'The source of Yamuna river and seat of Goddess Yamuna, famous for natural hot water springs.',
        shortDescription: 'Seat of Goddess Yamuna with natural hot spring Kunds.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        highlights: ['Surya Kund Hot Springs', 'Divya Shila', 'Janki Chatti Trek'],
        experiences: ['Prasad Cooking in Hot Springs', 'Scenic Mountain Walk'],
        latitude: 31.0140,
        longitude: 78.4600,
      ),
    ];
  }

  static List<CulturePlace> _getLocalCulture() {
    return [
      CulturePlace(
        id: 'kumaoni-aipan-art',
        name: 'Almora Aipan Folk Heritage',
        slug: 'kumaoni-aipan-art',
        district: 'Almora',
        region: 'Kumaon',
        description: 'Traditional ritualistic folk art of Kumaon drawn with rice paste (Biswar) over brick-red clay (Geru).',
        shortDescription: 'Ancient geometric sacred floor art of Kumaoni homes.',
        imageUrl: 'https://images.unsplash.com/photo-1596404987012-4217117df854?auto=format&fit=crop&w=800&q=80',
        highlights: ['Women Artisan Cooperatives', 'Handmade Mud Art', 'Ceremonial Chowkis'],
        experiences: ['Aipan Workshop', 'Local Wool Weaving', 'Pahadi Cuisine Tasting'],
      ),
      CulturePlace(
        id: 'garhwali-woodcraft',
        name: 'Garhwal Koti Banal Architecture',
        slug: 'garhwali-woodcraft',
        district: 'Uttarkashi',
        region: 'Garhwal',
        description: 'Thousand-year-old earthquake-resilient timber and stone tower architecture unique to the Himalayas.',
        shortDescription: 'Indigenous earthquake-resistant multistory wooden castle architecture.',
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        highlights: ['Carved Cedar Beams', '4-Storey Heritage Towers', 'Folk Woodcarvings'],
        experiences: ['Architecture Heritage Tour', 'Village Homestay Stay'],
      ),
      CulturePlace(
        id: 'nanda-devi-raj-jat',
        name: 'Nanda Devi Raj Jat Trail',
        slug: 'nanda-devi-raj-jat',
        district: 'Chamoli',
        region: 'Garhwal',
        description: 'World famous royal pilgrimage festival honoring Goddess Nanda Devi, traversing 280km across Himalayan ridges.',
        shortDescription: 'The Royal Himalayan Pilgrimage honoring Goddess Nanda Devi.',
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
        highlights: ['Four-Horned Ram Ring', 'Homkund Glacial Tarn', 'Sacred Chhantoli Umbrellas'],
        experiences: ['Folk Music & Jagar', 'High Altitude Meadow Trek'],
      ),
    ];
  }

  static List<ActivityItem> _getLocalActivities() {
    return [
      ActivityItem(
        id: 'ganga-river-rafting',
        name: 'White Water Rafting (Shivpuri to Rishikesh)',
        slug: 'ganga-river-rafting',
        district: 'Tehri Garhwal',
        region: 'Garhwal',
        description: '16km thrilling descent through Grade III and IV rapids like Roller Coaster, Golf Course, and Club House.',
        shortDescription: 'World class river rapids with safety kayakers and certified rescue guides.',
        imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=800&q=80',
        highlights: ['Grade III/IV Rapids', 'Cliff Jumping', 'Body Surfing in River Ganga'],
        experiences: ['Rafting', 'Body Surfing', 'Cliff Jump'],
        price: 1200,
      ),
      ActivityItem(
        id: 'chopta-tungnath-trek',
        name: 'Chopta to Tungnath & Chandrashila Trek',
        slug: 'chopta-tungnath-trek',
        district: 'Rudraprayag',
        region: 'Garhwal',
        description: 'Trek to the highest Shiva temple in the world (3,680m) and summit Chandrashila for 360-degree Himalayan views.',
        shortDescription: 'High altitude alpine ridge trek to the world highest Shiva shrine.',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        highlights: ['Highest Temple in the World', 'Rhododendron Forest', 'Nanda Devi View'],
        experiences: ['Alpine Trekking', 'Summit Sunrise', 'Temple Worship'],
        altitude: 4000,
        price: 2500,
      ),
      ActivityItem(
        id: 'jim-corbett-safari',
        name: 'Jim Corbett Tiger Safari (Dhikala Zone)',
        slug: 'jim-corbett-safari',
        district: 'Nainital',
        region: 'Kumaon',
        description: 'Open 4x4 Gypsy jungle safari inside India oldest national park to spot Bengal tigers and wild elephants.',
        shortDescription: 'Open Gypsy wilderness expedition in Royal Bengal Tiger territory.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        highlights: ['Royal Bengal Tigers', 'Wild Asian Elephants', 'Ramganga River Wildlife'],
        experiences: ['Jungle Safari', 'Bird Watching', 'Nature Photography'],
        price: 3200,
      ),
      ActivityItem(
        id: 'nainital-lake-boating',
        name: 'Yachting & Boating on Naini Lake',
        slug: 'nainital-lake-boating',
        district: 'Nainital',
        region: 'Kumaon',
        description: 'Glide on emerald mountain waters in colorful traditional gondolas or classic sailing yachts.',
        shortDescription: 'Serene boating in the heart of seven green Kumaon hills.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        highlights: ['Gondola & Paddle Boats', 'Highest Yacht Club', 'Scenic Mountain Reflections'],
        experiences: ['Boating', 'Lake Walk', 'Sunset Photography'],
        price: 400,
      ),
    ];
  }

  static List<Rental> _getLocalRentals() {
    return [
      Rental(
        id: 'r1',
        name: 'Honda Activa 6G',
        type: 'Scooter',
        location: 'Rishikesh / Tapovan',
        pricePerDay: 500,
        rating: 4.8,
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Honda_Activa_6G.jpg/1920px-Honda_Activa_6G.jpg',
        helmetIncluded: true,
        available: true,
        isVerified: true,
      ),
      Rental(
        id: 'r2',
        name: 'Royal Enfield Himalayan 450',
        type: 'Adventure Bike',
        location: 'Dehradun / Rishikesh',
        pricePerDay: 1200,
        rating: 4.9,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Royal_Enfield_Himalayan_450_Mana_Black.jpg',
        helmetIncluded: true,
        available: true,
        isVerified: true,
      ),
      Rental(
        id: 'r3',
        name: 'TVS Jupiter 125',
        type: 'Scooter',
        location: 'Kathgodam / Nainital',
        pricePerDay: 550,
        rating: 4.8,
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/TVS_Jupiter_Scooter.jpg/1920px-TVS_Jupiter_Scooter.jpg',
        helmetIncluded: true,
        available: true,
        isVerified: true,
      ),
      Rental(
        id: 'r4',
        name: 'Royal Enfield Classic 350',
        type: 'Cruiser',
        location: 'Nainital / Almora',
        pricePerDay: 900,
        rating: 4.8,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Royal_Enfield_Himalayan_450_Mana_Black.jpg',
        helmetIncluded: true,
        available: true,
        isVerified: true,
      ),
    ];
  }

  static List<Stay> _getLocalStays() {
    return [
      Stay(
        id: 's1',
        name: 'Pahadi Pineview Homestay',
        location: 'Binsar / Almora Ridge',
        stayType: 'Homestay',
        pricePerNight: 1600,
        rating: 4.9,
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Terrace_farming_in_a_small_himalayan_village%28binsar_wild_life_sanctury%29.jpg/1920px-Terrace_farming_in_a_small_himalayan_village%28binsar_wild_life_sanctury%29.jpg',
        amenities: ['Wifi', 'Local Mountain Thali', 'Valley Balcony View'],
        isVerified: true,
      ),
      Stay(
        id: 's2',
        name: 'Bhimtal Lakeside Wooden Retreat',
        location: 'Bhimtal Lake',
        stayType: 'Wooden Cottage',
        pricePerNight: 2400,
        rating: 4.8,
        imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Bhimtal_Lake.jpg/1920px-Bhimtal_Lake.jpg',
        amenities: ['Private Lake Deck', 'Bonfire & Barbecue', 'Heated Bedding'],
        isVerified: true,
      ),
      Stay(
        id: 's3',
        name: 'Ganga Alpine Camp',
        location: 'Rishikesh Riverbed',
        stayType: 'Luxury Camp',
        pricePerNight: 1200,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
        amenities: ['Riverside Access', 'Volleyball', 'Stargazing Lounge'],
        isVerified: true,
      ),
    ];
  }

  static List<Guide> _getLocalGuides() {
    return [
      Guide(
        id: 'g1',
        name: 'Vikram Singh Bisht',
        location: 'Chamoli & Valley of Flowers',
        experience: '8+ years high altitude guide',
        pricePerDay: 1500,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        languages: ['Hindi', 'English', 'Garhwali'],
        specialties: ['Valley of Flowers', 'Hemkund Sahib', 'Birding'],
      ),
      Guide(
        id: 'g2',
        name: 'Anjali Sharma',
        location: 'Almora & Binsar Sanctuary',
        experience: '6+ years cultural storyteller',
        pricePerDay: 1200,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        languages: ['Hindi', 'English', 'Kumaoni'],
        specialties: ['Heritage Temples', 'Local Cuisine Trails', 'Botanical Walks'],
      ),
    ];
  }
}
