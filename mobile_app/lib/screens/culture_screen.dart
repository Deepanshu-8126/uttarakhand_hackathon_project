import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/destination.dart';
import '../services/api_service.dart';

class CultureScreen extends StatefulWidget {
  const CultureScreen({super.key});

  @override
  State<CultureScreen> createState() => _CultureScreenState();
}

class _CultureScreenState extends State<CultureScreen> {
  List<CulturePlace> places = [];
  bool isLoading = true;
  String searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadCulture();
  }

  Future<void> _loadCulture() async {
    final res = await ApiService.getCulturePlaces();
    if (mounted) {
      setState(() {
        places = res;
        isLoading = false;
      });
    }
  }

  List<CulturePlace> get filteredPlaces {
    return places.where((p) {
      return searchQuery.isEmpty ||
          p.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          p.district.toLowerCase().contains(searchQuery.toLowerCase());
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'Uttarakhand Culture & Heritage',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : RefreshIndicator(
              onRefresh: _loadCulture,
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
                              imageUrl: 'https://images.unsplash.com/photo-1596404987012-4217117df854?q=80&w=1200&auto=format&fit=crop',
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
                                    'LIVING PAHAD HERITAGE',
                                    style: TextStyle(color: Color(0xFFFBBF24), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Aipan Art, Woodcraft & Folklore',
                                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                                  ),
                                  Text(
                                    'Ancient traditions, folk architecture and Himalayan customs',
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
                            hintText: 'Search Aipan art, Koti Banal woodcraft, festivals...',
                            hintStyle: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            prefixIcon: Icon(Icons.search, color: AppTheme.forestGreen, size: 20),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Culture Cards
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
                                  height: 150,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(color: AppTheme.beige),
                                  errorWidget: (context, url, error) => Container(
                                    color: AppTheme.beige,
                                    child: const Icon(Icons.palette_outlined, color: AppTheme.forestGreen, size: 40),
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
                                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFE0E7FF),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            p.region,
                                            style: const TextStyle(color: Color(0xFF3730A3), fontSize: 10, fontWeight: FontWeight.w800),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on, size: 13, color: Color(0xFF059669)),
                                        const SizedBox(width: 3),
                                        Text('${p.district} • Pahadi Heritage', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
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
                                          color: const Color(0xFFFEF3C7),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(h, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF92400E))),
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
