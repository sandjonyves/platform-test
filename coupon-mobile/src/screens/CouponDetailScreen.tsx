import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { couponsApi } from '../api/coupons';
import { CodeRow } from '../components/CodeRow';
import { OutlineButton } from '../components/OutlineButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBadge } from '../components/StatusBadge';
import type { CouponDetailScreenProps } from '../navigation/types';
import type { CodeName, Coupon } from '../types';
import { colors, radius, spacing } from '../theme';

const CODE_FIELDS: { name: CodeName; label: string; key: keyof Coupon }[] = [
  { name: 'code1', label: 'Code 1', key: 'code1' },
  { name: 'code2', label: 'Code 2', key: 'code2' },
  { name: 'code3', label: 'Code 3', key: 'code3' },
  { name: 'code4', label: 'Code 4', key: 'code4' },
];

export function CouponDetailScreen({ route, navigation }: CouponDetailScreenProps) {
  const { couponId } = route.params;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<CodeName | 'email' | 'coupon' | null>(
    null,
  );

  const loadCoupon = useCallback(async () => {
    setLoading(true);
    try {
      const response = await couponsApi.getById(couponId);
      if (response.success && response.data) {
        setCoupon(response.data);
      } else {
        Alert.alert('Erreur', 'Coupon introuvable.');
        navigation.goBack();
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger le coupon.');
    } finally {
      setLoading(false);
    }
  }, [couponId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadCoupon();
    }, [loadCoupon]),
  );

  const handleCodeAction = async (
    codeName: CodeName,
    action: 'validate' | 'invalidate',
  ) => {
    setActionLoading(codeName);
    try {
      const response =
        action === 'validate'
          ? await couponsApi.validateCode(couponId, codeName)
          : await couponsApi.invalidateCode(couponId, codeName);

      if (response.success) {
        await loadCoupon();
      } else {
        Alert.alert('Erreur', response.message || response.error || 'Action échouée.');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCouponAction = (action: 'validate' | 'invalidate') => {
    const title =
      action === 'validate' ? 'Valider le coupon ?' : 'Rejeter le coupon ?';
    Alert.alert(title, 'Cette action met à jour le statut global.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        style: action === 'invalidate' ? 'destructive' : 'default',
        onPress: async () => {
          setActionLoading('coupon');
          try {
            const response =
              action === 'validate'
                ? await couponsApi.validateCoupon(couponId)
                : await couponsApi.invalidateCoupon(couponId);
            if (response.success) {
              await loadCoupon();
              Alert.alert('Succès', response.message || 'Coupon mis à jour.');
            } else {
              Alert.alert('Erreur', response.message || 'Action échouée.');
            }
          } catch {
            Alert.alert('Erreur', 'Erreur réseau.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleSendEmail = () => {
    Alert.alert(
      'Envoyer la confirmation',
      'Un email sera envoyé au client avec le résultat de la vérification.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: async () => {
            setActionLoading('email');
            try {
              const response = await couponsApi.sendReceivedEmail(couponId);
              if (response.success) {
                await loadCoupon();
                Alert.alert('Succès', 'Email envoyé avec succès.');
              } else {
                Alert.alert('Erreur', response.message || "Échec de l'envoi.");
              }
            } catch {
              Alert.alert('Erreur', 'Erreur réseau.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  if (loading || !coupon) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.id}>Coupon #{coupon.id}</Text>
          <StatusBadge status={coupon.status} />
        </View>
        <Text style={styles.title}>
          {coupon.type} — {coupon.montant} {coupon.devise}
        </Text>
        <Text style={styles.email}>{coupon.email}</Text>
        <Text style={styles.meta}>
          Créé le {new Date(coupon.createdAt).toLocaleString('fr-FR')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Codes à vérifier</Text>
      {CODE_FIELDS.map(({ name, label, key }) => (
        <CodeRow
          key={name}
          label={label}
          codeName={name}
          value={coupon[key] as string | null}
          isValid={coupon[`${name}Valid` as keyof Coupon] as boolean}
          loading={actionLoading === name}
          onValidate={() => handleCodeAction(name, 'validate')}
          onReject={() => handleCodeAction(name, 'invalidate')}
        />
      ))}

      <Text style={styles.sectionTitle}>Actions</Text>
      <View style={styles.actions}>
        {coupon.status === 'pending' ? (
          <View style={styles.row}>
            <OutlineButton
              title="Valider coupon"
              variant="success"
              onPress={() => handleCouponAction('validate')}
              disabled={actionLoading === 'coupon'}
              style={styles.half}
            />
            <OutlineButton
              title="Rejeter coupon"
              variant="danger"
              onPress={() => handleCouponAction('invalidate')}
              disabled={actionLoading === 'coupon'}
              style={styles.half}
            />
          </View>
        ) : null}

        <PrimaryButton
          title={
            actionLoading === 'email'
              ? 'Envoi en cours...'
              : 'Confirmer et envoyer l\'email'
          }
          onPress={handleSendEmail}
          loading={actionLoading === 'email'}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  id: { fontSize: 14, fontWeight: '700', color: colors.primary },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  actions: { marginTop: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});
