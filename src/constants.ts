import type { WaveTransitionConfig } from './types';

/**
 * Animation constants for wave positioning (in viewport units)
 * Note: START_POSITION_VW must match the CSS initial transform in styles.css
 */
export const WAVE_ANIMATION = {
  /** Starting position off-screen right (vw) */
  START_POSITION_VW: 150,
  /** Ending position off-screen left (vw) */
  END_POSITION_VW: -150,
  /** Total travel distance (vw) */
  TRAVEL_DISTANCE_VW: 300,
  /** Scale multiplier at start of journey (0-1, relative to wave's configured scale) */
  START_SCALE_FACTOR: -0.5,
  /** Scale multiplier at end of journey (0-1, relative to wave's configured scale) */
  END_SCALE_FACTOR: 2.0,
  /** Progress point (0-1) at which opacity fade begins */
  OPACITY_FADE_START: 0.3,
} as const;

/**
 * Default configuration for wave transitions
 */
export const WAVE_TRANSITION_CONFIG: WaveTransitionConfig = {
  /** Path to the wave SVG asset */
  waveSvgPath: '/wave-pattern.svg',
  /** When leading wave covers the center of the viewport */
  leadingEdge: 0.6,
  /** When trailing wave reveals the center of the viewport */
  trailingEdge: 0.8,
  /** Debounce delay for window resize events */
  resizeDebounceMs: 100,
  /** Amplitude of vertical undulation in vh units */
  undulationAmplitude: 4,
  /** Frequency of undulation (number of complete sine waves during transition) */
  undulationFrequency: 2.5,
  /** Wave position (in vw) at which opacity changes begin */
  opacityTriggerVw: 50,
  /** Per-wave configuration (front to back) */
  waves: [
    { scale: 0.5, stagger: 0.0, opacity: 1, phaseOffset: 0, topOffset: 30 },
    { scale: 0.5, stagger: 0.08, opacity: 1, phaseOffset: Math.PI * 0.5, topOffset: 0 },
    { scale: 0.5, stagger: 0.16, opacity: 1, phaseOffset: Math.PI * 0.25, topOffset: -30 },
  ],
};

