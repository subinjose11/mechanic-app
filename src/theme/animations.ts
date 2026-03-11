import { Easing } from 'react-native';

export const animations = {
  // Timing
  timing: {
    fast: 100,
    normal: 200,
    slow: 300,
    stagger: 50,
  },

  // Easing
  easing: {
    smooth: Easing.bezier(0.4, 0, 0.2, 1),
    bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
    decelerate: Easing.out(Easing.cubic),
  },

  // Press feedback
  press: {
    scale: 0.98,
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
