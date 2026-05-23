import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { MedicationSchedule } from '../types';

interface MedicationAlarmPopupProps {
  medication: MedicationSchedule | null;
  visible: boolean;
  onClose: () => void;
  onTake: () => void;
  onSnooze: (minutes: number) => void;
}

// Coach messages for motivation
const coachMessages = [
  "Your medication is waiting. Take it now to stay on track!",
  "Small steps lead to big health improvements. Take your medication!",
  "Your future self will thank you for taking your medication on time.",
  "A healthy habit starts with one pill. You've got this!",
  "Taking your medication on time helps you stay at your best!",
];

export function MedicationAlarmPopup({
  medication,
  visible,
  onClose,
  onTake,
  onSnooze,
}: MedicationAlarmPopupProps) {
  const { colors } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0 });
  const [coachMessage] = useState(() => coachMessages[Math.floor(Math.random() * coachMessages.length)]);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && medication) {
      // Vibrate when popup shows
      Vibration.vibrate([0, 500, 200, 500]);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Start countdown
      const updateRemaining = () => {
        if (!medication) return;
        const now = new Date();
        const [hours, minutes] = medication.dose_time.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        const diff = scheduledTime.getTime() - now.getTime();
        if (diff > 0) {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeRemaining({ minutes: mins, seconds: secs });
        } else {
          setTimeRemaining({ minutes: 0, seconds: 0 });
        }
      };

      updateRemaining();
      intervalRef.current = setInterval(updateRemaining, 1000);
    } else {
      // Reset animation
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visible, medication]);

  const handleTake = () => {
    onTake();
    onClose();
  };

  const handleSnooze = () => {
    onSnooze(10); // Snooze for 10 minutes
    onClose();
  };

  if (!medication) return null;

  const isUrgent = timeRemaining.minutes < 5;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderColor: isUrgent ? '#FF3B30' : colors.primary,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Header with Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="medical" size={48} color={isUrgent ? '#FF3B30' : colors.primary} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Medication Reminder
          </Text>

          {/* Medication Name */}
          <Text style={[styles.medicationName, { color: colors.text }]}>
            {medication.medication_name}
          </Text>
          <Text style={[styles.dosage, { color: colors.textSecondary }]}>
            {medication.dosage}
          </Text>

          {/* Scheduled Time */}
          <View style={[styles.timerContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
              Scheduled Time
            </Text>
            <Text style={[styles.timerValue, { color: isUrgent ? '#FF3B30' : colors.primary }]}>
              {medication.dose_time}
            </Text>
            <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
              {timeRemaining.minutes > 0 || timeRemaining.seconds > 0
                ? `In ${timeRemaining.minutes}m ${timeRemaining.seconds}s`
                : 'Time to take now!'}
            </Text>
          </View>

          {/* Coach Message */}
          <View style={[styles.coachContainer, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.textSecondary} />
            <Text style={[styles.coachText, { color: colors.text }]}>
              {coachMessage}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.snoozeButton, { borderColor: colors.border }]}
              onPress={handleSnooze}
            >
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Snooze 10m
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.takeButton, { backgroundColor: colors.primary }]}
              onPress={handleTake}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Take Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dismiss */}
          <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
            <Text style={[styles.dismissText, { color: colors.textSecondary }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  countdownLabel: {
    fontSize: 14,
  },
  coachContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  coachText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  snoozeButton: {
    borderWidth: 1,
  },
  takeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 14,
  },
});
