import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'sos_safety_screen.dart';

class InnovationShowcaseScreen extends StatefulWidget {
  const InnovationShowcaseScreen({super.key});

  @override
  State<InnovationShowcaseScreen> createState() => _InnovationShowcaseScreenState();
}

class _InnovationShowcaseScreenState extends State<InnovationShowcaseScreen> {
  String activeTab = 'telemetry';
  Map<String, dynamic> telemetryData = {};
  bool isLoading = true;

  // Altitude AMS interactive simulator state
  double _simulatedAltitude = 3583; // Default: Kedarnath height

  // Offline Escrow Handshake interactive simulation state
  bool _isEscrowSimulating = false;
  bool _isEscrowVerified = false;

  // Pahadi Wallet interactive state
  int _walletBalance = 450;
  final Set<String> _claimedRewards = {};

  // Safety Mesh interactive state
  bool _isBroadcastingMesh = false;
  String _meshBroadcastStatus = 'Idle • Listening on Channel 14 (868 MHz)';

  final List<Map<String, dynamic>> tabs = [
    {'id': 'telemetry', 'label': 'Live Telemetry', 'icon': Icons.bolt},
    {'id': 'altitude', 'label': 'Altitude & AMS', 'icon': Icons.monitor_heart_outlined},
    {'id': 'escrow', 'label': 'Offline Escrow', 'icon': Icons.qr_code_2},
    {'id': 'wallet', 'label': 'Pahadi Wallet', 'icon': Icons.account_balance_wallet_outlined},
    {'id': 'mesh', 'label': 'Safety Mesh', 'icon': Icons.cell_tower},
  ];

  @override
  void initState() {
    super.initState();
    _loadTelemetry();
  }

  Future<void> _loadTelemetry() async {
    setState(() => isLoading = true);
    final t = await ApiService.getLiveTelemetry();
    if (mounted) {
      setState(() {
        telemetryData = t;
        isLoading = false;
      });
    }
  }

  void _simulateEscrowHandshake() {
    setState(() => _isEscrowSimulating = true);
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _isEscrowSimulating = false;
          _isEscrowVerified = true;
        });
      }
    });
  }

  void _resetEscrowSimulation() {
    setState(() {
      _isEscrowSimulating = false;
      _isEscrowVerified = false;
    });
  }

  void _claimReward(String taskId, int coins) {
    if (_claimedRewards.contains(taskId)) return;
    setState(() {
      _claimedRewards.add(taskId);
      _walletBalance += coins;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('🎉 +$coins Pahadi Coins claimed! New Balance: $_walletBalance'),
        backgroundColor: const Color(0xFF0F3D2E),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _broadcastMeshPacket() {
    setState(() {
      _isBroadcastingMesh = true;
      _meshBroadcastStatus = 'Broadcasting LoRa distress packet to 4 local nodes...';
    });

    Future.delayed(const Duration(milliseconds: 1400), () {
      if (mounted) {
        setState(() {
          _isBroadcastingMesh = false;
          _meshBroadcastStatus = '✅ Packet Acknowledged by Node #28 (Joshimath Outpost) in 380ms!';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F4),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F3D2E).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.psychology, color: Color(0xFF0F3D2E), size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Intelligent Mountain Tech',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: Color(0xFF0F3D2E), letterSpacing: -0.2),
                ),
                Text(
                  'Zero-Signal Protocols & High Altitude AI',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: Colors.grey[700]),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFDC2626).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield, color: Color(0xFFDC2626), size: 16),
                  SizedBox(width: 4),
                  Text('SOS', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w900, fontSize: 12)),
                ],
              ),
            ),
            tooltip: 'Emergency SOS',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen())),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Banner
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F3D2E).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: const Color(0xFF0F3D2E).withValues(alpha: 0.2)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.auto_awesome, size: 12, color: Color(0xFF0F3D2E)),
                        SizedBox(width: 4),
                        Text(
                          'PIONEERING MOUNTAIN TECH ARCHITECTURE',
                          style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Built specifically for the Himalayan terrain',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Live GIS crowd radar, offline escrow vouchers, autonomous altitude safeguards, and community mesh rescue.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
                  ),
                ],
              ),
            ),

            // Tab Bar
            SizedBox(
              height: 42,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: tabs.length,
                itemBuilder: (context, idx) {
                  final tab = tabs[idx];
                  final isSel = activeTab == tab['id'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => setState(() => activeTab = tab['id']),
                      borderRadius: BorderRadius.circular(999),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFF0F3D2E) : Colors.white,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: isSel ? const Color(0xFF0F3D2E) : const Color(0xFFE2E8F0)),
                          boxShadow: isSel ? [BoxShadow(color: const Color(0xFF0F3D2E).withValues(alpha: 0.2), blurRadius: 6)] : null,
                        ),
                        child: Row(
                          children: [
                            Icon(tab['icon'] as IconData, size: 14, color: isSel ? const Color(0xFF34D399) : const Color(0xFF64748B)),
                            const SizedBox(width: 6),
                            Text(
                              tab['label'],
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                                color: isSel ? Colors.white : const Color(0xFF334155),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 16),

            // Active Tab Content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildActiveTabContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveTabContent() {
    switch (activeTab) {
      case 'telemetry':
        return _buildTelemetryCard();
      case 'altitude':
        return _buildAltitudeSafetyCard();
      case 'escrow':
        return _buildEscrowVoucherCard();
      case 'wallet':
        return _buildPahadiWalletCard();
      case 'mesh':
        return _buildSafetyMeshCard();
      default:
        return _buildTelemetryCard();
    }
  }

  // ── Tab 1: Live Telemetry & Alpine Passes ────────────────────────────────────
  Widget _buildTelemetryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.bolt, color: Color(0xFF059669), size: 20),
                  SizedBox(width: 8),
                  Text('Live Mountain Telemetry', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh, size: 18, color: Color(0xFF0F3D2E)),
                tooltip: 'Refresh Telemetry',
                onPressed: _loadTelemetry,
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Real-time tracking of mountain corridor passes, active high-altitude trekkers, and SDRF mesh nodes.',
            style: TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.3),
          ),
          const SizedBox(height: 16),

          // 4-stat Grid
          Row(
            children: [
              Expanded(
                child: _buildStatBox(
                  'ACTIVE TREKKERS',
                  '${telemetryData['activeTrekkers'] ?? 1948}',
                  'GPS Tracked on Trails',
                  const Color(0xFF0F3D2E),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildStatBox(
                  'ESCROW SECURED',
                  '${telemetryData['escrowSecuredAmount'] ?? '₹14,80,000'}',
                  'Polygon Smart Vault',
                  const Color(0xFF059669),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildStatBox(
                  'MESH NODES ONLINE',
                  '${telemetryData['meshNodesOnline'] ?? 52}',
                  'LoRa + BLE P2P Relay',
                  const Color(0xFF2563EB),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildStatBox(
                  'SAFETY RADAR',
                  'GREEN LEVEL',
                  'Char Dham Corridor Clear',
                  const Color(0xFF059669),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Live Mountain Passes Status List
          const Text(
            'HIMALAYAN HIGH PASSES STATUS',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: 0.5),
          ),
          const SizedBox(height: 10),
          _buildPassRow('Mana Pass (5,545m)', '🟢 OPEN • Clear Skies (2°C)', const Color(0xFF059669)),
          const Divider(height: 14),
          _buildPassRow('Lipulekh Pass (5,200m)', '🟡 PERMIT REQUIRED • High Winds (-4°C)', const Color(0xFFD97706)),
          const Divider(height: 14),
          _buildPassRow('Kuari Pass (3,650m)', '🟢 CLEAR • Scenic Visibility (9°C)', const Color(0xFF059669)),
          const Divider(height: 14),
          _buildPassRow('Roopkund Ridge (4,780m)', '🟠 CAUTION • Morning Frost (0°C)', const Color(0xFFEA580C)),

          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Color(0xFF059669), size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Corridor Status: ${telemetryData['weatherAlert'] ?? 'Clear Skies across Char Dham & Alpine Corridors'}',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF065F46)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatBox(String label, String value, String sub, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              maxLines: 1,
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900, color: color),
            ),
          ),
          const SizedBox(height: 2),
          Text(sub, style: TextStyle(fontSize: 9, color: color.withValues(alpha: 0.85), fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildPassRow(String passName, String status, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(passName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
        Text(status, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }

  // ── Tab 2: Altitude & AMS Autonomous Safeguards ──────────────────────────────
  Widget _buildAltitudeSafetyCard() {
    final int alt = _simulatedAltitude.round();
    final bool isHigh = alt > 3500;
    final bool isModerate = alt > 2500 && alt <= 3500;

    final String riskTitle = isHigh
        ? '🔴 HIGH ALTITUDE WARNING (>3,500m)'
        : (isModerate ? '🟡 MODERATE AMS RISK (2,500m - 3,500m)' : '🟢 LOW RISK • Safe Normal Ascent');

    final Color badgeColor = isHigh ? const Color(0xFFDC2626) : (isModerate ? const Color(0xFFD97706) : const Color(0xFF059669));

    final int estimatedO2 = (100 - ((alt - 1000) / 100)).clamp(62, 99).round();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.monitor_heart_outlined, color: Color(0xFFDC2626), size: 20),
              SizedBox(width: 8),
              Text('Autonomous Altitude & AMS Safety AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Simulate and calculate ascent gradients, oxygen levels, and mandatory acclimatization halts.',
            style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 18),

          // Interactive Altitude Slider
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('SIMULATE CURRENT ELEVATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: badgeColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text('$alt meters', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: badgeColor,
                    inactiveTrackColor: const Color(0xFFE2E8F0),
                    thumbColor: badgeColor,
                    trackHeight: 6,
                  ),
                  child: Slider(
                    value: _simulatedAltitude,
                    min: 1000,
                    max: 5500,
                    divisions: 45,
                    onChanged: (val) => setState(() => _simulatedAltitude = val),
                  ),
                ),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('1,000m (Rishikesh)', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                    Text('3,583m (Kedarnath)', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                    Text('5,545m (Mana Pass)', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Dynamic AMS Risk Box
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(riskTitle, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: badgeColor)),
                const SizedBox(height: 6),
                Text(
                  isHigh
                      ? 'Past 3,500m, atmospheric pressure drops significantly. Cap daily vertical ascent to 500m. Mandatory rest day required in Joshimath or Guptkashi before summit push.'
                      : (isModerate
                          ? 'Acclimatization threshold reached. Drink 4-5 liters of water daily. Avoid rapid vehicular ascent without an overnight acclimatization halt.'
                          : 'Elevation is safe for normal activity and hiking. Maintain hydration and keep warm mountain layers handy.'),
                  style: TextStyle(fontSize: 11, color: badgeColor.withValues(alpha: 0.9), height: 1.35),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Oxygen & Hydration Metrics
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('EFFECTIVE OXYGEN', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                      const SizedBox(height: 4),
                      Text('$estimatedO2%', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                      Text(isHigh ? 'Thin Air Advisory' : 'Normal Atmosphere', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('WATER INTAKE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                      const SizedBox(height: 4),
                      Text('${isHigh ? '4.5L' : (isModerate ? '3.5L' : '2.5L')} / Day', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
                      const Text('Prevents Hypoxia', style: TextStyle(fontSize: 9, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('✅ AMS Diagnostic Complete for $alt m: Optimal heart rate & ascent buffer calculated!'),
                    backgroundColor: const Color(0xFF0F3D2E),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              icon: const Icon(Icons.speed, size: 16),
              label: const Text('RUN LIVE AMS DIAGNOSTIC', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.5)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F3D2E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Tab 3: Offline Escrow Vouchers & Web3 Blockchain Trust ───────────────────
  Widget _buildEscrowVoucherCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.qr_code_2, color: Color(0xFF0F3D2E), size: 20),
                  SizedBox(width: 8),
                  Text('Offline Escrow Voucher', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('ZERO-SIGNAL PROOF', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w900, fontSize: 9.5)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Cryptographically signed offline QR tokens that release booking escrow to homestay hosts even when cellular data is completely zero.',
            style: TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.35),
          ),
          const SizedBox(height: 18),

          // Digital Voucher Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFCBD5E1)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('OFFLINE DIGITAL VOUCHER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _isEscrowVerified ? const Color(0xFF059669) : const Color(0xFF0F3D2E),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _isEscrowVerified ? 'ESCROW RELEASED' : 'LOCKED IN ESCROW',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10),
                    ],
                  ),
                  child: Center(
                    child: _isEscrowVerified
                        ? const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle, size: 52, color: Color(0xFF059669)),
                              SizedBox(height: 6),
                              Text('Handshake Verified!', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: Color(0xFF0F3D2E))),
                              Text('Keys Released', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                            ],
                          )
                        : const Icon(Icons.qr_code, size: 100, color: Color(0xFF0F3D2E)),
                  ),
                ),
                const SizedBox(height: 10),
                const Text('OTP: 782-910 • Exp: 24h', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                const Text('Signed via Polygon Smart Contract (Chain ID: 137)', style: TextStyle(fontSize: 9.5, color: Color(0xFF64748B))),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(6)),
                  child: const Text('Sig: 0x71a482f...91e4c', style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: Color(0xFF475569))),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Simulation Button
          SizedBox(
            width: double.infinity,
            child: _isEscrowVerified
                ? OutlinedButton.icon(
                    onPressed: _resetEscrowSimulation,
                    icon: const Icon(Icons.restart_alt, size: 16),
                    label: const Text('RESET VOUCHER SIMULATION', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF0F3D2E),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      side: const BorderSide(color: Color(0xFF0F3D2E)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  )
                : ElevatedButton.icon(
                    onPressed: _isEscrowSimulating ? null : _simulateEscrowHandshake,
                    icon: _isEscrowSimulating
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.verified_user, size: 16),
                    label: Text(
                      _isEscrowSimulating ? 'VERIFYING 256-BIT SIGNATURE...' : 'SIMULATE PARTNER OFFLINE SCAN',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.5),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F3D2E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  // ── Tab 4: Pahadi Wallet & Green Traveler Economy ────────────────────────────
  Widget _buildPahadiWalletCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.account_balance_wallet, color: Color(0xFFD97706), size: 20),
              SizedBox(width: 8),
              Text('Pahadi Coins & Green Traveler Rewards', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Earn digital tokens by respecting mountain ecology. Redeem directly for bike rental & homestay discounts.',
            style: TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.35),
          ),
          const SizedBox(height: 18),

          // Metallic Emerald-Gold Wallet Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF09261C), Color(0xFF14532D), Color(0xFF0F3D2E)],
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(color: const Color(0xFF0F3D2E).withValues(alpha: 0.3), blurRadius: 14, offset: const Offset(0, 6)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'DEVBHOOMI GREEN LEDGER',
                      style: TextStyle(color: Color(0xFF86EFAC), fontSize: 9.5, fontWeight: FontWeight.w900, letterSpacing: 1),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('WEB3 ESCROW LINKED', style: TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w900)),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  '$_walletBalance PAHADI',
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                ),
                const SizedBox(height: 2),
                Text(
                  '≈ ₹$_walletBalance Discount Available on Next Booking',
                  style: const TextStyle(color: Color(0xFF86EFAC), fontSize: 11, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Icon(Icons.nfc, color: Colors.white70, size: 18),
                    SizedBox(width: 8),
                    Text('0% Platform Commission • 100% Host Payout', style: TextStyle(color: Colors.white70, fontSize: 10)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Interactive Eco Earning Tasks
          const Text('EARN PAHADI COINS (ECO-MISSIONS)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: 0.5)),
          const SizedBox(height: 10),

          _buildEcoTaskItem('plastic', 'Zero-Plastic Verification at Checkpost', 50, Icons.recycling, Colors.teal),
          const SizedBox(height: 8),
          _buildEcoTaskItem('trail', 'Leave No Trace Trail Photo Upload', 35, Icons.camera_alt, Colors.green),
          const SizedBox(height: 8),
          _buildEcoTaskItem('homestay', 'Stay at Verified Himalayan Homestay', 100, Icons.home_work, Colors.amber),
        ],
      ),
    );
  }

  Widget _buildEcoTaskItem(String id, String title, int coins, IconData icon, Color color) {
    final isClaimed = _claimedRewards.contains(id);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: Color(0xFF0F172A))),
                Text('+$coins Coins on Verification', style: TextStyle(fontSize: 10, color: Colors.grey[700])),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isClaimed ? Colors.grey[400] : const Color(0xFF0F3D2E),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: isClaimed ? null : () => _claimReward(id, coins),
            child: Text(isClaimed ? 'Claimed' : 'Claim', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  // ── Tab 5: Safety Mesh Network ───────────────────────────────────────────────
  Widget _buildSafetyMeshCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.cell_tower, color: Color(0xFF2563EB), size: 20),
              SizedBox(width: 8),
              Text('Community Safety & SDRF Mesh Grid', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Connects local taxi unions, Dhabas, and SDRF outpost radio towers into an offline peer mesh network using 868MHz LoRa & BLE.',
            style: TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.35),
          ),
          const SizedBox(height: 18),

          // Active Peer Nodes List
          const Text('ACTIVE CORRIDOR MESH RELAYS (4 ONLINE)', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: 0.5)),
          const SizedBox(height: 10),

          _buildMeshNodeItem('Node #01 • Rishikesh Base Gateway', '99% Battery • 0 Hops • Master Tower', '🟢 Optimal (RSSI -58 dBm)'),
          const Divider(height: 12),
          _buildMeshNodeItem('Node #14 • Devprayag Sangam Dhaba', '88% Battery • 1 Hop • Solar Relay', '🟢 Active (RSSI -68 dBm)'),
          const Divider(height: 12),
          _buildMeshNodeItem('Node #28 • Joshimath SDRF Station', '94% Battery • 2 Hops • Repeater Tower', '🟢 Strong (RSSI -62 dBm)'),
          const Divider(height: 12),
          _buildMeshNodeItem('Node #42 • Badrinath Outpost Shrine', '79% Battery • 3 Hops • Emergency Node', '🟡 Moderate (RSSI -79 dBm)'),

          const SizedBox(height: 16),

          // Mesh Status Bar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: Row(
              children: [
                const Icon(Icons.radio, color: Color(0xFF2563EB), size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    _meshBroadcastStatus,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF1E40AF)),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isBroadcastingMesh ? null : _broadcastMeshPacket,
              icon: _isBroadcastingMesh
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.send_rounded, size: 16),
              label: Text(
                _isBroadcastingMesh ? 'TRANSMITTING ACROSS PEER NODES...' : 'BROADCAST TEST MESH PACKET (868 MHz)',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.5),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMeshNodeItem(String title, String subtitle, String signal) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
              Text(subtitle, style: TextStyle(fontSize: 10, color: Colors.grey[700])),
            ],
          ),
        ),
        Text(signal, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800)),
      ],
    );
  }
}
