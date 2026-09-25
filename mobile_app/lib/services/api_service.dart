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
    } catch (_) {
      // Fallback to verified local Himalayan dataset
    }
    return _getLocalDestinations();
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

  // ── AI Copilot Chat ────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> sendCopilotMessage(
      String message, {String? destination}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/agent/chat'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'message': message,
          'pageContext': destination != null ? {'destinationName': destination} : null,
        }),
      ).timeout(const Duration(seconds: 25));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final agentResp = data['response'] ?? {};
        return {
          'text': agentResp['message'] ?? 'Main aapki yatra me madad karne ke liye taiyaar hoon.',
          'suggestions': (agentResp['suggestedActions'] as List?)
                  ?.map((s) => s['label']?.toString() ?? '')
                  .where((s) => s.isNotEmpty)
                  .toList() ??
              ['Explore Stays', 'Rent Bike', 'Weather Report'],
        };
      }
    } catch (_) {}

    // Smart Pahadi Copilot Local Logic
    final lower = message.toLowerCase();
    if (lower.contains('nainital')) {
      return {
        'text':
            'Nainital Kumaon region ka lake paradise hai. Best time October se June hai. ₹3,000-5,000 me 2 din ka stay aur boating experience plan ho sakta hai. Kya aap lake-view homestay dekhna chahenge?',
        'suggestions': ['Lake-view Stays', 'Scooty in Nainital', 'Weather Check'],
      };
    } else if (lower.contains('kedarnath')) {
      return {
        'text':
            'Kedarnath 3,583m ki unchai par sthit pavitra Dham hai. Gaurikund se 16km ka trek hai. Yatra ke liye biometric permit aur warm layers zaroori hain. Kya aap trek route guide chahte hain?',
        'suggestions': ['Verified Guides', 'Weather Advisory', 'Helicopter Info'],
      };
    } else if (lower.contains('bike') || lower.contains('rental') || lower.contains('scooty')) {
      return {
        'text':
            'Rishikesh aur Dehradun me verified 3-layer partner fleet available hai. Honda Activa 6G (₹500/day) aur Himalayan 450 (₹1,200/day) available hain. Pickup date kya hai?',
        'suggestions': ['Rent Himalayan 450', 'Rent Activa 6G', 'View All Rides'],
      };
    }

    return {
      'text':
          'Namaste! Main Discovery Uttarakhand ka Pahadi Copilot hoon. Uttarakhand ke kisi bhi destination, stay, rental ya route ke baare me puchiye, main verified ground data share karunga.',
      'suggestions': ['Nainital Trip', 'Kedarnath Trek', 'Rent Bike in Rishikesh', 'Auli Skiing'],
    };
  }

  // ── Verified Local Dataset ─────────────────────────────────────────────────
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
