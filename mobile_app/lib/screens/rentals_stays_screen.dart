import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/stay.dart';
import '../services/api_service.dart';

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
      padding: const EdgeInsets.all(16),
      itemCount: rentals.length,
      itemBuilder: (context, index) {
        final r = rentals[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: CachedNetworkImage(
                  imageUrl: r.imageUrl,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(color: AppTheme.beige),
                  errorWidget: (context, url, error) => Container(color: AppTheme.beige, child: const Icon(Icons.two_wheeler, color: AppTheme.forestGreen, size: 48)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(r.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                        ),
                        if (r.isVerified)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(999)),
                            child: const Text('Verified Partner', style: TextStyle(color: Color(0xFF065F46), fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(r.location, style: const TextStyle(color: AppTheme.mutedText, fontSize: 12)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('₹${r.pricePerDay}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.forestGreen)),
                            const Text('per day • Helmet included', style: TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                          ],
                        ),
                        ElevatedButton(
                          onPressed: () {
                            _showBookingDialog(context, r.name, '₹${r.pricePerDay}/day');
                          },
                          child: const Text('Book Now'),
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

  Widget _buildStaysTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: stays.length,
      itemBuilder: (context, index) {
        final s = stays[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: CachedNetworkImage(
                  imageUrl: s.imageUrl,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(color: AppTheme.beige),
                  errorWidget: (context, url, error) => Container(color: AppTheme.beige, child: const Icon(Icons.cottage, color: AppTheme.earthBrown, size: 48)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(s.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 16),
                            Text('${s.rating}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text('${s.location} • ${s.stayType}', style: const TextStyle(color: AppTheme.mutedText, fontSize: 12)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      children: s.amenities.map((a) {
                        return Chip(
                          label: Text(a, style: const TextStyle(fontSize: 10)),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          backgroundColor: AppTheme.beige,
                          side: BorderSide.none,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('₹${s.pricePerNight}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.earthBrown)),
                            const Text('per night • Verified Host', style: TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                          ],
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.earthBrown),
                          onPressed: () {
                            _showBookingDialog(context, s.name, '₹${s.pricePerNight}/night');
                          },
                          child: const Text('Reserve Stay'),
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
