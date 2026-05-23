import 'package:cloud_firestore/cloud_firestore.dart';

enum ScheduleType { timeSpecific, durationBased }

class MedicationSchedule {
  final String id;
  final String userId;
  final String medicationName;
  final String dosage;
  final String doseTime;
  final bool enabled;
  final ScheduleType scheduleType;
  final List<int> daysOfWeek;
  final int? intervalHours;
  final String? startTime;
  final String? endTime;
  final DateTime createdAt;

  MedicationSchedule({
    required this.id,
    required this.userId,
    required this.medicationName,
    required this.dosage,
    required this.doseTime,
    this.enabled = true,
    this.scheduleType = ScheduleType.timeSpecific,
    this.daysOfWeek = const [1, 2, 3, 4, 5, 6, 7],
    this.intervalHours,
    this.startTime,
    this.endTime,
    required this.createdAt,
  });

  factory MedicationSchedule.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return MedicationSchedule(
      id: doc.id,
      userId: data['userId'] ?? '',
      medicationName: data['medicationName'] ?? '',
      dosage: data['dosage'] ?? '1 pill',
      doseTime: data['doseTime'] ?? '08:00',
      enabled: data['enabled'] ?? true,
      scheduleType: data['scheduleType'] == 'duration-based'
          ? ScheduleType.durationBased
          : ScheduleType.timeSpecific,
      daysOfWeek: List<int>.from(data['daysOfWeek'] ?? [1, 2, 3, 4, 5, 6, 7]),
      intervalHours: data['intervalHours'],
      startTime: data['startTime'],
      endTime: data['endTime'],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'medicationName': medicationName,
      'dosage': dosage,
      'doseTime': doseTime,
      'enabled': enabled,
      'scheduleType': scheduleType == ScheduleType.durationBased
          ? 'duration-based'
          : 'time-specific',
      'daysOfWeek': daysOfWeek,
      'intervalHours': intervalHours,
      'startTime': startTime,
      'endTime': endTime,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}

enum DoseStatus { pending, taken, missed, skipped }

class DoseEvent {
  final String id;
  final String userId;
  final String scheduleId;
  final DateTime scheduledTime;
  final DateTime? actualTakenTime;
  final DoseStatus status;
  final DateTime createdAt;

  DoseEvent({
    required this.id,
    required this.userId,
    required this.scheduleId,
    required this.scheduledTime,
    this.actualTakenTime,
    this.status = DoseStatus.pending,
    required this.createdAt,
  });

  factory DoseEvent.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return DoseEvent(
      id: doc.id,
      userId: data['userId'] ?? '',
      scheduleId: data['scheduleId'] ?? '',
      scheduledTime: (data['scheduledTime'] as Timestamp?)?.toDate() ?? DateTime.now(),
      actualTakenTime: (data['actualTakenTime'] as Timestamp?)?.toDate(),
      status: DoseStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => DoseStatus.pending,
      ),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'scheduleId': scheduleId,
      'scheduledTime': Timestamp.fromDate(scheduledTime),
      'actualTakenTime': actualTakenTime != null
          ? Timestamp.fromDate(actualTakenTime!)
          : null,
      'status': status.name,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}

class NotificationItem {
  final String id;
  final String userId;
  final String type;
  final String title;
  final String body;
  final bool read;
  final DateTime createdAt;

  NotificationItem({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.body,
    this.read = false,
    required this.createdAt,
  });

  factory NotificationItem.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return NotificationItem(
      id: doc.id,
      userId: data['userId'] ?? '',
      type: data['type'] ?? 'system',
      title: data['title'] ?? '',
      body: data['body'] ?? '',
      read: data['read'] ?? false,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}
