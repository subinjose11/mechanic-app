import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { colors } from '@theme/colors';
import { BottomSheet } from './BottomSheet';

interface AddPartSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number, qty: number) => Promise<void>;
  isAdding: boolean;
}

export function AddPartSheet({ visible, onClose, onAdd, isAdding }: AddPartSheetProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');

  const handleClose = () => {
    setName('');
    setPrice('');
    setQty('1');
    onClose();
  };

  const handleAdd = async () => {
    if (!name || !price) return;
    await onAdd(name, parseInt(price), parseInt(qty));
    setName('');
    setPrice('');
    setQty('1');
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Add Spare Part">
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Part Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Oil filter, Brake pads"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Unit Price</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountField}
              value={price}
              onChangeText={(v) => setPrice(v.replace(/\D/g, ''))}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <View style={styles.qtyContainer}>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => setQty((q) => String(Math.max(1, parseInt(q) - 1)))}
            >
              <Icon source="minus" size={20} color={colors.primary} />
            </Pressable>
            <Text style={styles.qtyValue}>{qty}</Text>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => setQty((q) => String(parseInt(q) + 1))}
            >
              <Icon source="plus" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>
      <Pressable
        style={[styles.addBtn, (!name || !price) && styles.addBtnDisabled]}
        onPress={handleAdd}
        disabled={!name || !price || isAdding}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon source="plus" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add Part</Text>
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
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
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
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
