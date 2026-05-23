import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../app_theme.dart';
import '../providers/medication_provider.dart';
import '../models/medication.dart';
import '../widgets/radial_gauge.dart';

class StatsScreen extends StatefulWidget {
  const StatsScreen({super.key});

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen>
    with SingleTickerProviderStateMixin {
  String _period = 'week';
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 4, vsync: this, initialIndex: 1);
    _tabCtrl.addListener(() {
      if (!_tabCtrl.indexIsChanging) {
        setState(() {
          _period = ['today', 'week', 'month', 'all'][_tabCtrl.index];
        });
      }
    });
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<MedicationProvider>(
      builder: (context, provider, child) {
        final events = _filter(provider.doseEvents);
        final stats = _calc(events);
        final rate = stats['total']! > 0
            ? ((stats['taken']! / stats['total']!) * 100).round()
            : provider.adherenceRate;

        return Scaffold(
          backgroundColor: AppTheme.background,
          body: SafeArea(
            child: Column(
              children: [
                // ── Header ─────────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  child: Row(
                    children: [
                      Expanded(
                          child:
                              Text('Statistics', style: AppTheme.headline)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ── Tab bar (period) ────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.cardWhite,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: TabBar(
                      controller: _tabCtrl,
                      indicator: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      indicatorSize: TabBarIndicatorSize.tab,
                      labelColor: Colors.white,
                      unselectedLabelColor: AppTheme.lightText,
                      labelStyle: AppTheme.caption.copyWith(
                          fontWeight: FontWeight.w700, color: Colors.white),
                      unselectedLabelStyle: AppTheme.caption,
                      dividerColor: Colors.transparent,
                      tabs: const [
                        Tab(text: 'Today'),
                        Tab(text: 'Week'),
                        Tab(text: 'Month'),
                        Tab(text: 'All'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // ── Scrollable content ──────────────────────────────────
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Summary cards row
                        _buildSummaryRow(stats),
                        const SizedBox(height: 20),

                        // Adherence gauge card
                        _buildAdherenceCard(rate, stats),
                        const SizedBox(height: 20),

                        // Activity bar chart
                        _buildActivityChart(events),
                        const SizedBox(height: 20),

                        // History list
                        _buildHistory(events, provider),
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

  // ── Summary row ────────────────────────────────────────────────────────
  Widget _buildSummaryRow(Map<String, int> s) {
    return Row(
      children: [
        _SummaryTile(
            label: 'Taken',
            value: '${s['taken']}',
            color: AppTheme.success),
        const SizedBox(width: 12),
        _SummaryTile(
            label: 'Missed',
            value: '${s['missed']}',
            color: AppTheme.danger),
        const SizedBox(width: 12),
        _SummaryTile(
            label: 'Pending',
            value: '${s['pending']}',
            color: AppTheme.warning),
      ],
    );
  }

  // ── Adherence gauge card ───────────────────────────────────────────────
  Widget _buildAdherenceCard(int rate, Map<String, int> stats) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.darkCardGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          RadialGauge(
            percentage: rate.toDouble(),
            size: 110,
            strokeWidth: 10,
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Adherence Rate',
                    style: AppTheme.caption
                        .copyWith(color: Colors.white60)),
                const SizedBox(height: 4),
                Text('$rate%',
                    style: AppTheme.display1
                        .copyWith(color: Colors.white, fontSize: 36)),
                const SizedBox(height: 6),
                Text(_msg(rate),
                    style: AppTheme.bodySmall
                        .copyWith(color: Colors.white70)),
                const SizedBox(height: 10),
                Text('Based on ${stats['total']} recorded doses',
                    style: AppTheme.caption
                        .copyWith(color: Colors.white38)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Activity bar chart (7-day bars) ────────────────────────────────────
  Widget _buildActivityChart(List<DoseEvent> events) {
    final now = DateTime.now();
    final days = List.generate(7, (i) => now.subtract(Duration(days: 6 - i)));

    // Compute taken/missed per day
    final data = days.map((d) {
      final dayEvents = events.where((e) {
        final ed = e.scheduledTime;
        return ed.year == d.year && ed.month == d.month && ed.day == d.day;
      }).toList();
      return {
        'day': DateFormat('E').format(d),
        'taken': dayEvents.where((e) => e.status == DoseStatus.taken).length,
        'missed': dayEvents.where((e) => e.status == DoseStatus.missed).length,
        'total': dayEvents.length,
      };
    }).toList();

    final maxVal =
        data.map((d) => (d['total'] as int)).reduce(max).clamp(1, 9999);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Weekly Activity', style: AppTheme.title),
          const SizedBox(height: 4),
          Text('Doses taken vs missed',
              style: AppTheme.caption),
          const SizedBox(height: 20),
          SizedBox(
            height: 120,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: data.map((d) {
                final taken = d['taken'] as int;
                final missed = d['missed'] as int;
                final total = d['total'] as int;
                final frac = total / maxVal;
                return _ActivityBar(
                  day: d['day'] as String,
                  taken: taken,
                  missed: missed,
                  heightFraction: frac.clamp(0.0, 1.0),
                  isToday: data.indexOf(d) == 6,
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _Legend(color: AppTheme.success, label: 'Taken'),
              const SizedBox(width: 16),
              _Legend(color: AppTheme.danger, label: 'Missed'),
            ],
          ),
        ],
      ),
    );
  }

  // ── History list ────────────────────────────────────────────────────────
  Widget _buildHistory(List<DoseEvent> events, MedicationProvider provider) {
    final shown = events
        .where((e) =>
            e.status == DoseStatus.taken || e.status == DoseStatus.missed)
        .take(12)
        .toList();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('History', style: AppTheme.title),
          const SizedBox(height: 16),
          if (shown.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Column(
                  children: [
                    Icon(Icons.history, size: 40, color: AppTheme.lightText),
                    const SizedBox(height: 8),
                    Text('No history yet', style: AppTheme.bodySmall),
                  ],
                ),
              ),
            )
          else
            ...shown.map((event) {
              final sch = provider.schedules.firstWhere(
                (s) => s.id == event.scheduleId,
                orElse: () => MedicationSchedule(
                  id: '',
                  userId: '',
                  medicationName: 'Unknown',
                  dosage: '',
                  doseTime: '',
                  createdAt: DateTime.now(),
                ),
              );
              return _HistoryRow(event: event, schedule: sch);
            }),
        ],
      ),
    );
  }

  List<DoseEvent> _filter(List<DoseEvent> all) {
    final now = DateTime.now();
    switch (_period) {
      case 'today':
        return all
            .where((e) =>
                e.scheduledTime.year == now.year &&
                e.scheduledTime.month == now.month &&
                e.scheduledTime.day == now.day)
            .toList();
      case 'week':
        return all
            .where((e) =>
                e.scheduledTime.isAfter(now.subtract(const Duration(days: 7))))
            .toList();
      case 'month':
        return all
            .where((e) =>
                e.scheduledTime.isAfter(now.subtract(const Duration(days: 30))))
            .toList();
      default:
        return all;
    }
  }

  Map<String, int> _calc(List<DoseEvent> events) => {
        'taken': events.where((e) => e.status == DoseStatus.taken).length,
        'missed': events.where((e) => e.status == DoseStatus.missed).length,
        'pending': events.where((e) => e.status == DoseStatus.pending).length,
        'total': events.length,
      };

  String _msg(int r) {
    if (r >= 90) return 'Excellent! You\'re very consistent.';
    if (r >= 70) return 'Good progress! Keep the routine.';
    if (r >= 50) return 'Room for improvement.';
    return 'Let\'s work on improving together.';
  }
}

// ── Sub-widgets ─────────────────────────────────────────────────────────

class _SummaryTile extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _SummaryTile(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(value,
                style: AppTheme.headline.copyWith(color: color, fontSize: 26)),
            const SizedBox(height: 4),
            Text(label, style: AppTheme.caption),
          ],
        ),
      ),
    );
  }
}

class _ActivityBar extends StatelessWidget {
  final String day;
  final int taken;
  final int missed;
  final double heightFraction;
  final bool isToday;

  const _ActivityBar({
    required this.day,
    required this.taken,
    required this.missed,
    required this.heightFraction,
    required this.isToday,
  });

  @override
  Widget build(BuildContext context) {
    const maxH = 90.0;
    final takenH = taken > 0 ? (heightFraction * maxH * (taken / (taken + missed).clamp(1, 99))) : 0.0;
    final missedH = missed > 0 ? (heightFraction * maxH * (missed / (taken + missed).clamp(1, 99))) : 0.0;
    final emptyH = heightFraction == 0 ? 4.0 : 0.0;

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        if (isToday)
          Container(
            width: 28,
            height: 4,
            decoration: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        const SizedBox(height: 2),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: Column(
            children: [
              if (missedH > 0)
                Container(
                    width: 28,
                    height: missedH,
                    color: AppTheme.danger),
              if (takenH > 0)
                Container(
                    width: 28,
                    height: takenH,
                    color: AppTheme.success),
              if (emptyH > 0)
                Container(
                    width: 28,
                    height: emptyH,
                    color: AppTheme.border),
            ],
          ),
        ),
        const SizedBox(height: 6),
        Text(day,
            style: AppTheme.caption.copyWith(
              fontWeight: isToday ? FontWeight.w700 : FontWeight.w400,
              color: isToday ? AppTheme.primary : AppTheme.lightText,
            )),
      ],
    );
  }
}

class _Legend extends StatelessWidget {
  final Color color;
  final String label;
  const _Legend({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration:
              BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
        ),
        const SizedBox(width: 5),
        Text(label, style: AppTheme.caption),
      ],
    );
  }
}

class _HistoryRow extends StatelessWidget {
  final DoseEvent event;
  final MedicationSchedule schedule;
  const _HistoryRow({required this.event, required this.schedule});

  @override
  Widget build(BuildContext context) {
    final isTaken = event.status == DoseStatus.taken;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isTaken ? AppTheme.success : AppTheme.danger,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(schedule.medicationName,
                    style: AppTheme.body.copyWith(fontWeight: FontWeight.w600)),
                Text(
                    DateFormat('MMM d, h:mm a').format(event.scheduledTime),
                    style: AppTheme.caption),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: (isTaken ? AppTheme.success : AppTheme.danger)
                  .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              isTaken ? 'Taken' : 'Missed',
              style: AppTheme.caption.copyWith(
                color: isTaken ? AppTheme.success : AppTheme.danger,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
