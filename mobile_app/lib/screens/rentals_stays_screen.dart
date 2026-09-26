import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/stay.dart';
import '../services/api_service.dart';
import 'verification_proof_screen.dart';
import 'sos_safety_screen.dart';
import 'map_screen.dart';

class RentalsStaysScreen extends StatefulWidget {
  const RentalsStaysScreen({super.key});

  @override
  State<RentalsStaysScreen> createState() => _RentalsStaysScreenState();
}

class _RentalsStaysScreenState extends State<RentalsStaysScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Rental> rentals = [];
  List<Stay> stays = [];
  bool isLoading = true;

  // Stays Filtering State
  String searchQuery = '';
  String selectedRegion = 'All'; // 'All', 'Kumaon', 'Garhwal'
  String selectedStayType = 'All'; // 'All', 'Eco-Lodge', 'Cedar Homestay', 'Alpine Glamp', 'Mountain Cottage'
  String selectedBudget = 'All'; // 'All', 'Under ₹2,000', '₹2,000 - ₹4,000', '₹4,000+'
  double minRating = 0.0;

  final TextEditingController _searchController = TextEditingController();

  // Curated high-res authentic Uttarakhand mountain stay photo banks for fallback
  static const List<String> fallbackStayPhotos = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: 1); // Start on Mountain Stays tab
    _loadData();
  }

  Future<void> _loadData() async {
    final r = await ApiService.getRentals();
    final s = await ApiService.getStays();
    if (mounted) {
      setState(() {
        rentals = r;
        stays = s;
        isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  // Filter Logic
  List<Stay> get filteredStays {
    return stays.where((stay) {
      // 1. Search Query
      if (searchQuery.isNotEmpty) {
        final q = searchQuery.toLowerCase();
        final matchName = stay.name.toLowerCase().contains(q);
        final matchLoc = stay.location.toLowerCase().contains(q);
        final matchType = stay.stayType.toLowerCase().contains(q);
        if (!matchName && !matchLoc && !matchType) return false;
      }

      // 2. Region Filter
      if (selectedRegion != 'All') {
        final loc = (stay.location + ' ' + stay.name).toLowerCase();
        final isKumaon = loc.contains('nainital') ||
            loc.contains('almora') ||
            loc.contains('munsiyari') ||
            loc.contains('binsar') ||
            loc.contains('kausani') ||
            loc.contains('ranikhet') ||
            loc.contains('mukteshwar') ||
            loc.contains('pithoragarh') ||
            loc.contains('bageshwar') ||
            loc.contains('champawat');

        final isGarhwal = loc.contains('rishikesh') ||
            loc.contains('haridwar') ||
            loc.contains('dehradun') ||
            loc.contains('mussoorie') ||
            loc.contains('chopta') ||
            loc.contains('auli') ||
            loc.contains('kedarnath') ||
            loc.contains('badrinath') ||
            loc.contains('joshimath') ||
            loc.contains('uttarkashi') ||
            loc.contains('tehri') ||
            loc.contains('chamoli') ||
            loc.contains('rudraprayag');

        if (selectedRegion == 'Kumaon' && !isKumaon) return false;
        if (selectedRegion == 'Garhwal' && !isGarhwal) return false;
      }

      // 3. Stay Type Filter
      if (selectedStayType != 'All') {
        final type = (stay.stayType + ' ' + stay.name).toLowerCase();
        if (!type.contains(selectedStayType.toLowerCase().replaceAll(' ', ''))) {
          return false;
        }
      }

      // 4. Budget Filter
      if (selectedBudget == 'Under ₹2,000' && stay.pricePerNight >= 2000) return false;
      if (selectedBudget == '₹2,000 - ₹4,000' && (stay.pricePerNight < 2000 || stay.pricePerNight > 4000)) return false;
      if (selectedBudget == '₹4,000+' && stay.pricePerNight < 4000) return false;

      // 5. Min Rating
      if (minRating > 0 && stay.rating < minRating) return false;

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: Color(0xFF0F4C3A),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const Text('DU', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13)),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: const [
                Text('Discovery', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF0F4C3A), height: 1.1)),
                Text('UTTARAKHAND', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 8, color: Color(0xFF64748B), letterSpacing: 1.2)),
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
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF0F4C3A),
          indicatorWeight: 3,
          labelColor: const Color(0xFF0F4C3A),
          unselectedLabelColor: const Color(0xFF64748B),
          labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
          tabs: const [
            Tab(icon: Icon(Icons.two_wheeler, size: 20), text: 'Rides & Bikes'),
            Tab(icon: Icon(Icons.cottage, size: 20), text: 'Mountain Stays'),
          ],
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F4C3A)))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildRentalsTab(),
                _buildStaysTab(),
              ],
            ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MOUNTAIN STAYS TAB (PIXEL-PERFECT ECO-LUXE LAYOUT)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildStaysTab() {
    final list = filteredStays;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── 1. Hero Banner ────────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 20),
            color: const Color(0xFFFBF9F8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Trust Pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.verified_user, size: 13, color: Color(0xFF0F4C3A)),
                      SizedBox(width: 5),
                      Text(
                        '100% ESCROW & GPS-VERIFIED STAYS',
                        style: TextStyle(color: Color(0xFF0F4C3A), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.3),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Hero Title
                RichText(
                  text: const TextSpan(
                    text: 'Stay in the ',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.15),
                    children: [
                      TextSpan(
                        text: 'Mountains',
                        style: TextStyle(color: Color(0xFF0F4C3A)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'From cozy cedar-wood homestays to high-altitude retreats with Panchachuli & Nanda Devi views. Secured by smart escrow protection.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
                ),
                const SizedBox(height: 14),

                // Search Box
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3)),
                    ],
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) {
                            setState(() {
                              searchQuery = val;
                            });
                          },
                          decoration: const InputDecoration(
                            hintText: 'Where in Uttarakhand? (e.g. Munsiyari)',
                            hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                        ),
                      ),
                      if (searchQuery.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.clear, size: 16, color: Color(0xFF94A3B8)),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              searchQuery = '';
                            });
                          },
                        ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Trust Checklist Badges
                Wrap(
                  spacing: 12,
                  runSpacing: 6,
                  children: const [
                    _TrustBadgeItem(text: '86 GPS-Verified'),
                    _TrustBadgeItem(text: 'Escrow Protected'),
                    _TrustBadgeItem(text: 'Video KYC Verified'),
                  ],
                ),

                const SizedBox(height: 16),

                // ── Featured Property Showcase Card ────────────────────────
                _buildFeaturedPropertyCard(),
              ],
            ),
          ),

          // ── 2. Active Road Advisory Banner ────────────────────────────────
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFFDE68A)),
              boxShadow: [
                BoxShadow(color: Colors.amber.withOpacity(0.06), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706), size: 18),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'ACTIVE ROAD ADVISORY • 5 VALLEY SENTINELS',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF92400E), letterSpacing: 0.5),
                          ),
                          SizedBox(height: 3),
                          Text(
                            'Joshimath Corridor (NH-58) BLOCKED — Auto-reroute via Tharali Valley Bypass (+34km). BRO clearance active.',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B), height: 1.3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.alt_route, size: 16),
                    label: const Text('1-Tap Auto-Reroute on Map', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const MapScreen()));
                    },
                  ),
                ),
              ],
            ),
          ),

          // ── 3. Region Filter Selector Bar ─────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Curated Stays', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                    Text('${list.length} verified stays available', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
                  ],
                ),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  padding: const EdgeInsets.all(2),
                  child: Row(
                    children: [
                      _buildRegionTabBtn('All', 'All (${stays.length})'),
                      _buildRegionTabBtn('Kumaon', 'Kumaon'),
                      _buildRegionTabBtn('Garhwal', 'Garhwal'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Filter Chips Bar ──────────────────────────────────────────────
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('All Types', selectedStayType == 'All', () => setState(() => selectedStayType = 'All')),
                _buildFilterChip('Eco-Lodge', selectedStayType == 'Eco-Lodge', () => setState(() => selectedStayType = 'Eco-Lodge')),
                _buildFilterChip('Cedar Homestay', selectedStayType == 'Cedar Homestay', () => setState(() => selectedStayType = 'Cedar Homestay')),
                _buildFilterChip('Alpine Glamp', selectedStayType == 'Alpine Glamp', () => setState(() => selectedStayType = 'Alpine Glamp')),
                _buildFilterChip('Under ₹2,000', selectedBudget == 'Under ₹2,000', () => setState(() => selectedBudget = selectedBudget == 'Under ₹2,000' ? 'All' : 'Under ₹2,000')),
                _buildFilterChip('₹2,000 - ₹4,000', selectedBudget == '₹2,000 - ₹4,000', () => setState(() => selectedBudget = selectedBudget == '₹2,000 - ₹4,000' ? 'All' : '₹2,000 - ₹4,000')),
                _buildFilterChip('⭐ 4.8+', minRating == 4.8, () => setState(() => minRating = minRating == 4.8 ? 0.0 : 4.8)),
              ],
            ),
          ),

          // ── 4. Stays List Cards ───────────────────────────────────────────
          if (list.isEmpty)
            Container(
              margin: const EdgeInsets.all(24),
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.cottage_outlined, size: 48, color: Color(0xFF94A3B8)),
                  const SizedBox(height: 12),
                  const Text('No Mountain Stays Found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
                  const SizedBox(height: 4),
                  const Text('Try adjusting your search query or reset region filters.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B)), textAlign: TextAlign.center),
                  const SizedBox(height: 14),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F4C3A), foregroundColor: Colors.white),
                    onPressed: () {
                      setState(() {
                        searchQuery = '';
                        selectedRegion = 'All';
                        selectedStayType = 'All';
                        selectedBudget = 'All';
                        minRating = 0.0;
                        _searchController.clear();
                      });
                    },
                    child: const Text('Reset All Filters'),
                  ),
                ],
              ),
            )
          else
            ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final s = list[index];
                final fallbackImg = fallbackStayPhotos[index % fallbackStayPhotos.length];
                final imgUrl = (s.imageUrl.isNotEmpty && !s.imageUrl.contains('placeholder')) ? s.imageUrl : fallbackImg;

                return Container(
                  margin: const EdgeInsets.only(bottom: 18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Photo Header
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                            child: CachedNetworkImage(
                              imageUrl: imgUrl,
                              height: 190,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(color: const Color(0xFFF3EFE6)),
                              errorWidget: (context, url, error) => CachedNetworkImage(
                                imageUrl: fallbackImg,
                                height: 190,
                                width: double.infinity,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          // Escrow Badge Top Right
                          Positioned(
                            top: 10,
                            right: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669),
                                borderRadius: BorderRadius.circular(999),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4)],
                              ),
                              child: const Text(
                                'Escrow Protected',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                              ),
                            ),
                          ),
                          // Location Tag Bottom Left
                          Positioned(
                            bottom: 10,
                            left: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.65),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.location_on, color: Colors.white, size: 11),
                                  const SizedBox(width: 3),
                                  Text(
                                    s.location,
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Card Content
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFECFDF5),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFFA7F3D0)),
                                  ),
                                  child: Text(
                                    s.stayType.isNotEmpty ? s.stayType : 'Cedar Wood Retreat',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF047857)),
                                  ),
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded, color: Color(0xFFD97706), size: 16),
                                    const SizedBox(width: 2),
                                    Text(
                                      '${s.rating} (${20 + (index * 7) % 40})',
                                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF0F172A)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            Text(
                              s.name,
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.2),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              s.description.isNotEmpty ? s.description : 'Authentic Himalayan wooden cabin overlooking snow peaks with organic pahadi meals.',
                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, height: 1.3),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),

                            const SizedBox(height: 10),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: s.amenities.take(4).map((a) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(a, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFF475569))),
                                );
                              }).toList(),
                            ),

                            const SizedBox(height: 14),
                            const Divider(height: 1, color: Color(0xFFF1F5F9)),
                            const SizedBox(height: 12),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.baseline,
                                      textBaseline: TextBaseline.alphabetic,
                                      children: [
                                        Text('₹${s.pricePerNight}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                                        const Text(' /night', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
                                      ],
                                    ),
                                    const Text('GPS EXIF Verified ✓', style: TextStyle(fontSize: 9, color: Color(0xFF059669), fontWeight: FontWeight.w800)),
                                  ],
                                ),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0F4C3A),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    elevation: 0,
                                  ),
                                  onPressed: () {
                                    _showBookingDialog(context, s.name, '₹${s.pricePerNight}/night');
                                  },
                                  child: const Text('Book Secure', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

          // ── 5. Choose Your Mountain Realm Section ──────────────────────────
          _buildMountainRealmSection(),

          // ── 6. Escrow Guarantee Pillars ───────────────────────────────────
          _buildEscrowGuaranteeSection(),

          // ── 7. Traveler Stories Testimonials ──────────────────────────────
          _buildTravelerStoriesSection(),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FEATURED PROPERTY CARD WIDGET
  // ──────────────────────────────────────────────────────────────────────────
  Widget _buildFeaturedPropertyCard() {
    return Container(
      width: double.infinity,
      height: 220,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 14, offset: const Offset(0, 4)),
        ],
      ),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(22),
            child: CachedNetworkImage(
              imageUrl: 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=1000&q=80',
              width: double.infinity,
              height: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.4),
                  Colors.black.withOpacity(0.9),
                ],
              ),
            ),
          ),
          Positioned(
            top: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF059669),
                borderRadius: BorderRadius.circular(999),
              ),
              child: const Text('Escrow Ready', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
            ),
          ),
          Positioned(
            bottom: 14,
            left: 14,
            right: 14,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F4C3A).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF34D399).withOpacity(0.4)),
                  ),
                  child: const Text('FEATURED PROPERTY', style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
                ),
                const SizedBox(height: 4),
                const Text('Pahadi Eco-Lodge, Munsiyari', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                const SizedBox(height: 2),
                const Text('Panchachuli Snow View • GPS EXIF ✓', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('₹2,400 /night', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: Colors.white.withOpacity(0.3)),
                      ),
                      child: const Text('100% Verified', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
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

  // ──────────────────────────────────────────────────────────────────────────
  // MOUNTAIN REALM SECTION
  // ──────────────────────────────────────────────────────────────────────────
  Widget _buildMountainRealmSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0F4C3A),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0F4C3A).withOpacity(0.3), blurRadius: 14, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFF064E3B),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text('INTERACTIVE REGION EXPLORER', style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
          ),
          const SizedBox(height: 8),
          const Text('Choose Your Mountain Realm', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          const Text(
            'Explore Garhwal for high Himalayan shrines, or Kumaon for rolling tea estates and dense pine forests.',
            style: TextStyle(color: Color(0xFFD1FAE5), fontSize: 11, height: 1.3),
          ),
          const SizedBox(height: 14),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF0F4C3A),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => setState(() => selectedRegion = 'Kumaon'),
                  child: const Text('Kumaon (45)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF34D399)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => setState(() => selectedRegion = 'Garhwal'),
                  child: const Text('Garhwal (41)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Live Region Status Cards
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.15)),
            ),
            child: Column(
              children: [
                _buildStatusRow('Kumaon Weather & Routes', 'Clear / All Open', const Color(0xFF6EE7B7)),
                const Divider(color: Colors.white12, height: 14),
                _buildStatusRow('Garhwal Weather & Routes', 'NH-58 Caution', const Color(0xFFFCD34D)),
                const Divider(color: Colors.white12, height: 14),
                _buildStatusRow('Active Escrow Vaults', '₹1.4Cr Secured', const Color(0xFF6EE7B7)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusRow(String title, String status, Color statusColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
        Text(status, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w900)),
      ],
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ESCROW GUARANTEE PILLARS
  // ──────────────────────────────────────────────────────────────────────────
  Widget _buildEscrowGuaranteeSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('SECURE BOOKING GUARANTEE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0F4C3A), letterSpacing: 0.8)),
          const SizedBox(height: 4),
          const Text('Why Book with Escrow Protection?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
          const SizedBox(height: 12),

          _buildGuaranteePillarCard(
            icon: Icons.lock_outline,
            title: 'Smart Escrow Release',
            desc: 'Your funds are held securely in an automated escrow vault. The host only receives payment after you check in and confirm your stay.',
          ),
          const SizedBox(height: 10),
          _buildGuaranteePillarCard(
            icon: Icons.pin_drop_outlined,
            title: 'GPS EXIF Verification',
            desc: 'Every property photo and location pin is verified on-site via cryptographic EXIF data to ensure you never get scammed by fake listings.',
          ),
          const SizedBox(height: 10),
          _buildGuaranteePillarCard(
            icon: Icons.video_camera_front_outlined,
            title: 'Instant Video KYC',
            desc: 'Hosts undergo rigorous government ID checks and live video walkthroughs so you can trust who is welcoming you into the Himalayas.',
          ),
        ],
      ),
    );
  }

  Widget _buildGuaranteePillarCard({required IconData icon, required String title, required String desc}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF0F4C3A), size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                const SizedBox(height: 3),
                Text(desc, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.35)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TRAVELER STORIES SECTION
  // ──────────────────────────────────────────────────────────────────────────
  Widget _buildTravelerStoriesSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('TRAVELER STORIES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0F4C3A), letterSpacing: 0.8)),
          const SizedBox(height: 4),
          const Text('Loved by Mountain Explorers', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
          const SizedBox(height: 12),

          _buildTestimonialCard(
            quote: '"Booking through Discover Uttarakhand gave us complete peace of mind. The escrow system meant our money was safe until we reached our cedar cabin in Munsiyari."',
            author: 'Aarav Sharma',
            trip: 'Visited Munsiyari • October 2026',
            initials: 'AS',
          ),
          const SizedBox(height: 10),
          _buildTestimonialCard(
            quote: '"The active road advisory saved us hours of traffic when the Joshimath corridor was blocked. The auto-reroute feature guided us smoothly."',
            author: 'Neha Pant',
            trip: 'Visited Chopta • September 2026',
            initials: 'NP',
          ),
        ],
      ),
    );
  }

  Widget _buildTestimonialCard({required String quote, required String author, required String trip, required String initials}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(5, (_) => const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 16)),
          ),
          const SizedBox(height: 6),
          Text(quote, style: const TextStyle(fontSize: 12, color: Color(0xFF334155), fontStyle: FontStyle.italic, height: 1.35)),
          const SizedBox(height: 10),
          Row(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: const Color(0xFF0F4C3A),
                child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(author, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                  Text(trip, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPER FILTER WIDGETS
  // ──────────────────────────────────────────────────────────────────────────
  Widget _buildRegionTabBtn(String key, String label) {
    final isSelected = selectedRegion == key;
    return GestureDetector(
      onTap: () => setState(() => selectedRegion = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F4C3A) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: isSelected ? Colors.white : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F4C3A) : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: isSelected ? const Color(0xFF0F4C3A) : const Color(0xFFCBD5E1)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : const Color(0xFF334155),
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENTALS TAB (RIDES & BIKES)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildRentalsTab() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      itemCount: rentals.length,
      itemBuilder: (context, index) {
        final r = rentals[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    child: CachedNetworkImage(
                      imageUrl: r.imageUrl,
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: const Color(0xFFF3EFE6)),
                      errorWidget: (context, url, error) => Container(
                        color: const Color(0xFFF3EFE6),
                        child: const Icon(Icons.two_wheeler, color: Color(0xFF0F3D2E), size: 48),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => VerificationProofScreen(
                              title: r.name,
                              location: r.location,
                              category: 'Verified Fleet',
                            ),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(999),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F3D2E).withOpacity(0.92),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.verified, size: 12, color: Color(0xFF34D399)),
                            SizedBox(width: 4),
                            Text('3-Layer Verified Partner', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            r.name,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.3),
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Color(0xFFD97706), size: 16),
                            const SizedBox(width: 2),
                            Text(r.rating.toString(), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A))),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 13, color: Color(0xFF047857)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            r.location,
                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFA5D6A7)),
                          ),
                          child: const Text(
                            '100% Escrow Guard',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Technical Specs Badges
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: _getVehicleSpecChips(r.name).map((chip) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Text(
                            chip,
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('₹${r.pricePerDay}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                            const Text('per day • Zero Security Deposit', style: TextStyle(fontSize: 10, color: Color(0xFF047857), fontWeight: FontWeight.w700)),
                          ],
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F3D2E),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                            elevation: 0,
                          ),
                          onPressed: () {
                            _showBookingDialog(context, r.name, '₹${r.pricePerDay}/day');
                          },
                          child: const Text('Book Ride', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  List<String> _getVehicleSpecChips(String name) {
    final n = name.toLowerCase();
    if (n.contains('himalayan') || n.contains('scram') || n.contains('xpulse')) {
      return ['⚡ 411cc High Torque', '🧳 Luggage Panniers', '🛡️ Dual ABS', '🪖 2 Helmets'];
    }
    if (n.contains('classic') || n.contains('bullet') || n.contains('meteor')) {
      return ['⚡ 349cc Engine', '⚙️ Hill Cruise Gear', '🛡️ Backrest', '🪖 Helmet Included'];
    }
    if (n.contains('thar') || n.contains('gurkha') || n.contains('4x4')) {
      return ['🏔️ 4x4 High-Low', '⚡ 2.2L mHawk Diesel', '📐 226mm Clearance', '🛡️ Hill Descent'];
    }
    if (n.contains('scorpio') || n.contains('innova') || n.contains('fortuner')) {
      return ['👥 7-Seater SUV', '⚡ Turbo Diesel', '🛞 All-Terrain Tires', '❄️ Roof Rack'];
    }
    if (n.contains('activa') || n.contains('jupiter') || n.contains('ntorq') || n.contains('scooter')) {
      return ['⚡ 110cc Auto', '⛽ 50 km/l Avg', '📦 Boot Storage', '🪖 Helmet Included'];
    }
    return ['🏔️ Hill Tested', '📜 Full Insurance', '📡 GPS Live Beacon', '💳 Zero Deposit'];
  }

  void _showBookingDialog(BuildContext context, String title, String rate) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            top: 24,
            left: 24,
            right: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Instant Mountain Booking', style: TextStyle(color: AppTheme.mutedText, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
              Text('Rate: $rate (Escrow Protected)', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F4C3A))),
              const SizedBox(height: 20),
              const TextField(
                decoration: InputDecoration(
                  labelText: 'Traveler Full Name',
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                ),
              ),
              const SizedBox(height: 12),
              const TextField(
                decoration: InputDecoration(
                  labelText: 'Phone Number (for Pickup OTP)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F4C3A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Reservation request sent for $title!'),
                        backgroundColor: const Color(0xFF0F4C3A),
                      ),
                    );
                  },
                  child: const Text('CONFIRM BOOKING (ESCROW LOCKED)', style: TextStyle(fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TrustBadgeItem extends StatelessWidget {
  final String text;
  const _TrustBadgeItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF059669)),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
      ],
    );
  }
}
