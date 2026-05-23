import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePillTimer } from '../context/PillTimerContext';
import { Ionicons } from '@expo/vector-icons';
import PillTimerCard from '../components/PillTimer';

export default function MedsScreen() {
  const { colors } = useTheme();
  const { activeTimers, stats, startTimer } = usePillTimer();
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any>(null);

  const medications = [
    { id: '1', name: 'Aspirin', dosage: '100mg', time: '08:00 AM', taken: false },
    { id: '2', name: 'Vitamin D', dosage: '1000 IU', time: '12:00 PM', taken: false },
    { id: '3', name: 'Omega-3', dosage: '1000mg', time: '06:00 PM', taken: false },
  ];

  const handleStartTimer = (med: any) => {
    startTimer({
      id: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledTime: new Date(),
      timeWindowMinutes: 15,
    });
    setSelectedMed(med);
    setShowTimerModal(true);
  };

  // Find active timer for selected medication
  const activeTimer = activeTimers.find(t => t.id === selectedMed?.id && t.status !== 'taken' && t.status !== 'missed');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Medications</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {stats.adherenceRate}% adherence rate
          </Text>
        </View>
        <TouchableOpacity style={styles.statsButton}>
          <Ionicons name="trophy" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Active Timers Section */}
        {activeTimers.filter(t => t.status !== 'taken' && t.status !== 'missed').length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ⏰ Active Timers
            </Text>
            {activeTimers
              .filter(t => t.status !== 'taken' && t.status !== 'missed')
              .map(timer => (
                <PillTimerCard 
                  key={timer.id} 
                  timer={timer}
                  onClose={() => setShowTimerModal(false)}
                />
              ))}
          </View>
        )}

        {/* Medications List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💊 Today's Medications
          </Text>
          {medications.map((med) => {
            const hasActiveTimer = activeTimers.some(t => t.id === med.id && t.status !== 'taken' && t.status !== 'missed');
            
            return (
              <TouchableOpacity
                key={med.id}
                style={[styles.medCard, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: hasActiveTimer ? 0.6 : 1,
                }]}
                onPress={() => !hasActiveTimer && handleStartTimer(med)}
                activeOpacity={0.8}
              >
                <View style={styles.medInfo}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="medical" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.medDetails}>
                    <Text style={[styles.medName, { color: colors.text }]}>{med.name}</Text>
                    <Text style={[styles.medDosage, { color: colors.textSecondary }]}>
                      {med.dosage}
                    </Text>
                  </View>
                </View>
                <View style={styles.medRight}>
                  <Text style={[styles.medTime, { color: colors.textSecondary }]}>
                    {med.time}
                  </Text>
                  {hasActiveTimer ? (
                    <View style={[styles.timerBadge, { backgroundColor: '#F59E0B' }]}>
                      <Text style={styles.timerBadgeText}>TIMER</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.startButton, { backgroundColor: colors.primary }]}
                    >
                      <Ionicons name="play" size={16} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Coach Tip Card */}
        <View style={[styles.tipCard, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="bulb" size={24} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.text }]}>
            Tap any medication to start your Pill Timer. The time-box helps you take action instead of delaying!
          </Text>
        </View>
      </ScrollView>

      {/* Timer Modal */}
      <Modal
        visible={showTimerModal && !!activeTimer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Pill Timer Active
              </Text>
              <TouchableOpacity onPress={() => setShowTimerModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {activeTimer && (
              <PillTimerCard 
                timer={activeTimer} 
                onClose={() => setShowTimerModal(false)}
              />
            )}
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  medInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
  },
  medDosage: {
    fontSize: 14,
    marginTop: 2,
  },
  medRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  medTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  timerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  startButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
