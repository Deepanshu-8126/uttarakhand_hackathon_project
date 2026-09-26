import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import 'sos_safety_screen.dart';

class TripPlannerScreen extends StatefulWidget {
  const TripPlannerScreen({super.key});

  @override
  State<TripPlannerScreen> createState() => _TripPlannerScreenState();
}

class _TripPlannerScreenState extends State<TripPlannerScreen> {
  String selectedDestination = 'Nainital';
  double budget = 5000;
  int durationDays = 3;
  int travelers = 2;
  String travelStyle = 'Balanced';

  final List<String> destinations = [
    'Nainital',
    'Kedarnath',
    'Badrinath',
    'Valley of Flowers',
    'Auli',
    'Rishikesh',
    'Chopta & Tungnath',
    'Munsiyari',
    'Jim Corbett',
    'Haridwar',
    'Adi Kailash',
    'Jageshwar Dham',
    'Mussoorie',
    'Dhanaulti',
    'Gangotri',
    'Yamunotri',
    'Almora',
    'Kausani',
    'Ranikhet',
    'Mukteshwar',
    'Tehri Lake',
    'Dayara Bugyal',
    'Kedarkantha',
    'Binsar',
  ];

  @override
  Widget build(BuildContext context) {
    // Budget Allocator calculations
    final stayCost = (budget * 0.40).round();
    final foodCost = (budget * 0.25).round();
    final rideCost = (budget * 0.20).round();
    final emergencyCost = (budget * 0.15).round();

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text('AI Trip Planner', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.textDark)),
        actions: [
          IconButton(
            icon: const Icon(Icons.sos, color: Color(0xFFDC2626)),
            tooltip: 'Emergency SOS',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen())),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Rich Himalayan Mountain Hero Banner
            Container(
              height: 140,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.16), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CachedNetworkImage(
                      imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Trisul_peak_from_bedni_bugyal.jpg/1920px-Trisul_peak_from_bedni_bugyal.jpg',
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: const Color(0xFF0F3D2E)),
                      errorWidget: (context, url, error) => Container(color: const Color(0xFF0F3D2E)),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            const Color(0xFF09261C).withOpacity(0.92),
                            const Color(0xFF09261C).withOpacity(0.40),
                          ],
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF059669).withOpacity(0.9),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              'AI EXPEDITION OPTIMIZER',
                              style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Plan Your Uttarakhand Journey',
                            style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900, letterSpacing: -0.3),
                          ),
                          const Text(
                            'AI-balanced budget, verified stays, mountain routes & emergency buffer.',
                            style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // 1. Destination Selection
            const Text('Where do you want to go?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textDark)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: selectedDestination,
                  isExpanded: true,
                  items: destinations.map((d) {
                    return DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontWeight: FontWeight.bold)));
                  }).toList(),
                  onChanged: (val) => setState(() => selectedDestination = val ?? 'Nainital'),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // 2. Budget Slider
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total Budget', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textDark)),
                Text('₹${budget.round()}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.forestGreen)),
              ],
            ),
            Slider(
              value: budget,
              min: 2000,
              max: 30000,
              divisions: 28,
              activeColor: AppTheme.forestGreen,
              inactiveColor: AppTheme.beige,
              onChanged: (val) => setState(() => budget = val),
            ),

            const SizedBox(height: 16),

            // 3. Duration & Travelers
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Duration', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: AppTheme.forestGreen),
                            onPressed: () => setState(() => durationDays = durationDays > 1 ? durationDays - 1 : 1),
                          ),
                          Text('$durationDays Days', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: AppTheme.forestGreen),
                            onPressed: () => setState(() => durationDays = durationDays + 1),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Travelers', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: AppTheme.forestGreen),
                            onPressed: () => setState(() => travelers = travelers > 1 ? travelers - 1 : 1),
                          ),
                          Text('$travelers People', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: AppTheme.forestGreen),
                            onPressed: () => setState(() => travelers = travelers + 1),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // 4. Budget Breakdown Box
            const Text('Estimated Cost Breakdown', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textDark)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: Column(
                children: [
                  _buildCostRow('Stay & Homestay (40%)', '₹$stayCost', Icons.hotel, AppTheme.earthBrown),
                  const Divider(),
                  _buildCostRow('Pahadi Meals & Food (25%)', '₹$foodCost', Icons.restaurant, Colors.orange),
                  const Divider(),
                  _buildCostRow('Scooter/Bike Rental (20%)', '₹$rideCost', Icons.two_wheeler, AppTheme.forestGreen),
                  const Divider(),
                  _buildCostRow('Emergency Buffer (15%)', '₹$emergencyCost', Icons.shield, Colors.blueGrey),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Generate Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.forestGreen,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: Text('$durationDays-Day $selectedDestination Plan Ready!'),
                      content: Text(
                        'Day 1: Arrival & Local Exploration\nDay 2: Scenic Mountain Trail & Boating\nDay 3: Sunset Vantage & Heritage Market\n\nTotal Estimated: ₹${budget.round()}',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('CLOSE'),
                        ),
                      ],
                    ),
                  );
                },
                child: const Text('GENERATE SMART ITINERARY'),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildCostRow(String title, String amount, IconData icon, Color iconColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: iconColor),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
          ],
        ),
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            amount,
            maxLines: 1,
            softWrap: false,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
          ),
        ),
      ],
    );
  }
}
