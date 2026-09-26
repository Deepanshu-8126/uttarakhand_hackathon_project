import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
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
            Container(
              padding: const EdgeInsets.only(top: 50, bottom: 20, left: 20, right: 20),
              decoration: const BoxDecoration(
                color: Color(0xFF0F3D2E),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.terrain_rounded, color: Color(0xFF0F3D2E), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('DISCOVER', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1)),
                      Text('UTTARAKHAND', style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 10),
                children: [
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
                  const Divider(height: 20),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen()));
        },
        backgroundColor: const Color(0xFFDC2626),
        child: const Icon(Icons.sos, color: Colors.white, size: 28),
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
