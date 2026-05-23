import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/medication_provider.dart';
import '../models/medication.dart';

class MedsScreen extends StatefulWidget {
  const MedsScreen({super.key});

  @override
  State<MedsScreen> createState() => _MedsScreenState();
}

class _MedsScreenState extends State<MedsScreen> {
  int _filterIndex = 0;
  final _filters = ['All', 'Active', 'Inactive', 'Time-Specific', 'Duration'];

  List<MedicationSchedule> _applyFilter(List<MedicationSchedule> all) {
    switch (_filterIndex) {
      case 1:
        return all.where((s) => s.enabled).toList();
      case 2:
        return all.where((s) => !s.enabled).toList();
      case 3:
        return all.where((s) => s.scheduleType == ScheduleType.timeSpecific).toList();
      case 4:
        return all.where((s) => s.scheduleType == ScheduleType.durationBased).toList();
      default:
        return all;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<MedicationProvider>(
      builder: (context, provider, child) {
        final filtered = _applyFilter(provider.schedules);

        return Scaffold(
          backgroundColor: AppTheme.background,
          body: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header ──────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text('My Medications',
                            style: AppTheme.headline),
                      ),
                      Text(
                        '${provider.schedules.length} total',
                        style: AppTheme.bodySmall
                            .copyWith(color: AppTheme.primary),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ── Category filter chips ────────────────────────────
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    scrollDirection: Axis.horizontal,
                    itemCount: _filters.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final selected = _filterIndex == i;
                      return GestureDetector(
                        onTap: () => setState(() => _filterIndex = i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: selected
                                ? AppTheme.primary
                                : AppTheme.cardWhite,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: selected
                                  ? AppTheme.primary
                                  : AppTheme.border,
                            ),
                          ),
                          child: Text(
                            _filters[i],
                            style: AppTheme.caption.copyWith(
                              color: selected
                                  ? Colors.white
                                  : AppTheme.lightText,
                              fontWeight: selected
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),

                // ── List ─────────────────────────────────────────────
                Expanded(
                  child: filtered.isEmpty
                      ? _buildEmptyState()
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 12),
                          itemBuilder: (_, i) => _MedCard(
                            schedule: filtered[i],
                            provider: provider,
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

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.medication_outlined,
                size: 40, color: AppTheme.primary),
          ),
          const SizedBox(height: 20),
          Text('No medications found', style: AppTheme.title),
          const SizedBox(height: 8),
          Text(
            'Tap the + button to add your first medication',
            style: AppTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ── Medication card ──────────────────────────────────────────────────────
class _MedCard extends StatelessWidget {
  final MedicationSchedule schedule;
  final MedicationProvider provider;

  const _MedCard({required this.schedule, required this.provider});

  @override
  Widget build(BuildContext context) {
    final scheduleLabel = schedule.scheduleType == ScheduleType.durationBased
        ? 'Every ${schedule.intervalHours}h'
        : _daysLabel();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: schedule.enabled ? AppTheme.border : AppTheme.border,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Icon box
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: schedule.enabled
                  ? AppTheme.primaryGradient
                  : LinearGradient(
                      colors: [AppTheme.border, AppTheme.border]),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.medication, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 14),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(schedule.medicationName,
                    style: AppTheme.body
                        .copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 3),
                Text(schedule.dosage, style: AppTheme.caption),
                const SizedBox(height: 6),
                Row(
                  children: [
                    _InfoPill(
                      icon: Icons.schedule_outlined,
                      label: schedule.doseTime,
                      color: AppTheme.primary,
                    ),
                    const SizedBox(width: 6),
                    _InfoPill(
                      icon: Icons.repeat,
                      label: scheduleLabel,
                      color: AppTheme.accent,
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Toggle
          Switch(
            value: schedule.enabled,
            onChanged: (v) =>
                provider.updateSchedule(schedule.id, {'enabled': v}),
            activeTrackColor: AppTheme.success.withValues(alpha: 0.3),
            activeThumbColor: AppTheme.success,
            inactiveThumbColor: AppTheme.border,
          ),
        ],
      ),
    );
  }

  String _daysLabel() {
    if (schedule.daysOfWeek.length == 7) return 'Every day';
    const names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return schedule.daysOfWeek.map((d) => names[d % 7]).join(' ');
  }
}

class _InfoPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _InfoPill({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 3),
          Text(label,
              style:
                  AppTheme.caption.copyWith(color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
