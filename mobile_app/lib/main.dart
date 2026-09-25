import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/app_theme.dart';
import 'screens/main_navigation_screen.dart';

void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      debugPrint('Flutter Error: ${details.exceptionAsString()}');
    };

    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );

    runApp(const DiscoverUttarakhandApp());
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
      builder: (context, child) {
        ErrorWidget.builder = (FlutterErrorDetails errorDetails) {
          return Scaffold(
            backgroundColor: const Color(0xFFFDFBF7),
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.terrain, size: 54, color: Color(0xFF1A4331)),
                    const SizedBox(height: 14),
                    const Text(
                      'Discover Uttarakhand',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF1C1917)),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Loading offline mountain records...',
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
          );
        };
        return child ?? const SizedBox();
      },
    );
  }
}
