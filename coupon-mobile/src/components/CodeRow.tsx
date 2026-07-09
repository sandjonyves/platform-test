import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { CodeName } from '../types';
import { colors, radius, spacing } from '../theme';
import { OutlineButton } from './OutlineButton';

interface CodeRowProps {
  label: string;
  codeName: CodeName;
  value?: string | null;
  isValid: boolean;
  onValidate: () => void;
  onReject: () => void;
  loading?: boolean;
}

export function CodeRow({
  label,
  value,
  isValid,
  onValidate,
  onReject,
  loading = false,
}: CodeRowProps) {
  if (!value) return null;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.code}>{value}</Text>
        <Text style={[styles.status, isValid ? styles.valid : styles.invalid]}>
          {isValid ? 'Valide' : 'Non validé / rejeté'}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={styles.actions}>
          <OutlineButton
            title="Valider"
            variant="success"
            onPress={onValidate}
            style={styles.actionBtn}
          />
          <OutlineButton
            title="Rejeter"
            variant="danger"
            onPress={onReject}
            style={styles.actionBtn}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: { marginBottom: spacing.sm },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: 15,
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  status: { fontSize: 12, fontWeight: '600' },
  valid: { color: colors.success },
  invalid: { color: colors.error },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
});
