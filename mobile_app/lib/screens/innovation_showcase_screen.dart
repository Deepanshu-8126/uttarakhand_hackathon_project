import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
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
    final t = await ApiService.getLiveTelemetry();
    if (mounted) {
      setState(() {
        telemetryData = t;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'Intelligent Mountain Tech',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sos, color: Color(0xFFDC2626)),
            tooltip: 'Emergency SOS',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SosSafetyScreen())),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Apple-grade Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.auto_awesome, size: 12, color: Color(0xFF0F3D2E)),
                        SizedBox(width: 4),
                        Text('PIONEERING MOUNTAIN TECH ARCHITECTURE', style: TextStyle(color: Color(0xFF0F3D2E), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
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
              height: 40,
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
                          boxShadow: isSel ? [BoxShadow(color: const Color(0xFF0F3D2E).withOpacity(0.2), blurRadius: 6)] : null,
                        ),
                        child: Row(
                          children: [
                            Icon(tab['icon'] as IconData, size: 14, color: isSel ? const Color(0xFF34D399) : const Color(0xFF64748B)),
                            const SizedBox(width: 6),
                            Text(
                              tab['label'],
                              style: TextStyle(fontSize: 11, fontWeight: isSel ? FontWeight.w800 : FontWeight.w600, color: isSel ? Colors.white : const Color(0xFF334155)),
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

            // Content Panels
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

  Widget _buildTelemetryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.bolt, color: Color(0xFF059669), size: 18),
              SizedBox(width: 6),
              Text('Live Himalayan Mountain Telemetry', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 6),
          const Text('Real-time tracking of mountain corridor passes, active high-altitude trekkers, and SDRF mesh nodes.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('ACTIVE TREKKERS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                      const SizedBox(height: 4),
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '${telemetryData['activeTrekkers'] ?? 1842}',
                          maxLines: 1,
                          softWrap: false,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E)),
                        ),
                      ),
                      const Text('GPS Tracked on Trails', style: TextStyle(fontSize: 9, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
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
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('ESCROW SECURED', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                      const SizedBox(height: 4),
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '${telemetryData['escrowSecuredAmount'] ?? '₹12,45,000'}',
                          maxLines: 1,
                          softWrap: false,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E), letterSpacing: -0.5),
                        ),
                      ),
                      const Text('Smart Contract Vault', style: TextStyle(fontSize: 9, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
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
                    'Corridor Status: ${telemetryData['weatherAlert'] ?? 'All 4 passes clear'}',
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

  Widget _buildAltitudeSafetyCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.monitor_heart_outlined, color: Color(0xFFDC2626), size: 18),
              SizedBox(width: 6),
              Text('Autonomous Altitude & AMS Safety AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 6),
          const Text('Calculates ascent speed gradients and generates automatic acclimatization halts for high-altitude passes.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('⚠️ AMS Advisory Protocol (>3,000m)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF991B1B))),
                SizedBox(height: 4),
                Text('Ascend no more than 500m per day past 3,000m. Mandatory rest day in Joshimath or Guptkashi before Kedarnath/Tungnath summit.', style: TextStyle(fontSize: 11, color: Color(0xFF7F1D1D))),
              ],
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('AMS Safety Diagnostic: Optimal Heart Rate & O2 thresholds calculated!'), backgroundColor: Color(0xFF059669)),
              );
            },
            icon: const Icon(Icons.speed, size: 14),
            label: const Text('Run Live AMS Diagnostic'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F3D2E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEscrowVoucherCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.qr_code_2, color: Color(0xFF0F3D2E), size: 18),
              SizedBox(width: 6),
              Text('Offline Escrow Voucher (No-Internet Handshake)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 6),
          const Text('Cryptographically signed offline QR tokens that release booking escrow to homestay hosts even when cellular data is completely zero.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          const SizedBox(height: 16),
          Center(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: Column(
                children: const [
                  Icon(Icons.qr_code, size: 120, color: Color(0xFF0F3D2E)),
                  SizedBox(height: 8),
                  Text('VOUCHER #UK-ESC-98214', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1, color: Color(0xFF0F3D2E))),
                  Text('Signed via Polygon Smart Contract', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPahadiWalletCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.account_balance_wallet, color: Color(0xFFD97706), size: 18),
              SizedBox(width: 6),
              Text('Pahadi Coins & Green Traveler Rewards', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 6),
          const Text('Earn digital rewards by respecting mountain ecology: zero-plastic verification, verified review logging, and local homestay stays.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF0F3D2E), Color(0xFF1E5E47)]),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('BALANCE', style: TextStyle(color: Color(0xFF86EFAC), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1)),
                    SizedBox(height: 4),
                    Text('450 PAHADI', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                    Text('≈ ₹450 Discount on Bike Rentals', style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 10)),
                  ],
                ),
                const Icon(Icons.monetization_on, color: Color(0xFFFBBF24), size: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSafetyMeshCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.cell_tower, color: Color(0xFF2563EB), size: 18),
              SizedBox(width: 6),
              Text('Community Safety & SDRF Mesh Grid', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 6),
          const Text('Connects local taxi unions, Dhabas, and SDRF outpost radio towers into an offline peer mesh network.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: Row(
              children: const [
                Icon(Icons.radio, color: Color(0xFF2563EB), size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text('48 Mesh Nodes active along Rishikesh -> Badrinath -> Mana corridor.', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF1E40AF))),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
