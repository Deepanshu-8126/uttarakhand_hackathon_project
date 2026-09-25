import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/destination.dart';
import '../models/stay.dart';
import '../services/api_service.dart';
import 'destination_detail_screen.dart';

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
              children: [
                const Text(
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
            icon: const Icon(Icons.auto_awesome, color: AppTheme.forestGreen),
            tooltip: 'AI Copilot',
            onPressed: () => widget.onNavigateTab(4), // Navigate to AI tab
          ),
          const SizedBox(width: 8),
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
                    // ── Hero Banner ──────────────────────────────────────────
                    _buildHeroBanner(),

                    const SizedBox(height: 18),

                    // ── Search Bar ───────────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: AppTheme.borderLight),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: TextField(
                          onChanged: (val) => setState(() => searchQuery = val),
                          decoration: InputDecoration(
                            hintText: 'Where do you want to go in Uttarakhand?',
                            hintStyle: TextStyle(fontSize: 13, color: AppTheme.mutedText),
                            prefixIcon: const Icon(Icons.search, color: AppTheme.forestGreen, size: 20),
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
                      height: 38,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: categories.length,
                        itemBuilder: (context, index) {
                          final cat = categories[index];
                          final isSelected = selectedFilter == cat;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(
                                cat,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? Colors.white : AppTheme.textDark,
                                ),
                              ),
                              selected: isSelected,
                              showCheckmark: false,
                              selectedColor: AppTheme.forestGreen,
                              backgroundColor: AppTheme.beige,
                              side: BorderSide.none,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                              onSelected: (_) => setState(() => selectedFilter = cat),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 14),

                    // ── Live Mountain Radar Strip ─────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFCD34D)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.shield_outlined, color: AppTheme.amberWarning, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'Pahadi Safety Radar Active',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF92400E)),
                                  ),
                                  Text(
                                    'High altitude check, landslide warnings & road updates are verified live.',
                                    style: TextStyle(fontSize: 10, color: Color(0xFFB45309)),
                                  ),
                                ],
                              ),
                            ),
                            TextButton(
                              onPressed: () => widget.onNavigateTab(2), // Go to map
                              child: const Text('View Map', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF92400E))),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 22),

                    // ── Destinations Grid ────────────────────────────────────
                    _buildSectionHeader('Explore Uttarakhand', 'Discover valleys, peaks and quiet villages', () {}),
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
                    _buildSectionHeader('Meet Local Guides', 'Explore Uttarakhand with someone who knows it.', () {}),
                    const SizedBox(height: 12),
                    _buildGuidesList(),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHeroBanner() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 16, offset: const Offset(0, 6)),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CachedNetworkImage(
                imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(color: AppTheme.darkGreen),
                errorWidget: (context, url, error) => Container(color: AppTheme.darkGreen, child: const Icon(Icons.terrain, color: Colors.white24, size: 64)),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withOpacity(0.85),
                      Colors.black.withOpacity(0.2),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.25),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'RENT YOUR RIDE',
                        style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Take the Scenic Route.',
                      style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900),
                    ),
                    const Text(
                      'Explore Uttarakhand at your own pace with verified local rentals.',
                      style: TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.forestGreen,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      onPressed: () => widget.onNavigateTab(3), // Plan Trip
                      child: const Text('PLAN MY TRIP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
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

  Widget _buildSectionHeader(String title, String subtitle, VoidCallback onSeeAll) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
          Text(subtitle, style: const TextStyle(fontSize: 12, color: AppTheme.mutedText)),
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
      height: 240,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: list.length,
        itemBuilder: (context, index) {
          final dest = list[index];
          return GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => DestinationDetailScreen(destination: dest)),
            ),
            child: Container(
              width: 175,
              margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    child: CachedNetworkImage(
                      imageUrl: dest.imageUrl,
                      height: 120,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: AppTheme.beige),
                      errorWidget: (context, url, error) => Container(color: AppTheme.beige, child: const Icon(Icons.landscape, color: AppTheme.forestGreen)),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(dest.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                        Text('${dest.district} • ${dest.region}', maxLines: 1, style: const TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('From ₹${dest.estimatedBudget}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.earthBrown)),
                            Row(
                              children: [
                                const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                                Text(dest.rating.toString(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
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
      height: 185,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: rentals.length,
        itemBuilder: (context, index) {
          final r = rentals[index];
          return Container(
            width: 190,
            margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: r.imageUrl,
                    height: 85,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: AppTheme.beige),
                    errorWidget: (context, url, error) => Container(color: AppTheme.beige, child: const Icon(Icons.two_wheeler, color: AppTheme.forestGreen)),
                  ),
                ),
                const SizedBox(height: 6),
                Text(r.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                Text(r.location, style: const TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('₹${r.pricePerDay}/day', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.forestGreen)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppTheme.forestGreen, borderRadius: BorderRadius.circular(999)),
                      child: const Text('Rent', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                    ),
                  ],
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
      height: 185,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: stays.length,
        itemBuilder: (context, index) {
          final s = stays[index];
          return Container(
            width: 200,
            margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: s.imageUrl,
                    height: 85,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: AppTheme.beige),
                    errorWidget: (context, url, error) => Container(color: AppTheme.beige, child: const Icon(Icons.cottage, color: AppTheme.earthBrown)),
                  ),
                ),
                const SizedBox(height: 6),
                Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                Text(s.location, style: const TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('₹${s.pricePerNight}/night', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.earthBrown)),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 12, color: Colors.amber),
                        Text(s.rating.toString(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
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
