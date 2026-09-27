import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'services/auth_provider.dart';
import 'screens/main_navigation_screen.dart';

void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      debugPrint('Flutter Error: ${details.exceptionAsString()}');
    };

    ErrorWidget.builder = (FlutterErrorDetails details) {
      return const Material(
        color: Color(0xFFFDFBF7),
        child: Directionality(
          textDirection: TextDirection.ltr,
          child: Center(
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.terrain, size: 54, color: Color(0xFF1A4331)),
                  SizedBox(height: 14),
                  Text(
                    'Discover Uttarakhand',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF1C1917)),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Kuch gadbad ho gayi. App restart karein.',
                    style: TextStyle(color: Color(0xFF78716C), fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    };

    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
    );

    // Pre-load auth session before runApp to avoid splash async gap
    final authProvider = AuthProvider();
    await authProvider.loadStoredSession();

    runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
        ],
        child: const DiscoverUttarakhandApp(),
      ),
    );
  }, (error, stackTrace) {
    debugPrint('Uncaught Zone Error: $error\n$stackTrace');
  });
}

class DiscoverUttarakhandApp extends StatelessWidget {
  const DiscoverUttarakhandApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Discover Uttarakhand',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      builder: (context, child) {
        final screenWidth = MediaQuery.of(context).size.width;
        if (screenWidth > 600) {
          // On desktop/Edge, center mobile app inside flagship device container
          return Container(
            color: const Color(0xFF091C14),
            child: Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 520, maxHeight: 900),
                decoration: BoxDecoration(
                  color: const Color(0xFFFBF9F4),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.4),
                      blurRadius: 32,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: child!,
                ),
              ),
            ),
          );
        }
        return child!;
      },
      home: const MainNavigationScreen(),
    );
  }
}
