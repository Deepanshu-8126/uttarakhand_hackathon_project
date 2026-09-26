import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/destination.dart';
import '../services/api_service.dart';

class SpiritualScreen extends StatefulWidget {
  const SpiritualScreen({super.key});

  @override
  State<SpiritualScreen> createState() => _SpiritualScreenState();
}

class _SpiritualScreenState extends State<SpiritualScreen> {
  List<SpiritualPlace> places = [];
  bool isLoading = true;
  String searchQuery = '';
  String selectedRegion = 'All';

  final List<String> regions = ['All', 'Garhwal', 'Kumaon'];

  @override
  void initState() {
    super.initState();
    _loadSpiritual();
  }

  Future<void> _loadSpiritual() async {
    final res = await ApiService.getSpiritualPlaces();
    if (mounted) {
      setState(() {
        places = res;
        isLoading = false;
      });
    }
  }

  List<SpiritualPlace> get filteredPlaces {
    return places.where((p) {
      final matchRegion = selectedRegion == 'All' || p.region.toLowerCase() == selectedRegion.toLowerCase();
      final matchSearch = searchQuery.isEmpty ||
          p.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          p.district.toLowerCase().contains(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'Spiritual & Sacred Uttarakhand',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : RefreshIndicator(
              onRefresh: _loadSpiritual,
              color: AppTheme.forestGreen,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Hero Banner matching Web
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
                              imageUrl: 'https://images.unsplash.com/photo-1627882672776-8803eb6dfb92?q=80&w=1200&auto=format&fit=crop',
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
                                    'SACRED HIMALAYAS',
                                    style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Char Dham & Ancient Shrines',
                                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                                  ),
                                  Text(
                                    'Explore the sacred energy centers and ancient Vedic temples',
                                    style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Search & Region Filter
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
                          decoration: InputDecoration(
                            hintText: 'Search Kedarnath, Badrinath, Jageshwar...',
                            hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            prefixIcon: const Icon(Icons.search, color: AppTheme.forestGreen, size: 20),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ),

                    // Filter Pills
                    SizedBox(
                      height: 36,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: regions.length,
                        itemBuilder: (context, i) {
                          final r = regions[i];
                          final isSel = selectedRegion == r;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: () => setState(() => selectedRegion = r),
                              borderRadius: BorderRadius.circular(999),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSel ? AppTheme.forestGreen : Colors.white,
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(color: isSel ? AppTheme.forestGreen : const Color(0xFFE2E8F0)),
                                ),
                                child: Text(
                                  r,
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

                    // Shrines List
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filteredPlaces.length,
                      itemBuilder: (context, idx) {
                        final p = filteredPlaces[idx];
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
                                  imageUrl: p.imageUrl,
                                  height: 160,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(color: AppTheme.beige),
                                  errorWidget: (context, url, error) => Container(
                                    color: AppTheme.beige,
                                    child: const Icon(Icons.temple_hindu, color: AppTheme.forestGreen, size: 40),
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
                                            p.name,
                                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: Color(0xFF0F172A)),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFEF3C7),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            p.region,
                                            style: const TextStyle(color: Color(0xFF92400E), fontSize: 10, fontWeight: FontWeight.w800),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on, size: 13, color: Color(0xFF059669)),
                                        const SizedBox(width: 3),
                                        Text('${p.district} District', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      p.description.isNotEmpty ? p.description : p.shortDescription,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, color: Color(0xFF475569), height: 1.4),
                                    ),
                                    const SizedBox(height: 12),
                                    Wrap(
                                      spacing: 6,
                                      runSpacing: 4,
                                      children: p.highlights.map((h) => Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF1F5F9),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(h, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                                      )).toList(),
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
