import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
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
import { ScreenHeader } from '../components/ScreenHeader';
import { subscribeCouponRefresh } from '../services/couponRefresh';
import type { CodeName, Coupon } from '../types';
import { colors, spacing } from '../theme';

type ReviewedMap = Record<number, Set<CodeName>>;

export function HomeScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewedByCoupon, setReviewedByCoupon] = useState<ReviewedMap>({});

  const loadCoupons = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await couponsApi.getPending();
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

  // Refresh silencieux quand une notification FCM arrive / est tapée
  useEffect(() => {
    return subscribeCouponRefresh(() => {
      loadCoupons(true);
    });
  }, [loadCoupons]);

  // Refresh au retour au premier plan (tap notification / déverrouillage)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        loadCoupons(true);
      }
    });
    return () => subscription.remove();
  }, [loadCoupons]);

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
    if (updated.status === 'pending') {
      setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      return;
    }

    setCoupons((prev) => prev.filter((c) => c.id !== updated.id));
    setReviewedByCoupon((prev) => {
      const next = { ...prev };
      delete next[updated.id];
      return next;
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCoupons(true);
  }, [loadCoupons]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Coupons en attente"
        subtitle={`${coupons.length} à traiter`}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <FlatList
        data={coupons}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
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
              title="Aucun coupon en attente"
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
