import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDevices, useFamilyMembers } from '../hooks/useDevices';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { colors, spacing, fontSize, radius } from '../theme/colors';

export default function FamilyScreen() {
  const { data: devices } = useDevices();
  const deviceId = devices?.[0]?.id;
  const { data: familyMembers } = useFamilyMembers(deviceId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Members</Text>
        <Button size="sm">+ Invite</Button>
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Connected Members</CardTitle>
        </CardHeader>
        <CardContent style={styles.membersContent}>
          {familyMembers?.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <View style={styles.memberLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.profiles?.full_name?.charAt(0) ?? '?'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.memberName}>
                    {member.profiles?.full_name ?? 'Unknown'}
                  </Text>
                  <Text style={styles.memberRole}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Text>
                  {member.profiles?.phone && (
                    <Text style={styles.memberPhone}>{member.profiles.phone}</Text>
                  )}
                </View>
              </View>
              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                {member.role}
              </Badge>
            </View>
          ))}
          {(!familyMembers || familyMembers.length === 0) && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No family members</Text>
              <Text style={styles.emptySubtitle}>
                Invite family members to help manage medications.
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent style={styles.deviceContent}>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceLabel}>Device Name</Text>
            <Text style={styles.deviceValue}>{devices?.[0]?.name ?? 'Not connected'}</Text>
          </View>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceLabel}>Device ID</Text>
            <Text style={styles.deviceValue}>
              {devices?.[0]?.id ? `${devices[0].id.slice(0, 8)}...` : 'N/A'}
            </Text>
          </View>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
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
  membersContent: {
    gap: spacing[2],
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.light.primaryForeground,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  memberName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  memberRole: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
    textTransform: 'capitalize',
  },
  memberPhone: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.light.foreground,
    marginBottom: spacing[1],
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.light.mutedForeground,
    textAlign: 'center',
  },
  deviceContent: {
    gap: spacing[3],
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceLabel: {
    fontSize: fontSize.sm,
    color: colors.light.mutedForeground,
  },
  deviceValue: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.accent,
  },
  statusText: {
    fontSize: fontSize.sm,
    color: colors.light.accent,
    fontWeight: '500',
  },
});
