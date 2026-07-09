import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'success' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export function OutlineButton({
  title,
  onPress,
  variant = 'default',
  disabled = false,
  style,
}: OutlineButtonProps) {
  const variantStyle = {
    default: styles.default,
    success: styles.success,
    danger: styles.danger,
  }[variant];

  const textStyle = {
    default: styles.defaultText,
    success: styles.successText,
    danger: styles.dangerText,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  default: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  success: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  danger: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { fontSize: 14, fontWeight: '600' },
  defaultText: { color: colors.text },
  successText: { color: colors.success },
  dangerText: { color: colors.error },
});
