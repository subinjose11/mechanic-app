import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
  maxDelay?: number;
}

export function AnimatedListItem({
  children,
  index,
  style,
  maxDelay = 500,
}: AnimatedListItemProps) {
  const delay = Math.min(index * 60, maxDelay);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(18).stiffness(200)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export default AnimatedListItem;
