import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

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

  final List<String> destinations = ['Nainital', 'Kedarnath', 'Rishikesh', 'Auli', 'Binsar', 'Almora'];

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
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.forestGreen,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Plan Your Uttarakhand Trip',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Tell us your budget, time and interests. We will shape the optimal mountain journey.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
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
            Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
        Text(amount, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
      ],
    );
  }
}
