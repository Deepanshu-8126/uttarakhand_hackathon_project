import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../models/destination.dart';

class DestinationDetailScreen extends StatelessWidget {
  final Destination destination;
  const DestinationDetailScreen({super.key, required this.destination});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      body: CustomScrollView(
        slivers: [
          // ── Hero App Bar ──────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppTheme.forestGreen,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.4),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundColor: Colors.black.withOpacity(0.4),
                  child: IconButton(
                    icon: const Icon(Icons.favorite_border, color: Colors.white, size: 20),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${destination.name} saved to Wishlist!')),
                      );
                    },
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: destination.imageUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: AppTheme.darkGreen),
                    errorWidget: (context, url, error) => Container(color: AppTheme.darkGreen, child: const Icon(Icons.landscape, color: Colors.white30, size: 64)),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withOpacity(0.7),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 16,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.earthBrown,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            destination.category.toUpperCase(),
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          destination.name,
                          style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          '${destination.district} • ${destination.region} Region',
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Details Content ───────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quick stats row
                  Row(
                    children: [
                      _buildStatChip(Icons.terrain, '${destination.altitude}m', 'Altitude'),
                      const SizedBox(width: 10),
                      _buildStatChip(Icons.currency_rupee, '₹${destination.estimatedBudget}', 'Avg Budget'),
                      const SizedBox(width: 10),
                      _buildStatChip(Icons.star, '${destination.rating}', 'Rating'),
                    ],
                  ),

                  const SizedBox(height: 24),

                  const Text('About', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.textDark)),
                  const SizedBox(height: 8),
                  Text(
                    destination.description.isNotEmpty ? destination.description : destination.shortDescription,
                    style: const TextStyle(fontSize: 14, color: AppTheme.mutedText, height: 1.5),
                  ),

                  const SizedBox(height: 24),

                  const Text('Best Time to Visit', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.textDark)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: AppTheme.beige, borderRadius: BorderRadius.circular(16)),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today, color: AppTheme.forestGreen, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            destination.bestTimeToVisit,
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textDark),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  const Text('Key Highlights', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.textDark)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: destination.highlights.map((h) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: AppTheme.borderLight),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle, color: AppTheme.forestGreen, size: 14),
                            const SizedBox(width: 6),
                            Text(h, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 28),

                  // ── Verified Traveler Reviews & Ratings ──
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.verified, color: AppTheme.forestGreen, size: 16),
                              SizedBox(width: 6),
                              Text('Verified Traveler Reviews', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
                            ],
                          ),
                          const SizedBox(height: 2),
                          const Text('GPS Tracked • Zero Fake Reviews', style: TextStyle(fontSize: 11, color: AppTheme.mutedText)),
                        ],
                      ),
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          backgroundColor: const Color(0xFFECFDF5),
                          foregroundColor: AppTheme.forestGreen,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        ),
                        icon: const Icon(Icons.edit_note, size: 16),
                        label: const Text('Write Review', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                        onPressed: () => _showWriteReviewDialog(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Rating Summary Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.borderLight),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text('${destination.rating}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
                                const SizedBox(width: 6),
                                const Icon(Icons.star, color: Color(0xFFF59E0B), size: 24),
                              ],
                            ),
                            Text('Based on ${destination.reviewsCount > 0 ? destination.reviewsCount : 142} trek reviews', style: const TextStyle(fontSize: 10, color: AppTheme.mutedText)),
                          ],
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.monetization_on, color: Color(0xFFD97706), size: 14),
                              SizedBox(width: 4),
                              Text('+50 DevBhoomi Coins', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF92400E))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Sample Verified Review Cards
                  _buildReviewCard(
                    author: 'Rohan Sharma',
                    tag: 'Alpine Trekker',
                    rating: 5,
                    date: '3 days ago',
                    comment: 'Genuinely breathtaking experience. The trail is well-maintained and local guides provide emergency medical aid. Offline route tracking was extremely helpful when mobile network dropped.',
                  ),
                  const SizedBox(height: 10),
                  _buildReviewCard(
                    author: 'Dr. Ananya Joshi',
                    tag: 'Family Pilgrim',
                    rating: 5,
                    date: '1 week ago',
                    comment: 'Clean homestays, warm Pahadi food, and authentic mountain hospitality. Booking through the platform was transparent and seamless.',
                  ),

                  const SizedBox(height: 24),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.forestGreen, width: 2),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                          ),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Checking stays near ${destination.name}...')),
                            );
                          },
                          child: const Text('Find Stays', style: TextStyle(color: AppTheme.forestGreen, fontWeight: FontWeight.w800)),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.forestGreen,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                          ),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Added ${destination.name} to Trip Planner!')),
                            );
                          },
                          child: const Text('Plan Trip', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard({
    required String author,
    required String tag,
    required int rating,
    required String date,
    required String comment,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: const Color(0xFF0F3D2E),
                    child: Text(author[0], style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(author, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppTheme.textDark)),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFFA7F3D0)),
                            ),
                            child: const Text('VERIFIED', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
                          ),
                        ],
                      ),
                      Text(tag, style: const TextStyle(fontSize: 9, color: AppTheme.mutedText)),
                    ],
                  ),
                ],
              ),
              Row(
                children: List.generate(5, (i) => Icon(Icons.star, size: 12, color: i < rating ? const Color(0xFFF59E0B) : const Color(0xFFCBD5E1))),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(comment, style: const TextStyle(fontSize: 11, color: Color(0xFF334155), height: 1.4)),
          const SizedBox(height: 6),
          Text(date, style: const TextStyle(fontSize: 9, color: AppTheme.mutedText)),
        ],
      ),
    );
  }

  void _showWriteReviewDialog(BuildContext context) {
    int selectedStars = 5;
    final textCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Row(
                children: const [
                  Icon(Icons.rate_review, color: AppTheme.forestGreen, size: 20),
                  SizedBox(width: 8),
                  Text('Write Verified Review', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('How was your visit to ${destination.name}?', style: const TextStyle(fontSize: 12, color: AppTheme.mutedText)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final starNum = index + 1;
                        return IconButton(
                          icon: Icon(
                            Icons.star,
                            color: starNum <= selectedStars ? const Color(0xFFF59E0B) : const Color(0xFFCBD5E1),
                            size: 28,
                          ),
                          onPressed: () => setDialogState(() => selectedStars = starNum),
                        );
                      }),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: textCtrl,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Share road condition, weather, clean stays, or tips for fellow travelers...',
                        hintStyle: const TextStyle(fontSize: 11, color: AppTheme.mutedText),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderLight)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.shield_outlined, color: Color(0xFF059669), size: 14),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Your review earns +50 DevBhoomi Coins upon GPS proof verification.',
                              style: TextStyle(fontSize: 10, color: Color(0xFF065F46), fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  child: const Text('Cancel', style: TextStyle(color: AppTheme.mutedText, fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.forestGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    Navigator.pop(dialogCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Review submitted! +50 DevBhoomi Coins credited to your wallet.'),
                        backgroundColor: Color(0xFF0F3D2E),
                      ),
                    );
                  },
                  child: const Text('Submit Review', style: TextStyle(fontWeight: FontWeight.w900)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildStatChip(IconData icon, String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppTheme.forestGreen, size: 18),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
            Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.mutedText)),
          ],
        ),
      ),
    );
  }
}
