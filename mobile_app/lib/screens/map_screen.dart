import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'package:geolocator/geolocator.dart';
import 'package:cached_network_image/cached_network_image.dart';
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
  final MapController _mapController = MapController();
  final TextEditingController _searchController = TextEditingController();

  String selectedFilter = 'All';
  String? selectedLocationId;
  bool isSatelliteMode = false;
  bool showSafetyRadarLayer = true;
  bool showCorridorsLayer = true;
  bool showAllPins = false; // Default: clean decluttered Key Hubs overview
  String searchQuery = '';

  String? activeCorridorId;
  String? activeCorridorName;
  String? activeRouteStats;
  List<LatLng>? destinationRoutePoints;

  static const Set<String> _keyHubNames = {
    'Nainital', 'Kedarnath', 'Badrinath', 'Auli', 'Rishikesh',
    'Chopta', 'Tungnath', 'Valley of Flowers', 'Munsiyari',
    'Jim Corbett', 'Haridwar', 'Mussoorie', 'Tehri', 'Gangotri',
    'Yamunotri', 'Almora', 'Adi Kailash', 'Kausani', 'Ranikhet',
    'Pithoragarh', 'Dayara Bugyal', 'Kedarkantha', 'Binsar',
  };

  bool _isKeyHub(Destination d) {
    final n = d.name.toLowerCase();
    for (final hub in _keyHubNames) {
      if (n.contains(hub.toLowerCase()) || hub.toLowerCase().contains(n)) return true;
    }
    return d.altitude >= 3200;
  }

  List<Destination> destinations = [];
  List<SpiritualPlace> spirituals = [];
  List<ActivityItem> activities = [];
  bool isLoading = true;

  final List<String> categories = ['All', 'Spiritual', 'High Altitude', 'Lakes & Treks', 'Nature'];

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
    _searchController.dispose();
    super.dispose();
  }

  void _centerUttarakhand() {
    _mapController.move(const LatLng(30.0668, 79.0193), 8.2);
  }

  void _zoomIn() {
    final current = _mapController.camera.zoom;
    _mapController.move(_mapController.camera.center, current + 1.0);
  }

  void _zoomOut() {
    final current = _mapController.camera.zoom;
    _mapController.move(_mapController.camera.center, current - 1.0);
  }

  Future<void> _locateUser() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        final pos = await Geolocator.getCurrentPosition(timeLimit: const Duration(seconds: 4));
        _mapController.move(LatLng(pos.latitude, pos.longitude), 13.0);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Centered on GPS location (${pos.latitude.toStringAsFixed(3)}, ${pos.longitude.toStringAsFixed(3)})'),
              backgroundColor: const Color(0xFF0F3D2E),
              duration: const Duration(seconds: 2),
            ),
          );
        }
        return;
      }
    } catch (_) {}

    // Graceful fallback if GPS is blocked or times out in browser
    _mapController.move(const LatLng(30.0869, 78.2676), 11.5);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Centered on Rishikesh Gateway (GPS simulation)'),
          backgroundColor: Color(0xFF0F3D2E),
          duration: Duration(seconds: 2),
        ),
      );
    }
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

      // Always show searched results
      if (searchQuery.isNotEmpty) return true;

      if (selectedFilter != 'All') {
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
      }

      // If 'All' is selected, show uncluttered Key Hubs by default unless showAllPins is enabled
      if (!showAllPins) {
        return _isKeyHub(d) || selectedLocationId == d.id;
      }
      return true;
    }).toList();
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

  String _getDestinationImage(Destination dest) {
    if (dest.imageUrl.isNotEmpty && dest.imageUrl.startsWith('http')) {
      return dest.imageUrl;
    }
    if (dest.images.isNotEmpty && dest.images.first.startsWith('http')) {
      return dest.images.first;
    }
    final name = dest.name.toLowerCase();
    if (name.contains('kedar')) return 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('badri')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('auli')) return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('naini')) return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('rishi')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ram_Jhula_Rishikesh.jpg/1280px-Ram_Jhula_Rishikesh.jpg';
    if (name.contains('harid')) return 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('chopta') || name.contains('tung')) return 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('kailash') || name.contains('om')) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('flower') || name.contains('valley')) return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('mussoorie')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('corbett')) return 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80';
    if (name.contains('tehri')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80';
  }

  // Focus on a specific destination and open its preview card
  void _focusOnDestination(Destination dest) {
    setState(() => selectedLocationId = dest.id);
    final lat = dest.latitude ?? _fallbackLatForDistrict(dest.district, dest.name);
    final lng = dest.longitude ?? _fallbackLngForDistrict(dest.district, dest.name);
    _mapController.move(LatLng(lat, lng), 12.0);
  }

  void _routeToDestination(Destination dest) {
    final lat = dest.latitude ?? _fallbackLatForDistrict(dest.district, dest.name);
    final lng = dest.longitude ?? _fallbackLngForDistrict(dest.district, dest.name);

    final isKumaon = dest.region.toLowerCase().contains('kumaon') ||
        dest.district.toLowerCase().contains('nainital') ||
        dest.district.toLowerCase().contains('almora') ||
        dest.district.toLowerCase().contains('pithoragarh') ||
        dest.district.toLowerCase().contains('bageshwar');

    final origin = isKumaon ? const LatLng(29.2182, 79.5267) : const LatLng(30.0869, 78.2676);
    final originName = isKumaon ? 'Kathgodam Railhead' : 'Rishikesh Gateway';

    final midLat = (origin.latitude + lat) / 2.0;
    final midLng = (origin.longitude + lng) / 2.0;

    setState(() {
      destinationRoutePoints = [
        origin,
        LatLng(midLat + 0.04, midLng - 0.02),
        LatLng(lat, lng),
      ];
      activeCorridorId = 'dest_${dest.id}';
      activeCorridorName = '$originName → ${dest.name}';
      activeRouteStats = 'Scenic Mountain Route • Clear & Verified Pass';
    });

    _mapController.move(LatLng(midLat, midLng), 9.2);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Route calculated: $originName to ${dest.name}'),
        backgroundColor: const Color(0xFF0F3D2E),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _selectCorridor(Map<String, dynamic> c) {
    setState(() {
      activeCorridorId = c['id'] as String;
      activeCorridorName = c['name'] as String;
      activeRouteStats = '${c['distance']} • ${c['duration']} • ${c['status']}';
      destinationRoutePoints = null;
    });

    switch (c['id']) {
      case 'chardham':
        _mapController.move(const LatLng(30.3800, 78.9800), 8.8);
        break;
      case 'kumaon':
        _mapController.move(const LatLng(29.5892, 79.6467), 9.2);
        break;
      case 'adikailash':
        _mapController.move(const LatLng(30.0000, 80.6000), 8.8);
        break;
      case 'valley':
        _mapController.move(const LatLng(30.7000, 79.5900), 11.0);
        break;
      default:
        _centerUttarakhand();
    }
  }

  void _clearActiveRoute() {
    setState(() {
      activeCorridorId = null;
      activeCorridorName = null;
      activeRouteStats = null;
      destinationRoutePoints = null;
    });
  }

  List<Polyline> _buildCorridorPolylines() {
    final polylines = <Polyline>[];

    final corridorDefs = [
      {
        'id': 'chardham',
        'points': const [
          LatLng(29.9457, 78.1642), // Haridwar
          LatLng(30.0869, 78.2676), // Rishikesh
          LatLng(30.1459, 78.5990), // Devprayag
          LatLng(30.2227, 78.7844), // Srinagar
          LatLng(30.2858, 78.9811), // Rudraprayag
          LatLng(30.5200, 79.0800), // Guptkashi
          LatLng(30.7352, 79.0669), // Kedarnath
          LatLng(30.4070, 79.3364), // Chamoli
          LatLng(30.5564, 79.5661), // Joshimath
          LatLng(30.7465, 79.4942), // Badrinath
        ],
        'color': const Color(0xFF059669),
      },
      {
        'id': 'kumaon',
        'points': const [
          LatLng(29.2182, 79.5267), // Kathgodam
          LatLng(29.3803, 79.4636), // Nainital
          LatLng(29.3497, 79.5539), // Bhimtal
          LatLng(29.5892, 79.6467), // Almora
          LatLng(29.7042, 79.7564), // Binsar
          LatLng(29.8542, 79.6058), // Kausani
        ],
        'color': const Color(0xFF2563EB),
      },
      {
        'id': 'adikailash',
        'points': const [
          LatLng(29.5829, 80.2182), // Pithoragarh
          LatLng(29.8497, 80.5372), // Dharchula
          LatLng(30.1800, 80.8500), // Gunji
          LatLng(30.2200, 80.8800), // Nabi
          LatLng(30.2400, 81.0400), // Lipulekh
        ],
        'color': const Color(0xFFD97706),
      },
      {
        'id': 'valley',
        'points': const [
          LatLng(30.6250, 79.5480), // Govindghat
          LatLng(30.6400, 79.5600), // Poolna
          LatLng(30.6989, 79.5931), // Ghangaria
          LatLng(30.7280, 79.6053), // Valley of Flowers
          LatLng(30.7008, 79.6236), // Hemkund Sahib
        ],
        'color': const Color(0xFF7C3AED),
      },
    ];

    for (final def in corridorDefs) {
      final id = def['id'] as String;
      final points = def['points'] as List<LatLng>;
      final baseColor = def['color'] as Color;
      final isSelected = activeCorridorId == id;
      final isAnySelected = activeCorridorId != null;

      polylines.add(
        Polyline(
          points: points,
          color: isSelected
              ? baseColor
              : (isAnySelected ? baseColor.withValues(alpha: 0.35) : baseColor.withValues(alpha: 0.85)),
          strokeWidth: isSelected ? 6.5 : (isAnySelected ? 3.0 : 4.0),
          borderStrokeWidth: isSelected ? 2.5 : 1.2,
          borderColor: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.7),
        ),
      );
    }

    if (destinationRoutePoints != null && destinationRoutePoints!.isNotEmpty) {
      polylines.add(
        Polyline(
          points: destinationRoutePoints!,
          color: const Color(0xFF00FF88),
          strokeWidth: 6.5,
          borderStrokeWidth: 2.5,
          borderColor: const Color(0xFF0F3D2E),
        ),
      );
    }

    return polylines;
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
            // ── 1. Real Leaflet-Powered Geoapify Interactive Map ──
            Positioned.fill(
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: const LatLng(30.0668, 79.0193),
                  initialZoom: 8.2,
                  minZoom: 6.5,
                  maxZoom: 18.0,
                  interactionOptions: const InteractionOptions(
                    flags: InteractiveFlag.all,
                  ),
                  onTap: (_, __) {
                    if (selectedLocationId != null) {
                      setState(() => selectedLocationId = null);
                    }
                  },
                ),
                children: [
                  TileLayer(
                    urlTemplate: isSatelliteMode
                        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        : 'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=2c3a7f1f2e184822a7631d30dfac330c',
                    userAgentPackageName: 'com.discoveryuttarakhand.app',
                    maxZoom: 19,
                  ),
                  if (showCorridorsLayer)
                    PolylineLayer(
                      polylines: _buildCorridorPolylines(),
                    ),
                  if (!isLoading)
                    MarkerLayer(
                      markers: visiblePlaces.map((dest) {
                        final isSel = selectedLocationId == dest.id;
                        final color = _getNodeColor(dest);
                        final icon = _getNodeIcon(dest);
                        final lat = dest.latitude ?? _fallbackLatForDistrict(dest.district, dest.name);
                        final lng = dest.longitude ?? _fallbackLngForDistrict(dest.district, dest.name);
                        return Marker(
                          point: LatLng(lat, lng),
                          width: isSel ? 70 : 54,
                          height: isSel ? 70 : 54,
                          child: GestureDetector(
                            onTap: () => _focusOnDestination(dest),
                            child: _buildMarkerWidget(dest, isSel, color, icon),
                          ),
                        );
                      }).toList(),
                    ),
                ],
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
                          ? const Color(0xFF0F241A).withValues(alpha: 0.94)
                          : Colors.white.withValues(alpha: 0.96),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFE2E8F0),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isSatelliteMode ? 0.35 : 0.08),
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
                              hintText: 'Search 106+ Uttarakhand destinations, peaks, valleys...',
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
                        InkWell(
                          onTap: () {
                            setState(() => showAllPins = !showAllPins);
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSatelliteMode
                                  ? const Color(0xFF064E3B)
                                  : (showAllPins ? const Color(0xFFFEF3C7) : const Color(0xFFECFDF5)),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSatelliteMode
                                    ? const Color(0xFF059669).withValues(alpha: 0.5)
                                    : (showAllPins ? const Color(0xFFFDE68A) : const Color(0xFFA7F3D0)),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  showAllPins ? Icons.grid_view_rounded : Icons.push_pin_rounded,
                                  size: 11,
                                  color: isSatelliteMode
                                      ? const Color(0xFF34D399)
                                      : (showAllPins ? const Color(0xFFB45309) : const Color(0xFF065F46)),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  showAllPins ? 'ALL (${visiblePlaces.length})' : 'KEY HUBS (${visiblePlaces.length})',
                                  style: TextStyle(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w900,
                                    color: isSatelliteMode
                                        ? const Color(0xFF34D399)
                                        : (showAllPins ? const Color(0xFFB45309) : const Color(0xFF065F46)),
                                    letterSpacing: 0.4,
                                  ),
                                ),
                              ],
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
                                      ? const Color(0xFF0E2218).withValues(alpha: 0.9)
                                      : Colors.white.withValues(alpha: 0.92)),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                color: isSel
                                    ? const Color(0xFF0F3D2E)
                                    : (isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFCBD5E1)),
                                width: 1.1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: isSel ? 0.15 : 0.04),
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

                  // ── Active Route & Transit HUD Banner ──
                  if (activeCorridorName != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F3D2E),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF00FF88), width: 1.2),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 3)),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.navigation_rounded, color: Color(0xFF00FF88), size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  activeCorridorName!,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (activeRouteStats != null)
                                  Text(
                                    activeRouteStats!,
                                    style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                                  ),
                              ],
                            ),
                          ),
                          InkWell(
                            onTap: _clearActiveRoute,
                            borderRadius: BorderRadius.circular(999),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(color: Colors.white24, shape: BoxShape.circle),
                              child: const Icon(Icons.close, color: Colors.white, size: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
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
                  const SizedBox(height: 8),

                  // GPS Location Button
                  _buildFloatingToolButton(
                    icon: Icons.my_location_rounded,
                    tooltip: 'Current GPS Location',
                    onTap: _locateUser,
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
                        color: const Color(0xFFDC2626).withValues(alpha: 0.4),
                        blurRadius: 12,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
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

            // ── 5. Selected Mountain Destination Card (Floating Glassmorphic Modal with Large Photo) ──
            if (activeDest != null)
              Positioned(
                bottom: 16,
                left: 14,
                right: 14,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  decoration: BoxDecoration(
                    color: isSatelliteMode ? const Color(0xFF0A1B14).withValues(alpha: 0.98) : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSatelliteMode
                          ? const Color(0xFF1E3A2E)
                          : const Color(0xFFCBD5E1),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isSatelliteMode ? 0.55 : 0.16),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Large Panoramic Mountain Image Banner
                        SizedBox(
                          height: 140,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              CachedNetworkImage(
                                imageUrl: _getDestinationImage(activeDest),
                                fit: BoxFit.cover,
                                placeholder: (_, __) => Container(
                                  color: const Color(0xFF0F3D2E),
                                  child: const Center(
                                    child: CircularProgressIndicator(color: Color(0xFF34D399), strokeWidth: 2),
                                  ),
                                ),
                                errorWidget: (_, __, ___) => Container(
                                  color: const Color(0xFF0F3D2E),
                                  child: const Icon(Icons.terrain_rounded, color: Colors.white70, size: 40),
                                ),
                              ),
                              // Subtle bottom-up dark gradient scrim for high-contrast legibility
                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.black.withValues(alpha: 0.25),
                                      Colors.transparent,
                                      Colors.black.withValues(alpha: 0.85),
                                    ],
                                  ),
                                ),
                              ),
                              // Top Badges (Category & Dismiss)
                              Positioned(
                                top: 10,
                                left: 12,
                                right: 10,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0F3D2E).withValues(alpha: 0.9),
                                        borderRadius: BorderRadius.circular(999),
                                        border: Border.all(color: const Color(0xFF34D399).withValues(alpha: 0.6)),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            activeDest.altitude >= 3000 ? Icons.snowing : Icons.verified_rounded,
                                            size: 11,
                                            color: const Color(0xFF34D399),
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            activeDest.category,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w800,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withValues(alpha: 0.65),
                                            borderRadius: BorderRadius.circular(999),
                                          ),
                                          child: Text(
                                            '⛰️ ${activeDest.altitude}m',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w900,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        InkWell(
                                          onTap: () => setState(() => selectedLocationId = null),
                                          borderRadius: BorderRadius.circular(999),
                                          child: Container(
                                            padding: const EdgeInsets.all(4),
                                            decoration: BoxDecoration(
                                              color: Colors.black.withValues(alpha: 0.65),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.close_rounded, size: 16, color: Colors.white),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              // Bottom Destination Title & Star Rating
                              Positioned(
                                bottom: 10,
                                left: 14,
                                right: 14,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        activeDest.name,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w900,
                                          shadows: [
                                            Shadow(color: Colors.black, blurRadius: 8),
                                          ],
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF59E0B),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.star_rounded, size: 13, color: Colors.white),
                                          const SizedBox(width: 2),
                                          Text(
                                            '${activeDest.rating}',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w900,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Details and Action Dock Below Image
                        Padding(
                          padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.location_on_rounded, size: 13, color: isSatelliteMode ? const Color(0xFF34D399) : const Color(0xFF0F3D2E)),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      '${activeDest.district} • ${activeDest.region} Corridor • Best: ${activeDest.bestTimeToVisit}',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: isSatelliteMode ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),

                              // Three Interactive Actions (Show Route, Guide, Book Razorpay)
                              Row(
                                children: [
                                  // 1. Show Route Polyline Button
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () => _routeToDestination(activeDest!),
                                      icon: const Icon(Icons.alt_route_rounded, size: 14),
                                      label: const Text('Show Route'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0284C7),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                                        elevation: 0,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // 2. Explore Guide
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
                                      icon: const Icon(Icons.explore_outlined, size: 14),
                                      label: const Text('Guide'),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: isSatelliteMode ? const Color(0xFF34D399) : const Color(0xFF0F3D2E),
                                        side: BorderSide(
                                          color: isSatelliteMode ? const Color(0xFF059669) : const Color(0xFFCBD5E1),
                                        ),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // 3. Book Stay / Fleet (Razorpay)
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => CheckoutScreen(
                                              itemType: 'Stay & Pass Combo',
                                              itemName: '${activeDest!.name} Mountain Stay',
                                              basePrice: activeDest.estimatedBudget > 0 ? activeDest.estimatedBudget : 1800,
                                            ),
                                          ),
                                        );
                                      },
                                      icon: const Icon(Icons.lock_rounded, size: 13),
                                      label: const Text('Book'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0F3D2E),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                                        elevation: 0,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
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
        color: isSatelliteMode ? const Color(0xFF0F241A).withValues(alpha: 0.92) : Colors.white.withValues(alpha: 0.95),
        shape: BoxShape.circle,
        border: Border.all(
          color: isActive ? activeColor : (isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFE2E8F0)),
          width: isActive ? 1.8 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
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

  // Interactive Marker Pin Widget with Smart Decluttering
  Widget _buildMarkerWidget(Destination dest, bool isSel, Color color, IconData icon) {
    final bool isHub = _isKeyHub(dest);
    final bool shouldShowLabel = isSel || isHub || searchQuery.isNotEmpty || selectedFilter != 'All';

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.all(isSel ? 7 : (isHub ? 5 : 3.5)),
          decoration: BoxDecoration(
            color: isSel ? color : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: color, width: isSel ? 3 : (isHub ? 2 : 1.5)),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: isSel ? 0.6 : 0.2),
                blurRadius: isSel ? 14 : (isHub ? 6 : 3),
                spreadRadius: isSel ? 2 : 0,
              ),
            ],
          ),
          child: Icon(
            icon,
            size: isSel ? 16 : (isHub ? 12 : 9),
            color: isSel ? Colors.white : color,
          ),
        ),
        if (shouldShowLabel) ...[
          const SizedBox(height: 2),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
            decoration: BoxDecoration(
              color: isSel
                  ? color
                  : (isSatelliteMode ? const Color(0xFF0F241A).withValues(alpha: 0.9) : Colors.white.withValues(alpha: 0.95)),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: isSel ? color : (isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFE2E8F0)),
                width: 0.8,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 4,
                ),
              ],
            ),
            child: Text(
              dest.name,
              style: TextStyle(
                fontSize: isSel ? 9.5 : 8.2,
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
                  const Row(
                    children: [
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
                child: const Row(
                  children: [
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
  // Modal Sheet for Himalayan Transit Corridors & Route Navigator
  void _showCorridorsBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        String activePreset = activeCorridorId ?? 'chardham';
        String selectedOrigin = 'Rishikesh Gateway';
        String selectedDest = 'Kedarnath Dham';

        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.88,
              decoration: BoxDecoration(
                color: isSatelliteMode ? const Color(0xFF0A1B14) : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border.all(
                  color: isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFCBD5E1),
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(18, 12, 18, 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Drag Handle
                      Center(
                        child: Container(
                          width: 44,
                          height: 4,
                          decoration: BoxDecoration(
                            color: const Color(0xFFCBD5E1),
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F3D2E),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.navigation_rounded, color: Color(0xFF34D399), size: 18),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Himalayan Route Navigator',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w900,
                                      color: isSatelliteMode ? Colors.white : const Color(0xFF0F172A),
                                    ),
                                  ),
                                  const Text(
                                    'Tap any corridor or select locations to plot route',
                                    style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
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
                            _buildRouteShortcutChip('Kedarnath', 'chardham', activePreset, (id) {
                              setSheetState(() => activePreset = id);
                              final found = corridors.firstWhere((it) => it['id'] == id, orElse: () => corridors.first);
                              Navigator.pop(ctx);
                              _selectCorridor(found);
                            }),
                            const SizedBox(width: 6),
                            _buildRouteShortcutChip('Badrinath & Auli', 'chardham', activePreset, (id) {
                              setSheetState(() => activePreset = id);
                              final found = corridors.firstWhere((it) => it['id'] == id, orElse: () => corridors.first);
                              Navigator.pop(ctx);
                              _selectCorridor(found);
                            }),
                            const SizedBox(width: 6),
                            _buildRouteShortcutChip('Kumaon Lakes', 'kumaon', activePreset, (id) {
                              setSheetState(() => activePreset = id);
                              final found = corridors.firstWhere((it) => it['id'] == id, orElse: () => corridors.first);
                              Navigator.pop(ctx);
                              _selectCorridor(found);
                            }),
                            const SizedBox(width: 6),
                            _buildRouteShortcutChip('Valley of Flowers', 'valley', activePreset, (id) {
                              setSheetState(() => activePreset = id);
                              final found = corridors.firstWhere((it) => it['id'] == id, orElse: () => corridors.first);
                              Navigator.pop(ctx);
                              _selectCorridor(found);
                            }),
                            const SizedBox(width: 6),
                            _buildRouteShortcutChip('Adi Kailash', 'adikailash', activePreset, (id) {
                              setSheetState(() => activePreset = id);
                              final found = corridors.firstWhere((it) => it['id'] == id, orElse: () => corridors.first);
                              Navigator.pop(ctx);
                              _selectCorridor(found);
                            }),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Corridors List & Custom Location Selector Scrollable Area
                      Expanded(
                        child: ListView(
                          children: [
                            // ── Section 1: Custom Location to Route Selector ──
                            Container(
                              margin: const EdgeInsets.only(bottom: 14),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: isSatelliteMode ? const Color(0xFF0F241A) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSatelliteMode ? const Color(0xFF1E3A2E) : const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.tune_rounded, size: 14, color: Color(0xFF0F3D2E)),
                                      const SizedBox(width: 6),
                                      Text(
                                        'SELECT ORIGIN & DESTINATION',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: 0.5,
                                          color: isSatelliteMode ? const Color(0xFF34D399) : const Color(0xFF0F3D2E),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text('From', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                            const SizedBox(height: 4),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(10),
                                                border: Border.all(color: const Color(0xFFCBD5E1)),
                                              ),
                                              child: DropdownButtonHideUnderline(
                                                child: DropdownButton<String>(
                                                  value: selectedOrigin,
                                                  isExpanded: true,
                                                  isDense: true,
                                                  items: const [
                                                    DropdownMenuItem(value: 'Rishikesh Gateway', child: Text('Rishikesh Gateway', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Kathgodam Railhead', child: Text('Kathgodam Railhead', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Dehradun Airport', child: Text('Dehradun Airport', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Haridwar Junction', child: Text('Haridwar Junction', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                  ],
                                                  onChanged: (val) {
                                                    if (val != null) setSheetState(() => selectedOrigin = val);
                                                  },
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      const Padding(
                                        padding: EdgeInsets.only(top: 14),
                                        child: Icon(Icons.arrow_forward_rounded, size: 16, color: Color(0xFF64748B)),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text('To', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                            const SizedBox(height: 4),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(10),
                                                border: Border.all(color: const Color(0xFFCBD5E1)),
                                              ),
                                              child: DropdownButtonHideUnderline(
                                                child: DropdownButton<String>(
                                                  value: selectedDest,
                                                  isExpanded: true,
                                                  isDense: true,
                                                  items: const [
                                                    DropdownMenuItem(value: 'Kedarnath Dham', child: Text('Kedarnath Dham', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Badrinath Temple', child: Text('Badrinath Temple', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Auli Ski Resort', child: Text('Auli Ski Resort', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Nainital Lake', child: Text('Nainital Lake', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Chopta Bugyal', child: Text('Chopta Bugyal', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Valley of Flowers', child: Text('Valley of Flowers', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                    DropdownMenuItem(value: 'Adi Kailash', child: Text('Adi Kailash', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                                                  ],
                                                  onChanged: (val) {
                                                    if (val != null) setSheetState(() => selectedDest = val);
                                                  },
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton.icon(
                                      onPressed: () {
                                        Navigator.pop(ctx);
                                        // Find destination if matching
                                        final destName = selectedDest.replaceAll(' Dham', '').replaceAll(' Temple', '').replaceAll(' Lake', '').replaceAll(' Resort', '').replaceAll(' Bugyal', '').trim().toLowerCase();
                                        final matched = destinations.firstWhere(
                                          (d) => d.name.toLowerCase().contains(destName),
                                          orElse: () => destinations.isNotEmpty ? destinations.first : Destination(
                                            id: 'custom',
                                            name: selectedDest,
                                            district: 'Garhwal',
                                            region: 'Alpine',
                                            category: 'Spiritual',
                                            description: '',
                                            shortDescription: '',
                                            imageUrl: '',
                                            rating: 4.9,
                                            reviewsCount: 120,
                                            estimatedBudget: 2500,
                                            altitude: 3500,
                                            bestTimeToVisit: 'May - Oct',
                                            highlights: [],
                                            experiences: [],
                                          ),
                                        );
                                        _routeToDestination(matched);
                                      },
                                      icon: const Icon(Icons.directions_car_rounded, size: 15),
                                      label: Text('Plot Route: $selectedOrigin → $selectedDest'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0F3D2E),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 9),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // ── Section 2: Predefined Verified Corridors ──
                            ...corridors.map((c) {
                              final isSelected = activePreset == c['id'] || activeCorridorId == c['id'];
                              return InkWell(
                                onTap: () {
                                  Navigator.pop(ctx);
                                  _selectCorridor(c);
                                },
                                borderRadius: BorderRadius.circular(18),
                                child: Container(
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
                                          : (c['color'] as Color).withValues(alpha: 0.3),
                                      width: isSelected ? 1.8 : 1,
                                    ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: const Color(0xFF059669).withValues(alpha: 0.15),
                                              blurRadius: 10,
                                              offset: const Offset(0, 3),
                                            ),
                                          ]
                                        : null,
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
                                              color: (c['color'] as Color).withValues(alpha: 0.12),
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
                                      const SizedBox(height: 8),
                                      // Explicit Tap-to-Route Trigger
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          Text(
                                            '⚡ Tap to Show Route on Map →',
                                            style: TextStyle(
                                              fontSize: 10.5,
                                              fontWeight: FontWeight.w900,
                                              color: isSelected ? const Color(0xFF059669) : const Color(0xFF2563EB),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
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
                          onPressed: () {
                            Navigator.pop(ctx);
                            final found = corridors.firstWhere((it) => it['id'] == activePreset, orElse: () => corridors.first);
                            _selectCorridor(found);
                          },
                          icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
                          label: const Text('View Highlighted Corridor on Map'),
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
                ),
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

