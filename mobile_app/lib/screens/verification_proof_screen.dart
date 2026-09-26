import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class VerificationProofScreen extends StatelessWidget {
  final String title;
  final String identifier;
  final String category;
  final String registrationNumber;
  final String txHash;
  final String operatorName;
  final String location;
  final String issueDate;
  final String validityDate;
  final bool isVerified;

  const VerificationProofScreen({
    super.key,
    this.title = 'Royal Enfield Himalayan 450 - Mountain Spec',
    this.identifier = 'UK-VH-882194',
    this.category = 'Adventure Bike Rental',
    this.registrationNumber = 'UK07-AZ-4921',
    this.txHash = '0x8f2a93c7810b429d81643fae99120bc71410d481',
    this.operatorName = 'Garhwal Mountain Riders Union',
    this.location = 'Rishikesh Tapovan Base Hub',
    this.issueDate = '15 Jan 2026',
    this.validityDate = '31 Dec 2026',
    this.isVerified = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDFBF7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFDFBF7),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F3D2E)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Verification Proof Record',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: Color(0xFF0F3D2E)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            // ── Main Certificate Container ──────────────────────────
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F3D2E).withOpacity(0.04),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Emerald Badge Banner
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: const BoxDecoration(
                      color: Color(0xFF0F3D2E),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: const BoxDecoration(
                                color: Color(0xFF059669),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.verified, color: Colors.white, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  '3-LAYER VERIFIED FLEET',
                                  style: TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1,
                                  ),
                                ),
                                Text(
                                  'Uttarakhand Transport & Polygon Registry',
                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: const Text(
                            'VALID',
                            style: TextStyle(color: Color(0xFF86EFAC), fontSize: 9, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Certificate Body
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title & Identifier
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 13, color: Color(0xFF059669)),
                            const SizedBox(width: 4),
                            Text(location, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
                          ],
                        ),

                        const SizedBox(height: 18),

                        // 3-Layer Check Grid
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            children: [
                              _buildLayerRow(
                                '1. Physical Inspection',
                                'Disc brakes, cold ignition, and mountain suspension verified by certified mechanics.',
                                true,
                              ),
                              const Divider(height: 16),
                              _buildLayerRow(
                                '2. RTO & State Tax Clearance',
                                'Registered under Uttarakhand Commercial Transport permit: $registrationNumber.',
                                true,
                              ),
                              const Divider(height: 16),
                              _buildLayerRow(
                                '3. On-Chain Smart Contract Seal',
                                'Cryptographically minted on Polygon. Immutable ownership proof.',
                                true,
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Metadata Grid
                        _buildMetaItem('VEHICLE REGISTRATION', registrationNumber),
                        const SizedBox(height: 10),
                        _buildMetaItem('AUTHORIZED OPERATOR', operatorName),
                        const SizedBox(height: 10),
                        _buildMetaItem('BLOCKCHAIN TX HASH', txHash, isMono: true),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(child: _buildMetaItem('ISSUED ON', issueDate)),
                            const SizedBox(width: 10),
                            Expanded(child: _buildMetaItem('EXPIRY DATE', validityDate)),
                          ],
                        ),

                        const SizedBox(height: 20),

                        // Verified QR Code Section
                        Center(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFDFBF7),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Column(
                              children: [
                                const Icon(Icons.qr_code_scanner, size: 84, color: Color(0xFF0F3D2E)),
                                const SizedBox(height: 6),
                                Text(
                                  'SCAN TO AUDIT ON-CHAIN: $identifier',
                                  style: const TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.8,
                                    color: Color(0xFF0F3D2E),
                                  ),
                                ),
                                const Text(
                                  'Polygon Smart Contract: 0x71a...9B4',
                                  style: TextStyle(fontSize: 9, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Back Action
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.check, size: 16),
                label: const Text('CONFIRM & CLOSE RECORD'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F3D2E),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLayerRow(String title, String desc, bool passed) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: const BoxDecoration(
            color: Color(0xFFE8F5E9),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, color: Color(0xFF059669), size: 12),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetaItem(String label, String value, {bool isMono = false}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Color(0xFF94A3B8), letterSpacing: 0.5)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
              fontFamily: isMono ? 'monospace' : null,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
