import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  // ── Palette (Fitness-App-template inspired: deep navy + vivid coral) ──
  static const Color nearlyWhite    = Color(0xFFFAFAFF);
  static const Color nearlyBlack    = Color(0xFF0D1B2A);
  static const Color darkText       = Color(0xFF1A2340);
  static const Color darkerText     = Color(0xFF0A1628);
  static const Color lightText      = Color(0xFF6B7A99);

  static const Color primary        = Color(0xFF5C6BC0); // Indigo-blue
  static const Color primaryLight   = Color(0xFF8E99F3);
  static const Color primaryDark    = Color(0xFF3949AB);
  static const Color accent         = Color(0xFFFF6F61); // Coral accent
  static const Color accentLight    = Color(0xFFFFAFA8);

  static const Color success        = Color(0xFF26C6A0); // Teal-green
  static const Color warning        = Color(0xFFFFB74D); // Amber
  static const Color danger         = Color(0xFFEF5350); // Red

  static const Color background     = Color(0xFFF4F6FD);
  static const Color cardWhite      = Color(0xFFFFFFFF);
  static const Color cardPink       = Color(0xFFFFE4E9);
  static const Color cardDark       = Color(0xFF1A2340); // for dark blocks
  static const Color border         = Color(0xFFE0E5F2);
  static const Color divider        = Color(0xFFF0F3FB);

  // Tab / nav bar
  static const Color tabBar         = Color(0xFFFFFFFF);
  static const Color tabBarSelected = primary;
  static const Color tabBarUnselected = Color(0xFFBCC4D8);

  static const String fontName = 'WorkSans';

  // ── Light Theme ──────────────────────────────────────────────────────
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    fontFamily: fontName,
    brightness: Brightness.light,
    primaryColor: primary,
    scaffoldBackgroundColor: background,
    colorScheme: const ColorScheme.light(
      primary: primary,
      secondary: accent,
      surface: cardWhite,
      error: danger,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: cardWhite,
      foregroundColor: darkText,
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: CardThemeData(
      color: cardWhite,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: border),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(
          fontFamily: fontName,
          fontWeight: FontWeight.w600,
          fontSize: 15,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: background,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primary, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    dividerColor: divider,
  );

  // ── Text Styles ───────────────────────────────────────────────────────
  static const TextStyle display1 = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.bold,
    fontSize: 32,
    letterSpacing: 0.4,
    height: 1.1,
    color: darkerText,
  );

  static const TextStyle headline = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.bold,
    fontSize: 24,
    letterSpacing: 0.27,
    color: darkerText,
  );

  // alias used throughout screens
  static const TextStyle heading1 = display1;
  static const TextStyle heading2 = headline;

  static const TextStyle heading3 = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.w600,
    fontSize: 18,
    letterSpacing: 0.18,
    color: darkerText,
  );

  static const TextStyle title = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.w600,
    fontSize: 16,
    letterSpacing: 0.18,
    color: darkText,
  );

  static const TextStyle subtitle = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.w400,
    fontSize: 14,
    letterSpacing: -0.04,
    color: darkText,
  );

  static const TextStyle body = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.w400,
    fontSize: 14,
    letterSpacing: 0.1,
    color: darkText,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.w400,
    fontSize: 12,
    letterSpacing: 0.1,
    color: lightText,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: fontName,
    fontWeight: FontWeight.w400,
    fontSize: 11,
    letterSpacing: 0.2,
    color: lightText,
  );

  // ── Gradients ────────────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryLight],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accent, accentLight],
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1A2340), Color(0xFF2C3E6B)],
  );
}
