import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CouponStatus } from '../types';
import { colors, radius, spacing } from '../theme';

const labels: Record<CouponStatus, string> = {
  pending: 'En attente',
  verified: 'Validé',
  invalid: 'Rejeté',
};

const badgeStyles: Record<CouponStatus, { bg: string; text: string }> = {
  pending: { bg: colors.warningBg, text: colors.warning },
  verified: { bg: colors.successBg, text: colors.success },
  invalid: { bg: colors.errorBg, text: colors.error },
};

interface StatusBadgeProps {
  status: CouponStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = badgeStyles[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
