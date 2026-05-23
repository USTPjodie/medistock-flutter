import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface PillRingProps {
  current: number;
  capacity: number;
  label: string;
  medicationName?: string | null;
  size?: 'sm' | 'md';
}

export default function PillRing({
  current,
  capacity,
  label,
  medicationName,
  size = 'md',
}: PillRingProps) {
  const percentage = capacity > 0 ? (current / capacity) * 100 : 0;
  const isLow = percentage < 20;
  const isMedium = percentage >= 20 && percentage < 50;

  const ringColor = isLow
    ? colors.light.destructive
    : isMedium
    ? colors.light.warning
    : colors.light.accent;

  const dimension = size === 'sm' ? 80 : 112;
  const fontSize = size === 'sm' ? 14 : 18;
  const smallFontSize = size === 'sm' ? 10 : 12;

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: dimension, height: dimension }]}>
        {/* Background ring */}
        <View style={[styles.ringBackground, { width: dimension, height: dimension, borderRadius: dimension / 2 }]} />
        {/* Progress arc (simplified as a partial border) */}
        <View style={[
          styles.progressRing, 
          { 
            width: dimension, 
            height: dimension, 
            borderRadius: dimension / 2,
            borderColor: ringColor,
          }
        ]} />
        <View style={styles.textContainer}>
          <Text style={[styles.currentText, { fontSize }]}>{current}</Text>
          <Text style={[styles.capacityText, { fontSize: smallFontSize }]}>/{capacity}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      {medicationName && (
        <Text style={styles.medicationName} numberOfLines={1}>
          {medicationName}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringBackground: {
    position: 'absolute',
    borderWidth: 8,
    borderColor: colors.light.muted,
  },
  progressRing: {
    position: 'absolute',
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentText: {
    fontWeight: 'bold',
    color: colors.light.foreground,
  },
  capacityText: {
    color: colors.light.mutedForeground,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.light.mutedForeground,
  },
  medicationName: {
    fontSize: 11,
    color: colors.light.foreground,
    maxWidth: 80,
    textAlign: 'center',
  },
});
