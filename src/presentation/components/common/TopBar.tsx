import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, Platform } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { borderRadius } from '@theme/index';
import { shadows } from '@theme/shadows';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
}

export function TopBar({
  title,
  showBack = true,
  onBack,
  rightAction,
  style,
  transparent = false,
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const content = (
    <View style={styles.content}>
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Icon source="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {rightAction || <View style={styles.placeholder} />}
      </View>
    </View>
  );

  if (transparent) {
    return (
      <View
        style={[
          styles.container,
          styles.transparent,
          { paddingTop: insets.top + 13 },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={40}
        tint="dark"
        style={[
          styles.container,
          { paddingTop: insets.top + 13 },
          shadows.sm,
          style,
        ]}
      >
        <View style={styles.overlay}>{content}</View>
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.fallback,
        { paddingTop: insets.top + 13 },
        shadows.sm,
        style,
      ]}
    >
      {content}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  color = colors.textPrimary,
}: {
  icon: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.iconButtonPressed,
      ]}
    >
      <Icon source={icon} size={18} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 13,
    paddingHorizontal: 18,
  },
  overlay: {
    backgroundColor: 'rgba(10,10,15,0.7)',
  },
  fallback: {
    backgroundColor: 'rgba(10,10,15,0.95)',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.borderMedium,
  },
  placeholder: {
    width: 38,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: 38,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.borderMedium,
  },
});

export default TopBar;
