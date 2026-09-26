import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/stay.dart';
import '../services/api_service.dart';

class GuidesScreen extends StatefulWidget {
  const GuidesScreen({super.key});

  @override
  State<GuidesScreen> createState() => _GuidesScreenState();
}

class _GuidesScreenState extends State<GuidesScreen> {
  List<Guide> guides = [];
  bool isLoading = true;
  String searchQuery = '';
  String selectedFilter = 'All';

  final List<String> specialties = ['All', 'High Altitude', 'Valley of Flowers', 'Cultural', 'Wildlife'];

  @override
  void initState() {
    super.initState();
    _loadGuides();
  }

  Future<void> _loadGuides() async {
    final res = await ApiService.getGuides();
    if (mounted) {
      setState(() {
        guides = res;
        isLoading = false;
      });
    }
  }

  List<Guide> get filteredGuides {
    return guides.where((g) {
      final matchSpecialty = selectedFilter == 'All' ||
          g.specialties.any((s) => s.toLowerCase().contains(selectedFilter.toLowerCase()));
      final matchSearch = searchQuery.isEmpty ||
          g.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          g.location.toLowerCase().contains(searchQuery.toLowerCase());
      return matchSpecialty && matchSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'Verified Local Mountain Guides',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.forestGreen))
          : RefreshIndicator(
              onRefresh: _loadGuides,
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
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F3D2E),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.2), blurRadius: 16, offset: const Offset(0, 6)),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.verified_user, color: Color(0xFF34D399), size: 16),
                              SizedBox(width: 6),
                              Text('100% LOCAL HIMALAYAN RESIDENTS', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Explore with Someone Who Knows the Terrain',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Government certified, first-aid trained, and high-altitude emergency ready.',
                            style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                          ),
                        ],
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
                            hintText: 'Search guides by name, region or trail...',
                            hintStyle: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            prefixIcon: Icon(Icons.search, color: AppTheme.forestGreen, size: 20),
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
                        itemCount: specialties.length,
                        itemBuilder: (context, i) {
                          final s = specialties[i];
                          final isSel = selectedFilter == s;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: () => setState(() => selectedFilter = s),
                              borderRadius: BorderRadius.circular(999),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSel ? AppTheme.forestGreen : Colors.white,
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(color: isSel ? AppTheme.forestGreen : const Color(0xFFE2E8F0)),
                                ),
                                child: Text(
                                  s,
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

                    // Guide Cards
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filteredGuides.length,
                      itemBuilder: (context, idx) {
                        final g = filteredGuides[idx];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
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
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: CachedNetworkImage(
                                      imageUrl: g.imageUrl,
                                      height: 90,
                                      width: 90,
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) => Container(color: AppTheme.beige),
                                      errorWidget: (context, url, error) => Container(
                                        color: AppTheme.beige,
                                        child: const Icon(Icons.person, color: AppTheme.forestGreen, size: 40),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                g.name,
                                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFFEF3C7),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Row(
                                                children: [
                                                  const Icon(Icons.star_rounded, size: 13, color: Color(0xFFD97706)),
                                                  const SizedBox(width: 2),
                                                  Text(g.rating.toString(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF92400E))),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 2),
                                        Text(g.location, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
                                        const SizedBox(height: 4),
                                        Text(g.experience, style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w700)),
                                        const SizedBox(height: 4),
                                        Text('Speaks: ${g.languages.join(", ")}', style: const TextStyle(fontSize: 10, color: Color(0xFF475569))),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: g.specialties.map((s) => Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(s, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                                )).toList(),
                              ),
                              const SizedBox(height: 14),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('₹${g.pricePerDay}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                                      const Text('per day • includes trail guidance', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                                    ],
                                  ),
                                  ElevatedButton(
                                    onPressed: () {
                                      showDialog(
                                        context: context,
                                        builder: (_) => AlertDialog(
                                          title: Text('Book ${g.name}'),
                                          content: Text('Confirm booking with ${g.name} for ₹${g.pricePerDay}/day with 100% Escrow security.'),
                                          actions: [
                                            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                            ElevatedButton(
                                              onPressed: () {
                                                Navigator.pop(context);
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(content: Text('Booking request sent to ${g.name}!'), backgroundColor: AppTheme.forestGreen),
                                                );
                                              },
                                              child: const Text('Confirm Escrow Book'),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.forestGreen,
                                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                                    ),
                                    child: const Text('Book Guide', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                                  ),
                                ],
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
