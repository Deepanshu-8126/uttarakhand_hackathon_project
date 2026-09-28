import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../models/stay.dart';
import '../models/destination.dart';
import 'checkout_screen.dart';
import 'trip_planner_screen.dart';

class MyTripScreen extends StatefulWidget {
  final Map<String, dynamic>? tripPlan;
  final Map<String, dynamic>? savedTrip;
  final String? tripId;

  const MyTripScreen({
    super.key,
    this.tripPlan,
    this.savedTrip,
    this.tripId,
  });

  @override
  State<MyTripScreen> createState() => _MyTripScreenState();
}

class _MyTripScreenState extends State<MyTripScreen> {
  bool _isLoading = false;
  bool _isSaving = false;
  Map<String, dynamic>? _activePlan;
  List<Map<String, dynamic>> _userSavedTrips = [];

  @override
  void initState() {
    super.initState();
    if (widget.tripPlan != null) {
      _activePlan = widget.tripPlan;
    } else if (widget.savedTrip != null) {
      _activePlan = widget.savedTrip!['generatedItinerary'] as Map<String, dynamic>? ?? widget.savedTrip;
    } else {
      _loadSavedTrips();
    }
  }

  Future<void> _loadSavedTrips() async {
    setState(() => _isLoading = true);
    try {
      final trips = await ApiService.getMyTrips();
      if (mounted) {
        setState(() {
          _userSavedTrips = trips;
          if (_activePlan == null && trips.isNotEmpty) {
            final first = trips.first;
            _activePlan = {
              'destination': first['destination'] ?? 'Kedarnath',
              'durationDays': int.tryParse(first['duration']?.toString().split(' ')[0] ?? '3') ?? 3,
              'travelers': int.tryParse(first['travelers']?.toString() ?? '2') ?? 2,
              'budget': int.tryParse(first['budget']?.toString().replaceAll(RegExp(r'[^0-9]'), '') ?? '15000') ?? 15000,
              'days': first['generatedItinerary']?['days'] ?? _buildFallbackTimeline(first['destination'] ?? 'Uttarakhand', 3),
            };
          }
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveCurrentPlan() async {
    if (_activePlan == null) return;
    setState(() => _isSaving = true);
    final dest = _activePlan!['destination'] ?? 'Uttarakhand';
    final days = _activePlan!['durationDays'] ?? 3;
    final trav = _activePlan!['travelers'] ?? 2;
    final bud = _activePlan!['budget'] ?? 15000;

    final tripData = {
      'title': '$dest $days-Day Mountain Expedition',
      'destination': dest,
      'duration': '$days Days',
      'numDays': days,
      'travelers': '$trav',
      'budget': '₹$bud',
      'transport': 'Mountain Ride',
      'status': 'Planning',
      'generatedItinerary': _activePlan,
    };

    final res = await ApiService.saveTrip(tripData);
    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res != null ? '✅ Expedition saved to your account!' : '✅ Trip saved to workspace!'),
          backgroundColor: const Color(0xFF0F3D2E),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  List<Map<String, String>> _buildFallbackTimeline(String dest, int days) {
    return [
      {
        'day': 'Day 1: Base Hub Arrival & Terrain Briefing',
        'morning': 'Arrival at $dest gateway hub, safety check & gear inspection.',
        'afternoon': 'Check in at verified local homestay, fresh herbal tea.',
        'evening': 'Sunset mountain walk along scenic trail, weather sync.',
      },
      {
        'day': 'Day 2: High-Altitude Exploration & Cultural Darshan',
        'morning': 'Early morning temple darshan or ridge photography.',
        'afternoon': 'Local Pahadi cuisine lunch & guided alpine walk.',
        'evening': 'Campfire storytelling, warm dinner & stargazing.',
      },
      {
        'day': 'Day 3: Cooperative Souvenirs & Safe Departure',
        'morning': 'Sunrise meditation and hot breakfast.',
        'afternoon': 'Visit village artisan cooperative for organic honey & crafts.',
        'evening': 'Checkout, escrow voucher settlement & safe transit departure.',
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    final plan = _activePlan;
    final dest = plan?['destination'] ?? 'Kedarnath';
    final days = plan?['durationDays'] ?? 3;
    final travelers = plan?['travelers'] ?? 2;
    final budget = plan?['budget'] ?? 15000;
    final stay = plan?['stay'] as Stay?;
    final rental = plan?['rental'] as Rental?;
    final activity = plan?['activity'] as ActivityItem?;
    final List timelineDays = plan?['days'] as List? ?? _buildFallbackTimeline(dest, days);

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'My Mountain Expeditions',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
        actions: [
          if (_userSavedTrips.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.folder_special_outlined, color: AppTheme.forestGreen),
              tooltip: 'Switch Saved Expeditions (${_userSavedTrips.length})',
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  builder: (ctx) => ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    itemCount: _userSavedTrips.length,
                    itemBuilder: (_, i) {
                      final trip = _userSavedTrips[i];
                      return ListTile(
                        leading: const Icon(Icons.terrain, color: AppTheme.forestGreen),
                        title: Text(trip['title'] ?? 'Expedition ${i + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(trip['destination'] ?? 'Uttarakhand'),
                        onTap: () {
                          Navigator.pop(ctx);
                          setState(() {
                            _activePlan = trip['generatedItinerary'] as Map<String, dynamic>? ?? trip;
                          });
                        },
                      );
                    },
                  ),
                );
              },
            ),
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.forestGreen),
            tooltip: 'Plan New Expedition',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const TripPlannerScreen()),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Active Expedition Banner
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F3D2E), Color(0xFF1E5E47)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F3D2E).withValues(alpha: 0.2),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: const Text(
                                'ACTIVE EXPEDITION',
                                style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                              ),
                            ),
                            const Row(
                              children: [
                                Icon(Icons.shield_outlined, color: Color(0xFF86EFAC), size: 14),
                                SizedBox(width: 4),
                                Text('100% Escrow Protected', style: TextStyle(color: Color(0xFF86EFAC), fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '$dest High Altitude Circuit',
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$days Days • $travelers Persons • ₹$budget Budget',
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('TOTAL BUDGET', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 8, fontWeight: FontWeight.bold)),
                                    Text('₹$budget', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: InkWell(
                                onTap: _saveCurrentPlan,
                                child: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF00FF88).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.4)),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      if (_isSaving)
                                        const SizedBox(
                                          width: 14,
                                          height: 14,
                                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00FF88)),
                                        )
                                      else
                                        const Icon(Icons.bookmark_added_outlined, color: Color(0xFF00FF88), size: 16),
                                      const SizedBox(width: 6),
                                      const Text(
                                        'Save to Account',
                                        style: TextStyle(color: Color(0xFF00FF88), fontSize: 11, fontWeight: FontWeight.w900),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Matched Stay Card
                  if (stay != null) ...[
                    const SizedBox(height: 18),
                    const Text('🏨 MATCHED HOMESTAY / COTTAGE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: CachedNetworkImage(
                              imageUrl: stay.imageUrl,
                              width: 65,
                              height: 65,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(width: 65, height: 65, color: const Color(0xFF0F3D2E)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(stay.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis),
                                Text('${stay.stayType} • ₹${stay.pricePerNight}/night', style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w800)),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CheckoutScreen(itemType: 'stay', itemName: stay.name, basePrice: stay.pricePerNight),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F3D2E),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Book', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Matched Rental Card
                  if (rental != null) ...[
                    const SizedBox(height: 14),
                    const Text('🛵 MATCHED MOUNTAIN VEHICLE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: CachedNetworkImage(
                              imageUrl: rental.imageUrl,
                              width: 65,
                              height: 65,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(width: 65, height: 65, color: const Color(0xFF0F3D2E)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(rental.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis),
                                Text('${rental.type} • ₹${rental.pricePerDay}/day', style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w800)),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CheckoutScreen(itemType: 'rental', itemName: rental.name, basePrice: rental.pricePerDay),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F3D2E),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Rent', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Matched Activity Card
                  if (activity != null) ...[
                    const SizedBox(height: 14),
                    const Text('🧗 VERIFIED OUTDOOR EXPEDITION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: CachedNetworkImage(
                              imageUrl: activity.imageUrl,
                              width: 65,
                              height: 65,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(width: 65, height: 65, color: const Color(0xFF0F3D2E)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(activity.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis),
                                Text('${activity.district} • ₹${activity.price}', style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w800)),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CheckoutScreen(itemType: 'activity', itemName: activity.name, basePrice: activity.price),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F3D2E),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Book', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 22),
                  const Text('Day-by-Day Journey Plan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                  const SizedBox(height: 12),

                  // Day cards timeline
                  ...timelineDays.asMap().entries.map((entry) {
                    final idx = entry.key + 1;
                    final item = Map<String, dynamic>.from(entry.value is Map ? entry.value : {});
                    final dayTitle = item['day'] ?? 'Day $idx';
                    final morning = item['morning'] ?? '';
                    final afternoon = item['afternoon'] ?? '';
                    final evening = item['evening'] ?? '';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8)],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE8F5E9),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text('Day $idx', style: const TextStyle(color: Color(0xFF0F3D2E), fontSize: 11, fontWeight: FontWeight.w900)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEFF6FF),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text('VERIFIED ROUTE', style: TextStyle(color: Color(0xFF1D4ED8), fontSize: 9, fontWeight: FontWeight.w800)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(dayTitle, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                          if (morning.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('🌅 Morning: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F3D2E))),
                                Expanded(child: Text(morning, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.3))),
                              ],
                            ),
                          ],
                          if (afternoon.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('☀️ Afternoon: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F3D2E))),
                                Expanded(child: Text(afternoon, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.3))),
                              ],
                            ),
                          ],
                          if (evening.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('🌙 Evening: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F3D2E))),
                                Expanded(child: Text(evening, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.3))),
                              ],
                            ),
                          ],
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
