import 'package:flutter/material.dart';

class AppTheme {
  // Master Signature 2-Color Palette (GEMINI.md Constitution)
  static const Color forestGreen = Color(0xFF0F3D2E); // Deep Himalayan Emerald
  static const Color forestGreenHover = Color(0xFF144C3A);
  static const Color darkGreen = Color(0xFF09261C);
  static const Color radiantEmerald = Color(0xFF00FF88); // Radiant Mountain Emerald/Teal Glow
  static const Color emeraldSafe = Color(0xFF059669);
  static const Color emeraldLight = Color(0xFF34D399);

  // Surfaces
  static const Color cream = Color(0xFFFDFBF7); // Clean Alpine Light
  static const Color creamAlt = Color(0xFFFCFAF6);
  static const Color warmWhite = Color(0xFFFFFFFF);
  static const Color beige = Color(0xFFF3EFE6);
  static const Color slateDark = Color(0xFF080D0A);

  // Accents & Texts
  static const Color amberWarning = Color(0xFFD97706);
  static const Color earthBrown = Color(0xFF8B5A2B); // Rich Himalayan Teak / Earth
  static const Color textDark = Color(0xFF0F172A);
  static const Color mutedText = Color(0xFF475569);
  static const Color borderLight = Color(0xFFE2E8F0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: cream,
      primaryColor: forestGreen,
      colorScheme: ColorScheme.fromSeed(
        seedColor: forestGreen,
        primary: forestGreen,
        secondary: earthBrown,
        surface: cream,
        brightness: Brightness.light,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: textDark),
        displayMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: textDark),
        titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: textDark),
        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: textDark),
        bodyLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: textDark),
        bodyMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: mutedText),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: cream,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: forestGreen),
      ),
      cardTheme: CardTheme(
        color: warmWhite,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.06),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: forestGreen,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
          textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 0.5),
        ),
      ),
    );
  }
}
