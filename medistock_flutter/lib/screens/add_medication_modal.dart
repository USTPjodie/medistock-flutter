import 'package:flutter/material.dart';
import '../app_theme.dart';
import '../models/medication.dart';

class AddMedicationModal extends StatefulWidget {
  final Function(MedicationSchedule) onSave;

  const AddMedicationModal({super.key, required this.onSave});

  @override
  State<AddMedicationModal> createState() => _AddMedicationModalState();
}

class _AddMedicationModalState extends State<AddMedicationModal> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _dosageController = TextEditingController();
  final _timeController = TextEditingController(text: '08:00');
  final _intervalController = TextEditingController(text: '8');

  ScheduleType _scheduleType = ScheduleType.timeSpecific;
  final List<int> _selectedDays = [1, 2, 3, 4, 5];
  String _startTime = '08:00';
  String _endTime = '22:00';

  final List<String> _daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  @override
  void dispose() {
    _nameController.dispose();
    _dosageController.dispose();
    _timeController.dispose();
    _intervalController.dispose();
    super.dispose();
  }

  void _handleSave() {
    if (!_formKey.currentState!.validate()) return;

    final schedule = MedicationSchedule(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      userId: '',
      medicationName: _nameController.text.trim(),
      dosage: _dosageController.text.trim().isNotEmpty
          ? _dosageController.text.trim()
          : '1 pill',
      doseTime: _timeController.text,
      enabled: true,
      scheduleType: _scheduleType,
      daysOfWeek: _selectedDays,
      intervalHours: _scheduleType == ScheduleType.durationBased
          ? int.tryParse(_intervalController.text)
          : null,
      startTime: _scheduleType == ScheduleType.durationBased ? _startTime : null,
      endTime: _scheduleType == ScheduleType.durationBased ? _endTime : null,
      createdAt: DateTime.now(),
    );

    widget.onSave(schedule);
    Navigator.pop(context);
  }

  void _toggleDay(int dayIndex) {
    setState(() {
      if (_selectedDays.contains(dayIndex)) {
        _selectedDays.remove(dayIndex);
      } else {
        _selectedDays.add(dayIndex);
        _selectedDays.sort();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
                Text(
                  'Add Medication',
                  style: AppTheme.heading3,
                ),
                const SizedBox(width: 48),
              ],
            ),
          ),
          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Schedule Type
                    _buildScheduleTypeSelector(),
                    const SizedBox(height: 20),
                    // Form Fields
                    _buildFormFields(),
                    const SizedBox(height: 24),
                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _handleSave,
                        child: const Text('Save Medication'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleTypeSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Schedule Type',
            style: AppTheme.heading3,
          ),
          const SizedBox(height: 4),
          Text(
            'Choose how you want to schedule your medication',
            style: AppTheme.bodySmall,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildTypeButton(
                  ScheduleType.timeSpecific,
                  'Time-Specific',
                  Icons.schedule,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildTypeButton(
                  ScheduleType.durationBased,
                  'Duration-Based',
                  Icons.timer,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTypeButton(ScheduleType type, String label, IconData icon) {
    final isSelected = _scheduleType == type;
    return GestureDetector(
      onTap: () => setState(() => _scheduleType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.cardWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppTheme.primary : AppTheme.border,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? Colors.white : AppTheme.darkText,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppTheme.darkText,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormFields() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          // Medication Name
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Medication Name',
              hintText: 'e.g., Aspirin',
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Please enter a medication name';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          // Dosage
          TextFormField(
            controller: _dosageController,
            decoration: const InputDecoration(
              labelText: 'Dosage',
              hintText: 'e.g., 100mg',
            ),
          ),
          const SizedBox(height: 16),
          // Time-Specific Fields
          if (_scheduleType == ScheduleType.timeSpecific) ...[
            TextFormField(
              controller: _timeController,
              decoration: const InputDecoration(
                labelText: 'Time (HH:MM)',
                hintText: '08:00',
              ),
              keyboardType: TextInputType.datetime,
            ),
            const SizedBox(height: 16),
            // Days of Week
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Days of Week',
                  style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: List.generate(7, (index) {
                    final isSelected = _selectedDays.contains(index);
                    return GestureDetector(
                      onTap: () => _toggleDay(index),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primary : AppTheme.background,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? AppTheme.primary : AppTheme.border,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            _daysOfWeek[index],
                            style: TextStyle(
                              color: isSelected ? Colors.white : AppTheme.darkText,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ],
          // Duration-Based Fields
          if (_scheduleType == ScheduleType.durationBased) ...[
            TextFormField(
              controller: _intervalController,
              decoration: const InputDecoration(
                labelText: 'Every X Hours',
                hintText: '8',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    initialValue: _startTime,
                    decoration: const InputDecoration(
                      labelText: 'Start Time',
                      hintText: '08:00',
                    ),
                    keyboardType: TextInputType.datetime,
                    onChanged: (v) => _startTime = v,
                  ),
                ),
                const SizedBox(width: 12),
                Text('to', style: AppTheme.body),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    initialValue: _endTime,
                    decoration: const InputDecoration(
                      labelText: 'End Time',
                      hintText: '22:00',
                    ),
                    keyboardType: TextInputType.datetime,
                    onChanged: (v) => _endTime = v,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
