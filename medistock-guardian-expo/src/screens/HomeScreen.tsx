import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import {
  useDevices,
  useMedicationSchedule,
  useDoseEvents,
  useCreateDevice,
} from '../hooks/useDevices';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { MedicationAlarmPopup } from '../components/MedicationAlarmPopup';
import { RadialGauge } from '../components/RadialGauge';
import type { MedicationSchedule } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: devices, isLoading: devicesLoading } = useDevices();
  const createDevice = useCreateDevice();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();

  // Alarm popup state - shows 5 minutes before scheduled time
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  const [alarmMedication, setAlarmMedication] = useState<MedicationSchedule | null>(null);
  const [dismissedAlarms, setDismissedAlarms] = useState<Set<string>>(new Set());

  const activeDevice = devices?.find((d) => d.id === selectedDeviceId) ?? devices?.[0];
  const deviceId = activeDevice?.id;

  useEffect(() => {
    if (devices?.length && !selectedDeviceId) setSelectedDeviceId(devices[0].id);
  }, [devices, selectedDeviceId]);

  const { data: schedules } = useMedicationSchedule(deviceId);
  const { data: doseEvents } = useDoseEvents(deviceId);

  // Calculate adherence rate
  const adherenceRate = useMemo(() => {
    // Hardcoded to 95% for demo/testing
    return 95;
  }, [doseEvents]);

  // Get adherence message
  const adherenceMessage = useMemo(() => {
    if (adherenceRate >= 90) return 'Excellent! Keep it up!';
    if (adherenceRate >= 70) return 'Good progress!';
    if (adherenceRate >= 50) return 'Room for improvement';
    return 'Let\'s do better!';
  }, [adherenceRate]);

  // Get upcoming schedules
  const upcomingSchedules = schedules
    ?.filter(s => s.enabled)
    ?.sort((a, b) => a.dose_time.localeCompare(b.dose_time))
    ?.slice(0, 4) ?? [];

  // Check for medications due within 5 minutes and show reminder
  useEffect(() => {
    if (!schedules || showAlarmPopup) return;

    const checkUpcomingMedications = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      for (const schedule of schedules) {
        if (!schedule.enabled) continue;
        if (dismissedAlarms.has(schedule.id)) continue;

        const [hours, minutes] = schedule.dose_time.split(':').map(Number);
        const scheduledMinutes = hours * 60 + minutes;
        const diff = scheduledMinutes - currentTime;

        // Show reminder 5 minutes before scheduled time
        if (diff >= 0 && diff <= 5) {
          setAlarmMedication(schedule);
          setShowAlarmPopup(true);
          break;
        }
      }
    };

    checkUpcomingMedications();
    const interval = setInterval(checkUpcomingMedications, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [schedules, dismissedAlarms, showAlarmPopup]);

  const handleTakeMedication = () => {
    if (alarmMedication) {
      // Mark as taken - you could add logic here to update dose events
      console.log('Taken:', alarmMedication.medication_name);
      setDismissedAlarms(prev => new Set(prev).add(alarmMedication.id));
    }
  };

  const handleSnoozeMedication = (minutes: number) => {
    if (alarmMedication) {
      console.log('Snoozed:', alarmMedication.medication_name, 'for', minutes, 'minutes');
      // After snooze, the alarm will show again after the snooze period
      setTimeout(() => {
        setDismissedAlarms(prev => {
          const newSet = new Set(prev);
          newSet.delete(alarmMedication.id);
          return newSet;
        });
      }, minutes * 60 * 1000);
      setDismissedAlarms(prev => new Set(prev).add(alarmMedication.id));
    }
  };

  const handleCloseAlarm = () => {
    if (alarmMedication) {
      setDismissedAlarms(prev => new Set(prev).add(alarmMedication.id));
    }
    setShowAlarmPopup(false);
    setAlarmMedication(null);
  };

  if (devicesLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!devices?.length) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="medical" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Welcome to MediStock</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Set up your first smart dispenser to get started.
        </Text>
        <Button
          onPress={() => createDevice.mutate('My Dispenser')}
          loading={createDevice.isPending}
        >
          + Add Dispenser
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hi {user?.user_metadata?.full_name || 'User'}👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Have a nice day!
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          {/* Notification Badge */}
          <View style={[styles.notificationBadge, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Adherence Rate Card */}
        <View style={[styles.adherenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <RadialGauge percentage={adherenceRate} size={160} strokeWidth={12} />
          <Text style={[styles.adherenceTitle, { color: colors.text }]}>
            {adherenceMessage}
          </Text>
          <Text style={[styles.adherenceText, { color: colors.textSecondary }]}>
            You're taking your medications consistently
          </Text>
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your schedule</Text>

        {/* Medication Cards */}
        <View style={styles.cardsContainer}>
          {upcomingSchedules.map((schedule) => {
            const [hours, minutes] = schedule.dose_time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            
            return (
              <View key={schedule.id} style={[styles.medicationCard, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              }]}>
                <View style={styles.cardLeft}>
                  <View style={[styles.pillIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="medical" size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.medicationName, { color: colors.text }]}>
                      {schedule.medication_name}
                    </Text>
                    <Text style={[styles.dosageText, { color: colors.textSecondary }]}>
                      {schedule.dosage}
                    </Text>
                  </View>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: colors.primary }]}>
                    {displayHour}:{minutes}
                  </Text>
                  <Text style={[styles.ampmText, { color: colors.textSecondary }]}>
                    {ampm}
                  </Text>
                </View>
                <TouchableOpacity style={styles.checkButton}>
                  <View style={[styles.checkCircle, { borderColor: colors.primary }]} />
                </TouchableOpacity>
              </View>
            );
          })}
          
          {upcomingSchedules.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No medications scheduled
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Medication Alarm Popup */}
      <MedicationAlarmPopup
        medication={alarmMedication}
        visible={showAlarmPopup}
        onClose={handleCloseAlarm}
        onTake={handleTakeMedication}
        onSnooze={handleSnoozeMedication}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  adherenceCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  adherenceTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  adherenceText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dosageText: {
    fontSize: 14,
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  ampmText: {
    fontSize: 12,
  },
  checkButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
