import { TextStyle } from 'react-native';
import { colors } from './colors';

// Dark Premium typography
export const typography = {
  // Large Title
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -1.2,
    color: colors.textPrimary,
  } as TextStyle,

  // Title 1
  title1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -1.0,
    color: colors.textPrimary,
  } as TextStyle,

  // Title 2
  title2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.8,
    color: colors.textPrimary,
  } as TextStyle,

  // Title 3
  title3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: -0.6,
    color: colors.textPrimary,
  } as TextStyle,

  // Headline
  headline: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.textPrimary,
  } as TextStyle,

  // Body
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.textPrimary,
  } as TextStyle,

  // Callout
  callout: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.32,
    color: colors.textPrimary,
  } as TextStyle,

  // Subhead
  subhead: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
    color: colors.textPrimary,
  } as TextStyle,

  // Footnote
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.08,
    color: colors.textSecondary,
  } as TextStyle,

  // Caption 1
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  } as TextStyle,

  // Caption 2
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13,
    letterSpacing: 0.07,
    color: colors.textTertiary,
  } as TextStyle,

  // Mono - for numbers and codes
  mono: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    fontFamily: 'monospace',
    color: colors.textPrimary,
  } as TextStyle,

  // Legacy mappings for compatibility
  h1: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -1.2,
    color: colors.textPrimary,
  } as TextStyle,

  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -1.0,
    color: colors.textPrimary,
  } as TextStyle,

  h3: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.8,
    color: colors.textPrimary,
  } as TextStyle,

  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
    color: colors.textPrimary,
  } as TextStyle,

  h5: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.textPrimary,
  } as TextStyle,

  h6: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.textPrimary,
  } as TextStyle,

  // Body text variants
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.textPrimary,
  } as TextStyle,

  bodyMedium: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
    color: colors.textPrimary,
  } as TextStyle,

  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.08,
    color: colors.textSecondary,
  } as TextStyle,

  // Labels
  labelLarge: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.textPrimary,
  } as TextStyle,

  labelMedium: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: colors.textSecondary,
  } as TextStyle,

  labelSmall: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 13,
    letterSpacing: 0.07,
    color: colors.textTertiary,
  } as TextStyle,

  // Button text
  button: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.textPrimary,
  } as TextStyle,

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  } as TextStyle,

  // Overline
  overline: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
