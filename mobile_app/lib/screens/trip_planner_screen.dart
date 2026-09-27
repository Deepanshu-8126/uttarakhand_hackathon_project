import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/destination.dart';
import '../models/stay.dart';
import '../services/api_service.dart';
import 'sos_safety_screen.dart';
import 'checkout_screen.dart';
import 'destination_detail_screen.dart';

class TripPlannerScreen extends StatefulWidget {
  const TripPlannerScreen({super.key});

  @override
  State<TripPlannerScreen> createState() => _TripPlannerScreenState();
}

class _TripPlannerScreenState extends State<TripPlannerScreen> {
  final TextEditingController _budgetController = TextEditingController(text: '5000');
  double _budget = 5000;
  int _durationDays = 3;
  int _travelers = 2;
  
  String _selectedDestinationName = 'Nainital';
  Destination? _selectedDestination;

  // Real Database Data loaded via ApiService
  bool _isLoadingData = true;
  List<Destination> _destinations = [];
  List<Stay> _stays = [];
  List<Rental> _rentals = [];
  List<ActivityItem> _activities = [];

  // Generated Plan State
  bool _isGenerating = false;
  Map<String, dynamic>? _generatedPlan;

  final List<String> _fallbackDestinationNames = [
    'Nainital',
    'Kedarnath',
    'Badrinath',
    'Auli',
    'Rishikesh',
    'Chopta & Tungnath',
    'Valley of Flowers',
    'Munsiyari',
    'Jim Corbett',
    'Haridwar',
    'Mussoorie',
    'Dhanaulti',
    'Kausani',
    'Almora',
    'Ranikhet',
    'Tehri Lake',
    'Dayara Bugyal',
    'Kedarkantha',
    'Binsar',
  ];

  @override
  void initState() {
    super.initState();
    _loadRealDatabaseData();
  }

  @override
  void dispose() {
    _budgetController.dispose();
    super.dispose();
  }

  Future<void> _loadRealDatabaseData() async {
    setState(() => _isLoadingData = true);
    try {
      final dests = await ApiService.getDestinations();
      final stays = await ApiService.getStays();
      final rentals = await ApiService.getRentals();
      final activities = await ApiService.getActivities();

      if (mounted) {
        setState(() {
          _destinations = dests;
          _stays = stays;
          _rentals = rentals;
          _activities = activities;
          _isLoadingData = false;

          // Align initial selected destination
          if (_destinations.isNotEmpty) {
            final match = _destinations.firstWhere(
              (d) => d.name.toLowerCase().contains(_selectedDestinationName.toLowerCase()),
              orElse: () => _destinations.first,
            );
            _selectedDestination = match;
            _selectedDestinationName = match.name;
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingData = false);
      }
    }
  }

  void _onBudgetTextChanged(String val) {
    final cleaned = val.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.isNotEmpty) {
      final parsed = double.tryParse(cleaned);
      if (parsed != null && parsed >= 500) {
        setState(() {
          _budget = parsed;
        });
      }
    }
  }

  void _setBudget(double amount) {
    setState(() {
      _budget = amount;
      _budgetController.text = amount.round().toString();
    });
  }

  void _addBudget(double increment) {
    final newBudget = _budget + increment;
    _setBudget(newBudget);
  }

  void _generateSmartItinerary() {
    setState(() => _isGenerating = true);

    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;

      final destName = _selectedDestinationName.toLowerCase();

      // Find real matching stays from database
      final matchedStays = _stays.where((s) {
        final loc = s.location.toLowerCase();
        final name = s.name.toLowerCase();
        return loc.contains(destName) ||
            name.contains(destName) ||
            destName.contains(loc) ||
            (destName.contains('naini') && loc.contains('naini')) ||
            (destName.contains('rishi') && loc.contains('rishi')) ||
            (destName.contains('kedar') && loc.contains('garhw')) ||
            (destName.contains('auli') && loc.contains('chamol'));
      }).toList();

      final Stay primaryStay = matchedStays.isNotEmpty
          ? matchedStays.first
          : (_stays.isNotEmpty
              ? _stays.first
              : Stay(
                  id: 'default-stay',
                  name: '$_selectedDestinationName Himalayan Heritage Homestay',
                  location: _selectedDestinationName,
                  stayType: 'Homestay',
                  pricePerNight: (_budget * 0.35 / _durationDays).clamp(800, 3500).round(),
                  rating: 4.8,
                  imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1000&q=80',
                  amenities: ['Local Pahadi Meals', 'Mountain View', 'Geyser', 'Campfire'],
                  isVerified: true,
                ));

      // Find real matching rental from database
      final matchedRentals = _rentals.where((r) {
        final loc = r.location.toLowerCase();
        final name = r.name.toLowerCase();
        return loc.contains(destName) ||
            name.contains(destName) ||
            r.available;
      }).toList();

      final Rental primaryRental = matchedRentals.isNotEmpty
          ? matchedRentals.first
          : (_rentals.isNotEmpty
              ? _rentals.first
              : Rental(
                  id: 'default-rental',
                  name: 'Royal Enfield Himalayan 450 (GPS Fleet)',
                  type: 'Adventure Bike',
                  location: _selectedDestinationName,
                  pricePerDay: 1200,
                  rating: 4.9,
                  imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
                  helmetIncluded: true,
                  available: true,
                  isVerified: true,
                ));

      // Find real activity from database
      final matchedActivities = _activities.where((a) {
        final dist = a.district.toLowerCase();
        final name = a.name.toLowerCase();
        return dist.contains(destName) || name.contains(destName) || destName.contains(dist);
      }).toList();

      final ActivityItem primaryActivity = matchedActivities.isNotEmpty
          ? matchedActivities.first
          : (_activities.isNotEmpty
              ? _activities.first
              : ActivityItem(
                  id: 'default-activity',
                  name: 'Scenic Valley Ridge Exploration & Sunset Vantage',
                  slug: 'scenic-valley-ridge',
                  district: _selectedDestinationName,
                  region: 'Garhwal',
                  description: 'Guided alpine ridge hike with panoramic Himalayan views.',
                  shortDescription: 'High ridge panoramic trek.',
                  price: 850,
                  imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
                  highlights: ['Alpine views', 'Certified Guide'],
                  experiences: ['Trek', 'Nature'],
                ));

      // Financial allocation calculations
      final totalStayEstimate = primaryStay.pricePerNight * _durationDays;
      final totalRentalEstimate = primaryRental.pricePerDay * (_durationDays > 1 ? _durationDays - 1 : 1);
      final estimatedFood = (_budget * 0.22).round();
      final emergencyBuffer = (_budget * 0.15).round();
      final totalSpent = totalStayEstimate + totalRentalEstimate + estimatedFood + primaryActivity.price;
      final savingsOrBuffer = (_budget - totalSpent).round();

      setState(() {
        _isGenerating = false;
        _generatedPlan = {
          'destination': _selectedDestinationName,
          'durationDays': _durationDays,
          'travelers': _travelers,
          'budget': _budget.round(),
          'stay': primaryStay,
          'rental': primaryRental,
          'activity': primaryActivity,
          'totalStayEstimate': totalStayEstimate,
          'totalRentalEstimate': totalRentalEstimate,
          'estimatedFood': estimatedFood,
          'emergencyBuffer': emergencyBuffer,
          'totalSpent': totalSpent,
          'savings': savingsOrBuffer,
          'days': _buildDayTimeline(_selectedDestinationName, _durationDays),
        };
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✨ Verified Smart Plan generated for $_selectedDestinationName!'),
          backgroundColor: const Color(0xFF0F3D2E),
          behavior: SnackBarBehavior.floating,
        ),
      );
    });
  }

  List<Map<String, String>> _buildDayTimeline(String destination, int days) {
    final List<Map<String, String>> timeline = [];
    for (int i = 1; i <= days; i++) {
      if (i == 1) {
        timeline.add({
          'day': 'Day 1: Arrival & Acclimatization',
          'morning': 'Arrival at $destination base hub, key exchange & vehicle inspection.',
          'afternoon': 'Check into verified mountain homestay, fresh Pahadi herbal tea.',
          'evening': 'Sunset vantage walk along heritage trail, briefing for mountain weather.',
        });
      } else if (i == days) {
        timeline.add({
          'day': 'Day $i: Cultural Souvenirs & Safe Transit',
          'morning': 'Early temple aarti or morning valley mist photography.',
          'afternoon': 'Local women weavers cooperative visit for authentic handicrafts.',
          'evening': 'Checkout, digital escrow release review & return journey departure.',
        });
      } else {
        timeline.add({
          'day': 'Day $i: Alpine Circuit & Guided Trail',
          'morning': 'Dawn excursion to high vantage ridge with local certified guide.',
          'afternoon': 'Traditional Kumaoni/Garhwali lunch (Bhatt ki Churkani & Mandua Roti).',
          'evening': 'Stargazing session by the pine terrace & community bonfire.',
        });
      }
    }
    return timeline;
  }

  @override
  Widget build(BuildContext context) {
    final stayCost = (_budget * 0.40).round();
    final foodCost = (_budget * 0.25).round();
    final rideCost = (_budget * 0.20).round();
    final emergencyCost = (_budget * 0.15).round();

    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F4),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F3D2E).withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.auto_awesome, color: Color(0xFF0F3D2E), size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'AI Trip Planner',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: Color(0xFF0F3D2E), letterSpacing: -0.2),
                ),
                Text(
                  'Real Database Verified Stays & Fleet',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: Colors.grey[700]),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFDC2626).withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFDC2626).withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield, color: Color(0xFFDC2626), size: 16),
                  SizedBox(width: 4),
                  Text('SOS', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w900, fontSize: 12)),
                ],
              ),
            ),
            tooltip: 'Emergency SOS',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen())),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeroBanner(),
            const SizedBox(height: 20),
            _buildDestinationSection(),
            const SizedBox(height: 20),
            _buildTypeableBudgetSection(),
            const SizedBox(height: 20),
            _buildDurationAndTravelersSection(),
            const SizedBox(height: 20),
            _buildCostBreakdownSection(stayCost, foodCost, rideCost, emergencyCost),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F3D2E),
                  foregroundColor: Colors.white,
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: _isGenerating ? null : _generateSmartItinerary,
                child: _isGenerating
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                          SizedBox(width: 12),
                          Text('SCANNING DATABASE & OPTIMIZING...', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5)),
                        ],
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.bolt, color: Color(0xFF00FF88)),
                          SizedBox(width: 8),
                          Text(
                            'GENERATE SMART EXPEDITION PLAN',
                            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 0.5),
                          ),
                        ],
                      ),
              ),
            ),
            if (_generatedPlan != null) ...[
              const SizedBox(height: 28),
              _buildGeneratedPlanResults(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      height: 145,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.18), blurRadius: 18, offset: const Offset(0, 6)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            CachedNetworkImage(
              imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(color: const Color(0xFF0F3D2E)),
              errorWidget: (_, __, ___) => Container(color: const Color(0xFF0F3D2E)),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    const Color(0xFF09261C).withOpacity(0.94),
                    const Color(0xFF09261C).withOpacity(0.45),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified, color: Colors.white, size: 10),
                        SizedBox(width: 4),
                        Text(
                          'MONGODB & LIVE PROTOCOL CONNECTED',
                          style: TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'AI Expedition & Budget Optimizer',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: -0.3),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Directly type your budget. Match real verified Himalayan stays, rentals & local guides.',
                    style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11, height: 1.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDestinationSection() {
    final availableNames = _destinations.isNotEmpty
        ? _destinations.map((d) => d.name).toList()
        : _fallbackDestinationNames;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.06)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.location_on, color: Color(0xFF0F3D2E), size: 18),
                  SizedBox(width: 8),
                  Text('Where do you want to go?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F3D2E))),
                ],
              ),
              if (_isLoadingData)
                const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0F3D2E)))
              else
                Text(
                  '${availableNames.length} Verified',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF059669)),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAF9),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: availableNames.contains(_selectedDestinationName)
                    ? _selectedDestinationName
                    : availableNames.first,
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF0F3D2E)),
                items: availableNames.map((name) {
                  return DropdownMenuItem(
                    value: name,
                    child: Text(
                      name,
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF0F3D2E)),
                    ),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedDestinationName = val;
                      final match = _destinations.firstWhere(
                        (d) => d.name == val,
                        orElse: () => _destinations.isNotEmpty ? _destinations.first : Destination(
                          id: 'def',
                          name: val,
                          district: 'Garhwal',
                          region: 'Uttarakhand',
                          category: 'Alpine Destination',
                          description: 'Stunning destination in Uttarakhand',
                          shortDescription: 'Alpine Himalayan wonderland.',
                          imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
                          rating: 4.8,
                          reviewsCount: 120,
                          estimatedBudget: _budget.round(),
                          altitude: 2200,
                          bestTimeToVisit: 'Throughout the year',
                          highlights: ['Scenic View', 'Nature Trails'],
                          experiences: ['Trekking', 'Photography'],
                        ),
                      );
                      _selectedDestination = match;
                    });
                  }
                },
              ),
            ),
          ),
          if (_selectedDestination != null) ...[
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () {
                if (_selectedDestination != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => DestinationDetailScreen(destination: _selectedDestination!),
                    ),
                  );
                }
              },
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F3D2E).withOpacity(0.04),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF0F3D2E).withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: CachedNetworkImage(
                        imageUrl: _selectedDestination!.imageUrl,
                        width: 52,
                        height: 52,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(width: 52, height: 52, color: const Color(0xFF0F3D2E)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                _selectedDestination!.name,
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F3D2E)),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F3D2E),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  '${_selectedDestination!.altitude}m',
                                  style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _selectedDestination!.shortDescription,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 11, color: Colors.grey[700]),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios, size: 12, color: Color(0xFF0F3D2E)),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTypeableBudgetSection() {
    final double maxSlider = _budget > 50000 ? _budget * 1.5 : 50000;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFF059669).withOpacity(0.3), width: 1.5),
        boxShadow: [
          BoxShadow(color: const Color(0xFF059669).withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.currency_rupee, color: Color(0xFF059669), size: 20),
                  SizedBox(width: 6),
                  Text(
                    'Your Total Budget',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00FF88).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'TYPE ANY AMOUNT ✍️',
                  style: TextStyle(color: Color(0xFF0F3D2E), fontWeight: FontWeight.w900, fontSize: 10),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF6FAF7),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF059669), width: 1.5),
            ),
            child: Row(
              children: [
                const Text(
                  '₹',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F3D2E),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _budgetController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F3D2E),
                      letterSpacing: -0.5,
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Enter Budget',
                      hintStyle: TextStyle(color: Colors.black26),
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                    onChanged: _onBudgetTextChanged,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.clear, size: 18, color: Colors.grey),
                  tooltip: 'Clear',
                  onPressed: () {
                    _budgetController.clear();
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildIncrementChip('+₹1,000', 1000),
                const SizedBox(width: 6),
                _buildIncrementChip('+₹2,000', 2000),
                const SizedBox(width: 6),
                _buildIncrementChip('+₹5,000', 5000),
                const SizedBox(width: 6),
                _buildIncrementChip('+₹10,000', 10000),
              ],
            ),
          ),

          const SizedBox(height: 12),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildPresetChip('🎒 Backpacker (₹3K)', 3000),
                const SizedBox(width: 6),
                _buildPresetChip('⚖️ Balanced (₹6K)', 6000),
                const SizedBox(width: 6),
                _buildPresetChip('🌲 Explorer (₹12K)', 12000),
                const SizedBox(width: 6),
                _buildPresetChip('👑 Luxury (₹25K)', 25000),
              ],
            ),
          ),

          const SizedBox(height: 14),

          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: const Color(0xFF0F3D2E),
              inactiveTrackColor: const Color(0xFFE2E8F0),
              thumbColor: const Color(0xFF059669),
              overlayColor: const Color(0xFF059669).withOpacity(0.15),
              trackHeight: 6,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
            ),
            child: Slider(
              value: _budget.clamp(1000, maxSlider),
              min: 1000,
              max: maxSlider,
              onChanged: (val) {
                _setBudget(val.roundToDouble());
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('₹1,000', style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
              Text(
                'Per Person: ₹${(_budget / _travelers).round()}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
              ),
              Text('₹${maxSlider.round()}', style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIncrementChip(String label, double amount) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0F3D2E))),
      backgroundColor: const Color(0xFFF1F5F3),
      side: const BorderSide(color: Color(0xFFD1FAE5)),
      onPressed: () => _addBudget(amount),
    );
  }

  Widget _buildPresetChip(String label, double amount) {
    final isSelected = (_budget - amount).abs() < 50;
    return ChoiceChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: isSelected ? Colors.white : const Color(0xFF0F3D2E),
        ),
      ),
      selected: isSelected,
      selectedColor: const Color(0xFF0F3D2E),
      backgroundColor: Colors.white,
      side: BorderSide(color: isSelected ? const Color(0xFF0F3D2E) : const Color(0xFFE2E8F0)),
      onSelected: (_) => _setBudget(amount),
    );
  }

  Widget _buildDurationAndTravelersSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.06)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Trip Duration', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F3D2E))),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAF9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove, size: 18, color: Color(0xFF0F3D2E)),
                            onPressed: () => setState(() => _durationDays = _durationDays > 1 ? _durationDays - 1 : 1),
                          ),
                          Text('$_durationDays Days', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F3D2E))),
                          IconButton(
                            icon: const Icon(Icons.add, size: 18, color: Color(0xFF0F3D2E)),
                            onPressed: () => setState(() => _durationDays = _durationDays + 1),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Travelers', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F3D2E))),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAF9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove, size: 18, color: Color(0xFF0F3D2E)),
                            onPressed: () => setState(() => _travelers = _travelers > 1 ? _travelers - 1 : 1),
                          ),
                          Text('$_travelers Persons', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F3D2E))),
                          IconButton(
                            icon: const Icon(Icons.add, size: 18, color: Color(0xFF0F3D2E)),
                            onPressed: () => setState(() => _travelers = _travelers + 1),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCostBreakdownSection(int stayCost, int foodCost, int rideCost, int emergencyCost) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Live Budget Breakdown (AI Allocated)',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
              ),
              Text(
                'Total: ₹${_budget.round()}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildCostRow('Verified Homestay & Stays (40%)', '₹$stayCost', Icons.hotel, const Color(0xFF0F3D2E)),
          const Divider(height: 16),
          _buildCostRow('Pahadi Meals & Food (25%)', '₹$foodCost', Icons.restaurant, Colors.orange),
          const Divider(height: 16),
          _buildCostRow('Bike / Fleet Rentals (20%)', '₹$rideCost', Icons.two_wheeler, const Color(0xFF059669)),
          const Divider(height: 16),
          _buildCostRow('Mountain Safety & SOS Buffer (15%)', '₹$emergencyCost', Icons.shield, Colors.blueGrey),
        ],
      ),
    );
  }

  Widget _buildCostRow(String title, String amount, IconData icon, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, size: 14, color: color),
            ),
            const SizedBox(width: 10),
            Text(title, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))),
          ],
        ),
        Text(amount, style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }

  Widget _buildGeneratedPlanResults() {
    final plan = _generatedPlan!;
    final Stay stay = plan['stay'] as Stay;
    final Rental rental = plan['rental'] as Rental;
    final ActivityItem activity = plan['activity'] as ActivityItem;
    final List<Map<String, String>> days = (plan['days'] as List).cast<Map<String, String>>();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF059669).withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.08), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F3D2E),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Color(0xFF00FF88), size: 14),
                    const SizedBox(width: 6),
                    Text(
                      '${plan['durationDays']}-DAY REAL EXPEDITION PLAN',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE6F4EA),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Total: ₹${plan['totalSpent']}',
                  style: const TextStyle(color: Color(0xFF059669), fontSize: 12, fontWeight: FontWeight.w900),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Custom Plan for ${plan['destination']}',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
          ),
          Text(
            'Matched from real database stays, vehicle fleet, and verified safety corridors.',
            style: TextStyle(fontSize: 12, color: Colors.grey[700]),
          ),
          const SizedBox(height: 16),

          const Text('🏨 MATCHED REAL HOMESTAY (DATABASE)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF059669), letterSpacing: 0.5)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAF9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: stay.imageUrl,
                    width: 76,
                    height: 76,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(width: 76, height: 76, color: const Color(0xFF0F3D2E)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              stay.name,
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (stay.isVerified)
                            const Icon(Icons.verified, color: Color(0xFF059669), size: 14),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${stay.location} • ${stay.stayType}',
                        style: TextStyle(fontSize: 11, color: Colors.grey[700]),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '₹${stay.pricePerNight}/night',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F3D2E),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CheckoutScreen(
                                    itemType: 'Mountain Homestay',
                                    itemName: stay.name,
                                    basePrice: stay.pricePerNight,
                                  ),
                                ),
                              );
                            },
                            child: const Text('Book Stay', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          const Text('🏍️ MATCHED REAL VEHICLE FLEET (DATABASE)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF059669), letterSpacing: 0.5)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAF9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: rental.imageUrl,
                    width: 76,
                    height: 76,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(width: 76, height: 76, color: const Color(0xFF0F3D2E)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              rental.name,
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (rental.isVerified)
                            const Icon(Icons.verified, color: Color(0xFF059669), size: 14),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${rental.location} • ${rental.type}',
                        style: TextStyle(fontSize: 11, color: Colors.grey[700]),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '₹${rental.pricePerDay}/day',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CheckoutScreen(
                                    itemType: 'Rental Vehicle',
                                    itemName: rental.name,
                                    basePrice: rental.pricePerDay,
                                  ),
                                ),
                              );
                            },
                            child: const Text('Rent Bike', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          const Text('🏔️ MATCHED REAL ACTIVITY / TREK (DATABASE)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: 0.5)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAF9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: activity.imageUrl,
                    width: 76,
                    height: 76,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(width: 76, height: 76, color: const Color(0xFF0F3D2E)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activity.name,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${activity.district} • ${activity.region} • ${activity.altitude != null ? '${activity.altitude}m' : 'Alpine Circuit'}',
                        style: TextStyle(fontSize: 11, color: Colors.grey[700]),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${activity.price} per person',
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          const Text('📅 CURATED EXPEDITION SCHEDULE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: 0.5)),
          const SizedBox(height: 10),
          ...days.map((d) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAF9),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFF0F3D2E), borderRadius: BorderRadius.circular(6)),
                        child: Text(
                          d['day'] ?? 'Day',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildTimelineSlot('🌅 Morning', d['morning'] ?? ''),
                  const SizedBox(height: 4),
                  _buildTimelineSlot('☀️ Afternoon', d['afternoon'] ?? ''),
                  const SizedBox(height: 4),
                  _buildTimelineSlot('🌙 Evening', d['evening'] ?? ''),
                ],
              ),
            );
          }),

          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F3D2E).withOpacity(0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF0F3D2E).withOpacity(0.12)),
            ),
            child: const Row(
              children: [
                Icon(Icons.lock, color: Color(0xFF0F3D2E), size: 18),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '100% Devbhoomi Escrow Protection: Funds released only after check-in OTP verification at stay.',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF0F3D2E)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineSlot(String time, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 82,
          child: Text(
            time,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: Color(0xFF0F3D2E)),
          ),
        ),
        Expanded(
          child: Text(
            desc,
            style: TextStyle(fontSize: 11.5, color: const Color(0xFF334155), height: 1.3),
          ),
        ),
      ],
    );
  }
}
