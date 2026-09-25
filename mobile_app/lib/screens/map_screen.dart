import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  String selectedDestination = 'Nainital';
  bool showSafetyRadar = true;

  final List<Map<String, dynamic>> mountainPins = [
    {
      'name': 'Nainital',
      'region': 'Kumaon',
      'altitude': '2,084m',
      'weather': '18°C Clear',
      'status': 'Normal & Safe',
      'isHighAltitude': false,
    },
    {
      'name': 'Kedarnath',
      'region': 'Garhwal',
      'altitude': '3,583m',
      'weather': '4°C Cold',
      'status': 'Biometric Permit Required',
      'isHighAltitude': true,
    },
    {
      'name': 'Badrinath',
      'region': 'Garhwal',
      'altitude': '3,133m',
      'weather': '7°C Sunny',
      'status': 'Highway Open',
      'isHighAltitude': true,
    },
    {
      'name': 'Auli',
      'region': 'Garhwal',
      'altitude': '2,800m',
      'weather': '9°C Clear',
      'status': 'Ropeway Operational',
      'isHighAltitude': false,
    },
    {
      'name': 'Rishikesh',
      'region': 'Garhwal',
      'altitude': '372m',
      'weather': '26°C Clear',
      'status': 'Rafting Active',
      'isHighAltitude': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final active = mountainPins.firstWhere(
      (p) => p['name'] == selectedDestination,
      orElse: () => mountainPins[0],
    );

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text('Mountain GIS Map & Radar', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.textDark)),
        actions: [
          IconButton(
            icon: Icon(showSafetyRadar ? Icons.shield : Icons.shield_outlined, color: AppTheme.amberWarning),
            onPressed: () => setState(() => showSafetyRadar = !showSafetyRadar),
          ),
        ],
      ),
      body: Stack(
        children: [
          // ── Mountain Terrain Background Simulation ────────────────
          Container(
            color: const Color(0xFFE2E8F0),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 70, color: Colors.blueGrey.withOpacity(0.3)),
                  const SizedBox(height: 8),
                  Text(
                    'Interactive Uttarakhand Spatial Map',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.blueGrey.withOpacity(0.7)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Select a mountain hub below to inspect ground conditions',
                    style: TextStyle(fontSize: 11, color: Colors.blueGrey.withOpacity(0.6)),
                  ),
                ],
              ),
            ),
          ),

          // ── Horizontal Hub Selector ───────────────────────────────
          Positioned(
            top: 16,
            left: 0,
            right: 0,
            child: SizedBox(
              height: 44,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: mountainPins.length,
                itemBuilder: (context, index) {
                  final pin = mountainPins[index];
                  final isSelected = selectedDestination == pin['name'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.location_on, size: 14, color: isSelected ? Colors.white : AppTheme.forestGreen),
                          const SizedBox(width: 4),
                          Text(pin['name']),
                        ],
                      ),
                      selected: isSelected,
                      selectedColor: AppTheme.forestGreen,
                      backgroundColor: Colors.white,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppTheme.textDark,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                      onSelected: (_) => setState(() => selectedDestination = pin['name']),
                    ),
                  );
                },
              ),
            ),
          ),

          // ── Safety Radar Drawer ───────────────────────────────────
          if (showSafetyRadar)
            Positioned(
              top: 70,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10)],
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: AppTheme.amberWarning, size: 24),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Monsoon & Landslide Guard Active', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: Color(0xFF92400E))),
                          Text('Joshimath - Badrinath stretch is currently clear for daylight traffic.', style: TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // ── Bottom Selected Hub Card ──────────────────────────────
          Positioned(
            bottom: 20,
            left: 16,
            right: 16,
            child: Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              elevation: 6,
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(active['name'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: active['isHighAltitude'] ? const Color(0xFFFEE2E2) : const Color(0xFFD1FAE5),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            active['isHighAltitude'] ? 'High Altitude Guard' : 'Valley Transit',
                            style: TextStyle(
                              color: active['isHighAltitude'] ? const Color(0xFF991B1B) : const Color(0xFF065F46),
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text('${active['region']} Region • Elevation: ${active['altitude']}', style: const TextStyle(fontSize: 12, color: AppTheme.mutedText)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildInfoTag(Icons.cloud, active['weather']),
                        const SizedBox(width: 10),
                        _buildInfoTag(Icons.check_circle_outline, active['status']),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.navigation, size: 16),
                        label: Text('Plan Route to ${active['name']}'),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Calculating mountain route to ${active['name']}...')),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTag(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: AppTheme.beige, borderRadius: BorderRadius.circular(10)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppTheme.forestGreen),
          const SizedBox(width: 6),
          Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
