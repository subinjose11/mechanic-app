import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface GlassIconBoxProps {
  emoji: string;
  tintColor: string;
  borderColor: string;
  size?: number;
}

export function GlassIconBox({ emoji, tintColor, borderColor, size = 28 }: GlassIconBoxProps) {
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.29,
          backgroundColor: tintColor,
          borderColor: borderColor,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
