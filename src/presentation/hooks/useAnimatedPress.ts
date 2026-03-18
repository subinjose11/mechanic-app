import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { springPresets } from '@theme/animations';

export function useAnimatedPress(scaleTarget = 0.97) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleTarget, springPresets.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springPresets.snappy);
  };

  return { animatedStyle, handlePressIn, handlePressOut };
}
