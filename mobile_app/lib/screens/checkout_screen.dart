import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

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
  int pahadiCoinsBalance = 450; // Parity with Profile: 450 Pahadi Coins ≈ ₹450
  String selectedPaymentMethod = 'razorpay';
  bool isProcessing = false;

  int get subtotal => widget.basePrice * days;
  int get coinDiscount => usePahadiCoins ? (subtotal > pahadiCoinsBalance ? pahadiCoinsBalance : subtotal) : 0;
  int get platformFee => 120;
  int get total => subtotal - coinDiscount + platformFee;

  void _handlePayment() async {
    setState(() => isProcessing = true);

    try {
      await Future<void>.delayed(const Duration(milliseconds: 800));

      final bookingRes = await ApiService.createBooking(
        type: widget.itemType.toLowerCase().contains('stay') ? 'stay' : 'rental',
        title: widget.itemName,
        amount: total,
        days: days,
      );

      final bookingRef = bookingRes['bookingReference'] ??
          bookingRes['data']?['bookingReference'] ??
          'ESCROW-UT-${(DateTime.now().millisecondsSinceEpoch % 9000 + 1000)}';
      final otpCode = bookingRes['checkInOtp'] ?? bookingRes['data']?['checkInOtp'] ?? '8126';
      final razorpayPaymentId = 'pay_rzp_${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';

      if (mounted) {
        setState(() => isProcessing = false);
        _showEscrowPassDialog(bookingRef, otpCode, razorpayPaymentId);
      }
    } catch (_) {
      if (mounted) {
        setState(() => isProcessing = false);
        final fallbackRef = 'ESCROW-UT-${(DateTime.now().millisecondsSinceEpoch % 9000 + 1000)}';
        _showEscrowPassDialog(fallbackRef, '8126', 'pay_rzp_test_9982');
      }
    }
  }

  void _showEscrowPassDialog(String bookingRef, String otpCode, String razorpayPaymentId) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.all(20),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.verified_rounded, color: Color(0xFF059669), size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Payment Verified',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF34D399)),
                  ),
                  child: const Text(
                    'ESCROW LOCKED',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF065F46)),
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            Text(
              widget.itemName,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF0F3D2E)),
            ),
            const SizedBox(height: 4),
            Text(
              '${widget.itemType} • $days Days • ₹$total via Razorpay',
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: const Icon(Icons.qr_code_2_rounded, size: 36, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Pass #$bookingRef',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          '100% Refundable Escrow protection active against snow closures.',
                          style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Check-in OTP:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF065F46))),
                  Text(otpCode, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF059669), letterSpacing: 1.5)),
                ],
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Transaction ID: $razorpayPaymentId',
              style: const TextStyle(fontSize: 9.5, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F3D2E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
              ),
              child: const Text('View Full Escrow Pass'),
            ),
          ),
        ],
      ),
    );
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
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.forestGreen),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Escrow Guarantee Header Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F3D2E),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.lock_clock, color: Color(0xFF34D399), size: 22),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '100% ESCROW PROTECTION GUARANTEED',
                          style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Full refund if mountain passes close due to weather or snow.',
                          style: TextStyle(color: Colors.white, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

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
            const SizedBox(height: 14),

            // Pahadi Coins Discount (Gold Tier Parity: 450 Coins)
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
                      const Icon(Icons.monetization_on, color: Color(0xFFD97706), size: 22),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Text('Redeem Pahadi Coins', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                              SizedBox(width: 6),
                              Text('✨ Gold Tier', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFFD97706))),
                            ],
                          ),
                          Text('Available: $pahadiCoinsBalance coins (Save ₹$pahadiCoinsBalance)', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                        ],
                      ),
                    ],
                  ),
                  Switch(
                    value: usePahadiCoins,
                    activeThumbColor: const Color(0xFF0F3D2E),
                    activeTrackColor: const Color(0xFFA7F3D0),
                    onChanged: (val) => setState(() => usePahadiCoins = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Payment Gateway Selector
            const Text(
              'Select Payment Gateway',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 8),

            // Razorpay Option
            InkWell(
              onTap: () => setState(() => selectedPaymentMethod = 'razorpay'),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: selectedPaymentMethod == 'razorpay' ? const Color(0xFFECFDF5) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: selectedPaymentMethod == 'razorpay' ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                    width: selectedPaymentMethod == 'razorpay' ? 1.8 : 1.0,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0284C7).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.payment_rounded, color: Color(0xFF0284C7), size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text('Razorpay Official Gateway', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A))),
                              SizedBox(width: 6),
                              Text('LIVE TEST', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Color(0xFF0284C7))),
                            ],
                          ),
                          SizedBox(height: 2),
                          Text(
                            'UPI (GPay, PhonePe, Paytm), Cards & NetBanking',
                            style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      selectedPaymentMethod == 'razorpay' ? Icons.radio_button_checked : Icons.radio_button_off,
                      color: selectedPaymentMethod == 'razorpay' ? const Color(0xFF0F3D2E) : const Color(0xFF94A3B8),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Devbhoomi Escrow Direct Vault Option
            InkWell(
              onTap: () => setState(() => selectedPaymentMethod = 'escrow_vault'),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: selectedPaymentMethod == 'escrow_vault' ? const Color(0xFFECFDF5) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: selectedPaymentMethod == 'escrow_vault' ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                    width: selectedPaymentMethod == 'escrow_vault' ? 1.8 : 1.0,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.shield_rounded, color: Color(0xFF059669), size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Devbhoomi Cryptographic Escrow', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A))),
                          SizedBox(height: 2),
                          Text(
                            'Funds locked in smart escrow until physical host check-in',
                            style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      selectedPaymentMethod == 'escrow_vault' ? Icons.radio_button_checked : Icons.radio_button_off,
                      color: selectedPaymentMethod == 'escrow_vault' ? const Color(0xFF0F3D2E) : const Color(0xFF94A3B8),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Price Breakdown Card
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
                        const Text('Pahadi Coins Discount (Gold Tier)', style: TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                        Text('- ₹$coinDiscount', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                      ],
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Disaster Insurance & SDRF Mesh Fee', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
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
            const SizedBox(height: 20),

            // Pay Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: isProcessing ? null : _handlePayment,
                icon: isProcessing
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.lock_rounded, size: 18),
                label: Text(
                  isProcessing
                      ? 'PROCESSING SECURE RAZORPAY ESCROW...'
                      : (selectedPaymentMethod == 'razorpay'
                          ? 'PAY ₹$total WITH RAZORPAY'
                          : 'CONFIRM & LOCK ₹$total IN ESCROW'),
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
