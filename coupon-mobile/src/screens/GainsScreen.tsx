import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { gainsApi } from '../api/gains';
import { getApiErrorMessage } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { PaymentEntry } from '../components/PaymentEntry';
import { useAuth } from '../context/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, radius, spacing } from '../theme';
import type { GainItem, GainsReport } from '../types';
import { formatAmount, formatNumber, formatXaf } from '../utils/money';

/**
 * Détail de ce que le client doit payer, sous forme de tableau compact :
 * N° · Coupon · Montant · Gain · État. La date, l'email et les codes sont
 * volontairement absents pour garder le tableau lisible sur téléphone.
 */
export function GainsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [report, setReport] = useState<GainsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await gainsApi.getReport();
      if (response.success && response.data) {
        setReport(response.data);
        setError(null);
      } else {
        setError(response.message || 'Impossible de charger les gains.');
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const rows = useMemo(() => report?.items ?? [], [report]);
  const totals = report?.totals;

  const header = (
    <View>
      <View style={styles.summary}>
        <SummaryBox label="Déjà payé" value={formatNumber(totals?.paid ?? 0)} tone="success" />
        <SummaryBox label="Reste à payer" value={formatNumber(totals?.due ?? 0)} tone="primary" />
      </View>
      <Text style={styles.unit}>Montants en XAF</Text>

      {isAdmin && report ? <PaymentEntry due={totals?.due ?? 0} onSaved={load} /> : null}

      {report ? (
        <Text style={styles.rule}>
          {report.rate} XAF par unité · 100 € = {formatXaf(report.rate * 100)} · coupon répété = 0
        </Text>
      ) : null}

      <View style={[styles.row, styles.headRow, styles.tableTop]}>
        <Text style={[styles.th, styles.colId]}>N°</Text>
        <Text style={[styles.th, styles.colType]}>Coupon</Text>
        <Text style={[styles.th, styles.colAmount, styles.right]}>Montant</Text>
        <Text style={[styles.th, styles.colGain, styles.right]}>Gain</Text>
        <Text style={[styles.th, styles.colState, styles.center]}>État</Text>
      </View>
    </View>
  );

  const footer = rows.length ? (
    <View style={[styles.row, styles.footRow]}>
      <Text style={[styles.footLabel, styles.footLabelCol]}>Total à payer</Text>
      <Text style={[styles.footValue, styles.right]}>{formatXaf(totals?.due ?? 0)}</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Paiements"
        subtitle="Détail de ce que le client doit payer"
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
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
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <EmptyState title="Erreur" message={error} />
          ) : (
            <EmptyState title="Aucun coupon validé" />
          )
        }
        renderItem={({ item, index }) => <GainRow item={item} striped={index % 2 === 1} />}
      />
    </View>
  );
}

function GainRow({ item, striped }: { item: GainItem; striped: boolean }) {
  const state = item.duplicate
    ? { label: 'Répété', style: styles.badgeWarning, text: styles.badgeWarningText }
    : item.paid
      ? { label: 'Payé', style: styles.badgeSuccess, text: styles.badgeSuccessText }
      : item.partial
        ? { label: 'Partiel', style: styles.badgeInfo, text: styles.badgeInfoText }
        : { label: 'À payer', style: styles.badgePrimary, text: styles.badgePrimaryText };

  return (
    <View style={[styles.row, striped && styles.striped]}>
      <Text style={[styles.td, styles.colId, styles.muted]}>{item.id}</Text>
      <Text style={[styles.td, styles.colType, styles.bold]} numberOfLines={1}>
        {item.type}
      </Text>
      <Text style={[styles.td, styles.colAmount, styles.right]} numberOfLines={1}>
        {formatAmount(item.montant, item.devise)}
      </Text>
      <Text
        style={[styles.td, styles.colGain, styles.right, styles.bold, item.duplicate && styles.struck]}
        numberOfLines={1}>
        {formatNumber(item.gain)}
      </Text>
      <View style={[styles.colState, styles.center]}>
        <View style={[styles.badge, state.style]}>
          <Text style={[styles.badgeText, state.text]}>{state.label}</Text>
        </View>
      </View>
    </View>
  );
}

function SummaryBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'primary';
}) {
  return (
    <View style={[styles.box, tone === 'primary' && styles.boxPrimary]}>
      <Text style={[styles.boxLabel, tone === 'primary' && styles.boxLabelPrimary]}>{label}</Text>
      <Text
        style={[
          styles.boxValue,
          tone === 'success' && { color: colors.success },
          tone === 'primary' && styles.boxValuePrimary,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 },
  loader: { paddingVertical: spacing.xxl, alignItems: 'center' },

  summary: { flexDirection: 'row', gap: spacing.sm },
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
  },
  boxPrimary: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  boxLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  boxLabelPrimary: { color: 'rgba(255,255,255,0.85)' },
  boxValue: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 2 },
  boxValuePrimary: { color: colors.white },
  unit: { fontSize: 11, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'right' },
  rule: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  tableTop: { marginTop: spacing.md },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headRow: {
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    paddingVertical: 8,
  },
  striped: { backgroundColor: '#FAFBFD' },
  footRow: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },

  th: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  td: { fontSize: 13, color: colors.text },
  colId: { width: 34 },
  colType: { flex: 1, paddingRight: 4 },
  colAmount: { width: 62 },
  colGain: { width: 64 },
  colState: { width: 70 },
  right: { textAlign: 'right' },
  center: { alignItems: 'center', textAlign: 'center' },
  bold: { fontWeight: '700' },
  muted: { color: colors.textSecondary },
  struck: { textDecorationLine: 'line-through', color: colors.textSecondary },

  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeSuccess: { backgroundColor: colors.successBg },
  badgeSuccessText: { color: colors.success },
  badgeWarning: { backgroundColor: colors.warningBg },
  badgeWarningText: { color: colors.warning },
  badgePrimary: { backgroundColor: '#EEF0FF' },
  badgePrimaryText: { color: colors.primaryDark },
  badgeInfo: { backgroundColor: '#E0F2FE' },
  badgeInfoText: { color: '#0369A1' },

  footLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  footLabelCol: { flex: 1 },
  footValue: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
});
