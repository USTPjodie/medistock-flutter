import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePillTimer, ScheduleType, TimeSpecificSchedule, DurationBasedSchedule } from '../context/PillTimerContext';
import { Ionicons } from '@expo/vector-icons';

export default function AddMedicationScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { startTimer } = usePillTimer();
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('time-specific');
  
  // Time-Specific fields
  const [specificTime, setSpecificTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  
  // Duration-Based fields
  const [intervalHours, setIntervalHours] = useState('8');
  const [durationStartTime, setDurationStartTime] = useState('08:00');
  const [durationEndTime, setDurationEndTime] = useState('22:00');

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }

    // Create schedule config based on type
    let scheduleConfig: TimeSpecificSchedule | DurationBasedSchedule;
    
    if (scheduleType === 'time-specific') {
      if (selectedDays.length === 0) {
        Alert.alert('Error', 'Please select at least one day');
        return;
      }
      scheduleConfig = {
        type: 'time-specific',
        time: specificTime,
        daysOfWeek: selectedDays,
      };
    } else {
      const hours = parseInt(intervalHours);
      if (!hours || hours < 1 || hours > 24) {
        Alert.alert('Error', 'Please enter a valid interval (1-24 hours)');
        return;
      }
      scheduleConfig = {
        type: 'duration-based',
        intervalHours: hours,
        startTime: durationStartTime,
        endTime: durationEndTime || undefined,
      };
    }

    // Start the timer
    startTimer({
      id: Date.now().toString(),
      medicationName: medicationName.trim(),
      dosage: dosage.trim() || 'As directed',
      scheduledTime: new Date(),
      timeWindowMinutes: 15,
      scheduleType,
      scheduleConfig,
    });
    
    Alert.alert(
      'Success',
      `Medication "${medicationName}" added with ${scheduleType === 'time-specific' ? 'time-specific' : 'duration-based'} schedule!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Add Medication
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Schedule Type Selector - At Top */}
        <View style={[styles.scheduleTypeCard, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.scheduleTypeTitle, { color: colors.text }]}>
            Schedule Type
          </Text>
          <Text style={[styles.scheduleTypeSubtitle, { color: colors.textSecondary }]}>
            Choose how you want to schedule your medication
          </Text>
          <View style={styles.scheduleTypeContainer}>
              <TouchableOpacity
                style={[styles.scheduleTypeButton, { 
                  backgroundColor: scheduleType === 'time-specific' ? colors.primary : colors.background,
                  borderColor: colors.border,
                }]}
                onPress={() => setScheduleType('time-specific')}
              >
                <Ionicons 
                  name="time-outline" 
                  size={20} 
                  color={scheduleType === 'time-specific' ? '#FFFFFF' : colors.text} 
                />
                <Text style={[styles.scheduleTypeText, { 
                  color: scheduleType === 'time-specific' ? '#FFFFFF' : colors.text 
                }]}>
                  Time-Specific
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scheduleTypeButton, { 
                  backgroundColor: scheduleType === 'duration-based' ? colors.primary : colors.background,
                  borderColor: colors.border,
                }]}
                onPress={() => setScheduleType('duration-based')}
              >
                <Ionicons 
                  name="timer-outline" 
                  size={20} 
                  color={scheduleType === 'duration-based' ? '#FFFFFF' : colors.text} 
                />
                <Text style={[styles.scheduleTypeText, { 
                  color: scheduleType === 'duration-based' ? '#FFFFFF' : colors.text 
                }]}>
                  Duration-Based
                </Text>
              </TouchableOpacity>
            </View>
        </View>

        {/* Medication Details Card */}
        <View style={[styles.formCard, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          {/* Medication Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Medication Name
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              }]}
              placeholder="e.g., Aspirin"
              placeholderTextColor={colors.textSecondary}
              value={medicationName}
              onChangeText={setMedicationName}
            />
          </View>

          {/* Dosage */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Dosage
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              }]}
              placeholder="e.g., 100mg"
              placeholderTextColor={colors.textSecondary}
              value={dosage}
              onChangeText={setDosage}
            />
          </View>

          {/* Time-Specific Fields */}
          {scheduleType === 'time-specific' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Time (HH:MM)
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  }]}
                  placeholder="08:00"
                  placeholderTextColor={colors.textSecondary}
                  value={specificTime}
                  onChangeText={setSpecificTime}
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Days of Week
                </Text>
                <View style={styles.daysContainer}>
                  {daysOfWeek.map((day, index) => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayButton, { 
                        backgroundColor: selectedDays.includes(index) ? colors.primary : colors.background,
                        borderColor: colors.border,
                      }]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[styles.dayText, { 
                        color: selectedDays.includes(index) ? '#FFFFFF' : colors.text 
                      }]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Duration-Based Fields */}
          {scheduleType === 'duration-based' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Every X Hours
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  }]}
                  placeholder="8"
                  placeholderTextColor={colors.textSecondary}
                  value={intervalHours}
                  onChangeText={setIntervalHours}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Active Hours (Start - End)
                </Text>
                <View style={styles.timeRangeContainer}>
                  <TextInput
                    style={[styles.timeInput, { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    }]}
                    placeholder="08:00"
                    placeholderTextColor={colors.textSecondary}
                    value={durationStartTime}
                    onChangeText={setDurationStartTime}
                    keyboardType="numbers-and-punctuation"
                  />
                  <Text style={[styles.timeSeparator, { color: colors.textSecondary }]}>to</Text>
                  <TextInput
                    style={[styles.timeInput, { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    }]}
                    placeholder="22:00"
                    placeholderTextColor={colors.textSecondary}
                    value={durationEndTime}
                    onChangeText={setDurationEndTime}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Medication</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  scheduleTypeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  scheduleTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  scheduleTypeSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  scheduleTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  scheduleTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
