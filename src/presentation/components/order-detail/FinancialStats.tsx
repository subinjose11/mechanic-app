import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { formatCurrency } from '@core/utils/formatCurrency';
import { colors } from '@theme/colors';

interface FinancialStatsProps {
  total: number;
  paid: number;
  balance: number;
}

export const FinancialStats: React.FC<FinancialStatsProps> = ({
  total,
  paid,
  balance,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.totalCard]}>
        <Text style={styles.label}>TOTAL</Text>
        <Text style={[styles.value, { color: '#F1F5F9' }]}>
          {formatCurrency(total)}
        </Text>
      </View>

      <View style={[styles.card, styles.paidCard]}>
        <Text style={styles.label}>PAID</Text>
        <Text style={[styles.value, { color: '#22C55E' }]}>
          {formatCurrency(paid)}
        </Text>
      </View>

      <View style={[styles.card, styles.balanceCard]}>
        <Text style={styles.label}>BALANCE</Text>
        <Text
          style={[
            styles.value,
            { color: balance > 0 ? '#EF4444' : '#F1F5F9' },
          ]}
        >
          {formatCurrency(balance)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
  },
  card: {
    flex: 1,
    backgroundColor: '#12121C',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  totalCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  paidCard: {
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.15)',
  },
  balanceCard: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  label: {
    textTransform: 'uppercase',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(100,116,139,0.6)',
    marginBottom: 4,
  },
  value: {
    fontWeight: '800',
    fontSize: 15,
    color: '#F1F5F9',
  },
});
