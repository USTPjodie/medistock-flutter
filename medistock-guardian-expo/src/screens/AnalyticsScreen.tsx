import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDevices, useDoseEvents } from '../hooks/useDevices';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { colors, spacing, fontSize, radius } from '../theme/colors';
import { format, parseISO, subDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export default function AnalyticsScreen() {
  const { data: devices } = useDevices();
  const deviceId = devices?.[0]?.id;
  const { data: doseEvents } = useDoseEvents(deviceId);

  // Calculate adherence rate
  const totalEvents = doseEvents?.length ?? 0;
  const takenEvents = doseEvents?.filter((e) => e.status === 'taken').length ?? 0;
  const adherenceRate = totalEvents > 0 ? Math.round((takenEvents / totalEvents) * 100) : 0;

  // Weekly data
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyData = weekDays.map((day) => {
    const dayEvents = doseEvents?.filter((e) => isSameDay(parseISO(e.scheduled_time), day)) ?? [];
    const taken = dayEvents.filter((e) => e.status === 'taken').length;
    const total = dayEvents.length;
    return {
      day: format(day, 'EEE'),
      taken,
      total,
      rate: total > 0 ? Math.round((taken / total) * 100) : 0,
    };
  });

  // Recent history
  const recentEvents = doseEvents?.slice(0, 10) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Analytics</Text>

      {/* Adherence Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Adherence</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.adherenceContainer}>
            <View style={styles.adherenceCircle}>
              <Text style={styles.adherencePercent}>{adherenceRate}%</Text>
              <Text style={styles.adherenceLabel}>Adherence</Text>
            </View>
            <View style={styles.adherenceStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{takenEvents}</Text>
                <Text style={styles.statLabel}>Taken</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalEvents - takenEvents}</Text>
                <Text style={styles.statLabel}>Missed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalEvents}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.weeklyContainer}>
            {weeklyData.map((data, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: data.total > 0 ? (data.taken / data.total) * 60 : 4,
                        backgroundColor:
                          data.rate >= 80
                            ? colors.light.accent
                            : data.rate >= 50
                            ? colors.light.warning
                            : colors.light.destructive,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{data.day}</Text>
                <Text style={styles.dayValue}>{data.taken}/{data.total}</Text>
              </View>
            ))}
          </View>
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent style={styles.historyContent}>
          {recentEvents.map((event) => {
            const schedule = event.medication_schedule as any;
            return (
              <View key={event.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyIcon}>
                    {event.status === 'taken' ? '✅' : event.status === 'missed' ? '❌' : '⭕'}
                  </Text>
                  <View>
                    <Text style={styles.historyMedName}>
                      {schedule?.medication_name ?? 'Medication'}
                    </Text>
                    <Text style={styles.historyDate}>
                      {format(parseISO(event.scheduled_time), 'MMM d, HH:mm')}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.historyStatus,
                    {
                      color:
                        event.status === 'taken'
                          ? colors.light.accent
                          : event.status === 'missed'
                          ? colors.light.destructive
                          : colors.light.warning,
                    },
                  ]}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Text>
              </View>
            );
          })}
          {recentEvents.length === 0 && (
            <Text style={styles.emptyText}>No medication history yet.</Text>
          )}
        </CardContent>
      </Card>
    </ScrollView>
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
    paddingBottom: spacing[20],
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.light.foreground,
    marginBottom: spacing[2],
  },
  adherenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
  },
  adherenceCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.light.primary,
  },
  adherencePercent: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.light.primary,
  },
  adherenceLabel: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
  },
  adherenceStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.light.foreground,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 60,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[1],
  },
  dayValue: {
    fontSize: fontSize.xs,
    color: colors.light.foreground,
    fontWeight: '500',
  },
  historyContent: {
    gap: spacing[2],
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  historyIcon: {
    fontSize: 20,
  },
  historyMedName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  historyDate: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  historyStatus: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.light.mutedForeground,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
});
