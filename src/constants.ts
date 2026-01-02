import type { WaveTransitionConfig } from "./types";

/**
 * Animation constants for wave positioning (in viewport units)
 * Note: START_POSITION_VW must match the CSS initial transform in styles.css
 */
export const WAVE_ANIMATION = {
  /** Starting position off-screen right (vw) */
  START_POSITION_VW: 170,
  /** Ending position off-screen left (vw) */
  END_POSITION_VW: -115,
  /** Total travel distance (vw) */
  TRAVEL_DISTANCE_VW: 285,
  /** Progress point (0-1) at which opacity fade begins */
  OPACITY_FADE_START: 0.3,
} as const;

/**
 * Default configuration for wave transitions
 */
export const WAVE_TRANSITION_CONFIG: WaveTransitionConfig = {
  /** Path to the wave SVG asset */
  waveSvgPath: "/wave-pattern.svg",
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
  opacityTriggerVw: 80,
  /** Per-wave configuration (front to back) */
  waves: [
    {
      stagger: -0.48,
      opacity: 1,
      phaseOffset: Math.PI * 0,
      topOffset: 30,
      startScaleFactor: 1.0,
      endScaleFactor: 0.0,
      slope: 1,
    },
    {
      stagger: -0.24,
      opacity: 1,
      phaseOffset: Math.PI * 0.25,
      topOffset: 20,
      startScaleFactor: 2.0,
      endScaleFactor: 0.0,
      slope: 10.0,
    },
    {
      stagger: 0.0,
      opacity: 1,
      phaseOffset: Math.PI * 0.5,
      topOffset: 10,
      startScaleFactor: 3.0,
      endScaleFactor: 0.0,
      slope: 20,
    },
  ],
  /** Delay before scroll gravity kicks in after user stops scrolling */
  scrollIdleDelayMs: 0,
  /** Duration of the gravity snap animation */
  gravityAnimationDurationMs: 3000,
};
