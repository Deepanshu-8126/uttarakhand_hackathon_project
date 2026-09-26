import 'dart:math' as math;
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

class _MapScreenState extends State<MapScreen> with SingleTickerProviderStateMixin {
  final TransformationController _transformController = TransformationController();
  final TextEditingController _searchController = TextEditingController();

  String selectedFilter = 'All';
  String? selectedLocationId;
  bool isSatelliteMode = false;
  bool showSafetyRadarLayer = true;
  bool showCorridorsLayer = true;
  String searchQuery = '';

  List<Destination> destinations = [];
  List<SpiritualPlace> spirituals = [];
  List<ActivityItem> activities = [];
  bool isLoading = true;

  final List<String> categories = ['All', 'Spiritual', 'High Altitude', 'Lakes & Treks', 'Nature'];

  // Uttarakhand Topo Canvas Coordinates Boundary
  // Canvas Logical Dimensions
  static const double canvasWidth = 1100.0;
  static const double canvasHeight = 900.0;

  // Approximate Uttarakhand Bounding Box
  static const double minLng = 77.4;
  static const double maxLng = 81.2;
  static const double minLat = 28.7;
  static const double maxLat = 31.5;

  final List<Map<String, dynamic>> corridors = [
    {
      'id': 'chardham',
      'name': 'Char Dham Sacred Corridor',
      'route': 'Haridwar → Rishikesh → Guptkashi → Kedarnath → Badrinath',
      'status': 'Clear & Open',
      'weather': '12°C Pleasant',
      'color': const Color(0xFF059669),
      'safety': 'SDRF Patrol Grid Active (Every 15km)',
      'distance': '719 km',
      'duration': '18h 30m',
    },
    {
      'id': 'kumaon',
      'name': 'Kumaon Lakes & Wildlife Belt',
      'route': 'Kathgodam → Nainital → Bhimtal → Almora → Binsar',
      'status': 'All Routes Clear',
      'weather': '18°C Mild Sunny',
      'color': const Color(0xFF2563EB),
      'safety': 'Zero Landslide Risk Reported',
      'distance': '248 km',
      'duration': '6h 15m',
    },
    {
      'id': 'adikailash',
      'name': 'Adi Kailash & Om Parvat High Pass',
      'route': 'Pithoragarh → Dharchula → Gunji → Lipulekh',
      'status': 'Permit Required (>3,500m)',
      'weather': '2°C Snow Flurries',
      'color': const Color(0xFFD97706),
      'safety': 'ITBP & SDRF Checkpost Operational',
      'distance': '330 km',
      'duration': '11h 45m',
    },
    {
      'id': 'valley',
      'name': 'Hemkund & Valley of Flowers Trek',
      'route': 'Govindghat → Ghangaria → Valley of Flowers → Hemkund',
      'status': 'Open for Pilgrims',
      'weather': '8°C Crisp Alpine',
      'color': const Color(0xFF7C3AED),
      'safety': 'Helicopter Shuttle Available at Govindghat',
      'distance': '38 km Trek',
      'duration': '2 Days',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadSpatialData();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _centerUttarakhand();
    });
  }

  @override
  void dispose() {
    _transformController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _centerUttarakhand() {
    final size = MediaQuery.of(context).size;
    const double initialScale = 0.85;
    final double dx = (size.width - (canvasWidth * initialScale)) / 2;
    final double dy = (size.height - (canvasHeight * initialScale)) / 2 - 40;

    _transformController.value = Matrix4.identity()
      ..translate(dx, dy)
      ..scale(initialScale);
  }

  void _zoomIn() {
    final matrix = _transformController.value.clone();
    matrix.scale(1.25, 1.25);
    _transformController.value = matrix;
  }

  void _zoomOut() {
    final matrix = _transformController.value.clone();
    matrix.scale(0.8, 0.8);
    _transformController.value = matrix;
  }

  Future<void> _loadSpatialData() async {
    try {
      final d = await ApiService.getDestinations();
      final s = await ApiService.getSpiritualPlaces();
      final a = await ApiService.getActivities();
      if (mounted) {
        setState(() {
          destinations = d;
          spirituals = s;
          activities = a;
          isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  // Filtered destinations based on category and search
  List<Destination> get _filteredDestinations {
    return destinations.where((d) {
      final matchesSearch = searchQuery.isEmpty ||
          d.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          d.district.toLowerCase().contains(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (selectedFilter) {
        case 'Spiritual':
          return d.category.toLowerCase().contains('spiritual') ||
              d.name.toLowerCase().contains('temple') ||
              d.name.toLowerCase().contains('dham') ||
              d.name.toLowerCase().contains('kedar') ||
              d.name.toLowerCase().contains('badri');
        case 'High Altitude':
          return d.altitude >= 3000;
        case 'Lakes & Treks':
          return d.category.toLowerCase().contains('lake') ||
              d.category.toLowerCase().contains('trek') ||
              d.name.toLowerCase().contains('lake') ||
              d.name.toLowerCase().contains('tal') ||
              d.name.toLowerCase().contains('bugyal');
        case 'Nature':
          return d.category.toLowerCase().contains('nature') ||
              d.category.toLowerCase().contains('wildlife') ||
              d.category.toLowerCase().contains('sanctuary');
        default:
          return true;
      }
    }).toList();
  }

  // Map destination coordinates to canvas space
  Offset _getCanvasPosition(Destination dest) {
    double lat = dest.latitude ?? _fallbackLatForDistrict(dest.district, dest.name);
    double lng = dest.longitude ?? _fallbackLngForDistrict(dest.district, dest.name);

    lat = lat.clamp(minLat, maxLat);
    lng = lng.clamp(minLng, maxLng);

    final double xRatio = (lng - minLng) / (maxLng - minLng);
    final double yRatio = (maxLat - lat) / (maxLat - minLat);

    // Padding inset within canvas
    const double padX = 70.0;
    const double padY = 70.0;
    final double usableW = canvasWidth - (padX * 2);
    final double usableH = canvasHeight - (padY * 2);

    return Offset(padX + (xRatio * usableW), padY + (yRatio * usableH));
  }

  double _fallbackLatForDistrict(String district, String name) {
    final d = district.toLowerCase();
    final hashJitter = (name.hashCode % 100) / 700.0 - 0.07;
    if (d.contains('rudraprayag')) return 30.7333 + hashJitter;
    if (d.contains('chamoli')) return 30.5560 + hashJitter;
    if (d.contains('uttarkashi')) return 30.7248 + hashJitter;
    if (d.contains('dehradun')) return 30.3165 + hashJitter;
    if (d.contains('haridwar')) return 29.9457 + hashJitter;
    if (d.contains('nainital')) return 29.3919 + hashJitter;
    if (d.contains('almora')) return 29.5971 + hashJitter;
    if (d.contains('pithoragarh')) return 29.5829 + hashJitter;
    if (d.contains('bageshwar')) return 29.8447 + hashJitter;
    if (d.contains('tehri')) return 30.3800 + hashJitter;
    if (d.contains('pauri')) return 29.8378 + hashJitter;
    if (d.contains('champawat')) return 29.3333 + hashJitter;
    return 30.0869 + hashJitter;
  }

  double _fallbackLngForDistrict(String district, String name) {
    final d = district.toLowerCase();
    final hashJitter = (name.hashCode % 100) / 700.0 - 0.07;
    if (d.contains('rudraprayag')) return 79.0667 + hashJitter;
    if (d.contains('chamoli')) return 79.5660 + hashJitter;
    if (d.contains('uttarkashi')) return 78.4464 + hashJitter;
    if (d.contains('dehradun')) return 78.0322 + hashJitter;
    if (d.contains('haridwar')) return 78.1642 + hashJitter;
    if (d.contains('nainital')) return 79.4542 + hashJitter;
    if (d.contains('almora')) return 79.6591 + hashJitter;
    if (d.contains('pithoragarh')) return 80.2182 + hashJitter;
    if (d.contains('bageshwar')) return 79.5969 + hashJitter;
    if (d.contains('tehri')) return 78.4800 + hashJitter;
    if (d.contains('pauri')) return 78.6818 + hashJitter;
    if (d.contains('champawat')) return 80.1000 + hashJitter;
    return 78.2676 + hashJitter;
  }

  Color _getNodeColor(Destination dest) {
    if (dest.altitude >= 3000) return const Color(0xFFDC2626); // Crimson High Altitude
    final cat = dest.category.toLowerCase();
    if (cat.contains('spiritual') || dest.name.toLowerCase().contains('temple') || dest.name.toLowerCase().contains('dham')) {
      return const Color(0xFFD97706); // Amber Spiritual
    }
    if (cat.contains('lake') || cat.contains('water') || cat.contains('river')) {
      return const Color(0xFF2563EB); // Blue Water
    }
    if (cat.contains('trek') || cat.contains('adventure')) {
      return const Color(0xFF0284C7); // Sky Adventure
    }
    return const Color(0xFF0F3D2E); // Brand Emerald
  }

  IconData _getNodeIcon(Destination dest) {
    if (dest.altitude >= 3000) return Icons.terrain;
    final cat = dest.category.toLowerCase();
    if (cat.contains('spiritual') || dest.name.toLowerCase().contains('temple') || dest.name.toLowerCase().contains('dham')) {
      return Icons.wb_twilight;
    }
    if (cat.contains('lake') || cat.contains('water')) {
      return Icons.water_drop_outlined;
    }
    if (cat.contains('trek') || cat.contains('adventure')) {
      return Icons.hiking;
    }
    return Icons.landscape;
  }

  // Focus on a specific destination
  void _focusOnDestination(Destination dest) {
    setState(() => selectedLocationId = dest.id);
    final pos = _getCanvasPosition(dest);
    final size = MediaQuery.of(context).size;
    const double scale = 1.35;
    final double dx = (size.width / 2) - (pos.dx * scale);
    final double dy = (size.height / 2) - (pos.dy * scale) - 60;

    _transformController.value = Matrix4.identity()
      ..translate(dx, dy)
      ..scale(scale);
  }

  @override
  Widget build(BuildContext context) {
    Destination? activeDest;
    if (selectedLocationId != null) {
      activeDest = destinations.firstWhere(
        (d) => d.id == selectedLocationId,
        orElse: () => destinations.isNotEmpty ? destinations[0] : Destination(
          id: '',
          name: '',
          district: '',
          region: '',
          category: '',
          description: '',
          shortDescription: '',
          imageUrl: '',
          rating: 4.8,
          reviewsCount: 0,
          estimatedBudget: 3500,
          altitude: 2000,
          bestTimeToVisit: 'Year-round',
          highlights: [],
          experiences: [],
        ),
      );
    }

    final visiblePlaces = _filteredDestinations;

    return Scaffold(
      backgroundColor: isSatelliteMode ? const Color(0xFF06140E) : const Color(0xFFF6F8F6),
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Stack(
          children: [
            // ── 1. Infinite Canvas Alpine Topographic Map ──
            Positioned.fill(
              child: GestureDetector(
                onTap: () {
                  if (selectedLocationId != null) {
                    setState(() => selectedLocationId = null);
                  }
                },
                child: InteractiveViewer(
                  transformationController: _transformController,
                  minScale: 0.55,
                  maxScale: 3.5,
                  boundaryMargin: const EdgeInsets.all(500),
                  child: SizedBox(
                    width: canvasWidth,
                    height: canvasHeight,
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        // Topographic Contours, Mountain Peaks, Rivers, Corridors
                        CustomPaint(
                          size: const Size(canvasWidth, canvasHeight),
                          painter: AlpineUttarakhandTopoPainter(
                            isSatellite: isSatelliteMode,
                            showCorridors: showCorridorsLayer,
                            showRadar: showSafetyRadarLayer,
                          ),
                        ),

                        // Destination Markers
                        if (!isLoading)
                          ...visiblePlaces.map((dest) {
                            final pos = _getCanvasPosition(dest);
                            final isSel = selectedLocationId == dest.id;
                            final color = _getNodeColor(dest);
                            final icon = _getNodeIcon(dest);

                            return Positioned(
                              left: pos.dx - (isSel ? 24 : 18),
                              top: pos.dy - (isSel ? 24 : 18),
                              child: GestureDetector(
                                onTap: () => _focusOnDestination(dest),
                                child: _buildMarkerWidget(dest, isSel, color, icon),
                              ),
                            );
                          }),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ── 2. Top Sleek Alpine Search & Filter Bar (Zero-Squish HUD) ──
            Positioned(
              top: 10,
              left: 14,
              right: 14,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Clean Glassmorphic Search Bar
                  Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: isSatelliteMode
                          ? const Color(0xFF0F241A).withOpacity(0.94)
                          : Colors.white.withOpacity(0.96),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFE2E8F0),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(isSatelliteMode ? 0.35 : 0.08),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.search_rounded,
                          size: 20,
                          color: isSatelliteMode ? const Color(0xFF34D399) : const Color(0xFF0F3D2E),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: isSatelliteMode ? Colors.white : const Color(0xFF0F172A),
                            ),
                            decoration: InputDecoration(
                              hintText: 'Search 129+ Uttarakhand places, peaks, valleys...',
                              hintStyle: TextStyle(
                                fontSize: 12,
                                color: isSatelliteMode ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                              ),
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                            onChanged: (val) => setState(() => searchQuery = val),
                          ),
                        ),
                        if (searchQuery.isNotEmpty)
                          IconButton(
                            icon: const Icon(Icons.close, size: 16),
                            color: const Color(0xFF64748B),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => searchQuery = '');
                            },
                          ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isSatelliteMode
                                ? const Color(0xFF064E3B)
                                : const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isSatelliteMode
                                  ? const Color(0xFF059669).withOpacity(0.5)
                                  : const Color(0xFFA7F3D0),
                            ),
                          ),
                          child: Text(
                            '${visiblePlaces.length} PIN${visiblePlaces.length == 1 ? '' : 'S'}',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: isSatelliteMode ? const Color(0xFF34D399) : const Color(0xFF065F46),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Horizontal Category Pills
                  SizedBox(
                    height: 34,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, idx) {
                        final cat = categories[idx];
                        final isSel = selectedFilter == cat;
                        return InkWell(
                          onTap: () => setState(() => selectedFilter = cat),
                          borderRadius: BorderRadius.circular(999),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: isSel
                                  ? const Color(0xFF0F3D2E)
                                  : (isSatelliteMode
                                      ? const Color(0xFF0E2218).withOpacity(0.9)
                                      : Colors.white.withOpacity(0.92)),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                color: isSel
                                    ? const Color(0xFF0F3D2E)
                                    : (isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFCBD5E1)),
                                width: 1.1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(isSel ? 0.15 : 0.04),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                cat,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                                  color: isSel
                                      ? Colors.white
                                      : (isSatelliteMode ? const Color(0xFF94A3B8) : const Color(0xFF334155)),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // ── 3. Right Floating Alpine Tools Dock (Vertical Column) ──
            Positioned(
              right: 14,
              top: 115,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Layer Switcher: Topo / Satellite
                  _buildFloatingToolButton(
                    icon: isSatelliteMode ? Icons.satellite_alt_rounded : Icons.terrain_rounded,
                    tooltip: isSatelliteMode ? 'Switch to Alpine Topo' : 'Switch to Satellite Dark',
                    isActive: isSatelliteMode,
                    activeColor: const Color(0xFF10B981),
                    onTap: () => setState(() => isSatelliteMode = !isSatelliteMode),
                  ),
                  const SizedBox(height: 8),

                  // SDRF Safety Radar Trigger
                  _buildFloatingToolButton(
                    icon: Icons.radar_rounded,
                    tooltip: 'SDRF Mountain Radar',
                    isActive: showSafetyRadarLayer,
                    activeColor: const Color(0xFFF59E0B),
                    badge: true,
                    onTap: _showRadarBottomSheet,
                  ),
                  const SizedBox(height: 8),

                  // Himalayan Corridors Sheet Trigger
                  _buildFloatingToolButton(
                    icon: Icons.alt_route_rounded,
                    tooltip: 'Himalayan Transit Corridors',
                    isActive: showCorridorsLayer,
                    activeColor: const Color(0xFF3B82F6),
                    onTap: _showCorridorsBottomSheet,
                  ),
                  const SizedBox(height: 12),

                  // Zoom In Button
                  _buildFloatingToolButton(
                    icon: Icons.add_rounded,
                    tooltip: 'Zoom In',
                    onTap: _zoomIn,
                  ),
                  const SizedBox(height: 8),

                  // Zoom Out Button
                  _buildFloatingToolButton(
                    icon: Icons.remove_rounded,
                    tooltip: 'Zoom Out',
                    onTap: _zoomOut,
                  ),
                  const SizedBox(height: 8),

                  // Re-Center Compass Button
                  _buildFloatingToolButton(
                    icon: Icons.explore_rounded,
                    tooltip: 'Center Uttarakhand',
                    onTap: _centerUttarakhand,
                  ),
                ],
              ),
            ),

            // ── 4. Emergency SOS Quick Pill (Floating Top Left) ──
            Positioned(
              left: 14,
              bottom: activeDest != null ? 220 : 20,
              child: InkWell(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SosSafetyScreen()),
                ),
                borderRadius: BorderRadius.circular(999),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDC2626),
                    borderRadius: BorderRadius.circular(999),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFDC2626).withOpacity(0.4),
                        blurRadius: 12,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.sos_rounded, color: Colors.white, size: 16),
                      SizedBox(width: 6),
                      Text(
                        'SDRF SOS',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // ── 5. Selected Mountain Destination Card (Floating Glassmorphic Modal) ──
            if (activeDest != null)
              Positioned(
                bottom: 16,
                left: 14,
                right: 14,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSatelliteMode ? const Color(0xFF0A1B14).withOpacity(0.96) : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSatelliteMode
                          ? const Color(0xFF1E3A2E)
                          : const Color(0xFFCBD5E1),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(isSatelliteMode ? 0.45 : 0.12),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header with close button
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: CachedNetworkImage(
                              imageUrl: activeDest.imageUrl,
                              width: 72,
                              height: 72,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(
                                width: 72,
                                height: 72,
                                color: const Color(0xFF0F3D2E),
                                child: const Icon(Icons.landscape, color: Colors.white70),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        activeDest.name,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          fontSize: 16,
                                          color: isSatelliteMode ? Colors.white : const Color(0xFF0F172A),
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: activeDest.altitude >= 3000
                                            ? const Color(0xFFFEE2E2)
                                            : const Color(0xFFECFDF5),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        '⛰️ ${activeDest.altitude}m',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                          color: activeDest.altitude >= 3000
                                              ? const Color(0xFFDC2626)
                                              : const Color(0xFF059669),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    // Dismiss button
                                    IconButton(
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(),
                                      icon: const Icon(Icons.close_rounded, size: 18),
                                      color: const Color(0xFF94A3B8),
                                      onPressed: () => setState(() => selectedLocationId = null),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  '${activeDest.district} • ${activeDest.region} Corridor',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: isSatelliteMode ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                                    const SizedBox(width: 3),
                                    Text(
                                      '${activeDest.rating}',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: isSatelliteMode ? Colors.white : const Color(0xFF0F172A),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      '• ${activeDest.bestTimeToVisit}',
                                      style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Two Primary Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => DestinationDetailScreen(destination: activeDest!),
                                  ),
                                );
                              },
                              icon: const Icon(Icons.explore_outlined, size: 15),
                              label: const Text('Explore Guide'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: isSatelliteMode ? const Color(0xFF34D399) : const Color(0xFF0F3D2E),
                                side: BorderSide(
                                  color: isSatelliteMode ? const Color(0xFF059669) : const Color(0xFFCBD5E1),
                                ),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
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
                              icon: const Icon(Icons.lock_outline_rounded, size: 15),
                              label: const Text('Book Stay / Pass'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0F3D2E),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
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
      ),
    );
  }

  // Floating Action Tool Button Helper
  Widget _buildFloatingToolButton({
    required IconData icon,
    required String tooltip,
    required VoidCallback onTap,
    bool isActive = false,
    Color activeColor = const Color(0xFF0F3D2E),
    bool badge = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isSatelliteMode ? const Color(0xFF0F241A).withOpacity(0.92) : Colors.white.withOpacity(0.95),
        shape: BoxShape.circle,
        border: Border.all(
          color: isActive ? activeColor : (isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFE2E8F0)),
          width: isActive ? 1.8 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          IconButton(
            icon: Icon(icon, size: 20),
            color: isActive
                ? activeColor
                : (isSatelliteMode ? const Color(0xFF94A3B8) : const Color(0xFF475569)),
            tooltip: tooltip,
            onPressed: onTap,
            constraints: const BoxConstraints(minWidth: 42, minHeight: 42),
            padding: EdgeInsets.zero,
          ),
          if (badge)
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: Color(0xFF10B981), blurRadius: 6),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  // Interactive Marker Pin Widget
  Widget _buildMarkerWidget(Destination dest, bool isSel, Color color, IconData icon) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.all(isSel ? 7 : 5),
          decoration: BoxDecoration(
            color: isSel ? color : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: color, width: isSel ? 3 : 2),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(isSel ? 0.6 : 0.25),
                blurRadius: isSel ? 14 : 6,
                spreadRadius: isSel ? 2 : 0,
              ),
            ],
          ),
          child: Icon(
            icon,
            size: isSel ? 16 : 12,
            color: isSel ? Colors.white : color,
          ),
        ),
        const SizedBox(height: 2),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: isSel
                ? color
                : (isSatelliteMode ? const Color(0xFF0F241A).withOpacity(0.9) : Colors.white.withOpacity(0.95)),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isSel ? color : (isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFE2E8F0)),
              width: 0.8,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 4,
              ),
            ],
          ),
          child: Text(
            dest.name,
            style: TextStyle(
              fontSize: 8.5,
              fontWeight: isSel ? FontWeight.w900 : FontWeight.w700,
              color: isSel
                  ? Colors.white
                  : (isSatelliteMode ? Colors.white : const Color(0xFF0F172A)),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  // Modal Sheet for SDRF Mountain Radar
  void _showRadarBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: BoxDecoration(
            color: isSatelliteMode ? const Color(0xFF0A1B14) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(
              color: isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFCBD5E1),
            ),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.radar, color: Color(0xFF10B981), size: 22),
                      SizedBox(width: 8),
                      Text(
                        'SDRF Mountain Radar',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: const Text(
                      'LIVE 24/7 GRID',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.shield_outlined, color: Color(0xFF34D399), size: 22),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ALL 4 HIMALAYAN CORRIDORS REPORTED CLEAR',
                            style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w900),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'SDRF Emergency Rapid Response teams stationed every 15km on Char Dham & Kumaon belts.',
                            style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Corridor Safety Conditions:',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 8),
              ...corridors.map((c) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(color: c['color'] as Color, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(c['name'], style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                                Text(c['safety'], style: const TextStyle(fontSize: 10, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                          Text(c['weather'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                  )),
            ],
          ),
        );
      },
    );
  }

  // Modal Sheet for Himalayan Transit Corridors & Route Navigator
  void _showCorridorsBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        String activePreset = 'kedarnath';
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.85,
              decoration: BoxDecoration(
                color: isSatelliteMode ? const Color(0xFF0A1B14) : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border.all(
                  color: isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFCBD5E1),
                ),
              ),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F3D2E),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.navigation_rounded, color: Color(0xFF34D399), size: 18),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Himalayan Route Navigator',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                              ),
                              Text(
                                'Live Highway Status & Mountain Waypoints',
                                style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20, color: Color(0xFF64748B)),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Quick Route Shortcuts
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildRouteShortcutChip('Kedarnath', 'kedarnath', activePreset, (id) => setSheetState(() => activePreset = id)),
                        const SizedBox(width: 6),
                        _buildRouteShortcutChip('Badrinath & Auli', 'chardham', activePreset, (id) => setSheetState(() => activePreset = id)),
                        const SizedBox(width: 6),
                        _buildRouteShortcutChip('Kumaon Lakes', 'kumaon', activePreset, (id) => setSheetState(() => activePreset = id)),
                        const SizedBox(width: 6),
                        _buildRouteShortcutChip('Valley of Flowers', 'valley', activePreset, (id) => setSheetState(() => activePreset = id)),
                        const SizedBox(width: 6),
                        _buildRouteShortcutChip('Adi Kailash', 'adikailash', activePreset, (id) => setSheetState(() => activePreset = id)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Corridors List & Waypoints
                  Expanded(
                    child: ListView(
                      children: [
                        ...corridors.map((c) {
                          final isSelected = activePreset == c['id'];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFFECFDF5)
                                  : (isSatelliteMode ? const Color(0xFF0F241A) : const Color(0xFFF8FAFC)),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: isSelected
                                    ? const Color(0xFF059669)
                                    : (c['color'] as Color).withOpacity(0.25),
                                width: isSelected ? 1.5 : 1,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 10,
                                          height: 10,
                                          decoration: BoxDecoration(color: c['color'] as Color, shape: BoxShape.circle),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          c['name'],
                                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A)),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: (c['color'] as Color).withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        c['status'],
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: c['color'] as Color),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  c['route'],
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF475569), fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.speed, size: 13, color: Color(0xFF0F3D2E)),
                                    const SizedBox(width: 4),
                                    Text('${c['distance']} • ${c['duration']}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF334155))),
                                    const Spacer(),
                                    Text(c['weather'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF059669))),
                                  ],
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),

                  // Bottom Action Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pop(ctx),
                      icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
                      label: const Text('View Active Corridors on Map'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F3D2E),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildRouteShortcutChip(String label, String id, String current, Function(String) onSelect) {
    final isSelected = current == id;
    return GestureDetector(
      onTap: () => onSelect(id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F3D2E) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: isSelected ? const Color(0xFF0F3D2E) : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF334155),
          ),
        ),
      ),
    );
  }
}

// ── Topographic Uttarakhand Alpine Canvas Painter ──
class AlpineUttarakhandTopoPainter extends CustomPainter {
  final bool isSatellite;
  final bool showCorridors;
  final bool showRadar;

  AlpineUttarakhandTopoPainter({
    required this.isSatellite,
    required this.showCorridors,
    required this.showRadar,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final bgRect = Rect.fromLTWH(0, 0, size.width, size.height);

    // 1. Base Gradient Canvas Fill
    final bgPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: isSatellite
            ? [const Color(0xFF04100B), const Color(0xFF0B2018), const Color(0xFF06140E)]
            : [const Color(0xFFEDF2EC), const Color(0xFFF7FAF7), const Color(0xFFEBF1EB)],
      ).createShader(bgRect);
    canvas.drawRect(bgRect, bgPaint);

    // 2. High Elevation Snow-cap Shading (Northern Greater Himalayas)
    final snowCapPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: isSatellite
            ? [const Color(0xFF1E3A2E).withOpacity(0.5), Colors.transparent]
            : [const Color(0xFFD1E0D4).withOpacity(0.45), Colors.transparent],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height * 0.45));
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height * 0.45), snowCapPaint);

    // 3. Topographic Elevation Contours
    final contourPaint = Paint()
      ..color = isSatellite ? const Color(0xFF133827).withOpacity(0.5) : const Color(0xFFCBD8CD).withOpacity(0.6)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    final contourCount = 14;
    for (int i = 1; i <= contourCount; i++) {
      final yBase = (size.height / (contourCount + 1)) * i;
      final path = Path();
      path.moveTo(0, yBase);
      for (double x = 0; x <= size.width; x += 60) {
        final double wave = math.sin((x / 140) + (i * 0.7)) * (20 + (i * 1.5));
        path.lineTo(x, yBase + wave);
      }
      canvas.drawPath(path, contourPaint);
    }

    // 4. Sacred River Valleys (Alaknanda, Bhagirathi, Ganga, Yamuna, Kali)
    final riverPaint = Paint()
      ..color = isSatellite ? const Color(0xFF38BDF8).withOpacity(0.6) : const Color(0xFF0284C7).withOpacity(0.5)
      ..strokeWidth = 2.2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Ganga / Alaknanda main arterial river
    final alaknanda = Path()
      ..moveTo(size.width * 0.65, size.height * 0.15) // Badrinath origin
      ..cubicTo(size.width * 0.60, size.height * 0.32, size.width * 0.50, size.height * 0.45, size.width * 0.40, size.height * 0.58)
      ..cubicTo(size.width * 0.35, size.height * 0.65, size.width * 0.28, size.height * 0.72, size.width * 0.22, size.height * 0.88); // Haridwar / Plains
    canvas.drawPath(alaknanda, riverPaint);

    // Bhagirathi (Gangotri to Devprayag confluence)
    final bhagirathi = Path()
      ..moveTo(size.width * 0.45, size.height * 0.12) // Gangotri
      ..cubicTo(size.width * 0.42, size.height * 0.25, size.width * 0.38, size.height * 0.40, size.width * 0.40, size.height * 0.58);
    canvas.drawPath(bhagirathi, riverPaint);

    // Kali River (Eastern Border)
    final kaliRiver = Path()
      ..moveTo(size.width * 0.90, size.height * 0.22)
      ..cubicTo(size.width * 0.88, size.height * 0.45, size.width * 0.85, size.height * 0.65, size.width * 0.80, size.height * 0.85);
    canvas.drawPath(kaliRiver, riverPaint);

    // 5. Iconic Mountain Peaks (Triangular Snow Icons with Labels)
    _drawMountainPeak(canvas, size.width * 0.72, size.height * 0.20, 'Nanda Devi (7,816m)');
    _drawMountainPeak(canvas, size.width * 0.66, size.height * 0.26, 'Trishul (7,120m)');
    _drawMountainPeak(canvas, size.width * 0.52, size.height * 0.18, 'Kedarnath Peak (6,831m)');
    _drawMountainPeak(canvas, size.width * 0.60, size.height * 0.16, 'Badrinath / Neelkanth (6,596m)');
    _drawMountainPeak(canvas, size.width * 0.85, size.height * 0.32, 'Panchachuli (6,904m)');

    // 6. Himalayan Highway Transit Corridors
    if (showCorridors) {
      final corridorPaint = Paint()
        ..color = const Color(0xFF059669).withOpacity(0.7)
        ..strokeWidth = 2.8
        ..style = PaintingStyle.stroke;

      // Char Dham Highway Route
      final chardhamPath = Path()
        ..moveTo(size.width * 0.22, size.height * 0.88) // Haridwar
        ..lineTo(size.width * 0.28, size.height * 0.72) // Rishikesh
        ..lineTo(size.width * 0.40, size.height * 0.58) // Devprayag
        ..lineTo(size.width * 0.50, size.height * 0.45) // Rudraprayag
        ..lineTo(size.width * 0.60, size.height * 0.32) // Joshimath
        ..lineTo(size.width * 0.65, size.height * 0.15); // Badrinath
      canvas.drawPath(chardhamPath, corridorPaint);

      // Kumaon Lake Highway
      final kumaonPaint = Paint()
        ..color = const Color(0xFF2563EB).withOpacity(0.7)
        ..strokeWidth = 2.4
        ..style = PaintingStyle.stroke;

      final kumaonPath = Path()
        ..moveTo(size.width * 0.60, size.height * 0.88) // Kathgodam
        ..lineTo(size.width * 0.62, size.height * 0.75) // Nainital
        ..lineTo(size.width * 0.70, size.height * 0.65) // Almora
        ..lineTo(size.width * 0.73, size.height * 0.54); // Binsar
      canvas.drawPath(kumaonPath, kumaonPaint);
    }
  }

  void _drawMountainPeak(Canvas canvas, double x, double y, String label) {
    final peakPaint = Paint()
      ..color = isSatellite ? const Color(0xFFE2E8F0) : const Color(0xFF0F3D2E)
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(x, y - 10)
      ..lineTo(x - 9, y + 6)
      ..lineTo(x + 9, y + 6)
      ..close();
    canvas.drawPath(path, peakPaint);

    final textSpan = TextSpan(
      text: label,
      style: TextStyle(
        color: isSatellite ? const Color(0xFF94A3B8) : const Color(0xFF475569),
        fontSize: 8,
        fontWeight: FontWeight.w800,
      ),
    );
    final textPainter = TextPainter(text: textSpan, textDirection: TextDirection.ltr);
    textPainter.layout();
    textPainter.paint(canvas, Offset(x - (textPainter.width / 2), y + 8));
  }

  @override
  bool shouldRepaint(covariant AlpineUttarakhandTopoPainter oldDelegate) {
    return oldDelegate.isSatellite != isSatellite ||
        oldDelegate.showCorridors != showCorridors ||
        oldDelegate.showRadar != showRadar;
  }
}
