import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { formatCurrency } from '@core/utils/formatCurrency';
import { GlassCard } from './GlassCard';
import { GlassIconBox } from './GlassIconBox';

interface PaymentSummaryProps {
  laborTotal: number;
  partsTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
}

export function PaymentSummary({
  laborTotal,
  partsTotal,
  grandTotal,
  amountPaid,
  balanceDue,
}: PaymentSummaryProps) {
  const progressPercent =
    grandTotal > 0 ? Math.min((amountPaid / grandTotal) * 100, 100) : 0;

  const isPaid = balanceDue <= 0;

  return (
    <GlassCard glowColor="rgba(239,68,68,0.08)" glowPosition="center-top">
      {/* Header */}
      <View style={styles.header}>
        <GlassIconBox
          emoji="📊"
          tintColor="rgba(245,158,11,0.12)"
          borderColor="rgba(245,158,11,0.15)"
        />
        <Text style={styles.headerLabel}>Payment Summary</Text>
      </View>

      {/* Line Items */}
      <View style={styles.lineItems}>
        {/* Labor Total */}
        <View style={styles.row}>
          <Text style={styles.lineLabel}>Labor Total</Text>
          <Text style={styles.lineValue}>{formatCurrency(laborTotal)}</Text>
        </View>

        {/* Parts Total */}
        <View style={styles.row}>
          <Text style={styles.lineLabel}>Parts Total</Text>
          <Text style={styles.lineValue}>{formatCurrency(partsTotal)}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Grand Total */}
        <View style={styles.row}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>

        {/* Amount Paid */}
        <View style={styles.row}>
          <Text style={styles.paidLabel}>Amount Paid</Text>
          <Text style={styles.paidValue}>
            - {formatCurrency(amountPaid)}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Balance Due */}
        <View
          style={[
            styles.balanceContainer,
            isPaid ? styles.balancePaid : styles.balanceDue,
          ]}
        >
          <Text
            style={[
              styles.balanceLabel,
              { color: isPaid ? '#22C55E' : '#EF4444' },
            ]}
          >
            {isPaid ? 'Fully Paid' : 'Balance Due'}
          </Text>
          <Text
            style={[
              styles.balanceValue,
              { color: isPaid ? '#22C55E' : '#EF4444' },
            ]}
          >
            {formatCurrency(balanceDue)}
          </Text>
        </View>
      </View>

    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(148,163,184,0.9)',
  },
  lineItems: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  lineLabel: {
    fontSize: 12,
    color: 'rgba(148,163,184,0.7)',
  },
  lineValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 6,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  paidLabel: {
    fontSize: 12,
    color: '#22C55E',
  },
  paidValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  balanceDue: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.12)',
  },
  balancePaid: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.12)',
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '800',
  },
});
