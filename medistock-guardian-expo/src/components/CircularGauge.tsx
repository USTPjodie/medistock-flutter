import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CircularGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  showHeart?: boolean;
}

export default function CircularGauge({
  percentage,
  size = 160,
  strokeWidth = 14,
  label,
  sublabel,
  color = colors.light.coral,
  showHeart = false,
}: CircularGaugeProps) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Calculate arc parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Number of segments for smooth arc (more = smoother)
  const segmentCount = 100;
  const activeSegments = Math.round((clampedPercentage / 100) * segmentCount);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background track */}
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.light.softBlue,
          },
        ]}
      />
      
      {/* Progress arc - built from segments */}
      {Array.from({ length: segmentCount }).map((_, index) => {
        // Start from top (-90 degrees) and go clockwise
        const angle = (index / segmentCount) * 360 - 90;
        const isActive = index < activeSegments;
        
        // Skip rendering inactive segments (transparent)
        if (!isActive) return null;
        
        // Calculate position on the circle
        const radian = (angle * Math.PI) / 180;
        const x = size / 2 + radius * Math.cos(radian) - strokeWidth / 2;
        const y = size / 2 + radius * Math.sin(radian) - strokeWidth / 2;
        
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: strokeWidth,
              height: strokeWidth,
              borderRadius: strokeWidth / 2,
              backgroundColor: color,
            }}
          />
        );
      })}

      {/* Inner circle to create donut effect */}
      <View
        style={[
          styles.innerCircle,
          {
            width: size - strokeWidth * 2 - 2,
            height: size - strokeWidth * 2 - 2,
            borderRadius: (size - strokeWidth * 2 - 2) / 2,
          },
        ]}
      />

      {/* Center content */}
      <View style={styles.content}>
        {showHeart ? (
          <View style={[styles.heartContainer, { backgroundColor: color }]}>
            <Text style={styles.heartIcon}>♥</Text>
          </View>
        ) : null}
        <Text style={[styles.percentage, { color, fontSize: size * 0.22 }]}>
          {clampedPercentage}%
        </Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  innerCircle: {
    position: 'absolute',
    backgroundColor: colors.light.card,
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heartIcon: {
    color: colors.light.cardForeground,
    fontSize: 16,
  },
  percentage: {
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    color: colors.light.mutedForeground,
    marginTop: 2,
  },
  sublabel: {
    fontSize: 10,
    color: colors.light.mutedForeground,
  },
});
