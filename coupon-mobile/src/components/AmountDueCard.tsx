import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { colors, radius, spacing } from '../theme';
import type { GainsTotals } from '../types';
import { formatXaf } from '../utils/money';

interface AmountDueCardProps {
  totals: GainsTotals | null;
  loading?: boolean;
  onPress?: () => void;
}

/** Bandeau « Total à payer » affiché en haut de l'accueil. */
export function AmountDueCard({ totals, loading = false, onPress }: AmountDueCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Icon name="payments" size={18} color={colors.white} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>Total à payer par le client</Text>
        {loading && !totals ? (
          <ActivityIndicator color={colors.white} style={styles.loader} />
        ) : (
          <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
            {totals ? formatXaf(totals.due) : '—'}
          </Text>
        )}
        {totals ? (
          <Text style={styles.sub}>
            Payé {formatXaf(totals.paid)} sur {formatXaf(totals.totalGain)}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon name="chevron-right" size={22} color={colors.white} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pressed: { opacity: 0.9 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  body: { flex: 1 },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' },
  amount: { color: colors.white, fontSize: 18, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  loader: { alignSelf: 'flex-start', marginVertical: 2 },
});
