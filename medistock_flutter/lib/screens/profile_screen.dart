import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/medication_provider.dart';
import '../providers/theme_provider.dart';
import '../models/user_profile.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Consumer2<AuthProvider, MedicationProvider>(
      builder: (context, authProvider, medProvider, child) {
        final profile = medProvider.userProfile;
        final user = authProvider.user;

        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          body: CustomScrollView(
            slivers: [
              // ── Fitness-style header banner ──────────────────────────
              SliverToBoxAdapter(
                child: _buildProfileBanner(user, profile),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    const SizedBox(height: 20),
                    _buildHealthStatsRow(profile),
                    const SizedBox(height: 20),
                    _buildMedicalInfoCard(medProvider),
                    const SizedBox(height: 16),
                    _buildAllergiesCard(medProvider),
                    const SizedBox(height: 16),
                    _buildEmergencyContactCard(medProvider),
                    const SizedBox(height: 16),
                    _buildPhysicianCard(medProvider),
                    const SizedBox(height: 16),
                    _buildSettingsCard(context),
                    const SizedBox(height: 16),
                    _buildAppInfoCard(medProvider),
                    const SizedBox(height: 24),
                    _buildSignOutButton(context, authProvider),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ── Banner ──────────────────────────────────────────────────────────────
  Widget _buildProfileBanner(dynamic user, UserProfile? profile) {
    final initial = profile?.fullName?.isNotEmpty == true
        ? profile!.fullName![0].toUpperCase()
        : user?.email?[0].toUpperCase() ?? '?';

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 52, 20, 28),
      decoration: const BoxDecoration(
        gradient: AppTheme.darkCardGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
      ),
      child: Row(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              gradient: AppTheme.accentGradient,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white24, width: 2),
            ),
            child: Center(
              child: Text(
                initial,
                style: AppTheme.display1.copyWith(
                  color: Colors.white,
                  fontSize: 30,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile?.fullName ?? user?.displayName ?? 'User',
                  style: AppTheme.heading3.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? '',
                  style: AppTheme.caption.copyWith(color: Colors.white60),
                ),
                if (profile?.age != null) ...[
                  const SizedBox(height: 6),
                  _WhitePill(
                      label: '${profile!.age} yrs  ·  ${profile.gender ?? ''}'),
                ],
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: Colors.white70),
            onPressed: () => _editNameDialog(
                context.read<MedicationProvider>(), profile),
          ),
        ],
      ),
    );
  }

  // ── Health stats row ────────────────────────────────────────────────────
  Widget _buildHealthStatsRow(UserProfile? profile) {
    return Row(
      children: [
        _HealthTile(
          label: 'Weight',
          value: profile?.weight != null
              ? '${profile!.weight!.toStringAsFixed(1)}'
              : '--',
          unit: 'kg',
          icon: Icons.monitor_weight_outlined,
          color: AppTheme.primary,
          onTap: () => _editWeightDialog(
              context.read<MedicationProvider>(), profile),
        ),
        const SizedBox(width: 12),
        _HealthTile(
          label: 'Height',
          value: profile?.height != null
              ? '${profile!.height!.toStringAsFixed(0)}'
              : '--',
          unit: 'cm',
          icon: Icons.height,
          color: AppTheme.accent,
          onTap: () => _editHeightDialog(
              context.read<MedicationProvider>(), profile),
        ),
        const SizedBox(width: 12),
        _HealthTile(
          label: 'BMI',
          value: profile?.bmi != null
              ? profile!.bmi!.toStringAsFixed(1)
              : '--',
          unit: _bmiLabel(profile?.bmi),
          icon: Icons.analytics_outlined,
          color: _bmiColor(profile?.bmi),
          onTap: null,
        ),
      ],
    );
  }

  Color _bmiColor(double? bmi) {
    if (bmi == null) return AppTheme.lightText;
    if (bmi < 18.5) return AppTheme.warning;
    if (bmi < 25) return AppTheme.success;
    if (bmi < 30) return AppTheme.warning;
    return AppTheme.danger;
  }

  String _bmiLabel(double? bmi) {
    if (bmi == null) return '';
    if (bmi < 18.5) return 'Under';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Over';
    return 'Obese';
  }

  // ── Medical Info ────────────────────────────────────────────────────────
  Widget _buildMedicalInfoCard(MedicationProvider provider) {
    final p = provider.userProfile;
    return _SectionCard(
      title: 'Medical Info',
      icon: Icons.medical_services_outlined,
      children: [
        _InfoRow(
          icon: Icons.bloodtype_outlined,
          color: AppTheme.danger,
          label: 'Blood Type',
          value: p?.bloodType ?? 'Not set',
          onTap: () => _bloodTypeDialog(provider, p),
        ),
        const _Divider(),
        _InfoRow(
          icon: Icons.person_outline,
          color: AppTheme.primary,
          label: 'Gender',
          value: p?.gender ?? 'Not set',
          onTap: () => _genderDialog(provider, p),
        ),
        const _Divider(),
        _InfoRow(
          icon: Icons.cake_outlined,
          color: AppTheme.warning,
          label: 'Date of Birth',
          value: p?.dateOfBirth != null
              ? DateFormat('MMM d, yyyy').format(p!.dateOfBirth!)
              : 'Not set',
          onTap: () => _dobPicker(provider, p),
        ),
      ],
    );
  }

  // ── Allergies ───────────────────────────────────────────────────────────
  Widget _buildAllergiesCard(MedicationProvider provider) {
    final allergies = provider.userProfile?.allergies ?? [];
    return _SectionCard(
      title: 'Allergies',
      icon: Icons.warning_amber_outlined,
      action: TextButton.icon(
        onPressed: () => _addAllergyDialog(provider, provider.userProfile),
        icon: Icon(Icons.add, size: 16, color: AppTheme.primary),
        label: Text('Add',
            style: AppTheme.caption
                .copyWith(color: AppTheme.primary, fontWeight: FontWeight.w600)),
      ),
      children: [
        if (allergies.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text('No known allergies', style: AppTheme.bodySmall),
          )
        else
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: allergies
                  .map((a) => _AllergyChip(
                      label: a,
                      onRemove: () => _removeAllergy(provider, a)))
                  .toList(),
            ),
          ),
      ],
    );
  }

  // ── Emergency Contact ───────────────────────────────────────────────────
  Widget _buildEmergencyContactCard(MedicationProvider provider) {
    final contact = provider.userProfile?.emergencyContact;
    return _SectionCard(
      title: 'Emergency Contact',
      icon: Icons.contact_phone_outlined,
      action: IconButton(
        icon: Icon(Icons.edit_outlined, size: 18, color: AppTheme.primary),
        onPressed: () => _emergencyDialog(provider, provider.userProfile),
      ),
      children: [
        if (contact == null)
          _AddPrompt(
            label: 'Add emergency contact',
            onTap: () =>
                _emergencyDialog(provider, provider.userProfile),
          )
        else
          _ContactCard(contact: contact),
      ],
    );
  }

  // ── Physician ───────────────────────────────────────────────────────────
  Widget _buildPhysicianCard(MedicationProvider provider) {
    final p = provider.userProfile;
    return _SectionCard(
      title: 'Primary Physician',
      icon: Icons.local_hospital_outlined,
      action: IconButton(
        icon: Icon(Icons.edit_outlined, size: 18, color: AppTheme.primary),
        onPressed: () => _physicianDialog(provider, p),
      ),
      children: [
        if (p?.physicianName == null)
          _AddPrompt(
              label: 'Add physician info',
              onTap: () => _physicianDialog(provider, p))
        else
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.local_hospital_outlined,
                    color: AppTheme.success),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p!.physicianName!,
                      style:
                          AppTheme.body.copyWith(fontWeight: FontWeight.w600)),
                  if (p.physicianPhone != null)
                    Text(p.physicianPhone!,
                        style: AppTheme.bodySmall
                            .copyWith(color: AppTheme.primary)),
                ],
              ),
            ],
          ),
      ],
    );
  }

  // ── Settings ────────────────────────────────────────────────────────────
  Widget _buildSettingsCard(BuildContext context) {
    return _SectionCard(
      title: 'Settings',
      icon: Icons.settings_outlined,
      children: [
        _SwitchRow(
          icon: Icons.notifications_active_outlined,
          label: 'Push Notifications',
          subtitle: 'Receive alerts and reminders',
          value: true,
          onChanged: (_) {},
        ),
        const _Divider(),
        _SwitchRow(
          icon: Icons.alarm,
          label: 'Dose Reminders',
          subtitle: 'Remind me before each dose',
          value: true,
          onChanged: (_) {},
        ),
        const _Divider(),
        const _ThemeSelectionRow(),
      ],
    );
  }

  // ── App info ─────────────────────────────────────────────────────────────
  Widget _buildAppInfoCard(MedicationProvider provider) {
    return _SectionCard(
      title: 'App Info',
      icon: Icons.info_outline,
      children: [
        _RowItem(label: 'Version', value: '1.0.0'),
        const _Divider(),
        _RowItem(label: 'Build', value: '2026.03.10'),
        const _Divider(),
        _RowItem(
          label: 'Database',
          value: provider.error == null ? 'Connected' : 'Error',
          valueColor:
              provider.error == null ? AppTheme.success : AppTheme.danger,
        ),
      ],
    );
  }

  // ── Sign out ────────────────────────────────────────────────────────────
  Widget _buildSignOutButton(BuildContext context, AuthProvider provider) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Sign Out'),
            content: const Text('Are you sure you want to sign out?'),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel')),
              ElevatedButton(
                onPressed: () {
                  provider.signOut();
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.danger),
                child: const Text('Sign Out'),
              ),
            ],
          ),
        ),
        icon: const Icon(Icons.logout, color: AppTheme.danger),
        label: const Text('Sign Out',
            style: TextStyle(color: AppTheme.danger)),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          side: const BorderSide(color: AppTheme.danger),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }

  // ── Dialog helpers ──────────────────────────────────────────────────────
  void _editNameDialog(MedicationProvider mp, UserProfile? p) {
    final c = TextEditingController(text: p?.fullName ?? '');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Edit Name'),
        content: TextField(
          controller: c,
          decoration: const InputDecoration(labelText: 'Full Name'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (p != null) mp.updateUserProfile(p.copyWith(fullName: c.text.trim()));
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _editWeightDialog(MedicationProvider mp, UserProfile? p) {
    final c = TextEditingController(text: p?.weight?.toStringAsFixed(1) ?? '');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Weight (kg)'),
        content: TextField(
          controller: c,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration:
              const InputDecoration(labelText: 'Weight', suffixText: 'kg'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (p != null) {
                final w = double.tryParse(c.text);
                if (w != null) mp.updateUserProfile(p.copyWith(weight: w));
              }
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _editHeightDialog(MedicationProvider mp, UserProfile? p) {
    final c = TextEditingController(text: p?.height?.toStringAsFixed(0) ?? '');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Height (cm)'),
        content: TextField(
          controller: c,
          keyboardType: TextInputType.number,
          decoration:
              const InputDecoration(labelText: 'Height', suffixText: 'cm'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (p != null) {
                final h = double.tryParse(c.text);
                if (h != null) mp.updateUserProfile(p.copyWith(height: h));
              }
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _bloodTypeDialog(MedicationProvider mp, UserProfile? p) {
    showDialog(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Blood Type'),
        children: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            .map((t) => SimpleDialogOption(
                  onPressed: () {
                    if (p != null) mp.updateUserProfile(p.copyWith(bloodType: t));
                    Navigator.pop(context);
                  },
                  child: Row(
                    children: [
                      Text(t, style: AppTheme.body),
                      const Spacer(),
                      if (p?.bloodType == t)
                        Icon(Icons.check, color: AppTheme.primary),
                    ],
                  ),
                ))
            .toList(),
      ),
    );
  }

  void _genderDialog(MedicationProvider mp, UserProfile? p) {
    showDialog(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Gender'),
        children: ['Male', 'Female', 'Other']
            .map((g) => SimpleDialogOption(
                  onPressed: () {
                    if (p != null) mp.updateUserProfile(p.copyWith(gender: g));
                    Navigator.pop(context);
                  },
                  child: Row(
                    children: [
                      Text(g, style: AppTheme.body),
                      const Spacer(),
                      if (p?.gender == g) Icon(Icons.check, color: AppTheme.primary),
                    ],
                  ),
                ))
            .toList(),
      ),
    );
  }

  void _dobPicker(MedicationProvider mp, UserProfile? p) async {
    if (p == null) return;
    final d = await showDatePicker(
      context: context,
      initialDate: p.dateOfBirth ?? DateTime(1990),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (d != null) mp.updateUserProfile(p.copyWith(dateOfBirth: d));
  }

  void _addAllergyDialog(MedicationProvider mp, UserProfile? p) {
    final c = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Add Allergy'),
        content: TextField(
          controller: c,
          decoration:
              const InputDecoration(labelText: 'Allergy', hintText: 'e.g., Penicillin'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (p != null && c.text.trim().isNotEmpty) {
                mp.updateUserProfile(
                    p.copyWith(allergies: [...p.allergies, c.text.trim()]));
              }
              Navigator.pop(context);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _removeAllergy(MedicationProvider mp, String a) {
    final p = mp.userProfile;
    if (p == null) return;
    mp.updateUserProfile(
        p.copyWith(allergies: p.allergies.where((x) => x != a).toList()));
  }

  void _emergencyDialog(MedicationProvider mp, UserProfile? p) {
    final nc = TextEditingController(text: p?.emergencyContact?.name ?? '');
    final rc = TextEditingController(text: p?.emergencyContact?.relationship ?? '');
    final pc = TextEditingController(text: p?.emergencyContact?.phone ?? '');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Emergency Contact'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nc, decoration: const InputDecoration(labelText: 'Name')),
            const SizedBox(height: 10),
            TextField(controller: rc, decoration: const InputDecoration(labelText: 'Relationship')),
            const SizedBox(height: 10),
            TextField(
                controller: pc,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (p != null) {
                mp.updateUserProfile(p.copyWith(
                  emergencyContact: EmergencyContact(
                      name: nc.text.trim(),
                      relationship: rc.text.trim(),
                      phone: pc.text.trim()),
                ));
              }
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _physicianDialog(MedicationProvider mp, UserProfile? p) {
    final nc = TextEditingController(text: p?.physicianName ?? '');
    final pc = TextEditingController(text: p?.physicianPhone ?? '');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Primary Physician'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nc, decoration: const InputDecoration(labelText: 'Physician Name')),
            const SizedBox(height: 10),
            TextField(
                controller: pc,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (p != null) {
                mp.updateUserProfile(p.copyWith(
                    physicianName: nc.text.trim(),
                    physicianPhone: pc.text.trim()));
              }
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

// ── Reusable sub-widgets ─────────────────────────────────────────────────

class _WhitePill extends StatelessWidget {
  final String label;
  const _WhitePill({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white12,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white24),
      ),
      child: Text(label,
          style: AppTheme.caption.copyWith(color: Colors.white70)),
    );
  }
}

class _HealthTile extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;
  const _HealthTile({
    required this.label,
    required this.value,
    required this.unit,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: theme.dividerColor),
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
                      .copyWith(fontSize: 20)),
              Text(unit,
                  style: AppTheme.caption
                      .copyWith(color: color, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(label,
                  style: AppTheme.caption.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;
  final Widget? action;
  const _SectionCard({
    required this.title,
    required this.icon,
    required this.children,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: theme.primaryColor, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(title, style: AppTheme.title)),
              if (action != null) action!,
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String value;
  final VoidCallback onTap;
  const _InfoRow({
    required this.icon,
    required this.color,
    required this.label,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: AppTheme.caption.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                  Text(value,
                      style: AppTheme.body
                          .copyWith(fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: theme.colorScheme.onSurfaceVariant, size: 18),
          ],
        ),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Divider(height: 1, color: Theme.of(context).dividerColor),
      );
}

class _SwitchRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _SwitchRow({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(icon, color: theme.colorScheme.onSurfaceVariant, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTheme.body),
              Text(subtitle, style: AppTheme.caption.copyWith(color: theme.colorScheme.onSurfaceVariant)),
            ],
          ),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeTrackColor: AppTheme.success.withValues(alpha: 0.3),
          activeThumbColor: AppTheme.success,
        ),
      ],
    );
  }
}

class _RowItem extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  const _RowItem({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTheme.bodySmall.copyWith(color: theme.colorScheme.onSurfaceVariant)),
          Text(value,
              style: AppTheme.body.copyWith(
                fontWeight: FontWeight.w600,
                color: valueColor,
              )),
        ],
      ),
    );
  }
}

class _AllergyChip extends StatelessWidget {
  final String label;
  final VoidCallback onRemove;
  const _AllergyChip({required this.label, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.danger.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.danger.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.warning_amber, size: 14, color: AppTheme.danger),
          const SizedBox(width: 5),
          Text(label,
              style: AppTheme.caption.copyWith(
                  color: AppTheme.danger, fontWeight: FontWeight.w600)),
          const SizedBox(width: 5),
          GestureDetector(
              onTap: onRemove,
              child: Icon(Icons.close, size: 14, color: AppTheme.danger)),
        ],
      ),
    );
  }
}

class _AddPrompt extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _AddPrompt({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: theme.scaffoldBackgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.dividerColor),
        ),
        child: Row(
          children: [
            Icon(Icons.add_circle_outline, color: theme.colorScheme.onSurfaceVariant),
            const SizedBox(width: 10),
            Text(label,
                style: AppTheme.body.copyWith(color: theme.colorScheme.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  final EmergencyContact contact;
  const _ContactCard({required this.contact});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.primaryColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.primaryColor.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(22),
            ),
            child:
                const Icon(Icons.person, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(contact.name,
                    style:
                        AppTheme.body.copyWith(fontWeight: FontWeight.w700)),
                Text(contact.relationship, style: AppTheme.caption.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.phone, size: 13, color: AppTheme.success),
                    const SizedBox(width: 4),
                    Text(contact.phone,
                        style: AppTheme.caption
                            .copyWith(color: AppTheme.success)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ThemeSelectionRow extends StatelessWidget {
  const _ThemeSelectionRow();

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(Icons.dark_mode_outlined, color: theme.colorScheme.onSurfaceVariant, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Theme Mode', style: AppTheme.body),
              Text('Customize how MediStock looks',
                  style: AppTheme.caption.copyWith(color: theme.colorScheme.onSurfaceVariant)),
            ],
          ),
        ),
        DropdownButton<ThemeMode>(
          value: themeProvider.themeMode,
          onChanged: (ThemeMode? newMode) {
            if (newMode != null) {
              themeProvider.setThemeMode(newMode);
            }
          },
          underline: const SizedBox(),
          icon: Icon(Icons.arrow_drop_down, color: theme.primaryColor),
          dropdownColor: theme.cardColor,
          items: const [
            DropdownMenuItem(
              value: ThemeMode.system,
              child: Text('System', style: AppTheme.body),
            ),
            DropdownMenuItem(
              value: ThemeMode.light,
              child: Text('Light', style: AppTheme.body),
            ),
            DropdownMenuItem(
              value: ThemeMode.dark,
              child: Text('Dark', style: AppTheme.body),
            ),
          ],
        ),
      ],
    );
  }
}
