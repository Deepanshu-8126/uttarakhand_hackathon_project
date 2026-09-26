import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class CheckoutScreen extends StatefulWidget {
  final String itemType;
  final String itemName;
  final int basePrice;

  const CheckoutScreen({
    super.key,
    this.itemType = 'Stay & Ride',
    this.itemName = 'Pahadi Homestay + Himalayan 450 Combo',
    this.basePrice = 2800,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int days = 2;
  bool usePahadiCoins = false;
  int pahadiCoinsBalance = 350;
  bool isProcessing = false;

  int get subtotal => widget.basePrice * days;
  int get coinDiscount => usePahadiCoins ? (subtotal > pahadiCoinsBalance ? pahadiCoinsBalance : subtotal) : 0;
  int get platformFee => 120;
  int get total => subtotal - coinDiscount + platformFee;

  void _handlePayment() {
    setState(() => isProcessing = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => isProcessing = false);
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            backgroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Row(
              children: const [
                Icon(Icons.check_circle, color: Color(0xFF059669), size: 24),
                SizedBox(width: 8),
                Text('Escrow Secured!', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Your payment of ₹', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                Text('₹$total Locked in Devbhoomi Escrow Vault', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF0F3D2E))),
                const SizedBox(height: 10),
                const Text('Funds will ONLY be released to the host upon your safe check-in or offline OTP voucher confirmation.', style: TextStyle(fontSize: 11, color: Color(0xFF475569))),
              ],
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.forestGreen,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
                child: const Text('View Itinerary'),
              ),
            ],
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text(
          'Devbhoomi Escrow Checkout',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppTheme.forestGreen),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Escrow Guarantee Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F3D2E),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: const [
                  Icon(Icons.lock_clock, color: Color(0xFF34D399), size: 22),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('100% ESCROW PROTECTION GUARANTEED', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
                        SizedBox(height: 2),
                        Text('Full refund if mountain passes close due to weather.', style: TextStyle(color: Colors.white, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Item Details Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(widget.itemType, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF059669))),
                      Text('₹${widget.basePrice}/day', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F3D2E))),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(widget.itemName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Duration (Days / Nights)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                      Row(
                        children: [
                          IconButton(
                            onPressed: days > 1 ? () => setState(() => days--) : null,
                            icon: const Icon(Icons.remove_circle_outline, size: 20, color: Color(0xFF0F3D2E)),
                          ),
                          Text('$days', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                          IconButton(
                            onPressed: () => setState(() => days++),
                            icon: const Icon(Icons.add_circle_outline, size: 20, color: Color(0xFF0F3D2E)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Pahadi Coins Discount
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.monetization_on, color: Color(0xFFD97706), size: 20),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Redeem Pahadi Coins', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                          Text('Available: $pahadiCoinsBalance coins (Save ₹$pahadiCoinsBalance)', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                        ],
                      ),
                    ],
                  ),
                  Switch(
                    value: usePahadiCoins,
                    activeColor: const Color(0xFF0F3D2E),
                    onChanged: (val) => setState(() => usePahadiCoins = val),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Price Breakdown
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Base Price', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      Text('₹$subtotal', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                    ],
                  ),
                  if (usePahadiCoins) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Pahadi Coins Discount', style: TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                        Text('- ₹$coinDiscount', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                      ],
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Disaster Insurance & Mesh Fee', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      Text('₹$platformFee', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Amount Payable', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                      Text('₹$total', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F3D2E))),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Pay Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: isProcessing ? null : _handlePayment,
                icon: isProcessing
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.shield_outlined, size: 18),
                label: Text(
                  isProcessing ? 'AUTHORIZING SMART ESCROW...' : 'CONFIRM & LOCK ₹$total IN ESCROW',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                ),
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
}
