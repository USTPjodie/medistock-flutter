import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePillTimer, MedicationTimer } from '../context/PillTimerContext';
import { Ionicons } from '@expo/vector-icons';

interface PillTimerProps {
  timer: MedicationTimer;
  onClose?: () => void;
}

export default function PillTimerCard({ timer, onClose }: PillTimerProps) {
  const { colors } = useTheme();
  const { takeMedication, snoozeTimer, dismissTimer, getTimeRemaining, getCoachMessage, isInTimeWindow } = usePillTimer();
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(timer));
  const [coachMessage, setCoachMessage] = useState(getCoachMessage());
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  
  // Pulse animation for urgency
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Update timer every second
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(timer);
      setTimeLeft(remaining);
      
      // Update coach message based on urgency
      if (remaining.percentage < 30 && remaining.percentage > 25) {
        setCoachMessage(getCoachMessage());
      }
      
      // Pulse animation when time is running low
      if (remaining.percentage < 20) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, getTimeRemaining, getCoachMessage, pulseAnim]);

  const handleTake = () => {
    Vibration.vibrate(200);
    takeMedication(timer.id);
    onClose?.();
  };

  const handleSnooze = (minutes: number) => {
    Vibration.vibrate(100);
    snoozeTimer(timer.id, minutes);
    setShowSnoozeOptions(false);
  };

  const handleDismiss = () => {
    dismissTimer(timer.id);
    onClose?.();
  };

  // Determine urgency color
  const getUrgencyColor = () => {
    if (timeLeft.percentage > 50) return colors.primary;
    if (timeLeft.percentage > 20) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const urgencyColor = getUrgencyColor();
  const isUrgent = timeLeft.percentage < 20;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: urgencyColor,
          transform: [{ scale: pulseAnim }],
        },
        isUrgent && styles.urgentContainer,
      ]}
    >
      {/* Header with medication info */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: urgencyColor + '20' }]}>
          <Ionicons name="medical" size={28} color={urgencyColor} />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={[styles.medicationName, { color: colors.text }]}>
            {timer.medicationName}
          </Text>
          <Text style={[styles.dosage, { color: colors.textSecondary }]}>
            {timer.dosage}
          </Text>
        </View>
        {timer.snoozeCount > 0 && (
          <View style={[styles.snoozeBadge, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.snoozeText}>⏰ {timer.snoozeCount}</Text>
          </View>
        )}
      </View>

      {/* Time Box Progress */}
      <View style={styles.timerSection}>
        <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
          Time Window
        </Text>
        <View style={styles.timerDisplay}>
          <Text style={[styles.timerValue, { color: urgencyColor }]}>
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </Text>
          <Text style={[styles.timerUnit, { color: colors.textSecondary }]}>
            remaining
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: urgencyColor,
                width: `${timeLeft.percentage}%`,
              }
            ]} 
          />
        </View>
      </View>

      {/* Coach Message */}
      <View style={[styles.coachSection, { backgroundColor: urgencyColor + '10' }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={urgencyColor} />
        <Text style={[styles.coachText, { color: colors.text }]}>
          {coachMessage}
        </Text>
      </View>

      {/* Action Buttons */}
      {!showSnoozeOptions ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.takeButton, { backgroundColor: colors.primary }]}
            onPress={handleTake}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.takeButtonText}>Take Medication</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.snoozeButton, { borderColor: colors.border }]}
              onPress={() => setShowSnoozeOptions(true)}
              disabled={timer.snoozeCount >= timer.maxSnoozes}
            >
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.snoozeButtonText, { color: colors.textSecondary }]}>
                Snooze {timer.snoozeCount}/{timer.maxSnoozes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dismissButton, { borderColor: '#EF4444' }]}
              onPress={handleDismiss}
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.snoozeOptions}>
          <Text style={[styles.snoozeTitle, { color: colors.text }]}>
            Postpone for:
          </Text>
          <View style={styles.snoozeButtons}>
            {[5, 10, 15].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[styles.snoozeOptionButton, { backgroundColor: colors.primary }]}
                onPress={() => handleSnooze(minutes)}
                activeOpacity={0.8}
              >
                <Text style={styles.snoozeOptionText}>{minutes} min</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.cancelSnoozeButton}
            onPress={() => setShowSnoozeOptions(false)}
          >
            <Text style={[styles.cancelSnoozeText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  urgentContainer: {
    borderWidth: 3,
    shadowOpacity: 0.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: '700',
  },
  dosage: {
    fontSize: 14,
    marginTop: 2,
  },
  snoozeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  snoozeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  timerSection: {
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerUnit: {
    fontSize: 16,
    marginLeft: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  coachSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  coachText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actions: {
    gap: 12,
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  takeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  snoozeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  snoozeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  snoozeOptions: {
    alignItems: 'center',
    gap: 12,
  },
  snoozeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  snoozeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  snoozeOptionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  snoozeOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelSnoozeButton: {
    paddingVertical: 8,
  },
  cancelSnoozeText: {
    fontSize: 14,
  },
});
