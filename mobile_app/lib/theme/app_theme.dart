import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Color Palette matching Discovery Uttarakhand
  static const Color forestGreen = Color(0xFF1A4331);
  static const Color darkGreen = Color(0xFF122A1F);
  static const Color cream = Color(0xFFFDFBF7);
  static const Color warmWhite = Color(0xFFFFFFFF);
  static const Color beige = Color(0xFFF3EFE6);
  static const Color earthBrown = Color(0xFFC08457);
  static const Color textDark = Color(0xFF1C1917);
  static const Color mutedText = Color(0xFF57534E);
  static const Color borderLight = Color(0xFFE7E5E4);
  static const Color amberWarning = Color(0xFFD97706);
  static const Color emeraldSafe = Color(0xFF059669);

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
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: textDark),
        displayMedium: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w800, color: textDark),
        titleLarge: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: textDark),
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: textDark),
        bodyLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: textDark),
        bodyMedium: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: mutedText),
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
          textStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 0.5),
        ),
      ),
    );
  }
}
