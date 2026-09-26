import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/stay.dart';
import '../services/api_service.dart';
import 'verification_proof_screen.dart';
import 'sos_safety_screen.dart';

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

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text('Rentals & Stays', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.textDark)),
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
          indicatorColor: AppTheme.forestGreen,
          labelColor: AppTheme.forestGreen,
          unselectedLabelColor: AppTheme.mutedText,
          labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
          tabs: const [
            Tab(icon: Icon(Icons.two_wheeler), text: 'Rides & Bikes'),
            Tab(icon: Icon(Icons.cottage), text: 'Mountain Stays'),
          ],
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildRentalsTab(),
                _buildStaysTab(),
              ],
            ),
    );
  }

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
            borderRadius: BorderRadius.circular(28),
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
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
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

  Widget _buildStaysTab() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      itemCount: stays.length,
      itemBuilder: (context, index) {
        final s = stays[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
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
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                    child: CachedNetworkImage(
                      imageUrl: s.imageUrl,
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: const Color(0xFFF3EFE6)),
                      errorWidget: (context, url, error) => Container(
                        color: const Color(0xFFF3EFE6),
                        child: const Icon(Icons.cottage, color: Color(0xFF0F3D2E), size: 48),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
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
                          Icon(Icons.shield, size: 12, color: Color(0xFF34D399)),
                          SizedBox(width: 4),
                          Text('100% Escrow Verified Stay', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
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
                          child: Text(s.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.3)),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Color(0xFFD97706), size: 16),
                            const SizedBox(width: 2),
                            Text('${s.rating}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A))),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 13, color: Color(0xFF047857)),
                        const SizedBox(width: 4),
                        Text('${s.location} • ${s.stayType}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w500)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      children: s.amenities.map((a) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF3EFE6),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(a, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
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
                            Text('₹${s.pricePerNight}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                            const Text('per night • Verified Host', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
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
                            _showBookingDialog(context, s.name, '₹${s.pricePerNight}/night');
                          },
                          child: const Text('Reserve Stay', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
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

  void _showBookingDialog(BuildContext context, String title, String rate) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Instant Mountain Booking', style: TextStyle(color: AppTheme.mutedText, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
              Text('Rate: $rate (Escrow Protected)', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.forestGreen)),
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
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Reservation request sent for $title!')),
                    );
                  },
                  child: const Text('CONFIRM BOOKING'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
