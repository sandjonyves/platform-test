import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { gainsApi } from '../api/gains';
import { getApiErrorMessage } from '../api/client';
import { colors, radius, spacing } from '../theme';
import { formatXaf } from '../utils/money';

interface PaymentEntryProps {
  /** Reste à payer actuel, pour refuser un montant trop élevé. */
  due: number;
  /** Appelé après un paiement enregistré (pour recharger les totaux). */
  onSaved: () => void;
}

/** Champ + bouton (admin) pour saisir un montant payé par le client. */
export function PaymentEntry({ due, onSaved }: PaymentEntryProps) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const amount = Number(value.replace(/\s/g, ''));
  const valid = Number.isInteger(amount) && amount > 0;

  const save = async () => {
    try {
      setSaving(true);
      const response = await gainsApi.createPayment(amount);
      if (response.success) {
        setValue('');
        Keyboard.dismiss();
        onSaved();
        Alert.alert('Paiement enregistré', response.message || formatXaf(amount));
      } else {
        Alert.alert('Erreur', response.message || 'Paiement non enregistré.');
      }
    } catch (error) {
      Alert.alert('Erreur', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const submit = () => {
    if (!valid) {
      Alert.alert('Montant invalide', 'Entrez un montant entier en XAF, par exemple 4000.');
      return;
    }
    if (amount > due) {
      Alert.alert(
        'Montant trop élevé',
        due > 0 ? `Le reste à payer est de ${formatXaf(due)}.` : 'Il ne reste rien à payer.',
      );
      return;
    }
    Alert.alert(
      'Confirmer le paiement',
      `Le client a payé ${formatXaf(amount)} ?\nReste à payer après : ${formatXaf(due - amount)}.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Enregistrer', onPress: save },
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Montant payé par le client (XAF)</Text>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ''))}
          placeholder="ex. 4000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={submit}
          editable={!saving}
          style={styles.input}
        />
        <Pressable
          onPress={submit}
          disabled={saving || !value}
          style={({ pressed }) => [
            styles.button,
            (saving || !value) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Enregistrer</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
