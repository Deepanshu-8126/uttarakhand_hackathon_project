import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../services/auth_provider.dart';
import 'home_screen.dart';
import 'rentals_stays_screen.dart';
import 'spiritual_screen.dart';
import 'culture_screen.dart';
import 'activities_screen.dart';
import 'guides_screen.dart';
import 'map_screen.dart';
import 'trip_planner_screen.dart';
import 'ai_copilot_screen.dart';
import 'innovation_showcase_screen.dart';
import 'sos_safety_screen.dart';
import 'my_trip_screen.dart';
import 'checkout_screen.dart';
import 'profile_screen.dart';
import 'login_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  void _onTabChanged(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final isLoggedIn = auth.isAuthenticated;

    final screens = [
      HomeScreen(onNavigateTab: _onTabChanged),
      const RentalsStaysScreen(),
      const MapScreen(),
      const TripPlannerScreen(),
      const AiCopilotScreen(),
      const InnovationShowcaseScreen(),
    ];

    return Scaffold(
      drawer: Drawer(
        backgroundColor: AppTheme.cream,
        child: Column(
          children: [
            // User Header in Drawer
            Container(
              padding: const EdgeInsets.only(top: 50, bottom: 20, left: 20, right: 20),
              decoration: const BoxDecoration(
                color: Color(0xFF0F3D2E),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person, color: Color(0xFF0F3D2E), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isLoggedIn ? (user?['name'] ?? 'Pahadi Explorer') : 'Guest Explorer',
                          style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          isLoggedIn ? (user?['email'] ?? 'Verified Member') : 'Tap to Sign In / Register',
                          style: const TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.w700),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildDrawerItem(Icons.account_circle_outlined, isLoggedIn ? 'My Profile & Pahadi Wallet' : 'Sign In / Register', () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => isLoggedIn ? const ProfileScreen() : const LoginScreen()),
                    );
                  }),
                  const Divider(height: 16),
                  _buildDrawerItem(Icons.explore_outlined, 'Explore Valleys & Peaks', () {
                    Navigator.pop(context);
                    _onTabChanged(0);
                  }),
                  _buildDrawerItem(Icons.temple_hindu_outlined, 'Spiritual & Sacred Shrines', () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const SpiritualScreen()));
                  }),
                  _buildDrawerItem(Icons.palette_outlined, 'Culture, Art & Heritage', () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const CultureScreen()));
                  }),
                  _buildDrawerItem(Icons.kayaking_outlined, 'Mountain Adventures & Activities', () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ActivitiesScreen()));
                  }),
                  _buildDrawerItem(Icons.two_wheeler_outlined, 'Rentals & Mountain Stays', () {
                    Navigator.pop(context);
                    _onTabChanged(1);
                  }),
                  _buildDrawerItem(Icons.person_pin_outlined, 'Meet Local Mountain Guides', () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const GuidesScreen()));
                  }),
                  _buildDrawerItem(Icons.map_outlined, 'Interactive GIS Map & Radar', () {
                    Navigator.pop(context);
                    _onTabChanged(2);
                  }),
                  _buildDrawerItem(Icons.luggage_outlined, 'AI Trip Planner', () {
                    Navigator.pop(context);
                    _onTabChanged(3);
                  }),
                  _buildDrawerItem(Icons.auto_awesome_outlined, 'Devbhoomi AI Copilot', () {
                    Navigator.pop(context);
                    _onTabChanged(4);
                  }),
                  _buildDrawerItem(Icons.stars_outlined, 'Intelligent Tech Showcase', () {
                    Navigator.pop(context);
                    _onTabChanged(5);
                  }),
                  const Divider(height: 16),
                  _buildDrawerItem(Icons.route_outlined, 'My Expeditions & Itinerary', () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const MyTripScreen()));
                  }),
                  _buildDrawerItem(Icons.shopping_bag_outlined, 'Escrow Checkout & Pass Vault', () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutScreen()));
                  }),
                  _buildDrawerItem(Icons.emergency_outlined, 'Emergency SOS & Mountain Mesh', () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen()));
                  }, isDanger: true),
                ],
              ),
            ),
          ],
        ),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE2E8F0), width: 1)),
        ),
        child: SafeArea(
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: _onTabChanged,
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,
            selectedItemColor: const Color(0xFF0F3D2E),
            unselectedItemColor: const Color(0xFF64748B),
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: -0.2),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 10),
            elevation: 0,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.explore_outlined, size: 20),
                activeIcon: Icon(Icons.explore, size: 20),
                label: 'Explore',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.two_wheeler_outlined, size: 20),
                activeIcon: Icon(Icons.two_wheeler, size: 20),
                label: 'Rentals',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.map_outlined, size: 20),
                activeIcon: Icon(Icons.map, size: 20),
                label: 'GIS Map',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.luggage_outlined, size: 20),
                activeIcon: Icon(Icons.luggage, size: 20),
                label: 'Plan Trip',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.auto_awesome_outlined, size: 20),
                activeIcon: Icon(Icons.auto_awesome, size: 20),
                label: 'AI Copilot',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.stars_outlined, size: 20),
                activeIcon: Icon(Icons.stars, size: 20),
                label: 'Tech Suite',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap, {bool isDanger = false}) {
    return ListTile(
      leading: Icon(icon, color: isDanger ? const Color(0xFFDC2626) : const Color(0xFF0F3D2E), size: 20),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 13,
          fontWeight: isDanger ? FontWeight.w900 : FontWeight.w700,
          color: isDanger ? const Color(0xFFDC2626) : const Color(0xFF0F172A),
        ),
      ),
      onTap: onTap,
    );
  }
}
