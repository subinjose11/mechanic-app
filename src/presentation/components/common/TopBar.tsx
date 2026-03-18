import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, Platform } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
  largeTitle?: boolean;
}

export function TopBar({
  title,
  showBack = true,
  onBack,
  rightAction,
  style,
  transparent = false,
  largeTitle = false,
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
          <Icon source="chevron-left" size={24} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      {!largeTitle && (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}

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
          { paddingTop: insets.top + 8 },
          style,
        ]}
      >
        {content}
        {largeTitle && <Text style={styles.largeTitle}>{title}</Text>}
      </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={60}
        tint="dark"
        style={[
          styles.container,
          styles.blurred,
          { paddingTop: insets.top + 8 },
          style,
        ]}
      >
        <View style={styles.overlay}>
          {content}
          {largeTitle && <Text style={styles.largeTitle}>{title}</Text>}
        </View>
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.fallback,
        { paddingTop: insets.top + 8 },
        style,
      ]}
    >
      {content}
      {largeTitle && <Text style={styles.largeTitle}>{title}</Text>}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  color = colors.primary,
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
      <Icon source={icon} size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  blurred: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.separator,
  },
  overlay: {
    backgroundColor: 'rgba(6,6,10,0.85)',
  },
  fallback: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.separator,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
    paddingVertical: 8,
    paddingRight: 8,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backText: {
    fontSize: 17,
    color: colors.primary,
    marginLeft: -2,
  },
  placeholder: {
    width: 60,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1.2,
    marginTop: 8,
    marginBottom: 8,
  },
  rightContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    opacity: 0.6,
  },
});

export default TopBar;
