import 'package:cloud_firestore/cloud_firestore.dart';

class UserProfile {
  final String userId;
  final String? fullName;
  final String? email;
  final DateTime? dateOfBirth;
  final String? bloodType;
  final String? gender;
  final double? weight; // in kg
  final double? height; // in cm
  final List<String> allergies;
  final List<String> medicalConditions;
  final EmergencyContact? emergencyContact;
  final String? physicianName;
  final String? physicianPhone;
  final DateTime createdAt;
  final DateTime? updatedAt;

  UserProfile({
    required this.userId,
    this.fullName,
    this.email,
    this.dateOfBirth,
    this.bloodType,
    this.gender,
    this.weight,
    this.height,
    this.allergies = const [],
    this.medicalConditions = const [],
    this.emergencyContact,
    this.physicianName,
    this.physicianPhone,
    required this.createdAt,
    this.updatedAt,
  });

  int? get age {
    if (dateOfBirth == null) return null;
    final now = DateTime.now();
    int years = now.year - dateOfBirth!.year;
    if (now.month < dateOfBirth!.month ||
        (now.month == dateOfBirth!.month && now.day < dateOfBirth!.day)) {
      years--;
    }
    return years;
  }

  double? get bmi {
    if (weight == null || height == null || height! <= 0) return null;
    final heightInMeters = height! / 100;
    return weight! / (heightInMeters * heightInMeters);
  }

  factory UserProfile.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return UserProfile(
      userId: data['userId'] ?? '',
      fullName: data['fullName'],
      email: data['email'],
      dateOfBirth: (data['dateOfBirth'] as Timestamp?)?.toDate(),
      bloodType: data['bloodType'],
      gender: data['gender'],
      weight: (data['weight'] as num?)?.toDouble(),
      height: (data['height'] as num?)?.toDouble(),
      allergies: List<String>.from(data['allergies'] ?? []),
      medicalConditions: List<String>.from(data['medicalConditions'] ?? []),
      emergencyContact: data['emergencyContact'] != null
          ? EmergencyContact.fromMap(data['emergencyContact'])
          : null,
      physicianName: data['physicianName'],
      physicianPhone: data['physicianPhone'],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'fullName': fullName,
      'email': email,
      'dateOfBirth': dateOfBirth != null ? Timestamp.fromDate(dateOfBirth!) : null,
      'bloodType': bloodType,
      'gender': gender,
      'weight': weight,
      'height': height,
      'allergies': allergies,
      'medicalConditions': medicalConditions,
      'emergencyContact': emergencyContact?.toMap(),
      'physicianName': physicianName,
      'physicianPhone': physicianPhone,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
    };
  }

  UserProfile copyWith({
    String? fullName,
    String? email,
    DateTime? dateOfBirth,
    String? bloodType,
    String? gender,
    double? weight,
    double? height,
    List<String>? allergies,
    List<String>? medicalConditions,
    EmergencyContact? emergencyContact,
    String? physicianName,
    String? physicianPhone,
  }) {
    return UserProfile(
      userId: userId,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      bloodType: bloodType ?? this.bloodType,
      gender: gender ?? this.gender,
      weight: weight ?? this.weight,
      height: height ?? this.height,
      allergies: allergies ?? this.allergies,
      medicalConditions: medicalConditions ?? this.medicalConditions,
      emergencyContact: emergencyContact ?? this.emergencyContact,
      physicianName: physicianName ?? this.physicianName,
      physicianPhone: physicianPhone ?? this.physicianPhone,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}

class EmergencyContact {
  final String name;
  final String relationship;
  final String phone;

  EmergencyContact({
    required this.name,
    required this.relationship,
    required this.phone,
  });

  factory EmergencyContact.fromMap(Map<String, dynamic> map) {
    return EmergencyContact(
      name: map['name'] ?? '',
      relationship: map['relationship'] ?? '',
      phone: map['phone'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'relationship': relationship,
      'phone': phone,
    };
  }
}
