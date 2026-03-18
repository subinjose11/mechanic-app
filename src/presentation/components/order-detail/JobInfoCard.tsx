import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { OrderStatus } from '@core/constants';
import { formatDateTime } from '@core/utils/formatDate';
import { GlassCard } from './GlassCard';
import { GlassIconBox } from './GlassIconBox';

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string; color: string }[] = [
  { key: 'pending', label: 'Pending', icon: 'clock-outline', color: '#FBBF24' },
  { key: 'in_progress', label: 'In Progress', icon: 'wrench', color: '#818CF8' },
  { key: 'completed', label: 'Completed', icon: 'check-circle', color: '#22C55E' },
];

interface JobInfoCardProps {
  vehicleMake?: string;
  vehicleModel?: string;
  customerName?: string;
  licensePlate?: string;
  status: OrderStatus;
  createdAt: Date;
  description: string | null;
  kmReading: number | null;
  onSaveOdometer: (value: number) => void;
  onSaveDescription: (value: string) => void;
  onStatusChange: (status: OrderStatus) => Promise<void>;
}

const statusConfig: Record<string, { bg: string; border: string; color: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)', color: '#FBBF24', label: 'PENDING' },
  in_progress: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)', color: '#818CF8', label: 'IN PROGRESS' },
  completed: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)', color: '#22C55E', label: 'COMPLETED' },
};

export function JobInfoCard({
  vehicleMake,
  vehicleModel,
  customerName,
  licensePlate,
  status,
  createdAt,
  description,
  kmReading,
  onSaveOdometer,
  onSaveDescription,
  onStatusChange,
}: JobInfoCardProps) {
  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [odoValue, setOdoValue] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const config = statusConfig[status] || statusConfig.pending;

  const handleEditDesc = () => {
    setIsEditingDesc(true);
    setDescValue(description || '');
  };

  const handleConfirmDesc = () => {
    if (descValue.trim()) {
      onSaveDescription(descValue.trim());
    }
    setIsEditingDesc(false);
  };

  const handleEditOdo = () => {
    setIsEditingOdo(true);
    setOdoValue(kmReading?.toString() || '');
  };

  const handleConfirmOdo = () => {
    const parsed = parseInt(odoValue, 10);
    if (!isNaN(parsed)) {
      onSaveOdometer(parsed);
    }
    setIsEditingOdo(false);
  };

  return (
    <GlassCard glowColor="rgba(99,102,241,0.12)" glowPosition="top-right" style={styles.card}>
      {/* Work Description as Title */}
      <View style={styles.titleSection}>
        {isEditingDesc ? (
          <View style={styles.titleEditRow}>
            <TextInput
              style={styles.titleInput}
              value={descValue}
              onChangeText={setDescValue}
              autoFocus
              multiline
              placeholder="Enter work description..."
              placeholderTextColor="rgba(148,163,184,0.4)"
              onBlur={handleConfirmDesc}
            />
            <Pressable style={styles.titleEditBtn} onPress={handleConfirmDesc}>
              <Icon source="check" size={16} color="#818CF8" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.titleRow}>
            <Text style={styles.titleText} numberOfLines={3}>
              {description || 'Add work description...'}
            </Text>
            <Pressable style={styles.titleEditBtn} onPress={handleEditDesc}>
              <Icon source="pencil" size={14} color="#818CF8" />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Vehicle Info */}
      <View style={styles.vehicleSection}>
        <View style={styles.vehicleRow}>
          <View style={styles.vehicleIcon}>
            <Text style={styles.vehicleEmoji}>🚗</Text>
          </View>
          <View style={styles.vehicleInfo}>
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
        </View>
        <Text style={styles.dateText}>{formatDateTime(createdAt)}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Odometer */}
      <View style={styles.odometerSection}>
        <View style={styles.odometerLeft}>
          <GlassIconBox emoji="🔢" tintColor="rgba(34,211,238,0.12)" borderColor="rgba(34,211,238,0.15)" />
          <Text style={styles.sectionLabel}>Odometer</Text>
        </View>
        <View style={styles.odometerRight}>
          {isEditingOdo ? (
            <>
              <View style={styles.odoBox}>
                <TextInput
                  style={styles.odoInput}
                  value={odoValue}
                  onChangeText={setOdoValue}
                  keyboardType="numeric"
                  autoFocus
                  onBlur={handleConfirmOdo}
                />
              </View>
              <Pressable style={styles.odoEditBtn} onPress={handleConfirmOdo}>
                <Icon source="check" size={14} color="#818CF8" />
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.odoBox}>
                <Text style={styles.odoValue}>
                  {kmReading != null ? kmReading.toLocaleString() : '—'}
                </Text>
                {kmReading != null && <Text style={styles.odoSuffix}>km</Text>}
              </View>
              <Pressable style={styles.odoEditBtn} onPress={handleEditOdo}>
                <Icon source="pencil" size={14} color="#818CF8" />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Job Status */}
      <View>
        <View style={styles.statusHeaderRow}>
          <GlassIconBox emoji="🚦" tintColor="rgba(168,85,247,0.12)" borderColor="rgba(168,85,247,0.15)" />
          <Text style={styles.sectionLabel}>Job Status</Text>
        </View>
        <View style={styles.statusSegments}>
          {STATUS_STEPS.map((step) => {
            const isActive = status === step.key;
            return (
              <Pressable
                key={step.key}
                style={[
                  styles.statusSegment,
                  isActive && {
                    backgroundColor: step.color + '18',
                    borderColor: step.color + '30',
                  },
                ]}
                onPress={async () => {
                  if (isUpdatingStatus) return;
                  setIsUpdatingStatus(true);
                  try {
                    await onStatusChange(step.key);
                  } finally {
                    setIsUpdatingStatus(false);
                  }
                }}
                disabled={isUpdatingStatus}
              >
                <View
                  style={[
                    styles.statusSegmentIcon,
                    {
                      backgroundColor: isActive ? step.color : 'rgba(255,255,255,0.06)',
                    },
                  ]}
                >
                  {isUpdatingStatus && isActive ? (
                    <ActivityIndicator size={14} color="#fff" />
                  ) : (
                    <Icon
                      source={step.icon}
                      size={16}
                      color={isActive ? '#fff' : 'rgba(148,163,184,0.4)'}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: isActive ? step.color : 'rgba(148,163,184,0.4)',
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {step.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
  },
  // Title (Work Description)
  titleSection: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    lineHeight: 24,
  },
  titleEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    lineHeight: 24,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99,102,241,0.3)',
    paddingBottom: 4,
  },
  titleEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(148,163,184,0.9)',
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 14,
  },
  // Vehicle
  vehicleSection: {},
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleEmoji: {
    fontSize: 22,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#F1F5F9',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 11,
    color: 'rgba(148,163,184,0.7)',
    marginBottom: 5,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#F1F5F9',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dateText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 10,
    color: 'rgba(100,116,139,0.5)',
  },
  // Odometer
  odometerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  odometerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  odometerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  odoBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  odoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  odoSuffix: {
    fontSize: 10,
    color: 'rgba(148,163,184,0.6)',
    marginLeft: 4,
  },
  odoInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    minWidth: 60,
    padding: 0,
  },
  odoEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Status
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusSegments: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statusSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusSegmentIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
