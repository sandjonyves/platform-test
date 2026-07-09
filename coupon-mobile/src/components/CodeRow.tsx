import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CodeName } from '../types';
import { colors, radius, spacing } from '../theme';
import { Icon } from './Icon';

export type CodeDecision = 'validated' | 'rejected' | null;

interface CodeRowProps {
  label: string;
  codeName: CodeName;
  value?: string | null;
  decision: CodeDecision;
  reviewed: boolean;
  readOnly?: boolean;
  onValidate: () => void;
  onReject: () => void;
  loading?: boolean;
}

export function CodeRow({
  label,
  value,
  decision,
  reviewed,
  readOnly = false,
  onValidate,
  onReject,
  loading = false,
}: CodeRowProps) {
  if (!value) return null;

  const statusLabel =
    decision === 'validated'
      ? '✓'
      : decision === 'rejected'
        ? '✗'
        : '·';

  const statusStyle =
    decision === 'validated'
      ? styles.valid
      : decision === 'rejected'
        ? styles.rejected
        : styles.pending;

  return (
    <View style={[styles.row, reviewed && styles.rowReviewed]}>
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.code} numberOfLines={1}>
          {value}
        </Text>
      </View>

      <Text style={[styles.status, statusStyle]}>{statusLabel}</Text>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : readOnly ? null : (
        <View style={styles.actions}>
          <Pressable
            onPress={onValidate}
            disabled={reviewed}
            style={({ pressed }) => [
              styles.iconBtn,
              styles.validateBtn,
              reviewed && styles.iconBtnDisabled,
              pressed && !reviewed && styles.pressed,
            ]}
            accessibilityLabel="Valider le code">
            <Icon name="check" size={18} color={reviewed ? colors.textSecondary : colors.success} />
          </Pressable>
          <Pressable
            onPress={onReject}
            disabled={reviewed}
            style={({ pressed }) => [
              styles.iconBtn,
              styles.rejectBtn,
              reviewed && styles.iconBtnDisabled,
              pressed && !reviewed && styles.pressed,
            ]}
            accessibilityLabel="Rejeter le code">
            <Icon name="close" size={18} color={reviewed ? colors.textSecondary : colors.error} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  rowReviewed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    width: 16,
    textAlign: 'center',
  },
  valid: { color: colors.success },
  rejected: { color: colors.error },
  pending: { color: colors.textSecondary },
  loader: {
    width: 68,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  validateBtn: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  rejectBtn: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  iconBtnDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  pressed: { opacity: 0.85 },
});
