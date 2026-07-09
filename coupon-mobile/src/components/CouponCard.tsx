import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { couponsApi } from '../api/coupons';
import type { CodeDecision } from './CodeRow';
import { CodeRow } from './CodeRow';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { StatusBadge } from './StatusBadge';
import type { CodeName, Coupon, CouponType } from '../types';
import { allCodesReviewed, getExistingCodeFields } from '../utils/couponCodes';
import { colors, radius, spacing } from '../theme';

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
  reviewedCodes: Set<CodeName>;
  onCodeReviewed: (codeName: CodeName, decision: CodeDecision) => void;
  onCouponUpdated: (coupon: Coupon) => void;
}

export function CouponCard({
  coupon,
  reviewedCodes,
  onCodeReviewed,
  onCouponUpdated,
}: CouponCardProps) {
  const [actionLoading, setActionLoading] = useState<CodeName | 'confirm' | null>(null);
  const [codeDecisions, setCodeDecisions] = useState<Partial<Record<CodeName, CodeDecision>>>(
    {},
  );

  const date = new Date(coupon.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const iconName = typeIcons[coupon.type] || 'confirmation-number';
  const isPending = coupon.status === 'pending';
  const existingCodes = useMemo(() => getExistingCodeFields(coupon), [coupon]);
  const canConfirm = isPending && allCodesReviewed(coupon, reviewedCodes);

  const getDecision = (codeName: CodeName, validKey: keyof Coupon): CodeDecision => {
    if (codeDecisions[codeName]) return codeDecisions[codeName]!;
    if (reviewedCodes.has(codeName)) {
      return coupon[validKey] ? 'validated' : 'rejected';
    }
    return null;
  };

  const handleCodeAction = (
    codeName: CodeName,
    label: string,
    action: 'validate' | 'invalidate',
  ) => {
    const isValidate = action === 'validate';
    Alert.alert(
      isValidate ? `Valider ${label} ?` : `Rejeter ${label} ?`,
      isValidate
        ? 'Ce code sera marqué comme valide.'
        : 'Ce code sera marqué comme rejeté.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: isValidate ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(codeName);
            try {
              const response = isValidate
                ? await couponsApi.validateCode(coupon.id, codeName)
                : await couponsApi.invalidateCode(coupon.id, codeName);

              if (response.success) {
                const decision: CodeDecision = isValidate ? 'validated' : 'rejected';
                setCodeDecisions((prev) => ({ ...prev, [codeName]: decision }));
                onCodeReviewed(codeName, decision);

                const payload = response.data as { coupon?: Coupon } | undefined;
                if (payload?.coupon) {
                  onCouponUpdated(payload.coupon);
                } else {
                  onCouponUpdated({
                    ...coupon,
                    [`${codeName}Valid`]: isValidate,
                  } as Coupon);
                }
              } else {
                Alert.alert('Erreur', response.message || response.error || 'Action échouée.');
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

  const handleConfirmCoupon = () => {
    Alert.alert(
      'Confirmer le coupon ?',
      'Cette action finalise la vérification du coupon selon les codes traités.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setActionLoading('confirm');
            try {
              const response = await couponsApi.validateCoupon(coupon.id);
              if (response.success && response.data) {
                onCouponUpdated(response.data);
                Alert.alert('Succès', response.message || 'Coupon confirmé.');
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
      ],
    );
  };

  return (
    <View style={styles.card}>
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
          </View>
        </View>
      </View>

      {existingCodes.length > 0 ? (
        <View style={styles.codesSection}>
          <Text style={styles.sectionTitle}>
            {isPending ? 'Codes à vérifier' : 'Codes'}
          </Text>
          {existingCodes.map(({ name, label, key, validKey }) => (
            <CodeRow
              key={name}
              label={label}
              codeName={name}
              value={coupon[key] as string | null}
              decision={
                isPending
                  ? getDecision(name, validKey)
                  : coupon[validKey]
                    ? 'validated'
                    : 'rejected'
              }
              reviewed={isPending ? reviewedCodes.has(name) : true}
              readOnly={!isPending}
              loading={actionLoading === name}
              onValidate={() => handleCodeAction(name, label, 'validate')}
              onReject={() => handleCodeAction(name, label, 'invalidate')}
            />
          ))}
        </View>
      ) : null}

      {isPending && existingCodes.length > 0 ? (
        <View style={styles.confirmSection}>
          <PrimaryButton
            title={canConfirm ? 'Confirmer le coupon' : 'Traiter les codes d\'abord'}
            onPress={handleConfirmCoupon}
            loading={actionLoading === 'confirm'}
            disabled={!canConfirm}
            style={styles.confirmBtn}
          />
        </View>
      ) : null}

      {!isPending && coupon.verificationDate ? (
        <Text style={styles.verifiedMeta}>
          Traité le {new Date(coupon.verificationDate).toLocaleString('fr-FR')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
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
    fontSize: 11,
    color: colors.textSecondary,
  },
  codesSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  confirmSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmBtn: {
    minHeight: 44,
  },
  verifiedMeta: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
