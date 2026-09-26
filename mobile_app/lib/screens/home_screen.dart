import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/destination.dart';
import '../models/stay.dart';
import '../services/api_service.dart';
import 'destination_detail_screen.dart';
import 'spiritual_screen.dart';
import 'culture_screen.dart';
import 'activities_screen.dart';
import 'guides_screen.dart';
import 'sos_safety_screen.dart';
import 'checkout_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(int) onNavigateTab;
  const HomeScreen({super.key, required this.onNavigateTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Destination> destinations = [];
  List<Rental> rentals = [];
  List<Stay> stays = [];
  List<Guide> guides = [];
  bool isLoading = true;
  String selectedFilter = 'All';
  String searchQuery = '';
  int activeSlide = 0;

  final List<String> categories = ['All', 'Lakes', 'Spiritual', 'Snow', 'Adventure', 'Wildlife'];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final d = await ApiService.getDestinations();
    final r = await ApiService.getRentals();
    final s = await ApiService.getStays();
    final g = await ApiService.getGuides();
    if (mounted) {
      setState(() {
        destinations = d;
        rentals = r;
        stays = s;
        guides = g;
        isLoading = false;
      });
    }
  }

  List<Destination> get filteredDestinations {
    return destinations.where((dest) {
      final matchesFilter = selectedFilter == 'All' || dest.category.toLowerCase() == selectedFilter.toLowerCase();
      final matchesSearch = searchQuery.isEmpty ||
          dest.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          dest.district.toLowerCase().contains(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/images/logo.png',
                width: 30,
                height: 30,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: AppTheme.forestGreen,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.terrain_rounded, color: Colors.white, size: 16),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'DISCOVER',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1, color: AppTheme.textDark),
                ),
                Text(
                  'UTTARAKHAND',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.5, color: AppTheme.forestGreen),
                ),
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
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: AppTheme.forestGreen),
            tooltip: 'AI Copilot',
            onPressed: () => widget.onNavigateTab(4),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: AppTheme.forestGreen,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Hero Banner Carousel ──
                    _buildHeroBanner(),

                    const SizedBox(height: 16),

                    // ── Quick Category Action Badges ──
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          _buildQuickActionButton('Spiritual', Icons.temple_hindu_outlined, const Color(0xFFFEF3C7), const Color(0xFF92400E), () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const SpiritualScreen()));
                          }),
                          const SizedBox(width: 8),
                          _buildQuickActionButton('Culture', Icons.palette_outlined, const Color(0xFFE0E7FF), const Color(0xFF3730A3), () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const CultureScreen()));
                          }),
                          const SizedBox(width: 8),
                          _buildQuickActionButton('Adventures', Icons.kayaking_outlined, const Color(0xFFDCFCE7), const Color(0xFF166534), () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const ActivitiesScreen()));
                          }),
                          const SizedBox(width: 8),
                          _buildQuickActionButton('Guides', Icons.person_pin_outlined, const Color(0xFFF3E8FF), const Color(0xFF6B21A8), () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const GuidesScreen()));
                          }),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // ── Search Bar ───────────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: TextField(
                          onChanged: (val) => setState(() => searchQuery = val),
                          decoration: InputDecoration(
                            hintText: 'Search valleys, temples, stays, or rides...',
                            hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                            prefixIcon: const Icon(Icons.search, color: Color(0xFF0F3D2E), size: 20),
                            suffixIcon: searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.close, size: 16),
                                    onPressed: () => setState(() => searchQuery = ''),
                                  )
                                : null,
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // ── Category Filter Pills ────────────────────────────────
                    SizedBox(
                      height: 36,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: categories.length,
                        itemBuilder: (context, index) {
                          final cat = categories[index];
                          final isSelected = selectedFilter == cat;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: () => setState(() => selectedFilter = cat),
                              borderRadius: BorderRadius.circular(999),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF0F3D2E) : Colors.white,
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(
                                    color: isSelected ? const Color(0xFF0F3D2E) : const Color(0xFFE2E8F0),
                                  ),
                                  boxShadow: isSelected
                                      ? [BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.2), blurRadius: 6, offset: const Offset(0, 2))]
                                      : null,
                                ),
                                child: Text(
                                  cat,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 18),

                    // ── The Devbhoomi Trust Standard ─────────────────────────
                    _buildDevbhoomiTrustBanner(),

                    const SizedBox(height: 22),

                    // ── Destinations Section ─────────────────────────────────
                    _buildSectionHeader('Explore Uttarakhand', 'Pristine valleys, sacred shrines, and authentic mountain life', () {}),
                    const SizedBox(height: 12),
                    _buildDestinationsGrid(),

                    const SizedBox(height: 28),

                    // ── Rent Your Ride Section ───────────────────────────────
                    _buildSectionHeader('Rent Your Ride', 'Your road. Your pace. 3-layer verified bikes & scooters.', () => widget.onNavigateTab(1)),
                    const SizedBox(height: 12),
                    _buildRentalsList(),

                    const SizedBox(height: 28),

                    // ── Mountain Stays Section ───────────────────────────────
                    _buildSectionHeader('Stay in the Mountains', 'From cozy homestays to wooden retreats.', () => widget.onNavigateTab(1)),
                    const SizedBox(height: 12),
                    _buildStaysList(),

                    const SizedBox(height: 28),

                    // ── Verified Guides Section ──────────────────────────────
                    _buildSectionHeader('Meet Local Guides', 'Explore Uttarakhand with someone who knows it.', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const GuidesScreen()));
                    }),
                    const SizedBox(height: 12),
                    _buildGuidesList(),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildQuickActionButton(String label, IconData icon, Color bgColor, Color fgColor, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: fgColor.withOpacity(0.2)),
          ),
          child: Column(
            children: [
              Icon(icon, color: fgColor, size: 20),
              const SizedBox(height: 4),
              Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: fgColor)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroBanner() {
    final heroSlides = [
      {
        'title': 'DISCOVER UTTARAKHAND',
        'subtitle': 'Where Sacred Himalayas Meet The Sky',
        'tag': 'GPS VERIFIED • LIVE CORRIDOR',
        'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        'dest': 'Nainital & Kumaon Lakes',
      },
    ];

    final currentSlide = heroSlides[activeSlide % heroSlides.length];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        height: 220,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.18), blurRadius: 20, offset: const Offset(0, 8)),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CachedNetworkImage(
                imageUrl: currentSlide['image']!,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(color: const Color(0xFF09261C)),
                errorWidget: (context, url, error) => Container(color: const Color(0xFF09261C)),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      const Color(0xFF09261C).withOpacity(0.92),
                      const Color(0xFF09261C).withOpacity(0.35),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withOpacity(0.90),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                      ),
                      child: Text(
                        currentSlide['tag']!,
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      currentSlide['title']!,
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: -0.3),
                    ),
                    Text(
                      currentSlide['subtitle']!,
                      style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF0F3D2E),
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                          ),
                          onPressed: () => widget.onNavigateTab(3), // Plan Trip
                          icon: const Icon(Icons.luggage, size: 14, color: Color(0xFF0F3D2E)),
                          label: const Text('PLAN JOURNEY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white60),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                          ),
                          onPressed: () => widget.onNavigateTab(2), // GIS Map
                          child: const Text('VIEW RADAR', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDevbhoomiTrustBanner() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.shield_outlined, size: 13, color: Color(0xFF0F3D2E)),
                      SizedBox(width: 4),
                      Text(
                        'THE DEVBHOOMI STANDARD',
                        style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Text(
              'Safer Mountain Travel.\nZero Booking Fraud.',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.25),
            ),
            const SizedBox(height: 6),
            const Text(
              'High-altitude verified stays, GPS-tracked bike fleet & 100% escrow protection against sudden mountain pass closures.',
              style: TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFDFBF7),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('100%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                        Text('Escrow Protected', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFDFBF7),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('3-Layer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                        Text('Verified Fleet', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle, VoidCallback onSeeAll) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.3)),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildDestinationsGrid() {
    final list = filteredDestinations;
    if (list.isEmpty) {
      return const Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No destinations found.')));
    }
    return SizedBox(
      height: 280,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: list.length,
        itemBuilder: (context, index) {
          final dest = list[index];
          return GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => DestinationDetailScreen(destination: dest)),
            ),
            child: Container(
              width: 220,
              margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
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
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    child: CachedNetworkImage(
                      imageUrl: dest.imageUrl,
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: const Color(0xFFF3EFE6)),
                      errorWidget: (context, url, error) => Container(color: const Color(0xFFF3EFE6), child: const Icon(Icons.landscape, color: Color(0xFF0F3D2E))),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          dest.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 12, color: Color(0xFF047857)),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(
                                '${dest.district} • ${dest.region}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'From ₹${dest.estimatedBudget}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F3D2E)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.star_rounded, size: 13, color: Color(0xFFD97706)),
                                  const SizedBox(width: 2),
                                  Text(
                                    dest.rating.toString(),
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF92400E)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRentalsList() {
    return SizedBox(
      height: 250,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: rentals.length,
        itemBuilder: (context, index) {
          final r = rentals[index];
          return Container(
            width: 210,
            margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
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
                        height: 125,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: const Color(0xFFF3EFE6)),
                        errorWidget: (context, url, error) => Container(
                          color: const Color(0xFFF3EFE6),
                          child: const Icon(Icons.two_wheeler, color: Color(0xFF0F3D2E), size: 36),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F3D2E).withOpacity(0.92),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.verified, size: 10, color: Color(0xFF34D399)),
                            SizedBox(width: 3),
                            Text('3-Layer Verified', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        r.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        r.location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '₹${r.pricePerDay}',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                              ),
                              const Text('/day • Helmet incl.', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                            ],
                          ),
                          InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CheckoutScreen(
                                    itemType: 'Bike Rental (3-Layer Verified)',
                                    itemName: r.name,
                                    basePrice: r.pricePerDay,
                                  ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(999),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F3D2E),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: const Text('Book', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
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
        },
      ),
    );
  }

  Widget _buildStaysList() {
    return SizedBox(
      height: 240,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: stays.length,
        itemBuilder: (context, index) {
          final s = stays[index];
          return Container(
            width: 210,
            margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
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
                        imageUrl: s.imageUrl,
                        height: 120,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: const Color(0xFFF3EFE6)),
                        errorWidget: (context, url, error) => Container(
                          color: const Color(0xFFF3EFE6),
                          child: const Icon(Icons.cottage, color: Color(0xFF0F3D2E), size: 36),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F3D2E).withOpacity(0.92),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.shield, size: 10, color: Color(0xFF34D399)),
                            SizedBox(width: 3),
                            Text('Verified Stay', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        s.location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '₹${s.pricePerNight}/night',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                          ),
                          Row(
                            children: [
                              const Icon(Icons.star_rounded, size: 14, color: Color(0xFFD97706)),
                              Text(s.rating.toString(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                            ],
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
    );
  }

  Widget _buildGuidesList() {
    return SizedBox(
      height: 140,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: guides.length,
        itemBuilder: (context, index) {
          final g = guides[index];
          return Container(
            width: 240,
            margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: CachedNetworkImage(
                    imageUrl: g.imageUrl,
                    height: 75,
                    width: 75,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: AppTheme.beige),
                    errorWidget: (context, url, error) => Container(color: AppTheme.beige, child: const Icon(Icons.person, color: AppTheme.forestGreen)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(g.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      Text(g.location, maxLines: 1, style: const TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                      Text(g.experience, style: const TextStyle(fontSize: 10, color: AppTheme.forestGreen, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('₹${g.pricePerDay}/day', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.textDark)),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
