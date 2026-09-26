import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/destination.dart';
import '../services/api_service.dart';

class ActivitiesScreen extends StatefulWidget {
  const ActivitiesScreen({super.key});

  @override
  State<ActivitiesScreen> createState() => _ActivitiesScreenState();
}

class _ActivitiesScreenState extends State<ActivitiesScreen> {
  List<ActivityItem> activities = [];
  bool isLoading = true;
  String searchQuery = '';
  String selectedType = 'All';

  final List<String> types = ['All', 'Rafting', 'Trekking', 'Safari', 'Boating'];

  @override
  void initState() {
    super.initState();
    _loadActivities();
  }

  Future<void> _loadActivities() async {
    final res = await ApiService.getActivities();
    if (mounted) {
      setState(() {
        activities = res;
        isLoading = false;
      });
    }
  }

  List<ActivityItem> get filteredActivities {
    return activities.where((a) {
      final matchType = selectedType == 'All' ||
          a.name.toLowerCase().contains(selectedType.toLowerCase()) ||
          a.experiences.any((e) => e.toLowerCase().contains(selectedType.toLowerCase()));
      final matchSearch = searchQuery.isEmpty ||
          a.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          a.district.toLowerCase().contains(searchQuery.toLowerCase());
      return matchType && matchSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'Mountain Adventures & Activities',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : RefreshIndicator(
              onRefresh: _loadActivities,
              color: AppTheme.forestGreen,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Banner
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      height: 160,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(color: AppTheme.forestGreen.withOpacity(0.12), blurRadius: 16, offset: const Offset(0, 6)),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            CachedNetworkImage(
                              imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200&q=80',
                              fit: BoxFit.cover,
                            ),
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                  colors: [
                                    const Color(0xFF09261C).withOpacity(0.92),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(18),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'HIGH ADRENALINE EXPERIENCES',
                                    style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'White Water Rafting & Alpine Treks',
                                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                                  ),
                                  Text(
                                    'Certified mountain guides with emergency safety gear included',
                                    style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Search
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: TextField(
                          onChanged: (v) => setState(() => searchQuery = v),
                          decoration: const InputDecoration(
                            hintText: 'Search rafting, trekking, wildlife safari...',
                            hintStyle: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            prefixIcon: Icon(Icons.search, color: AppTheme.forestGreen, size: 20),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ),

                    // Type filter pills
                    SizedBox(
                      height: 36,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: types.length,
                        itemBuilder: (context, i) {
                          final t = types[i];
                          final isSel = selectedType == t;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: () => setState(() => selectedType = t),
                              borderRadius: BorderRadius.circular(999),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSel ? AppTheme.forestGreen : Colors.white,
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(color: isSel ? AppTheme.forestGreen : const Color(0xFFE2E8F0)),
                                ),
                                child: Text(
                                  t,
                                  style: TextStyle(
                                    fontSize: 12,
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

                    const SizedBox(height: 14),

                    // Activity Cards
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filteredActivities.length,
                      itemBuilder: (context, idx) {
                        final a = filteredActivities[idx];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                                child: CachedNetworkImage(
                                  imageUrl: a.imageUrl,
                                  height: 160,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(color: AppTheme.beige),
                                  errorWidget: (context, url, error) => Container(
                                    color: AppTheme.beige,
                                    child: const Icon(Icons.kayaking, color: AppTheme.forestGreen, size: 40),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            a.name,
                                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFE8F5E9),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            '₹${a.price}',
                                            style: const TextStyle(color: Color(0xFF0F3D2E), fontSize: 13, fontWeight: FontWeight.w900),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on, size: 13, color: Color(0xFF059669)),
                                        const SizedBox(width: 3),
                                        Text('${a.district} • ${a.region}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      a.description.isNotEmpty ? a.description : a.shortDescription,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF475569), height: 1.4),
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Wrap(
                                          spacing: 6,
                                          children: a.highlights.take(2).map((h) => Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF1F5F9),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(h, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                                          )).toList(),
                                        ),
                                        ElevatedButton(
                                          onPressed: () {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text('Selected "${a.name}" for itinerary'),
                                                backgroundColor: AppTheme.forestGreen,
                                              ),
                                            );
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppTheme.forestGreen,
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                                          ),
                                          child: const Text('Add Activity', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
