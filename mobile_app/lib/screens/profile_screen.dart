import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../services/auth_provider.dart';
import '../services/api_service.dart';
import '../models/destination.dart';
import '../models/stay.dart';
import 'login_screen.dart';
import 'my_trip_screen.dart';
import 'checkout_screen.dart';
import 'trip_planner_screen.dart';
import 'destination_detail_screen.dart';
import 'sos_safety_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Destination> _savedDestinations = [];
  List<Stay> _savedStays = [];
  List<Map<String, dynamic>> _myTrips = [];
  List<Map<String, dynamic>> _myBookings = [];
  List<Map<String, dynamic>> _myFavorites = [];
  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadVaultData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadVaultData() async {
    setState(() => _isLoadingData = true);
    try {
      final tripsFuture = ApiService.getMyTrips();
      final bookingsFuture = ApiService.getMyBookings();
      final favoritesFuture = ApiService.getFavorites();
      final destsFuture = ApiService.getDestinations();
      final staysFuture = ApiService.getStays();

      final results = await Future.wait([
        tripsFuture,
        bookingsFuture,
        favoritesFuture,
        destsFuture,
        staysFuture,
      ]);

      if (mounted) {
        setState(() {
          _myTrips = results[0] as List<Map<String, dynamic>>;
          _myBookings = results[1] as List<Map<String, dynamic>>;
          _myFavorites = results[2] as List<Map<String, dynamic>>;
          final allDests = results[3] as List<Destination>;
          final allStays = results[4] as List<Stay>;

          if (_myFavorites.isNotEmpty) {
            final favDestIds = _myFavorites.where((f) => f['itemType'] == 'destination' || f['itemType'] == 'place').map((f) => f['itemId']?.toString() ?? '').toSet();
            final favStayIds = _myFavorites.where((f) => f['itemType'] == 'stay').map((f) => f['itemId']?.toString() ?? '').toSet();
            _savedDestinations = allDests.where((d) => favDestIds.contains(d.id)).toList();
            _savedStays = allStays.where((s) => favStayIds.contains(s.id)).toList();
          }
          if (_savedDestinations.isEmpty) {
            _savedDestinations = allDests.take(4).toList();
          }
          if (_savedStays.isEmpty) {
            _savedStays = allStays.take(3).toList();
          }

          _isLoadingData = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingData = false);
    }
  }

  void _showEditProfileModal(BuildContext context, AuthProvider auth) {
    final user = auth.user;
    final nameCtrl = TextEditingController(text: user?['name'] ?? 'Pahadi Explorer');
    final phoneCtrl = TextEditingController(text: user?['phone'] ?? '+91 98765 43210');
    final emergencyCtrl = TextEditingController(text: user?['emergencyContact'] ?? '+91 98111 22233');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          top: 24,
          left: 20,
          right: 20,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Edit Himalayan Profile',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.textDark),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: nameCtrl,
              decoration: InputDecoration(
                labelText: 'Full Name',
                prefixIcon: const Icon(Icons.person_outline, color: AppTheme.forestGreen),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              decoration: InputDecoration(
                labelText: 'Phone Number',
                prefixIcon: const Icon(Icons.phone_outlined, color: AppTheme.forestGreen),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: emergencyCtrl,
              decoration: InputDecoration(
                labelText: 'Emergency SOS Contact',
                prefixIcon: const Icon(Icons.emergency_outlined, color: Colors.red),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  auth.updateUserProfile({
                    'name': nameCtrl.text.trim(),
                    'phone': phoneCtrl.text.trim(),
                    'emergencyContact': emergencyCtrl.text.trim(),
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Profile details updated successfully!'), backgroundColor: AppTheme.forestGreen),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.forestGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Save Profile Changes', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showRoleSwitchModal(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Switch Portal & Role',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.textDark),
            ),
            const SizedBox(height: 6),
            const Text(
              'Experience Discovery Uttarakhand from traveler, verified partner, or government admin view.',
              style: TextStyle(fontSize: 12, color: AppTheme.mutedText),
            ),
            const SizedBox(height: 18),
            _buildRoleOption(
              icon: Icons.explore,
              title: 'Himalayan Traveler View',
              subtitle: 'Access saved trips, wishlist, offline passes & coins',
              isActive: !auth.isPartner && !auth.isAdmin,
              onTap: () {
                auth.loginAsDemoRole('traveler');
                Navigator.pop(ctx);
              },
            ),
            const SizedBox(height: 10),
            _buildRoleOption(
              icon: Icons.storefront,
              title: 'Mountain Partner Portal',
              subtitle: 'Manage homestays, bike fleet telemetry & payouts',
              isActive: auth.isPartner && !auth.isAdmin,
              onTap: () {
                auth.loginAsDemoRole('partner');
                Navigator.pop(ctx);
              },
            ),
            const SizedBox(height: 10),
            _buildRoleOption(
              icon: Icons.admin_panel_settings,
              title: 'SuperAdmin Command Center',
              subtitle: 'Verify partner KYC, monitor escrows & road corridors',
              isActive: auth.isAdmin,
              onTap: () {
                auth.loginAsDemoRole('admin');
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.forestGreen.withValues(alpha: 0.08) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive ? AppTheme.forestGreen : const Color(0xFFE2E8F0),
            width: isActive ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isActive ? AppTheme.forestGreen : const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: isActive ? Colors.white : AppTheme.forestGreen, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.textDark)),
                  Text(subtitle, style: const TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                ],
              ),
            ),
            if (isActive) const Icon(Icons.check_circle, color: AppTheme.forestGreen, size: 20),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final isLoggedIn = auth.isAuthenticated;
    final isAdmin = auth.isAdmin;
    final isPartner = auth.isPartner;

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'My Profile & Credentials',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.textDark),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz, color: AppTheme.forestGreen),
            tooltip: 'Switch Role (Admin/Partner/Traveler)',
            onPressed: () => _showRoleSwitchModal(context, auth),
          ),
          if (isLoggedIn)
            IconButton(
              icon: const Icon(Icons.logout, color: Color(0xFFDC2626)),
              tooltip: 'Sign Out',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Sign Out?'),
                    content: const Text('Are you sure you want to sign out from Discovery Uttarakhand?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          auth.logout();
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626), foregroundColor: Colors.white),
                        child: const Text('Sign Out'),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── 1. Glassmorphic User Hero Card ──
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F3D2E), Color(0xFF165540)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF0F3D2E).withValues(alpha: 0.25), blurRadius: 20, offset: const Offset(0, 8)),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      // Avatar with online status
                      Stack(
                        children: [
                          Container(
                            width: 62,
                            height: 62,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.person, color: Color(0xFF0F3D2E), size: 36),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 16,
                              height: 16,
                              decoration: BoxDecoration(
                                color: const Color(0xFF00FF88),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF0F3D2E), width: 2),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isLoggedIn ? (user?['name'] ?? 'Pahadi Explorer') : 'Guest Explorer',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isLoggedIn ? (user?['email'] ?? 'deepanshukapri4@gmail.com') : 'Sign in to sync saved trips & bookings',
                              style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1)),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isAdmin
                                        ? Colors.amber[700]
                                        : (isPartner ? const Color(0xFF059669) : const Color(0xFF059669)),
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    isAdmin
                                        ? '👑 SUPERADMIN PORTAL'
                                        : (isPartner ? '🏢 VERIFIED MOUNTAIN PARTNER' : '🛡️ 100% VERIFIED TRAVELER'),
                                    style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.6),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                InkWell(
                                  onTap: () => _showEditProfileModal(context, auth),
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.edit, color: Colors.white, size: 12),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  if (!isLoggedIn) ...[
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF0F3D2E),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                        ),
                        child: const Text('Sign In or Register', style: TextStyle(fontWeight: FontWeight.w900)),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 14),

            // ── 2. Pahadi Coins & Loyalty Tier ──
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: const BoxDecoration(color: Color(0xFFFEF3C7), shape: BoxShape.circle),
                        child: const Icon(Icons.monetization_on, color: Color(0xFFD97706), size: 24),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                '${user?['pahadiCoins'] ?? 450} Pahadi Coins',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(width: 4),
                              const Icon(Icons.auto_awesome, color: Colors.amber, size: 14),
                            ],
                          ),
                          Text('≈ ₹${user?['pahadiCoins'] ?? 450} Travel Credit Available', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                        ],
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Coins automatically applied at checkout for discounts!'),
                          backgroundColor: AppTheme.forestGreen,
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(999)),
                      child: const Text('Gold Tier', style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 11, fontWeight: FontWeight.w900)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // ── 3. Interactive Category Tabs ──
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.forestGreen,
                labelColor: AppTheme.forestGreen,
                unselectedLabelColor: Colors.grey[600],
                labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                unselectedLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.normal),
                tabs: const [
                  Tab(icon: Icon(Icons.route_outlined, size: 18), text: 'Trips'),
                  Tab(icon: Icon(Icons.favorite_outline, size: 18), text: 'Wishlist'),
                  Tab(icon: Icon(Icons.qr_code_2, size: 18), text: 'Vouchers'),
                  Tab(icon: Icon(Icons.admin_panel_settings_outlined, size: 18), text: 'Admin/Hub'),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // ── Tab Contents Container ──
            SizedBox(
              height: 480,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTripsTab(context),
                  _buildWishlistTab(context),
                  _buildVouchersTab(context),
                  _buildAdminHubTab(context, auth),
                ],
              ),
            ),

            const SizedBox(height: 16),
            const Center(
              child: Text(
                '🏔️ Discovery Uttarakhand v1.1.0 • Ground Verified Blockchain Architecture',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // ── Tab 1: Saved Trips & Active Plans ──────────────────────────────
  Widget _buildTripsTab(BuildContext context) {
    final displayTrips = _myTrips.isNotEmpty
        ? _myTrips.map((t) => {
            'title': (t['title'] ?? t['destination'] ?? 'Uttarakhand Expedition').toString(),
            'duration': '${t['days'] ?? t['duration'] ?? 4} Days',
            'budget': '₹${t['budget'] ?? '5,000'}',
            'stops': (t['destination'] ?? 'Himalayan Ridge').toString(),
            'status': 'Saved in Account',
            'image': (t['coverImage'] ?? t['image'] ?? 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80').toString(),
            'raw': t,
          }).toList()
        : [
            {
              'title': '4-Day Kedarnath & Chopta Snow Trek',
              'duration': '4 Days • 3 Nights',
              'budget': '₹5,200 DIY',
              'stops': 'Haridwar → Guptkashi → Kedarnath → Chopta Tungnath',
              'status': 'Active Itinerary',
              'image': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
            },
            {
              'title': 'Munsiyari & Panchachuli 4x4 Road Trip',
              'duration': '5 Days • 4 Nights',
              'budget': '₹8,500 Backpacker',
              'stops': 'Kathgodam → Almora → Birthi Falls → Munsiyari',
              'status': 'Planned Expedition',
              'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Panchachuli_peaks_from_Munsiyari.jpg/1280px-Panchachuli_peaks_from_Munsiyari.jpg',
            },
          ];

    return ListView(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _myTrips.isNotEmpty ? 'My Saved Itineraries (${_myTrips.length})' : 'My Active Itineraries',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark),
            ),
            TextButton.icon(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TripPlannerScreen())),
              icon: const Icon(Icons.add, size: 16, color: AppTheme.forestGreen),
              label: const Text('+ Plan New Trip', style: TextStyle(color: AppTheme.forestGreen, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ],
        ),
        for (final trip in displayTrips)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 3))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  child: Stack(
                    children: [
                      CachedNetworkImage(
                        imageUrl: trip['image'] as String,
                        height: 120,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: const Color(0xFF0F3D2E).withValues(alpha: 0.85), borderRadius: BorderRadius.circular(8)),
                          child: Text(trip['status'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(trip['title'] as String, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppTheme.textDark)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.timer_outlined, size: 13, color: AppTheme.forestGreen),
                          const SizedBox(width: 4),
                          Text(trip['duration'] as String, style: const TextStyle(fontSize: 11, color: AppTheme.mutedText)),
                          const SizedBox(width: 12),
                          const Icon(Icons.account_balance_wallet_outlined, size: 13, color: AppTheme.forestGreen),
                          const SizedBox(width: 4),
                          Text(trip['budget'] as String, style: const TextStyle(fontSize: 11, color: AppTheme.mutedText, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Route: ${trip['stops']}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                if (trip['raw'] != null) {
                                  Navigator.push(context, MaterialPageRoute(builder: (_) => MyTripScreen(savedTrip: trip['raw'] as Map<String, dynamic>)));
                                } else {
                                  Navigator.push(context, MaterialPageRoute(builder: (_) => const MyTripScreen()));
                                }
                              },
                              icon: const Icon(Icons.map, size: 14),
                              label: const Text('View Route Map', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppTheme.forestGreen,
                                side: const BorderSide(color: AppTheme.forestGreen),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => TripPlannerScreen(
                                      initialDestination: trip['stops'] as String,
                                    ),
                                  ),
                                );
                              },
                              icon: const Icon(Icons.edit, size: 14),
                              label: const Text('Modify Days', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.forestGreen,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
          ),
      ],
    );
  }

  // ── Tab 2: Saved Mountain Wishlist ─────────────────────────────────
  Widget _buildWishlistTab(BuildContext context) {
    if (_isLoadingData) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen));
    }

    return ListView(
      children: [
        const Text('Saved Himalayan Destinations & Stays', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark)),
        const SizedBox(height: 10),
        for (final dest in _savedDestinations)
          Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: CachedNetworkImage(
                    imageUrl: dest.imageUrl,
                    width: 70,
                    height: 70,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(dest.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark)),
                      const SizedBox(height: 2),
                      Text('${dest.district} • ${dest.altitude}m', style: const TextStyle(fontSize: 10, color: AppTheme.forestGreen, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 12),
                          const SizedBox(width: 2),
                          Text('${dest.rating}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          const Spacer(),
                          InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => DestinationDetailScreen(destination: dest)),
                              );
                            },
                            child: const Text('Explore →', style: TextStyle(color: AppTheme.forestGreen, fontWeight: FontWeight.w900, fontSize: 11)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        if (_savedStays.isNotEmpty) ...[
          const SizedBox(height: 8),
          const Text('Verified Homestays in Wishlist', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark)),
          const SizedBox(height: 8),
          for (final stay in _savedStays)
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: CachedNetworkImage(
                      imageUrl: stay.imageUrl,
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(stay.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark)),
                        const SizedBox(height: 2),
                        Text('${stay.location} • ₹${stay.pricePerNight}/night', style: const TextStyle(fontSize: 10, color: AppTheme.forestGreen, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.verified, color: AppTheme.forestGreen, size: 12),
                            const SizedBox(width: 2),
                            const Text('KMVN Certified', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.forestGreen)),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(6)),
                              child: const Text('Booked Pass Active', style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 9, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ],
    );
  }

  // ── Tab 3: Escrow Vouchers & Passes ────────────────────────────────
  Widget _buildVouchersTab(BuildContext context) {
    if (_myBookings.isNotEmpty) {
      return ListView(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('My Verified Bookings (${_myBookings.length})', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(8)),
                child: const Text('IMMUTABLE SNAPSHOT', style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 9, fontWeight: FontWeight.w900)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          for (final b in _myBookings)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              (b['title'] ?? b['item']?['name'] ?? b['type'] ?? 'Himalayan Booking').toString(),
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              'Type: ${(b['bookingType'] ?? b['type'] ?? 'Stay/Rental').toString().toUpperCase()} • Guests: ${b['guests'] ?? 1}',
                              style: const TextStyle(fontSize: 10, color: AppTheme.mutedText),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: ((b['status']?.toString().toUpperCase() == 'CONFIRMED') || (b['status'] == null))
                              ? const Color(0xFFE8F5E9)
                              : const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          (b['status'] ?? 'CONFIRMED').toString().toUpperCase(),
                          style: TextStyle(
                            color: ((b['status']?.toString().toUpperCase() == 'CONFIRMED') || (b['status'] == null))
                                ? const Color(0xFF0F3D2E)
                                : const Color(0xFFD97706),
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.qr_code_2, size: 40, color: AppTheme.textDark),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ref: #${b['bookingReference'] ?? (b['_id'] != null ? b['_id'].toString().substring(0, 8).toUpperCase() : 'UT-BK-9182')}',
                              style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 11),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Total Amount: ₹${b['totalPrice'] ?? b['amount'] ?? '2,400'} (Zero Brokerage Escrow)',
                              style: const TextStyle(fontSize: 10, color: AppTheme.forestGreen, fontWeight: FontWeight.bold),
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
      );
    }

    return ListView(
      children: [
        const Text('Cryptographically Signed Passes', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Royal Enfield Himalayan 450', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                      Text('Rishikesh to Kedarnath Base • 3 Days', style: TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(8)),
                    child: const Text('ESCROW LOCKED', style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 9, fontWeight: FontWeight.w900)),
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.qr_code, size: 48, color: AppTheme.textDark),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Pass #ESCROW-UT-9842', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 11)),
                        SizedBox(height: 2),
                        Text('100% Refundable Escrow protection active against snow closures.', style: TextStyle(fontSize: 9, color: AppTheme.mutedText)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutScreen())),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.forestGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('View Full Escrow Pass', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Tab 4: Mountain Admin & Partner Command Center ─────────────────
  Widget _buildAdminHubTab(BuildContext context, AuthProvider auth) {
    final isAdmin = auth.isAdmin;
    final isPartner = auth.isPartner;

    return ListView(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              isAdmin
                  ? '🏛️ Government Admin Command Hub'
                  : (isPartner ? '🏢 Verified Mountain Partner Hub' : '🏢 Partner & Admin Gateway'),
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.textDark),
            ),
            TextButton(
              onPressed: () => _showRoleSwitchModal(context, auth),
              child: const Text('Switch Role', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.forestGreen)),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Live Platform KPIs
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.8,
          children: [
            _buildKpiCard('42 Partners', 'Verified KYC Status', Icons.verified_user, const Color(0xFF0F3D2E)),
            _buildKpiCard('68 Vehicles', 'GPS Live Fleet', Icons.motorcycle, const Color(0xFF059669)),
            _buildKpiCard('₹2,48,000', 'Escrow Vault Pool', Icons.shield, const Color(0xFFD97706)),
            _buildKpiCard('0 Alerts', 'Corridor Road Clear', Icons.cloud_done, const Color(0xFF0284C7)),
          ],
        ),

        const SizedBox(height: 14),

        // Admin & Partner Fast Actions
        _buildAdminActionTile(
          icon: Icons.add_business,
          title: 'Register New Homestay or Bike Fleet',
          subtitle: 'Instant onboarding with geo-tagged verification',
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Partner listing onboarding form launched!'), backgroundColor: AppTheme.forestGreen),
            );
          },
        ),
        _buildAdminActionTile(
          icon: Icons.emergency,
          title: 'Broadcast Himalayan Route Advisory',
          subtitle: 'Push live snow/landslide alerts to active travelers',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen()));
          },
        ),
        _buildAdminActionTile(
          icon: Icons.security,
          title: 'Inspect Blockchain Escrow Ledger',
          subtitle: '100% auditable smart-contract dispute resolution',
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('All 14 active bookings locked in verified smart contracts.'), backgroundColor: AppTheme.forestGreen),
            );
          },
        ),
      ],
    );
  }

  Widget _buildKpiCard(String title, String subtitle, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 6),
              Text(title, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: color)),
            ],
          ),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 9, color: AppTheme.mutedText)),
        ],
      ),
    );
  }

  Widget _buildAdminActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: const Color(0xFF0F3D2E), size: 18),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF0F172A))),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8), size: 18),
        onTap: onTap,
      ),
    );
  }
}
