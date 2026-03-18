import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { OrderStatus } from '@core/constants';
import { GlassCard } from './GlassCard';
import { GlassIconBox } from './GlassIconBox';

const STEPS: { key: OrderStatus; label: string; icon: string; color: string }[] = [
  { key: 'pending', label: 'Pending', icon: 'clock-outline', color: '#FBBF24' },
  { key: 'in_progress', label: 'In Progress', icon: 'wrench', color: '#818CF8' },
  { key: 'completed', label: 'Completed', icon: 'check-circle', color: '#22C55E' },
];

interface StatusStepperProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

export function StatusStepper({ currentStatus, onStatusChange }: StatusStepperProps) {
  const [localStatus, setLocalStatus] = useState(currentStatus);

  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const handlePress = (status: OrderStatus) => {
    setLocalStatus(status);
    onStatusChange(status);
  };

  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <GlassIconBox
          emoji="🚦"
          tintColor="rgba(168,85,247,0.12)"
          borderColor="rgba(168,85,247,0.15)"
        />
        <Text style={styles.label}>Job Status</Text>
      </View>

      <View style={styles.segmentContainer}>
        {STEPS.map((step) => {
          const isActive = localStatus === step.key;
          return (
            <Pressable
              key={step.key}
              style={[
                styles.segment,
                isActive && {
                  backgroundColor: step.color + '18',
                  borderColor: step.color + '30',
                },
              ]}
              onPress={() => handlePress(step.key)}
            >
              <View
                style={[
                  styles.segmentIcon,
                  {
                    backgroundColor: isActive ? step.color : 'rgba(255,255,255,0.06)',
                    shadowColor: isActive ? step.color : 'transparent',
                    shadowOpacity: isActive ? 0.5 : 0,
                    shadowRadius: isActive ? 8 : 0,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: isActive ? 6 : 0,
                  },
                ]}
              >
                <Icon
                  source={step.icon}
                  size={16}
                  color={isActive ? '#fff' : 'rgba(148,163,184,0.4)'}
                />
              </View>
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color: isActive ? step.color : 'rgba(148,163,184,0.4)',
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {step.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    color: 'rgba(148,163,184,0.9)',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  segment: {
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
  segmentIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: 10,
  },
});
