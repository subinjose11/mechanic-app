import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Text } from 'react-native-paper';
import { colors } from '@theme/colors';

interface QuickActionsProps {
  onAddLabor: () => void;
  onAddParts: () => void;
  onRecordPayment: () => void;
  onPreviewReceipt: () => void;
}

const actions = [
  {
    key: 'labor',
    icon: 'wrench',
    gradient: ['#6366F1', '#4361ee'] as const,
    label: 'Labor',
  },
  {
    key: 'parts',
    icon: 'cog',
    gradient: ['#f72585', '#b5179e'] as const,
    label: 'Parts',
  },
  {
    key: 'payment',
    icon: 'credit-card-outline',
    gradient: ['#06d6a0', '#118ab2'] as const,
    label: 'Payment',
  },
  {
    key: 'receipt',
    icon: 'file-document-outline',
    gradient: ['#F59E0B', '#FBBF24'] as const,
    label: 'Receipt',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddLabor,
  onAddParts,
  onRecordPayment,
  onPreviewReceipt,
}) => {
  const handlers: Record<string, () => void> = {
    labor: onAddLabor,
    parts: onAddParts,
    payment: onRecordPayment,
    receipt: onPreviewReceipt,
  };

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
          onPress={handlers[action.key]}
        >
          <LinearGradient
            colors={[action.gradient[0], action.gradient[1]]}
            style={styles.iconCircle}
          >
            <Icon source={action.icon} size={16} color="#fff" />
          </LinearGradient>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#12121C',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardPressed: {
    transform: [{ scale: 0.95 }],
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(148,163,184,0.8)',
    textAlign: 'center',
  },
});
