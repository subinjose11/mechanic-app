import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { formatCurrency } from '@core/utils/formatCurrency';

interface WorkItemRowProps {
  name: string;
  detail: string;
  amount: number;
  accentColor?: string;
  amountColor?: string;
  onDelete?: () => void;
}

export function WorkItemRow({ name, detail, amount, amountColor, onDelete }: WorkItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.center}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <Text style={[styles.amount, amountColor ? { color: amountColor } : undefined]}>
        {formatCurrency(amount)}
      </Text>
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  center: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F1F5F9',
  },
  detail: {
    fontSize: 10,
    color: 'rgba(100,116,139,0.6)',
    marginTop: 2,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
    marginRight: 10,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteText: {
    fontSize: 14,
    color: 'rgba(239,68,68,0.5)',
  },
});
