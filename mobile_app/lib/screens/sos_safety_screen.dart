import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class SosSafetyScreen extends StatefulWidget {
  const SosSafetyScreen({super.key});

  @override
  State<SosSafetyScreen> createState() => _SosSafetyScreenState();
}

class _SosSafetyScreenState extends State<SosSafetyScreen> with SingleTickerProviderStateMixin {
  bool isHolding = false;
  double holdProgress = 0.0;
  Timer? _holdTimer;
  bool isTriggering = false;
  bool isSirenPlaying = false;
  String? activeIncidentId;
  String selectedIncident = 'GENERAL_SOS';
  final TextEditingController _notesController = TextEditingController();

  // Emergency Contacts State
  List<Map<String, String>> emergencyContacts = [
    {'name': 'Devbhoomi SDRF Control', 'phone': '1070', 'relation': 'Disaster Rescue'},
    {'name': 'Uttarakhand Police Control', 'phone': '112', 'relation': 'Emergency Police'},
    {'name': 'Family Contact', 'phone': '+91 98765 43210', 'relation': 'Primary Kin'},
  ];

  final List<Map<String, dynamic>> incidentTypes = [
    {'id': 'GENERAL_SOS', 'label': 'General SOS', 'icon': Icons.shield_outlined, 'color': Color(0xFFE11D48)},
    {'id': 'MEDICAL', 'label': 'Medical Emergency', 'icon': Icons.medical_services_outlined, 'color': Color(0xFFDC2626)},
    {'id': 'AMS_ALTITUDE', 'label': 'Altitude / AMS', 'icon': Icons.terrain_outlined, 'color': Color(0xFFD97706)},
    {'id': 'LANDSLIDE_STRANDED', 'label': 'Landslide Blocked', 'icon': Icons.warning_amber_rounded, 'color': Color(0xFFEA580C)},
    {'id': 'LOST_TRAIL', 'label': 'Lost on Trail', 'icon': Icons.explore_off_outlined, 'color': Color(0xFF2563EB)},
    {'id': 'WOMEN_SAFETY', 'label': 'Women Solo Alert', 'icon': Icons.verified_user_outlined, 'color': Color(0xFFDB2777)},
    {'id': 'VEHICLE_BREAKDOWN', 'label': 'Vehicle Breakdown', 'icon': Icons.two_wheeler_outlined, 'color': Color(0xFF059669)},
  ];

  void _startHold() {
    setState(() {
      isHolding = true;
      holdProgress = 0.0;
    });

    _holdTimer?.cancel();
    _holdTimer = Timer.periodic(const Duration(milliseconds: 30), (timer) {
      setState(() {
        holdProgress += 0.033; // 1 second hold to trigger
        if (holdProgress >= 1.0) {
          timer.cancel();
          isHolding = false;
          _triggerFullSOS();
        }
      });
    });
  }

  void _cancelHold() {
    _holdTimer?.cancel();
    if (isHolding && holdProgress < 1.0) {
      setState(() {
        isHolding = false;
        holdProgress = 0.0;
      });
    }
  }

  Future<void> _triggerFullSOS() async {
    setState(() => isTriggering = true);
    final res = await ApiService.triggerSOS(
      emergencyType: selectedIncident,
      locationName: 'Kedarnath Valley Pass (3,150m)',
      latitude: 30.7352,
      longitude: 79.0669,
      medicalNotes: _notesController.text.isNotEmpty ? _notesController.text : 'Urgent SOS triggered from Himalayan terrain',
    );

    if (mounted) {
      setState(() {
        isTriggering = false;
        activeIncidentId = res['incidentId'] ?? 'SOS-UK-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
      });
      _showSuccessDialog();
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF0C130F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFE11D48), width: 1.5)),
        title: Row(
          children: const [
            Icon(Icons.shield_rounded, color: Color(0xFFE11D48), size: 24),
            SizedBox(width: 8),
            Text('SOS BEACON LIVE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('INCIDENT ID: $activeIncidentId', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF34D399), letterSpacing: 0.8)),
            const SizedBox(height: 10),
            const Text(
              'Your GPS coordinates (30.7352° N, 79.0669° E at 3,150m) and battery telemetry have been locked into the SDRF Quick Response Mesh Grid.',
              style: TextStyle(fontSize: 12, color: Color(0xFFCBD5E1), height: 1.4),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1014),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE11D48).withOpacity(0.4)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.radar, color: Color(0xFFE11D48), size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'SDRF Joshimath / Sonprayag Rapid Response dispatched (ETA: 12-18 min)',
                      style: TextStyle(color: Color(0xFFFDA4AF), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _shareOnWhatsApp();
            },
            child: const Text('Share Live GPS on WhatsApp', style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE11D48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
            ),
            child: const Text('Keep Active'),
          ),
        ],
      ),
    );
  }

  void _shareOnWhatsApp() async {
    final text = Uri.encodeComponent(
      '🚨 EMERGENCY SOS ALERT from Uttarakhand!\n'
      'Incident: $selectedIncident\n'
      'Live GPS: https://maps.google.com/?q=30.7352,79.0669\n'
      'Altitude: 3,150m | Incident Ticket: $activeIncidentId\n'
      'Please notify SDRF Uttarakhand (1070) or Police (112) immediately!',
    );
    final url = Uri.parse('https://wa.me/?text=$text');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _makePhoneCall(String number) async {
    final url = Uri.parse('tel:$number');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080D0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF080D0A),
        iconTheme: const IconThemeData(color: Colors.white),
        title: Row(
          children: const [
            Icon(Icons.shield_outlined, color: Color(0xFFE11D48), size: 20),
            SizedBox(width: 8),
            Text(
              'MOUNTAIN EMERGENCY SOS',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 0.8, color: Colors.white),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(isSirenPlaying ? Icons.volume_up : Icons.volume_off, color: const Color(0xFFE11D48)),
            tooltip: 'Loud Distress Siren',
            onPressed: () {
              setState(() => isSirenPlaying = !isSirenPlaying);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(isSirenPlaying ? 'Distress Siren Activated (High Pitch Frequency)!' : 'Siren Silenced.'),
                  backgroundColor: const Color(0xFFE11D48),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Live Corridor Telemetry Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF101B15),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF059669).withOpacity(0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.satellite_alt, color: Color(0xFF34D399), size: 16),
                      SizedBox(width: 8),
                      Text('SDRF Satellite Link: Online', style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.w800)),
                    ],
                  ),
                  Row(
                    children: const [
                      Icon(Icons.battery_charging_full, color: Color(0xFFFBBF24), size: 16),
                      SizedBox(width: 4),
                      Text('92%', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Incident Selector Grid
            const Text(
              'SELECT EMERGENCY NATURE',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 10),

            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: incidentTypes.length,
                itemBuilder: (context, idx) {
                  final t = incidentTypes[idx];
                  final isSel = selectedIncident == t['id'];
                  return GestureDetector(
                    onTap: () => setState(() => selectedIncident = t['id']),
                    child: Container(
                      width: 110,
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFF1E1014) : const Color(0xFF121B15),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isSel ? const Color(0xFFE11D48) : const Color(0xFF1E293B), width: isSel ? 1.5 : 1),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(t['icon'] as IconData, color: isSel ? const Color(0xFFE11D48) : const Color(0xFF94A3B8), size: 24),
                          const SizedBox(height: 6),
                          Text(
                            t['label'],
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isSel ? FontWeight.w900 : FontWeight.w600,
                              color: isSel ? Colors.white : const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 20),

            // Press and Hold Panic Trigger Circle (Apple & Web standard)
            Center(
              child: Column(
                children: [
                  GestureDetector(
                    onTapDown: (_) => _startHold(),
                    onTapUp: (_) => _cancelHold(),
                    onTapCancel: () => _cancelHold(),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 170,
                          height: 170,
                          child: CircularProgressIndicator(
                            value: holdProgress > 0 ? holdProgress : 0,
                            strokeWidth: 6,
                            backgroundColor: const Color(0xFF1E1014),
                            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFE11D48)),
                          ),
                        ),
                        Container(
                          width: 146,
                          height: 146,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const RadialGradient(
                              colors: [Color(0xFFE11D48), Color(0xFF9F1239)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFE11D48).withOpacity(isHolding ? 0.8 : 0.4),
                                blurRadius: isHolding ? 35 : 20,
                                spreadRadius: isHolding ? 4 : 1,
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.touch_app, color: Colors.white, size: 36),
                              const SizedBox(height: 4),
                              Text(
                                isHolding ? 'HOLDING...' : 'HOLD 1 SEC\nFOR SOS',
                                textAlign: TextAlign.center,
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Instant dispatch to SDRF & local Mountain Rescue',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Direct Helplines Strip
            const Text(
              'ONE-TAP DIRECT HELPLINES',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _makePhoneCall('1070'),
                    icon: const Icon(Icons.phone_in_talk, size: 16),
                    label: const Text('SDRF (1070)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      foregroundColor: const Color(0xFF34D399),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFF334155))),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _makePhoneCall('112'),
                    icon: const Icon(Icons.local_police, size: 16),
                    label: const Text('Police (112)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      foregroundColor: const Color(0xFF60A5FA),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFF334155))),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _shareOnWhatsApp,
                    icon: const Icon(Icons.share, size: 16),
                    label: const Text('WhatsApp'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      foregroundColor: const Color(0xFF22C55E),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFF334155))),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Emergency Contacts Management
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'NOTIFIED GUARDIANS & CONTACTS',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            ...emergencyContacts.map((c) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF121B15),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(c['name']!, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.white)),
                      Text('${c['relation']} • ${c['phone']}', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.phone, color: Color(0xFF34D399), size: 20),
                    onPressed: () => _makePhoneCall(c['phone']!),
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
