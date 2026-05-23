import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import {
  useDevices,
  useMedicationSchedule,
  useDoseEvents,
  useUpdateDoseEvent,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from '../hooks/useDevices';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { colors, spacing, fontSize, radius } from '../theme/colors';
import { format, parseISO, isToday } from 'date-fns';
import Toast from 'react-native-toast-message';
import type { MedicationSchedule } from '../types';

const statusConfig = {
  taken: { icon: '✅', color: colors.light.accent, bg: `${colors.light.accent}20`, label: 'Taken' },
  pending: { icon: '⭕', color: colors.light.warning, bg: `${colors.light.warning}20`, label: 'Pending' },
  missed: { icon: '❌', color: colors.light.destructive, bg: `${colors.light.destructive}20`, label: 'Missed' },
  skipped: { icon: '⚠️', color: colors.light.mutedForeground, bg: colors.light.muted, label: 'Skipped' },
  upcoming: { icon: '⭕', color: colors.light.primary, bg: `${colors.light.primary}20`, label: 'Upcoming' },
};

export default function ScheduleScreen() {
  const { data: devices } = useDevices();
  const deviceId = devices?.[0]?.id;
  const { data: schedules } = useMedicationSchedule(deviceId);
  const { data: doseEvents } = useDoseEvents(deviceId);
  const updateDose = useUpdateDoseEvent();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MedicationSchedule | null>(null);
  const [medName, setMedName] = useState('');
  const [doseTime, setDoseTime] = useState('08:00');
  const [dosage, setDosage] = useState('1 pill');
  const [enabled, setEnabled] = useState(true);

  const todayEvents = doseEvents?.filter((e) => isToday(parseISO(e.scheduled_time))) ?? [];

  const resetForm = () => {
    setMedName('');
    setDoseTime('08:00');
    setDosage('1 pill');
    setEnabled(true);
    setEditingSchedule(null);
  };

  const openAddModal = () => {
    console.log('Opening add modal');
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (schedule: MedicationSchedule) => {
    setEditingSchedule(schedule);
    setMedName(schedule.medication_name);
    setDoseTime(schedule.dose_time);
    setDosage(schedule.dosage);
    setEnabled(schedule.enabled);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleMarkTaken = async (id: string) => {
    await updateDose.mutateAsync({ id, status: 'taken' });
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Dose marked as taken',
    });
  };

  const handleSaveSchedule = async () => {
    console.log('Saving schedule', { deviceId, medName, doseTime, dosage, editingSchedule });
    if (!deviceId || !medName) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a medication name',
      });
      return;
    }

    if (editingSchedule) {
      // Update existing
      await updateSchedule.mutateAsync({
        id: editingSchedule.id,
        updates: {
          medication_name: medName,
          dose_time: doseTime,
          dosage,
          enabled,
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Schedule updated',
      });
    } else {
      // Create new
      await createSchedule.mutateAsync({
        device_id: deviceId,
        medication_name: medName,
        dose_time: doseTime,
        dosage,
        enabled: true,
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Schedule added',
      });
    }
    closeModal();
  };

  const handleDeleteSchedule = (schedule: MedicationSchedule) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${schedule.medication_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSchedule.mutateAsync(schedule.id);
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Schedule deleted',
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Button size="sm" onPress={openAddModal}>
            + Add
          </Button>
        </View>

        {/* Today's Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Today — {format(new Date(), 'EEEE, MMM d')}</CardTitle>
          </CardHeader>
          <CardContent style={styles.timelineContent}>
            {todayEvents.length === 0 && (
              <Text style={styles.emptyText}>No doses scheduled for today.</Text>
            )}
            {todayEvents.map((event) => {
              const config = statusConfig[event.status as keyof typeof statusConfig] ?? statusConfig.pending;
              const schedule = event.medication_schedule as any;
              return (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timelineIcon}>{config.icon}</Text>
                    <View>
                      <Text style={styles.timelineMedName}>
                        {schedule?.medication_name ?? 'Medication'}
                      </Text>
                      <Text style={styles.timelineTime}>
                        {format(parseISO(event.scheduled_time), 'HH:mm')} · {schedule?.dosage}
                      </Text>
                    </View>
                  </View>
                  {event.status === 'pending' ? (
                    <Button size="sm" variant="outline" onPress={() => handleMarkTaken(event.id)}>
                      Mark Taken
                    </Button>
                  ) : (
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: config.bg }}
                      textStyle={{ color: config.color }}
                    >
                      {config.label}
                    </Badge>
                  )}
                </View>
              );
            })}
          </CardContent>
        </Card>

        {/* All Schedules */}
        <Card>
          <CardHeader>
            <CardTitle>All Schedules</CardTitle>
          </CardHeader>
          <CardContent style={styles.scheduleContent}>
            {schedules?.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.scheduleItem}
                onPress={() => openEditModal(s)}
                onLongPress={() => handleDeleteSchedule(s)}
              >
                <View style={styles.scheduleLeft}>
                  <View style={[styles.scheduleIcon, { backgroundColor: s.enabled ? colors.light.teal : colors.light.muted }]}>
                    <Text style={{ fontSize: 16 }}>💊</Text>
                  </View>
                  <View>
                    <Text style={styles.scheduleMedName}>{s.medication_name}</Text>
                    <Text style={styles.scheduleDetails}>
                      {s.dosage} · {s.dose_time.slice(0, 5)}
                    </Text>
                  </View>
                </View>
                <View style={styles.scheduleActions}>
                  <Badge variant={s.enabled ? 'default' : 'secondary'}>
                    {s.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSchedule(s)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            {(!schedules || schedules.length === 0) && (
              <Text style={styles.emptyText}>No schedules yet. Tap + to add one.</Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>

      {/* Add/Edit Schedule Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSchedule ? 'Edit Schedule' : 'Add Medication Schedule'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Medication Name</Text>
              <TextInput
                style={styles.input}
                value={medName}
                onChangeText={setMedName}
                placeholder="e.g. Aspirin"
                placeholderTextColor={colors.light.mutedForeground}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Time (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={doseTime}
                onChangeText={setDoseTime}
                placeholder="08:00"
                placeholderTextColor={colors.light.mutedForeground}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="1 pill"
                placeholderTextColor={colors.light.mutedForeground}
              />
            </View>

            {editingSchedule && (
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Enabled</Text>
                <Switch
                  value={enabled}
                  onValueChange={setEnabled}
                  trackColor={{ false: colors.light.border, true: colors.light.teal }}
                  thumbColor={enabled ? colors.light.card : colors.light.mutedForeground}
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button
                variant="outline"
                onPress={closeModal}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSaveSchedule}
                loading={createSchedule.isPending || updateSchedule.isPending}
                style={{ flex: 1 }}
              >
                {editingSchedule ? 'Update' : 'Save'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
    paddingBottom: spacing[16],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.light.foreground,
  },
  timelineContent: {
    gap: spacing[2],
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  timelineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  timelineIcon: {
    fontSize: 20,
  },
  timelineMedName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  timelineTime: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  scheduleContent: {
    gap: spacing[2],
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.card,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleMedName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  scheduleDetails: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  scheduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  deleteButton: {
    padding: spacing[2],
    borderRadius: radius.md,
  },
  deleteIcon: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.light.mutedForeground,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    backgroundColor: colors.light.card,
    borderRadius: radius.lg,
    padding: spacing[6],
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.light.foreground,
    marginBottom: spacing[4],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
    marginBottom: spacing[1.5],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light.input,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    fontSize: fontSize.base,
    color: colors.light.foreground,
    backgroundColor: colors.light.background,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingVertical: spacing[2],
  },
});
