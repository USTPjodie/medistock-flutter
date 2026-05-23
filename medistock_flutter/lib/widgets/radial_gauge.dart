import 'dart:math';
import 'package:flutter/material.dart';
import '../app_theme.dart';

class RadialGauge extends StatelessWidget {
  final double percentage;
  final double size;
  final double strokeWidth;
  final double trackSizeDegrees;
  final bool showLabel;

  const RadialGauge({
    super.key,
    required this.percentage,
    this.size = 120,
    this.strokeWidth = 10,
    this.trackSizeDegrees = 270,
    this.showLabel = true,
  });

  Color _getColor(double pct) {
    if (pct >= 90) return AppTheme.success;
    if (pct >= 70) return AppTheme.primary;
    if (pct >= 50) return AppTheme.warning;
    return AppTheme.danger;
  }

  @override
  Widget build(BuildContext context) {
    final progressColor = _getColor(percentage);
    final startAngle = -pi / 2 - (trackSizeDegrees * pi / 360);
    final sweepAngle = trackSizeDegrees * pi / 180;
    final progressSweep = (percentage / 100) * sweepAngle;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background Track
          CustomPaint(
            size: Size(size, size),
            painter: _ArcPainter(
              strokeWidth: strokeWidth,
              color: AppTheme.border,
              startAngle: startAngle,
              sweepAngle: sweepAngle,
            ),
          ),
          // Progress Track
          CustomPaint(
            size: Size(size, size),
            painter: _ArcPainter(
              strokeWidth: strokeWidth,
              color: progressColor,
              startAngle: startAngle,
              sweepAngle: progressSweep,
              strokeCap: StrokeCap.round,
            ),
          ),
          // Center Content
          if (showLabel)
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${percentage.round()}%',
                  style: AppTheme.heading2.copyWith(
                    color: progressColor,
                    fontSize: size * 0.2,
                  ),
                ),
                Text(
                  'Adherence',
                  style: AppTheme.bodySmall.copyWith(
                    fontSize: size * 0.08,
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _ArcPainter extends CustomPainter {
  final double strokeWidth;
  final Color color;
  final double startAngle;
  final double sweepAngle;
  final StrokeCap strokeCap;

  _ArcPainter({
    required this.strokeWidth,
    required this.color,
    required this.startAngle,
    required this.sweepAngle,
    this.strokeCap = StrokeCap.butt,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - strokeWidth / 2;

    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = strokeCap;

    final rect = Rect.fromCircle(center: center, radius: radius);
    canvas.drawArc(rect, startAngle, sweepAngle, false, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
