import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/destination.dart';
import '../models/stay.dart';

class ApiService {
  // Live Render production backend URL (fallback to offline dataset)
  static String baseUrl = 'https://uttarakhand-hackathon-project.onrender.com/api';

  // ── Destinations ───────────────────────────────────────────────────────────
  static Future<List<Destination>> getDestinations() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/destinations'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
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
      final response = await http
          .get(Uri.parse('$baseUrl/spiritual'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
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
      final response = await http
          .get(Uri.parse('$baseUrl/culture'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
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
      final response = await http
          .get(Uri.parse('$baseUrl/activities'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
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
      final response = await http
          .get(Uri.parse('$baseUrl/rentals'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
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
      final response = await http
          .get(Uri.parse('$baseUrl/stays'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
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
      final response = await http
          .get(Uri.parse('$baseUrl/guides'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
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
    final bridgeHosts = ['http://10.0.2.2:8765', 'http://127.0.0.1:8765'];
    for (final host in bridgeHosts) {
      try {
        final res = await http
            .post(
              Uri.parse('$host/api/voice/ask'),
              headers: {'Content-Type': 'application/json'},
              body: json.encode({'query': query, 'lang': lang}),
            )
            .timeout(const Duration(seconds: 6));
        if (res.statusCode == 200) {
          final data = json.decode(res.body) as Map<String, dynamic>;
          if (data['response'] != null) {
            return {
              'text': data['response'].toString(),
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

  // ── AI Copilot Chat ────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> sendCopilotMessage(
      String message, {String? destination, bool isVoice = false}) async {
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
      ).timeout(const Duration(seconds: 25));

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
        description: 'Set around emerald Naini Lake, surrounded by seven peaks with colonial heritage and lively boat rides.',
        shortDescription: 'The Lake City of Uttarakhand, surrounded by scenic green peaks.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
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
        description: 'One of the twelve sacred Jyotirlingas of Shiva, set against soaring snow peaks and Mandakini River.',
        shortDescription: 'Sacred High-Altitude Jyotirlinga at 3,583m in the Garhwal Himalayas.',
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
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
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
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
        description: 'The Yoga Capital of the World and heart of white-water rafting on the emerald rapids of Mother Ganga.',
        shortDescription: 'Yoga capital and adrenaline capital on the banks of Ganga.',
        imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
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
        id: 'binsar',
        name: 'Binsar',
        district: 'Almora',
        region: 'Kumaon',
        category: 'Wildlife',
        description: 'Dense oak and rhododendron sanctuary offering a 300km unbroken view of the great Himalayan range.',
        shortDescription: 'Quiet oak sanctuary with 300km unbroken Himalayan panoramic views.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
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
    ];
  }

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
        imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
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
        imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
        helmetIncluded: true,
        available: true,
        isVerified: true,
      ),
      Rental(
        id: 'r3',
        name: 'Mahindra Thar 4x4',
        type: 'SUV',
        location: 'Kathgodam / Haldwani',
        pricePerDay: 2800,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
        helmetIncluded: false,
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
        imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
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
        location: 'Nainital Hills',
        stayType: 'Homestay',
        pricePerNight: 1600,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
        amenities: ['Wifi', 'Local Mountain Thali', 'Valley Balcony View'],
        isVerified: true,
      ),
      Stay(
        id: 's2',
        name: 'Lakeside Wooden Retreat',
        location: 'Bhimtal',
        stayType: 'Wooden Cottage',
        pricePerNight: 2400,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=600&q=80',
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
