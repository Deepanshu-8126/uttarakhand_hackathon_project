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
      return Material(
        color: const Color(0xFFFDFBF7),
        child: Directionality(
          textDirection: TextDirection.ltr,
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.terrain, size: 54, color: Color(0xFF1A4331)),
                  const SizedBox(height: 14),
                  const Text(
                    'Discover Uttarakhand',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF1C1917)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Loading mountain records...',
                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    };

    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );

    runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
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
      home: const MainNavigationScreen(),
    );
  }
}
