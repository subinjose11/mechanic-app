import { Easing } from 'react-native';
import { FadeInDown, FadeInUp, FadeIn, FadeOut, SlideInRight, SlideOutLeft, withSpring, WithSpringConfig } from 'react-native-reanimated';

// Spring presets for Reanimated
export const springPresets = {
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  } as WithSpringConfig,

  bouncy: {
    damping: 12,
    stiffness: 150,
    mass: 0.8,
  } as WithSpringConfig,

  snappy: {
    damping: 18,
    stiffness: 300,
    mass: 0.8,
  } as WithSpringConfig,

  stiff: {
    damping: 26,
    stiffness: 400,
    mass: 1,
  } as WithSpringConfig,
} as const;

// Entering/exiting presets
export const enteringPresets = {
  fadeInDown: FadeInDown.springify().damping(18).stiffness(200),
  fadeInUp: FadeInUp.springify().damping(18).stiffness(200),
  fadeIn: FadeIn.duration(200),
  slideInRight: SlideInRight.springify().damping(20).stiffness(200),
};

export const exitingPresets = {
  fadeOut: FadeOut.duration(150),
  slideOutLeft: SlideOutLeft.springify().damping(20).stiffness(200),
};

// List item entering with stagger
export const listItemEntering = (index: number) =>
  FadeInDown.delay(index * 60).springify().damping(18).stiffness(200);

export const animations = {
  // Timing
  timing: {
    fast: 100,
    normal: 200,
    slow: 300,
    stagger: 60,
  },

  // Easing
  easing: {
    smooth: Easing.bezier(0.4, 0, 0.2, 1),
    bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
    decelerate: Easing.out(Easing.cubic),
  },

  // Press feedback
  press: {
    scale: 0.97,
    opacity: 0.85,
    duration: 100,
  },

  // Appearance
  fadeIn: {
    from: { opacity: 0, translateY: 8 },
    to: { opacity: 1, translateY: 0 },
    duration: 250,
  },

  // FAB bounce
  fabAppear: {
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 300,
  },

  // Pulse for in-progress status
  pulse: {
    scale: [1, 1.05, 1],
    duration: 2000,
  },
} as const;

export type AnimationKey = keyof typeof animations;
