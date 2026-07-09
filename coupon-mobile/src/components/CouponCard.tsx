import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Coupon, CouponType } from '../types';
import { colors, radius, spacing } from '../theme';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';

const typeIcons: Partial<Record<CouponType, string>> = {
  NEOSURF: 'credit-card',
  PCS: 'payment',
  TRANSCASH: 'account-balance-wallet',
  PAYSAFECARD: 'card-giftcard',
  'GOOGLE PLAY': 'android',
  STEAM: 'sports-esports',
  FLEXEPIN: 'pin',
  CASHLIB: 'attach-money',
  NETFLIX: 'movie',
  AMAZON: 'shopping-cart',
};

interface CouponCardProps {
  coupon: Coupon;
  onPress: () => void;
}

export function CouponCard({ coupon, onPress }: CouponCardProps) {
  const date = new Date(coupon.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const iconName = typeIcons[coupon.type] || 'confirmation-number';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Icon name={iconName} size={22} color={colors.primary} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {coupon.type}
            </Text>
            <StatusBadge status={coupon.status} />
          </View>

          <Text style={styles.amount}>
            {coupon.montant} {coupon.devise}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {coupon.email}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.id}>#{coupon.id}</Text>
            <Text style={styles.date}>{date}</Text>
            <Icon name="chevron-right" size={18} color={colors.textSecondary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  pressed: { opacity: 0.92 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  id: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  date: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
});
