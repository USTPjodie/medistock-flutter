import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useProfile, useUpdateProfile } from '../hooks/useDevices';
import { useFirebaseConnection } from '../hooks/useFirebaseConnection';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { colors, spacing, fontSize, radius } from '../theme/colors';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { status, error, checkConnection } = useFirebaseConnection();
  
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Settings</Text>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent style={styles.profileContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0) ?? user?.email?.charAt(0) ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {profile?.phone && (
              <Text style={styles.profilePhone}>{profile.phone}</Text>
            )}
          </View>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent style={styles.settingsContent}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive alerts and reminders</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.light.muted, true: colors.light.primary }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⏰</Text>
              <View>
                <Text style={styles.settingTitle}>Dose Reminders</Text>
                <Text style={styles.settingDescription}>Get reminded before each dose</Text>
              </View>
            </View>
            <Switch
              value={reminders}
              onValueChange={setReminders}
              trackColor={{ false: colors.light.muted, true: colors.light.primary }}
              thumbColor="#fff"
            />
          </View>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent style={styles.settingsContent}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Use dark theme</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.light.muted, true: colors.light.primary }}
              thumbColor="#fff"
            />
          </View>
        </CardContent>
      </Card>

      {/* Firebase Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Firebase Connection</CardTitle>
        </CardHeader>
        <CardContent style={styles.connectionContent}>
          <View style={styles.connectionItem}>
            <View style={styles.connectionLeft}>
              <Ionicons 
                name={
                  status === 'connected' ? 'checkmark-circle' : 
                  status === 'checking' ? 'sync' : 
                  status === 'error' ? 'alert-circle' : 'help-circle'
                } 
                size={24} 
                color={
                  status === 'connected' ? '#22C55E' : 
                  status === 'checking' ? '#F59E0B' : 
                  '#EF4444'
                } 
              />
              <View>
                <Text style={styles.connectionTitle}>
                  {status === 'connected' ? 'Connected' : 
                   status === 'checking' ? 'Checking...' : 
                   status === 'error' ? 'Connection Error' : 'Not Configured'}
                </Text>
                <Text style={styles.connectionDescription}>
                  Project: medistock-51865
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={checkConnection}
              disabled={status === 'checking'}
            >
              {status === 'checking' ? (
                <ActivityIndicator size="small" color={colors.light.primary} />
              ) : (
                <Ionicons name="refresh" size={20} color={colors.light.primary} />
              )}
            </TouchableOpacity>
          </View>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent style={styles.aboutContent}>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>2026.03.10</Text>
          </View>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button variant="destructive" onPress={handleSignOut}>
        Sign Out
      </Button>
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
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.light.primaryForeground,
    fontSize: fontSize['2xl'],
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.light.foreground,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  profilePhone: {
    fontSize: fontSize.sm,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  settingsContent: {
    gap: spacing[2],
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  settingDescription: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: spacing[0.5],
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
  },
  aboutContent: {
    gap: spacing[2],
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  aboutLabel: {
    fontSize: fontSize.sm,
    color: colors.light.mutedForeground,
  },
  aboutValue: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  connectionContent: {
    gap: spacing[2],
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  connectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.light.foreground,
  },
  connectionDescription: {
    fontSize: fontSize.xs,
    color: colors.light.mutedForeground,
    marginTop: 2,
  },
  refreshButton: {
    padding: spacing[2],
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: spacing[3],
    borderRadius: radius.md,
    marginTop: spacing[2],
  },
  errorText: {
    fontSize: fontSize.xs,
    color: '#DC2626',
  },
});
