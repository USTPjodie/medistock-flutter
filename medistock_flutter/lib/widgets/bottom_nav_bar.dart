import 'package:flutter/material.dart';
import '../app_theme.dart';

class BottomNavBar extends StatefulWidget {
  final int selectedIndex;
  final Function(int) onTabSelected;
  final VoidCallback onAddPressed;

  const BottomNavBar({
    super.key,
    required this.selectedIndex,
    required this.onTabSelected,
    required this.onAddPressed,
  });

  @override
  State<BottomNavBar> createState() => _BottomNavBarState();
}

class _BottomNavBarState extends State<BottomNavBar>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _animations;

  final _tabs = const [
    _TabData(Icons.grid_view_rounded,     Icons.grid_view_rounded,  'Home'),
    _TabData(Icons.medication_outlined,   Icons.medication,         'Meds'),
    _TabData(Icons.bar_chart_rounded,     Icons.bar_chart_rounded,  'Stats'),
    _TabData(Icons.person_outline_rounded,Icons.person_rounded,     'Profile'),
  ];

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(_tabs.length, (i) {
      final c = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 300),
      );
      if (i == widget.selectedIndex) c.value = 1.0;
      return c;
    });
    _animations = _controllers
        .map((c) => CurvedAnimation(parent: c, curve: Curves.easeOutCubic))
        .toList();
  }

  @override
  void didUpdateWidget(BottomNavBar old) {
    super.didUpdateWidget(old);
    if (old.selectedIndex != widget.selectedIndex) {
      _controllers[old.selectedIndex].reverse();
      _controllers[widget.selectedIndex].forward();
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      height: 72,
      decoration: BoxDecoration(
        color: theme.cardColor,
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Row(
        children: [
          // Left two tabs
          _buildTab(0),
          _buildTab(1),
          // Centre FAB
          _buildCenterFab(),
          // Right two tabs
          _buildTab(2),
          _buildTab(3),
        ],
      ),
    );
  }

  Widget _buildTab(int index) {
    final theme = Theme.of(context);
    final tab = _tabs[index];
    final isSelected = widget.selectedIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => widget.onTabSelected(index),
        behavior: HitTestBehavior.opaque,
        child: AnimatedBuilder(
          animation: _animations[index],
          builder: (context, child) {
            final t = _animations[index].value;
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated pill indicator + icon
                Container(
                  width: 44,
                  height: 32,
                  decoration: BoxDecoration(
                    color: Color.lerp(
                        Colors.transparent,
                        theme.primaryColor.withValues(alpha: 0.12),
                        t),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    isSelected ? tab.filledIcon : tab.outlinedIcon,
                    size: 22,
                    color: Color.lerp(
                        AppTheme.tabBarUnselected, theme.primaryColor, t),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  tab.label,
                  style: TextStyle(
                    fontFamily: AppTheme.fontName,
                    fontSize: 10,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: Color.lerp(
                        AppTheme.tabBarUnselected, theme.primaryColor, t),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildCenterFab() {
    return GestureDetector(
      onTap: widget.onAddPressed,
      child: Container(
        width: 56,
        height: 56,
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          gradient: AppTheme.accentGradient,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppTheme.accent.withValues(alpha: 0.35),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ),
    );
  }
}

class _TabData {
  final IconData outlinedIcon;
  final IconData filledIcon;
  final String label;
  const _TabData(this.outlinedIcon, this.filledIcon, this.label);
}
