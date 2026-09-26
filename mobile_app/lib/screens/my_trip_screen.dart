import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class MyTripScreen extends StatefulWidget {
  const MyTripScreen({super.key});

  @override
  State<MyTripScreen> createState() => _MyTripScreenState();
}

class _MyTripScreenState extends State<MyTripScreen> {
  final List<Map<String, dynamic>> itineraryItems = [
    {
      'day': 'Day 1',
      'title': 'Rishikesh to Guptkashi Corridor',
      'desc': 'Pick up Royal Enfield Himalayan 450 (3-Layer Verified) from Rishikesh Tapovan. Ride along Alaknanda river corridor to Guptkashi.',
      'type': 'RIDE & STAY',
      'cost': '₹1,200 (Bike) + ₹1,600 (Homestay)',
      'status': 'ESCROW SECURED',
    },
    {
      'day': 'Day 2',
      'title': 'Gaurikund to Kedarnath Base Camp (3,583m)',
      'desc': 'Early morning start from Gaurikund. Verified Guide Vikram Singh Bisht joined at Sonprayag. Altitude AMS checklist green.',
      'type': 'TREK & PILGRIMAGE',
      'cost': '₹1,500 (Guide Fee)',
      'status': 'ACTIVE TRAIL',
    },
    {
      'day': 'Day 3',
      'title': 'Morning Temple Darshan & Descent to Chopta',
      'desc': 'Attend Maha Aarti at Kedarnath temple. Descend to Chopta - the Mini Switzerland of Uttarakhand. Evening bonfires.',
      'type': 'DARSHAN & RETREAT',
      'cost': '₹2,400 (Alpine Cottage)',
      'status': 'CONFIRMED',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'My Mountain Expeditions',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Live Trip Header
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F3D2E), Color(0xFF1E5E47)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.2), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF059669),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text('TRIP #UK-EXP-2026', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
                      ),
                      const Row(
                        children: [
                          Icon(Icons.shield_outlined, color: Color(0xFF86EFAC), size: 14),
                          SizedBox(width: 4),
                          Text('100% Escrow Vault Active', style: TextStyle(color: Color(0xFF86EFAC), fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text('Kedarnath & Tungnath High Altitude Circuit', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  const Text('3 Days • 2 Persons • 1 Ride • 1 Guide', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('TOTAL BUDGET', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 8, fontWeight: FontWeight.bold)),
                              Text('₹6,700', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('OFFLINE VOUCHER', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 8, fontWeight: FontWeight.bold)),
                              Text('Ready (QR)', style: TextStyle(color: Color(0xFF86EFAC), fontSize: 16, fontWeight: FontWeight.w900)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            const Text('Day-by-Day Journey Plan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            const SizedBox(height: 12),

            // Stepper timeline
            ...itineraryItems.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(item['day'], style: const TextStyle(color: Color(0xFF0F3D2E), fontSize: 11, fontWeight: FontWeight.w900)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(item['status'], style: const TextStyle(color: Color(0xFF1D4ED8), fontSize: 9, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(item['title'], style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                  const SizedBox(height: 4),
                  Text(item['desc'], style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.4)),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(item['cost'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0F3D2E))),
                      const Icon(Icons.arrow_forward_ios, size: 12, color: Color(0xFF94A3B8)),
                    ],
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
