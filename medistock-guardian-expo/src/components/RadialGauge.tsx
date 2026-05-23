import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface RadialGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  trackSizeDegrees?: number;
  showLabel?: boolean;
}

export function RadialGauge({
  percentage,
  size = 120,
  strokeWidth = 10,
  trackSizeDegrees = 270,
  showLabel = true,
}: RadialGaugeProps) {
  const { colors } = useTheme();

  // Calculate dimensions
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const viewBox = `0 0 ${size} ${size}`;
  const center = size / 2;

  // Track calculations
  const trackFillPercentage = trackSizeDegrees / 360;
  const trackDashoffset = circumference * (1 - trackFillPercentage);

  // Value calculations
  const valuePercentage = (percentage / 100) * trackFillPercentage;
  const valueDashoffset = circumference * (1 - valuePercentage);

  // Rotation to center the gap at bottom
  const rotation = -(trackSizeDegrees / 2) - 90;

  // Color based on percentage
  const getColor = (pct: number) => {
    if (pct >= 90) return '#22C55E'; // Green - Excellent
    if (pct >= 70) return '#6366F1'; // Indigo - Good
    if (pct >= 50) return '#F59E0B'; // Yellow - Fair
    return '#EF4444'; // Red - Needs improvement
  };

  const progressColor = getColor(percentage);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={viewBox}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={progressColor} />
            <Stop offset="100%" stopColor={progressColor} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        
        {/* Background Track */}
        <Circle
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeDasharray={circumference}
          strokeDashoffset={trackDashoffset}
          strokeWidth={strokeWidth}
          transform={`rotate(${rotation}, ${center}, ${center})`}
        />
        
        {/* Progress Track */}
        <Circle
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeDasharray={circumference}
          strokeDashoffset={valueDashoffset}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform={`rotate(${rotation}, ${center}, ${center})`}
        />
      </Svg>
      
      {/* Center Content */}
      {showLabel && (
        <View style={styles.centerContent}>
          <Text style={[styles.percentageText, { color: progressColor }]}>
            {percentage}%
          </Text>
          <Text style={[styles.labelText, { color: colors.textSecondary }]}>
            Adherence
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '700',
  },
  labelText: {
    fontSize: 10,
    marginTop: 2,
  },
});
