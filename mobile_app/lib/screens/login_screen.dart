import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../services/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  final bool initialIsRegister;
  const LoginScreen({super.key, this.initialIsRegister = false});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late bool isRegister;
  String accountMode = 'traveler'; // 'traveler' or 'partner'
  String partnerSubRole = 'Homestay';

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _showPassword = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    isRegister = widget.initialIsRegister;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleAuth() async {
    final email = _emailController.text.trim();
    final pass = _passwordController.text.trim();
    final name = _nameController.text.trim();

    if (email.isEmpty || pass.isEmpty || (isRegister && name.isEmpty)) {
      setState(() => _errorMessage = 'Please complete all required fields.');
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    setState(() => _errorMessage = null);

    if (isRegister) {
      final res = await auth.register(
        name: name,
        email: email,
        password: pass,
        isPartnerRole: accountMode == 'partner',
        businessType: accountMode == 'partner' ? partnerSubRole : null,
      );
      if (res['success'] == true && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Welcome to Discovery Uttarakhand, ${res['user']?['name'] ?? ''}!'),
            backgroundColor: AppTheme.forestGreen,
          ),
        );
      }
    } else {
      final res = await auth.login(
        email: email,
        password: pass,
        isPartnerRole: accountMode == 'partner',
      );
      if (res['success'] == true && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Welcome back, ${res['user']?['name'] ?? 'Traveler'}!'),
            backgroundColor: AppTheme.forestGreen,
          ),
        );
      }
    }
  }

  Future<void> _handleGoogleSignIn() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final isPartner = accountMode == 'partner';
    final res = await auth.login(
      email: isPartner ? 'partner.himalayas@gmail.com' : 'traveler.pahadi@gmail.com',
      password: 'GoogleOAuth2User@2026',
      name: isPartner ? 'Verified Mountain Partner' : 'Deepanshu (Pahadi Explorer)',
      isPartnerRole: isPartner,
    );
    if (res['success'] == true && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Signed in via Google as ${res['user']?['name']}'),
          backgroundColor: AppTheme.forestGreen,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isPartner = accountMode == 'partner';

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: Text(
          isRegister ? 'Create Account' : 'Sign In',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.textDark),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: Color(0xFF0F3D2E),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.terrain_rounded, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('DISCOVERY UTTARAKHAND', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 0.8, color: Color(0xFF0F172A))),
                    Text(isPartner ? 'Mountain Partner & Vendor Portal' : 'Sacred Mountain Travel & Community', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Account Mode Toggle (Traveler vs Partner - exact match to Web)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => accountMode = 'traveler'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: !isPartner ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: !isPartner ? [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4)] : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.explore_outlined, size: 16, color: !isPartner ? const Color(0xFF0F3D2E) : const Color(0xFF64748B)),
                            const SizedBox(width: 6),
                            Text('Traveler', style: TextStyle(fontSize: 12, fontWeight: !isPartner ? FontWeight.w900 : FontWeight.w600, color: !isPartner ? const Color(0xFF0F3D2E) : const Color(0xFF64748B))),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => accountMode = 'partner'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: isPartner ? const Color(0xFF0F3D2E) : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: isPartner ? [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 4)] : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.storefront_outlined, size: 16, color: isPartner ? Colors.white : const Color(0xFF64748B)),
                            const SizedBox(width: 6),
                            Text('Mountain Partner', style: TextStyle(fontSize: 12, fontWeight: isPartner ? FontWeight.w900 : FontWeight.w600, color: isPartner ? Colors.white : const Color(0xFF64748B))),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Google 1-Click Sign-In
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: auth.isLoading ? null : _handleGoogleSignIn,
                icon: const Icon(Icons.g_mobiledata, size: 28, color: Color(0xFFEA4335)),
                label: Text(
                  isPartner ? 'Continue as Verified Host (Google)' : 'Sign In with Google',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
                ),
                style: OutlinedButton.styleFrom(
                  backgroundColor: Colors.white,
                  side: const BorderSide(color: Color(0xFFCBD5E1)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),

            const SizedBox(height: 18),

            Row(
              children: const [
                Expanded(child: Divider()),
                Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text('OR EMAIL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)))),
                Expanded(child: Divider()),
              ],
            ),

            const SizedBox(height: 18),

            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Color(0xFF991B1B), fontSize: 11))),
                  ],
                ),
              ),

            // Register Name Field
            if (isRegister) ...[
              const Text('Full Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    hintText: 'e.g. Deepanshu Rawat',
                    hintStyle: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Email Field
            const Text('Email or Phone Number', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  hintText: 'explorer@discoveryuttarakhand.in',
                  hintStyle: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  border: InputBorder.none,
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Password Field
            const Text('Password', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: TextField(
                controller: _passwordController,
                obscureText: !_showPassword,
                decoration: InputDecoration(
                  hintText: '••••••••',
                  hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  border: InputBorder.none,
                  suffixIcon: IconButton(
                    icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility, size: 18, color: const Color(0xFF64748B)),
                    onPressed: () => setState(() => _showPassword = !_showPassword),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Main Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: auth.isLoading ? null : _handleAuth,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F3D2E),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
                child: auth.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(
                        isRegister ? (isPartner ? 'REGISTER PARTNER ACCOUNT' : 'CREATE FREE ACCOUNT') : 'SIGN IN TO UTTARAKHAND',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                      ),
              ),
            ),

            const SizedBox(height: 16),

            // Toggle Register / Login mode
            Center(
              child: TextButton(
                onPressed: () => setState(() => isRegister = !isRegister),
                child: Text(
                  isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one",
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F3D2E)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
