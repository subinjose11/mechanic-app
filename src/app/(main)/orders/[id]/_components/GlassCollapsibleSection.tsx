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
import { GlassCard } from './GlassCard';
import { GlassIconBox } from './GlassIconBox';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface GlassCollapsibleSectionProps {
  title: string;
  emoji: string;
  count: number;
  subtotal: number;
  accentColor: string;
  accentDimColor: string;
  accentBorderColor: string;
  glowColor?: string;
  glowPosition?: 'top-left' | 'top-right' | 'bottom-right' | 'center-top';
  defaultExpanded?: boolean;
  onAdd?: () => void;
  children: React.ReactNode;
}

export function GlassCollapsibleSection({
  title,
  emoji,
  count,
  subtotal,
  accentColor,
  accentDimColor,
  accentBorderColor,
  glowColor,
  glowPosition,
  defaultExpanded,
  onAdd,
  children,
}: GlassCollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? count > 0);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <GlassCard glowColor={glowColor} glowPosition={glowPosition}>
      <Pressable onPress={toggle} style={styles.header}>
        <View style={styles.headerLeft}>
          <GlassIconBox
            emoji={emoji}
            tintColor={accentDimColor}
            borderColor={accentBorderColor}
          />
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.countBadge, { backgroundColor: accentDimColor }]}>
            <Text style={[styles.countText, { color: accentColor }]}>{count}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.subtotal}>{formatCurrency(subtotal)}</Text>
          {onAdd && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              style={[styles.addBtn, { backgroundColor: accentDimColor, borderColor: accentBorderColor }]}
            >
              <Text style={[styles.addBtnText, { color: accentColor }]}>+</Text>
            </Pressable>
          )}
        </View>
      </Pressable>

      {expanded && count > 0 && (
        <View style={[styles.body, { borderLeftColor: accentColor + '33' }]}>
          {children}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: '#F1F5F9',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countText: {
    fontSize: 9,
    fontWeight: '600',
  },
  subtotal: {
    fontWeight: '700',
    fontSize: 15,
    color: '#F1F5F9',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    borderLeftWidth: 2,
    marginLeft: 14,
    paddingLeft: 14,
    marginTop: 12,
  },
});
