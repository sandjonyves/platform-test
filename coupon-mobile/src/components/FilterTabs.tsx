import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CouponFilter } from '../types';
import { colors, radius, spacing } from '../theme';

const filters: { key: CouponFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'Attente' },
  { key: 'verified', label: 'Validés' },
  { key: 'invalid', label: 'Rejetés' },
];

interface FilterTabsProps {
  active: CouponFilter;
  counts: Record<CouponFilter, number>;
  onChange: (filter: CouponFilter) => void;
}

export function FilterTabs({ active, counts, onChange }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}>
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[styles.tab, isActive && styles.tabActive]}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {f.label}
            </Text>
            <View style={[styles.count, isActive && styles.countActive]}>
              <Text style={[styles.countText, isActive && styles.countTextActive]}>
                {counts[f.key]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    maxHeight: 44,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  count: {
    marginLeft: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  countTextActive: {
    color: colors.white,
  },
});
