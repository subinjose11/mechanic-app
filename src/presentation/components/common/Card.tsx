import React, { useRef } from 'react';
import { StyleSheet, ViewStyle, Pressable, View, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass } from '@theme/glass';
import { animations } from '@theme/animations';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  elevated?: boolean;
  disabled?: boolean;
  blurEnabled?: boolean;
}

export function Card({
  children,
  onPress,
  style,
  contentStyle,
  elevated = false,
  disabled = false,
  blurEnabled = true,
}: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glassConfig = elevated ? glass.elevated : glass.card;
  const shouldBlur = blurEnabled && Platform.OS === 'ios';

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: animations.press.scale,
      duration: animations.press.duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: animations.press.duration,
      useNativeDriver: true,
    }).start();
  };

  const cardRadius = 'borderRadius' in glassConfig ? glassConfig.borderRadius : 20;

  const innerContent = (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const renderContent = () => {
    if (shouldBlur) {
      return (
        <BlurView
          intensity={glassConfig.blurIntensity}
          tint={glassConfig.blurTint}
          style={[
            styles.blur,
            {
              borderWidth: glassConfig.borderWidth,
              borderColor: glassConfig.borderColor,
              borderRadius: cardRadius,
            },
          ]}
        >
          <View style={[styles.overlay, { backgroundColor: glassConfig.backgroundColor }]}>
            {innerContent}
          </View>
        </BlurView>
      );
    }

    return (
      <View
        style={[
          styles.fallback,
          {
            backgroundColor: glassConfig.backgroundColor,
            borderWidth: glassConfig.borderWidth,
            borderColor: glassConfig.borderColor,
            borderRadius: cardRadius,
          },
        ]}
      >
        {innerContent}
      </View>
    );
  };

  if (onPress) {
    return (
      <Animated.View
        style={[
          styles.card,
          { borderRadius: cardRadius },
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[styles.pressable, disabled && styles.disabled]}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.card, { borderRadius: cardRadius }, style]}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  blur: {
    overflow: 'hidden',
  },
  fallback: {
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Card;
