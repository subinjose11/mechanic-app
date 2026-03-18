import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { GlassCard } from './GlassCard';
import { GlassIconBox } from './GlassIconBox';
import { colors } from '@theme/colors';

interface WorkDescriptionProps {
  description: string | null;
}

export function WorkDescription({ description }: WorkDescriptionProps) {
  if (!description) return null;

  return (
    <GlassCard
      glowColor="rgba(99,102,241,0.1)"
      glowPosition="top-left"
    >
      <View style={styles.headerRow}>
        <GlassIconBox
          emoji="📋"
          tintColor="rgba(99,102,241,0.12)"
          borderColor="rgba(99,102,241,0.15)"
        />
        <Text style={styles.label}>Work Description</Text>
      </View>
      <Text style={styles.body}>{description}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(148,163,184,0.9)',
  },
  body: {
    fontSize: 13,
    color: 'rgba(241,245,249,0.85)',
    lineHeight: 22,
    paddingLeft: 36,
  },
});
