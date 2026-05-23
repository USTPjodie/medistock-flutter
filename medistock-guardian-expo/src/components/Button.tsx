import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme/colors';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'destructive' ? colors.light.primaryForeground : colors.light.primary}
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  // Variants
  default: {
    backgroundColor: colors.light.primary,
  },
  secondary: {
    backgroundColor: colors.light.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.light.destructive,
  },
  // Sizes
  defaultSize: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    height: 40,
  },
  sm: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    height: 32,
  },
  lg: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    height: 44,
  },
  // Text styles
  text: {
    fontWeight: '500',
  },
  defaultText: {
    color: colors.light.primaryForeground,
    fontSize: fontSize.sm,
  },
  secondaryText: {
    color: colors.light.secondaryForeground,
    fontSize: fontSize.sm,
  },
  outlineText: {
    color: colors.light.foreground,
    fontSize: fontSize.sm,
  },
  ghostText: {
    color: colors.light.foreground,
    fontSize: fontSize.sm,
  },
  destructiveText: {
    color: colors.light.destructiveForeground,
    fontSize: fontSize.sm,
  },
  smText: {
    fontSize: fontSize.xs,
  },
  lgText: {
    fontSize: fontSize.base,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
