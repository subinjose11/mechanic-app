import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { OrderStatus } from '@core/constants';
import { formatDateTime } from '@core/utils/formatDate';
import { GlassCard } from './GlassCard';

interface VehicleInfoCardProps {
  vehicleMake?: string;
  vehicleModel?: string;
  customerName?: string;
  licensePlate?: string;
  status: OrderStatus;
  createdAt: Date;
}

const statusConfig: Record<string, { bg: string; border: string; color: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)', color: '#FBBF24', label: 'PENDING' },
  in_progress: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)', color: '#818CF8', label: 'IN PROGRESS' },
  completed: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)', color: '#22C55E', label: 'COMPLETED' },
};

export function VehicleInfoCard({
  vehicleMake,
  vehicleModel,
  customerName,
  licensePlate,
  status,
  createdAt,
}: VehicleInfoCardProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <GlassCard glowColor="rgba(99,102,241,0.15)" glowPosition="top-right" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>🚗</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {vehicleMake} {vehicleModel}
          </Text>
          <Text style={styles.customerName}>{customerName}</Text>
          <View style={styles.chips}>
            {licensePlate && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{licensePlate}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>{formatDateTime(createdAt)}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  vehicleName: {
    fontWeight: '700',
    fontSize: 17,
    color: '#F1F5F9',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
    color: 'rgba(148,163,184,0.7)',
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#F1F5F9',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dateText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 10,
    color: 'rgba(100,116,139,0.5)',
  },
});
