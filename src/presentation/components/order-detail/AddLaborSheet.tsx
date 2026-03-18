import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { colors } from '@theme/colors';
import { BottomSheet } from './BottomSheet';

interface AddLaborSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (description: string, amount: number) => Promise<void>;
  isAdding: boolean;
}

export function AddLaborSheet({ visible, onClose, onAdd, isAdding }: AddLaborSheetProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const handleClose = () => {
    setDesc('');
    setAmount('');
    onClose();
  };

  const handleAdd = async () => {
    if (!desc || !amount) return;
    await onAdd(desc, parseInt(amount));
    setDesc('');
    setAmount('');
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Add Labor Service">
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Service Description</Text>
        <TextInput
          style={styles.input}
          value={desc}
          onChangeText={setDesc}
          placeholder="e.g., Oil change, Brake service"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Amount</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountField}
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
      </View>
      <Pressable
        style={[styles.addBtn, (!desc || !amount) && styles.addBtnDisabled]}
        onPress={handleAdd}
        disabled={!desc || !amount || isAdding}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon source="plus" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add Labor</Text>
          </>
        )}
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 6,
  },
  amountField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 56,
    marginTop: 8,
    gap: 10,
  },
  addBtnDisabled: {
    backgroundColor: colors.systemGray4,
  },
  addBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
