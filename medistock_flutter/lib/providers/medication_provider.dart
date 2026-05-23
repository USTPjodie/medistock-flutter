import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/medication.dart';
import '../models/user_profile.dart';

class MedicationProvider with ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  List<MedicationSchedule> _schedules = [];
  List<DoseEvent> _doseEvents = [];
  List<NotificationItem> _notifications = [];
  UserProfile? _userProfile;
  bool _isLoading = false;
  String? _error;

  List<MedicationSchedule> get schedules => _schedules;
  List<DoseEvent> get doseEvents => _doseEvents;
  List<NotificationItem> get notifications => _notifications;
  UserProfile? get userProfile => _userProfile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get active schedules
  List<MedicationSchedule> get activeSchedules =>
      _schedules.where((s) => s.enabled).toList();

  // Calculate adherence rate
  int get adherenceRate {
    if (_doseEvents.isEmpty) return 95;
    final taken = _doseEvents.where((e) => e.status == DoseStatus.taken).length;
    final total = _doseEvents.length;
    return total > 0 ? ((taken / total) * 100).round() : 95;
  }

  // Get adherence message
  String get adherenceMessage {
    final rate = adherenceRate;
    if (rate >= 90) return 'Excellent! Keep it up!';
    if (rate >= 70) return 'Good progress!';
    if (rate >= 50) return 'Room for improvement';
    return "Let's do better!";
  }

  // Get unread notifications count
  int get unreadCount => _notifications.where((n) => !n.read).length;

  // Fetch schedules
  Future<void> fetchSchedules() async {
    final user = _auth.currentUser;
    if (user == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      final snapshot = await _firestore
          .collection('schedules')
          .where('userId', isEqualTo: user.uid)
          .orderBy('createdAt', descending: true)
          .get();

      _schedules = snapshot.docs
          .map((doc) => MedicationSchedule.fromFirestore(doc))
          .toList();
      _error = null;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Add schedule
  Future<void> addSchedule(MedicationSchedule schedule) async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final docRef = await _firestore.collection('schedules').add({
        ...schedule.toMap(),
        'userId': user.uid,
        'createdAt': FieldValue.serverTimestamp(),
      });

      _schedules.insert(0, MedicationSchedule(
        id: docRef.id,
        userId: user.uid,
        medicationName: schedule.medicationName,
        dosage: schedule.dosage,
        doseTime: schedule.doseTime,
        enabled: schedule.enabled,
        scheduleType: schedule.scheduleType,
        daysOfWeek: schedule.daysOfWeek,
        intervalHours: schedule.intervalHours,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        createdAt: DateTime.now(),
      ));

      notifyListeners();
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }

  // Update schedule
  Future<void> updateSchedule(String id, Map<String, dynamic> data) async {
    try {
      await _firestore.collection('schedules').doc(id).update(data);
      
      final index = _schedules.indexWhere((s) => s.id == id);
      if (index != -1) {
        // Update local state
        await fetchSchedules();
      }
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }

  // Delete schedule
  Future<void> deleteSchedule(String id) async {
    try {
      await _firestore.collection('schedules').doc(id).delete();
      _schedules.removeWhere((s) => s.id == id);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }

  // Fetch dose events
  Future<void> fetchDoseEvents() async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final snapshot = await _firestore
          .collection('doseEvents')
          .where('userId', isEqualTo: user.uid)
          .orderBy('scheduledTime', descending: true)
          .limit(50)
          .get();

      _doseEvents = snapshot.docs
          .map((doc) => DoseEvent.fromFirestore(doc))
          .toList();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }

  // Add dose event
  Future<void> addDoseEvent(DoseEvent event) async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final docRef = await _firestore.collection('doseEvents').add({
        ...event.toMap(),
        'userId': user.uid,
        'createdAt': FieldValue.serverTimestamp(),
      });

      _doseEvents.insert(0, DoseEvent(
        id: docRef.id,
        userId: user.uid,
        scheduleId: event.scheduleId,
        scheduledTime: event.scheduledTime,
        actualTakenTime: event.actualTakenTime,
        status: event.status,
        createdAt: DateTime.now(),
      ));

      notifyListeners();
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }

  // Update dose event status
  Future<void> updateDoseEventStatus(String id, DoseStatus status, {DateTime? actualTakenTime}) async {
    try {
      await _firestore.collection('doseEvents').doc(id).update({
        'status': status.name,
        if (actualTakenTime != null)
          'actualTakenTime': Timestamp.fromDate(actualTakenTime),
      });

      final index = _doseEvents.indexWhere((e) => e.id == id);
      if (index != -1) {
        _doseEvents[index] = DoseEvent(
          id: _doseEvents[index].id,
          userId: _doseEvents[index].userId,
          scheduleId: _doseEvents[index].scheduleId,
          scheduledTime: _doseEvents[index].scheduledTime,
          actualTakenTime: actualTakenTime ?? _doseEvents[index].actualTakenTime,
          status: status,
          createdAt: _doseEvents[index].createdAt,
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }

  // Fetch notifications
  Future<void> fetchNotifications() async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final snapshot = await _firestore
          .collection('notifications')
          .where('userId', isEqualTo: user.uid)
          .orderBy('createdAt', descending: true)
          .limit(20)
          .get();

      _notifications = snapshot.docs
          .map((doc) => NotificationItem.fromFirestore(doc))
          .toList();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }

  // Mark notification as read
  Future<void> markNotificationRead(String id) async {
    try {
      await _firestore.collection('notifications').doc(id).update({'read': true});
      
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1) {
        _notifications[index] = NotificationItem(
          id: _notifications[index].id,
          userId: _notifications[index].userId,
          type: _notifications[index].type,
          title: _notifications[index].title,
          body: _notifications[index].body,
          read: true,
          createdAt: _notifications[index].createdAt,
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
    }
  }

  // Initialize data
  Future<void> initialize() async {
    await Future.wait([
      fetchSchedules(),
      fetchDoseEvents(),
      fetchNotifications(),
      fetchUserProfile(),
    ]);
  }

  // Fetch user profile
  Future<void> fetchUserProfile() async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final doc = await _firestore.collection('userProfiles').doc(user.uid).get();
      if (doc.exists) {
        _userProfile = UserProfile.fromFirestore(doc);
      } else {
        // Create default profile
        _userProfile = UserProfile(
          userId: user.uid,
          fullName: user.displayName,
          email: user.email,
          createdAt: DateTime.now(),
        );
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }

  // Update user profile
  Future<void> updateUserProfile(UserProfile profile) async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      await _firestore.collection('userProfiles').doc(user.uid).set({
        ...profile.toMap(),
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      _userProfile = profile;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }

  // Update specific profile field
  Future<void> updateProfileField(String field, dynamic value) async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      await _firestore.collection('userProfiles').doc(user.uid).set({
        field: value,
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      // Update local state
      if (_userProfile != null) {
        // Re-fetch to get updated profile
        await fetchUserProfile();
      }
    } catch (e) {
      _error = e.toString();
      rethrow;
    }
  }
}
