import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { formatCurrency } from '@core/utils/formatCurrency';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface CollapsibleSectionProps {
  title: string;
  count: number;
  subtotal: number;
  accentColor: string;
  accentDimColor: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  count,
  subtotal,
  accentColor,
  accentDimColor,
  defaultExpanded,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded ?? count > 0);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={toggleExpanded} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: accentDimColor }]}>
            <Text style={[styles.badgeText, { color: accentColor }]}>
              {count}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.subtotal}>{formatCurrency(subtotal)}</Text>
          <Icon
            source={expanded ? 'chevron-down' : 'chevron-right'}
            size={16}
            color="rgba(100,116,139,0.5)"
          />
        </View>
      </Pressable>

      {expanded && (
        <View
          style={[
            styles.body,
            { borderLeftColor: accentColor + '40' },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#12121C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  body: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginTop: 10,
  },
});
