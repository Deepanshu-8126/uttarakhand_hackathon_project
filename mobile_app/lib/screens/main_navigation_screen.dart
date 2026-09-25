import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import 'rentals_stays_screen.dart';
import 'map_screen.dart';
import 'trip_planner_screen.dart';
import 'ai_copilot_screen.dart';
import 'web_experience_screen.dart';

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
      const WebExperienceScreen(),
    ];

    return Scaffold(
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
                icon: Icon(Icons.language_outlined, size: 20),
                activeIcon: Icon(Icons.language, size: 20),
                label: 'Web Live',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
