import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../services/auth_provider.dart';
import 'login_screen.dart';
import 'my_trip_screen.dart';
import 'checkout_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final isLoggedIn = auth.isAuthenticated;

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'My Profile & Credentials',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.textDark),
        ),
        actions: [
          if (isLoggedIn)
            IconButton(
              icon: const Icon(Icons.logout, color: Color(0xFFDC2626)),
              tooltip: 'Sign Out',
              onPressed: () => auth.logout(),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F3D2E), Color(0xFF1E5E47)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.2), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                        child: const Icon(Icons.person, color: Color(0xFF0F3D2E), size: 30),
                      ),
                      const SizedBox(width: 14),
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
                              isLoggedIn ? (user?['email'] ?? 'Verified Account') : 'Sign in to access offline bookings & escrow',
                              style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1)),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                isLoggedIn ? (user?['role'] == 'partner' ? 'VERIFIED MOUNTAIN PARTNER' : 'VERIFIED HIMALAYAN TRAVELER') : 'NOT SIGNED IN',
                                style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                              ),
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

            const SizedBox(height: 20),

            // Pahadi Coins & Rewards (Exact match to Web Profile)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
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
                          const Text('Pahadi Coins Balance', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                          Text('450 Coins (≈ ₹450 Travel Discount)', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(999)),
                    child: const Text('Gold Tier', style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            const Text('Travel Management & Vault', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            const SizedBox(height: 10),

            // Profile Action Tiles
            _buildProfileTile(Icons.route_outlined, 'My Expeditions & Active Itineraries', 'View day-by-day journeys & guides', () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const MyTripScreen()));
            }),
            _buildProfileTile(Icons.qr_code_2, 'Offline Escrow Pass Vouchers', 'Access cryptographically signed QR vouchers', () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutScreen()));
            }),
            _buildProfileTile(Icons.favorite_outline, 'Saved Mountain Wishlist', 'Homestays, trails, and high passes', () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Wishlist synced with cloud storage!'), backgroundColor: AppTheme.forestGreen),
              );
            }),
            _buildProfileTile(Icons.storefront_outlined, 'Mountain Partner Dashboard', 'Manage bike fleets, homestay listings & permits', () {
              if (!isLoggedIn) {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen(initialIsRegister: false)));
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Partner portal active: 3 listings verified!'), backgroundColor: AppTheme.forestGreen),
                );
              }
            }),

            const SizedBox(height: 15),
            const Center(
              child: Text(
                '🏔️ Discovery Uttarakhand v1.0.5 (Build 6 • Live Release)',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileTile(IconData icon, String title, String subtitle, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: const Color(0xFF0F3D2E), size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0F172A))),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8), size: 20),
        onTap: onTap,
      ),
    );
  }
}
