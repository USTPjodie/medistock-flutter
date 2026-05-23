import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/medication_provider.dart';
import '../models/medication.dart';
import '../widgets/radial_gauge.dart';
import 'notifications_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<MedicationProvider>(
      builder: (context, provider, child) {
        return Scaffold(
          backgroundColor: AppTheme.background,
          body: RefreshIndicator(
            color: AppTheme.primary,
            onRefresh: provider.initialize,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                _buildAppBar(context, provider),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        _buildAdherenceBanner(provider),
                        const SizedBox(height: 24),
                        _buildAreaStats(provider),
                        const SizedBox(height: 28),
                        _buildSectionHeader('Upcoming Doses'),
                        const SizedBox(height: 12),
                        _buildUpcomingDoses(provider),
                        const SizedBox(height: 28),
                        _buildSectionHeader('Today\'s Schedule'),
                        const SizedBox(height: 12),
                        _buildScheduleCards(provider),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ── App Bar ──────────────────────────────────────────────────────────
  SliverAppBar _buildAppBar(BuildContext context, MedicationProvider provider) {
    return SliverAppBar(
      expandedHeight: 0,
      floating: true,
      snap: true,
      backgroundColor: AppTheme.background,
      elevation: 0,
      titleSpacing: 20,
      title: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Good ${_greeting()} ☀️',
                  style: AppTheme.bodySmall
                      .copyWith(color: AppTheme.lightText),
                ),
                const SizedBox(height: 2),
                Text('MediStock', style: AppTheme.heading3),
              ],
            ),
          ),
          _NotifBell(provider: provider),
        ],
      ),
    );
  }

  // ── Adherence banner (dark card) ─────────────────────────────────────
  Widget _buildAdherenceBanner(MedicationProvider provider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.darkCardGradient,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          // Gauge
          RadialGauge(
            percentage: provider.adherenceRate.toDouble(),
            size: 120,
            strokeWidth: 11,
          ),
          const SizedBox(width: 20),
          // Text
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Adherence',
                  style: AppTheme.bodySmall
                      .copyWith(color: Colors.white60),
                ),
                const SizedBox(height: 4),
                Text(
                  provider.adherenceMessage,
                  style: AppTheme.heading3
                      .copyWith(color: Colors.white, fontSize: 16),
                ),
                const SizedBox(height: 12),
                _PillBadge(
                  icon: Icons.medication,
                  label:
                      '${provider.activeSchedules.length} active meds',
                  color: AppTheme.accentLight,
                  textColor: AppTheme.accent,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Three area-stat chips ────────────────────────────────────────────
  Widget _buildAreaStats(MedicationProvider provider) {
    final now = DateTime.now();
    final todayAll = provider.doseEvents.where((e) {
      final d = e.scheduledTime;
      return d.year == now.year && d.month == now.month && d.day == now.day;
    }).toList();
    final todayTaken = todayAll.where((e) => e.status == DoseStatus.taken).length;
    final todayMissed = todayAll.where((e) => e.status == DoseStatus.missed).length;

    return Row(
      children: [
        _AreaStatCard(
          label: 'Taken Today',
          value: '$todayTaken',
          icon: Icons.check_circle_outline,
          color: AppTheme.success,
        ),
        const SizedBox(width: 12),
        _AreaStatCard(
          label: 'Missed',
          value: '$todayMissed',
          icon: Icons.cancel_outlined,
          color: AppTheme.danger,
        ),
        const SizedBox(width: 12),
        _AreaStatCard(
          label: 'Streak',
          value: '${_streak(provider)}d',
          icon: Icons.local_fire_department_outlined,
          color: AppTheme.warning,
        ),
      ],
    );
  }

  int _streak(MedicationProvider provider) {
    int streak = 0;
    final now = DateTime.now();
    for (int i = 0; i < 30; i++) {
      final d = now.subtract(Duration(days: i));
      final events = provider.doseEvents.where((e) {
        final ed = e.scheduledTime;
        return ed.year == d.year && ed.month == d.month && ed.day == d.day;
      }).toList();
      if (events.isEmpty && i > 0) break;
      if (events.every((e) => e.status == DoseStatus.taken)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak > 0 ? streak : 1;
  }

  // ── Section header ───────────────────────────────────────────────────
  Widget _buildSectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppTheme.title),
        Text('See all',
            style: AppTheme.bodySmall
                .copyWith(color: AppTheme.primary, fontWeight: FontWeight.w600)),
      ],
    );
  }

  // ── Upcoming horizontal scroll ───────────────────────────────────────
  Widget _buildUpcomingDoses(MedicationProvider provider) {
    final now = DateTime.now();
    final currentMin = now.hour * 60 + now.minute;
    final upcoming = (provider.activeSchedules.toList()
          ..sort((a, b) {
            int parse(String t) {
              final p = t.split(':');
              return (int.tryParse(p[0]) ?? 0) * 60 + (int.tryParse(p[1]) ?? 0);
            }
            return parse(a.doseTime).compareTo(parse(b.doseTime));
          }))
        .where((s) {
          final p = s.doseTime.split(':');
          return ((int.tryParse(p[0]) ?? 0) * 60 + (int.tryParse(p[1]) ?? 0)) >
              currentMin;
        })
        .take(5)
        .toList();

    if (upcoming.isEmpty) {
      return _EmptyHint(
        icon: Icons.check_circle_outline,
        label: 'All doses done for today!',
        color: AppTheme.success,
      );
    }

    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: upcoming.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) => _UpcomingDoseChip(schedule: upcoming[i]),
      ),
    );
  }

  // ── Full schedule cards ──────────────────────────────────────────────
  Widget _buildScheduleCards(MedicationProvider provider) {
    final schedules = provider.activeSchedules.take(4).toList();
    if (schedules.isEmpty) {
      return _EmptyHint(
        icon: Icons.medication_outlined,
        label: 'No medications scheduled yet.\nTap + to add one.',
        color: AppTheme.lightText,
      );
    }
    return Column(
      children: schedules
          .map((s) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _ScheduleRow(schedule: s),
              ))
          .toList(),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }
}

// ── Sub-widgets ──────────────────────────────────────────────────────────

class _NotifBell extends StatelessWidget {
  final MedicationProvider provider;
  const _NotifBell({required this.provider});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => const NotificationsScreen())),
      child: Stack(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppTheme.cardWhite,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.border),
            ),
            child: const Icon(Icons.notifications_outlined,
                color: AppTheme.darkText, size: 22),
          ),
          if (provider.unreadCount > 0)
            Positioned(
              right: 6,
              top: 6,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: AppTheme.danger,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.background, width: 1.5),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _PillBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color textColor;
  const _PillBadge({
    required this.icon,
    required this.label,
    required this.color,
    required this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: textColor),
          const SizedBox(width: 4),
          Text(label,
              style: AppTheme.caption
                  .copyWith(color: textColor, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _AreaStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _AreaStatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: AppTheme.cardWhite,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(height: 8),
            Text(value,
                style: AppTheme.heading3
                    .copyWith(fontSize: 20, color: AppTheme.darkerText)),
            const SizedBox(height: 3),
            Text(label,
                style: AppTheme.caption,
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _UpcomingDoseChip extends StatelessWidget {
  final MedicationSchedule schedule;
  const _UpcomingDoseChip({required this.schedule});

  @override
  Widget build(BuildContext context) {
    final parts = schedule.doseTime.split(':');
    final h = int.tryParse(parts[0]) ?? 0;
    final m = parts.length > 1 ? parts[1] : '00';
    final ampm = h >= 12 ? 'PM' : 'AM';
    final dh = h % 12 == 0 ? 12 : h % 12;

    return Container(
      width: 130,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primary.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('$dh:$m $ampm',
              style: AppTheme.title.copyWith(
                  color: AppTheme.primary, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(schedule.medicationName,
              style: AppTheme.body.copyWith(fontWeight: FontWeight.w500),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(schedule.dosage,
              style: AppTheme.caption, maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

class _ScheduleRow extends StatelessWidget {
  final MedicationSchedule schedule;
  const _ScheduleRow({required this.schedule});

  @override
  Widget build(BuildContext context) {
    final parts = schedule.doseTime.split(':');
    final h = int.tryParse(parts[0]) ?? 0;
    final m = parts.length > 1 ? parts[1] : '00';
    final ampm = h >= 12 ? 'PM' : 'AM';
    final dh = h % 12 == 0 ? 12 : h % 12;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.medication, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(schedule.medicationName,
                    style: AppTheme.body.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 3),
                Text(schedule.dosage, style: AppTheme.caption),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('$dh:$m',
                  style: AppTheme.title.copyWith(
                      color: AppTheme.primary, fontWeight: FontWeight.w700)),
              Text(ampm, style: AppTheme.caption),
            ],
          ),
          const SizedBox(width: 12),
          // Checkbox circle
          Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.border, width: 2),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyHint extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _EmptyHint(
      {required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Icon(icon, size: 40, color: color),
          const SizedBox(height: 12),
          Text(label,
              textAlign: TextAlign.center,
              style: AppTheme.bodySmall),
        ],
      ),
    );
  }
}
