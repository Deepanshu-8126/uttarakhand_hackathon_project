import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/destination.dart';
import '../services/api_service.dart';
import 'destination_detail_screen.dart';
import 'checkout_screen.dart';
import 'sos_safety_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  String selectedFilter = 'All';
  String? selectedLocationId;
  bool isSatelliteMode = false;
  bool showSafetyRadar = true;
  bool showCorridors = true;

  List<Destination> destinations = [];
  List<SpiritualPlace> spirituals = [];
  List<ActivityItem> activities = [];
  bool isLoading = true;

  final List<String> categories = ['All', 'Lakes & Peaks', 'Spiritual', 'Adventures', 'High Altitude'];

  final List<Map<String, dynamic>> corridors = [
    {
      'name': 'Char Dham Sacred Corridor',
      'route': 'Haridwar -> Rishikesh -> Guptkashi -> Kedarnath -> Badrinath',
      'status': 'Clear & Open',
      'weather': '12°C Pleasant',
      'color': Color(0xFF059669),
      'safety': 'SDRF Grid Active (Every 15km)',
    },
    {
      'name': 'Kumaon Lakes & Sanctuary Belt',
      'route': 'Kathgodam -> Nainital -> Bhimtal -> Almora -> Binsar',
      'status': 'All Routes Clear',
      'weather': '18°C Mild Sunny',
      'color': Color(0xFF2563EB),
      'safety': 'Zero Landslide Risk',
    },
    {
      'name': 'Adi Kailash & Om Parvat High Pass',
      'route': 'Pithoragarh -> Dharchula -> Gunji -> Lipulekh',
      'status': 'Permit Required (>3,500m)',
      'weather': '2°C Snow Flurries',
      'color': Color(0xFFD97706),
      'safety': 'Inner Line Permit Checkpost',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadSpatialData();
  }

  Future<void> _loadSpatialData() async {
    final d = await ApiService.getDestinations();
    final s = await ApiService.getSpiritualPlaces();
    final a = await ApiService.getActivities();
    if (mounted) {
      setState(() {
        destinations = d;
        spirituals = s;
        activities = a;
        isLoading = false;
        if (destinations.isNotEmpty) {
          selectedLocationId = destinations[0].id;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    Destination? activeDest;
    if (destinations.isNotEmpty) {
      activeDest = destinations.firstWhere(
        (d) => d.id == selectedLocationId,
        orElse: () => destinations[0],
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.map_outlined, color: AppTheme.forestGreen, size: 20),
            SizedBox(width: 8),
            Text(
              'Spatial GIS Map & Radar',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.textDark),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(
              isSatelliteMode ? Icons.satellite_alt : Icons.layers_outlined,
              color: isSatelliteMode ? const Color(0xFF059669) : AppTheme.forestGreen,
            ),
            tooltip: 'Toggle Satellite Layer',
            onPressed: () => setState(() => isSatelliteMode = !isSatelliteMode),
          ),
          IconButton(
            icon: Icon(
              showSafetyRadar ? Icons.radar : Icons.radar_outlined,
              color: showSafetyRadar ? const Color(0xFFD97706) : const Color(0xFF64748B),
            ),
            tooltip: 'Toggle SDRF Safety Radar',
            onPressed: () => setState(() => showSafetyRadar = !showSafetyRadar),
          ),
          IconButton(
            icon: const Icon(Icons.sos, color: Color(0xFFDC2626)),
            tooltip: 'Emergency SOS',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen())),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : Stack(
              children: [
                // ── Interactive Map Canvas Simulation with Mountain Stylings ──
                Container(
                  decoration: BoxDecoration(
                    color: isSatelliteMode ? const Color(0xFF0B1914) : const Color(0xFFF1F5F9),
                  ),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Topographical Grid Lines & Mountain Elevation Relief
                      CustomPaint(
                        painter: MountainTopoPainter(isSatellite: isSatelliteMode),
                      ),

                      // Interactive Mountain Node Pins
                      if (destinations.isNotEmpty) ...[
                        _buildMapNode(destinations[0], 0.25, 0.40, 'Nainital (2,084m)', const Color(0xFF0F3D2E)),
                        if (destinations.length > 1)
                          _buildMapNode(destinations[1], 0.65, 0.22, 'Kedarnath (3,583m)', const Color(0xFFDC2626), isHighAlt: true),
                        if (destinations.length > 2)
                          _buildMapNode(destinations[2], 0.55, 0.35, 'Auli Ski Slopes (2,800m)', const Color(0xFF2563EB)),
                        if (destinations.length > 3)
                          _buildMapNode(destinations[3], 0.32, 0.60, 'Rishikesh Rafting', const Color(0xFF059669)),
                        if (destinations.length > 4)
                          _buildMapNode(destinations[4], 0.70, 0.52, 'Binsar Sanctuary', const Color(0xFF7C3AED)),
                      ],
                    ],
                  ),
                ),

                // ── Top Pill Categories ──
                Positioned(
                  top: 12,
                  left: 0,
                  right: 0,
                  child: SizedBox(
                    height: 38,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: categories.length,
                      itemBuilder: (context, idx) {
                        final cat = categories[idx];
                        final isSel = selectedFilter == cat;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: InkWell(
                            onTap: () => setState(() => selectedFilter = cat),
                            borderRadius: BorderRadius.circular(999),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSel ? const Color(0xFF0F3D2E) : Colors.white.withOpacity(0.95),
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(color: isSel ? const Color(0xFF0F3D2E) : const Color(0xFFCBD5E1)),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 6)],
                              ),
                              child: Text(
                                cat,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                                  color: isSel ? Colors.white : const Color(0xFF334155),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),

                // ── Safety Radar Strip (Live Pass Condition) ──
                if (showSafetyRadar)
                  Positioned(
                    top: 58,
                    left: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withOpacity(0.94),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF059669).withOpacity(0.4)),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 10)],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(color: Color(0xFF064E3B), shape: BoxShape.circle),
                            child: const Icon(Icons.shield_outlined, color: Color(0xFF34D399), size: 16),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('LIVE MOUNTAIN RADAR • ALL 4 CORRIDORS GREEN', style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
                                Text('SDRF Emergency Response active along Kedarnath & Badrinath routes.', style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 10)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // ── Corridors Floating Carousel ──
                if (showCorridors)
                  Positioned(
                    bottom: 230,
                    left: 0,
                    right: 0,
                    child: SizedBox(
                      height: 80,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: corridors.length,
                        itemBuilder: (context, idx) {
                          final c = corridors[idx];
                          return Container(
                            width: 260,
                            margin: const EdgeInsets.only(right: 10),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.95),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: (c['color'] as Color).withOpacity(0.3)),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        c['name'],
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: Color(0xFF0F172A)),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: (c['color'] as Color).withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        c['status'],
                                        style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: c['color'] as Color),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  c['route'],
                                  style: const TextStyle(fontSize: 9, color: Color(0xFF64748B)),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  c['safety'],
                                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Color(0xFF059669)),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                // ── Selected Mountain Hub Details Card ──
                if (activeDest != null)
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: CachedNetworkImage(
                                  imageUrl: activeDest.imageUrl,
                                  width: 65,
                                  height: 65,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          activeDest.name,
                                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: activeDest.altitude > 3000 ? const Color(0xFFFEF2F2) : const Color(0xFFECFDF5),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            '${activeDest.altitude}m',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w900,
                                              color: activeDest.altitude > 3000 ? const Color(0xFFDC2626) : const Color(0xFF059669),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${activeDest.district} • ${activeDest.region} Corridor',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.wb_sunny_outlined, size: 12, color: Color(0xFFD97706)),
                                        const SizedBox(width: 4),
                                        Text('${activeDest.bestTimeToVisit}', style: const TextStyle(fontSize: 10, color: Color(0xFF475569), fontWeight: FontWeight.w500)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => DestinationDetailScreen(destination: activeDest!)),
                                    );
                                  },
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFF0F3D2E),
                                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                  child: const Text('View Highlights', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => CheckoutScreen(
                                          itemType: 'Pass & Stay Package',
                                          itemName: '${activeDest!.name} Mountain Expedition',
                                          basePrice: activeDest.estimatedBudget,
                                        ),
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.lock_clock, size: 14),
                                  label: const Text('Escrow Book', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0F3D2E),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
    );
  }

  Widget _buildMapNode(Destination dest, double xFraction, double yFraction, String label, Color color, {bool isHighAlt = false}) {
    final isSel = selectedLocationId == dest.id;
    return Positioned(
      left: MediaQuery.of(context).size.width * xFraction,
      top: MediaQuery.of(context).size.height * yFraction,
      child: GestureDetector(
        onTap: () => setState(() => selectedLocationId = dest.id),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSel ? color : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: color, width: isSel ? 3 : 2),
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(isSel ? 0.5 : 0.25),
                    blurRadius: isSel ? 12 : 6,
                    spreadRadius: isSel ? 2 : 0,
                  ),
                ],
              ),
              child: Icon(
                isHighAlt ? Icons.terrain : Icons.location_pin,
                size: isSel ? 18 : 14,
                color: isSel ? Colors.white : color,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.95),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4)],
              ),
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: isSel ? FontWeight.w900 : FontWeight.w700,
                  color: isSel ? color : const Color(0xFF0F172A),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MountainTopoPainter extends CustomPainter {
  final bool isSatellite;
  MountainTopoPainter({required this.isSatellite});

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = isSatellite ? const Color(0xFF1E3A2E).withOpacity(0.4) : const Color(0xFFCBD5E1).withOpacity(0.5)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    // Draw topographic elevation contours
    for (double i = 50; i < size.height; i += 70) {
      final path = Path();
      path.moveTo(0, i);
      path.quadraticBezierTo(size.width * 0.25, i - 25, size.width * 0.5, i + 15);
      path.quadraticBezierTo(size.width * 0.75, i - 15, size.width, i + 5);
      canvas.drawPath(path, linePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
