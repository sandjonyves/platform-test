import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { couponsApi } from '../api/coupons';
import type { CodeDecision } from '../components/CodeRow';
import { CouponCard } from '../components/CouponCard';
import { EmptyState } from '../components/EmptyState';
import { FilterTabs } from '../components/FilterTabs';
import { ScreenHeader } from '../components/ScreenHeader';
import type { CodeName, Coupon, CouponFilter } from '../types';
import { colors, spacing } from '../theme';

type ReviewedMap = Record<number, Set<CodeName>>;

export function HomeScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filter, setFilter] = useState<CouponFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewedByCoupon, setReviewedByCoupon] = useState<ReviewedMap>({});

  const loadCoupons = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await couponsApi.getAll();
      if (response.success && response.data) {
        setCoupons(response.data);
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de charger les coupons.');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau lors du chargement.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCoupons();
    }, [loadCoupons]),
  );

  const handleCodeReviewed = useCallback(
    (couponId: number, codeName: CodeName, _decision: CodeDecision) => {
      setReviewedByCoupon((prev) => {
        const next = new Set(prev[couponId] ?? []);
        next.add(codeName);
        return { ...prev, [couponId]: next };
      });
    },
    [],
  );

  const handleCouponUpdated = useCallback((updated: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const counts = useMemo(
    () => ({
      all: coupons.length,
      pending: coupons.filter((c) => c.status === 'pending').length,
      verified: coupons.filter((c) => c.status === 'verified').length,
      invalid: coupons.filter((c) => c.status === 'invalid').length,
    }),
    [coupons],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return coupons;
    return coupons.filter((c) => c.status === filter);
  }, [coupons, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCoupons(true);
  }, [loadCoupons]);

  const listHeader = (
    <View style={styles.filtersWrap}>
      <FilterTabs active={filter} counts={counts} onChange={setFilter} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Coupons"
        subtitle={`${counts.pending} en attente`}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyLoader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Chargement des coupons...</Text>
            </View>
          ) : (
            <EmptyState
              title="Aucun coupon"
              message="Tirez vers le bas ou appuyez sur ↻ pour actualiser."
            />
          )
        }
        renderItem={({ item }) => (
          <CouponCard
            coupon={item}
            reviewedCodes={reviewedByCoupon[item.id] ?? new Set()}
            onCodeReviewed={(codeName, decision) =>
              handleCodeReviewed(item.id, codeName, decision)
            }
            onCouponUpdated={handleCouponUpdated}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filtersWrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.md,
    paddingBottom: spacing.xs,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  emptyLoader: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
});
