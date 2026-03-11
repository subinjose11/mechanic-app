import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { animations } from '@theme/animations';

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
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(animations.fadeIn.from.translateY)).current;

  useEffect(() => {
    const delay = Math.min(index * animations.timing.stagger, maxDelay);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: animations.fadeIn.duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animations.fadeIn.duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, maxDelay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default AnimatedListItem;
