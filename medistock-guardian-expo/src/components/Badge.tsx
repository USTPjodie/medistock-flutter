import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, fontSize } from '../theme/colors';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  // Variants
  default: {
    backgroundColor: colors.light.primary,
  },
  defaultText: {
    color: colors.light.primaryForeground,
  },
  secondary: {
    backgroundColor: colors.light.secondary,
  },
  secondaryText: {
    color: colors.light.secondaryForeground,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  outlineText: {
    color: colors.light.foreground,
  },
  destructive: {
    backgroundColor: colors.light.destructive,
  },
  destructiveText: {
    color: colors.light.destructiveForeground,
  },
});
