import type { WaveTransitionConfig } from "./types";

/**
 * Scroll gravity animation constants
 */
export const SCROLL_GRAVITY = {
  /** Minimum distance (pixels) to trigger snap animation - avoids micro-animations */
  MIN_SNAP_DISTANCE_PX: 1,
} as const;

/**
 * Animation constants for wave positioning (in viewport units)
 * Note: START_POSITION_VW must match the CSS initial transform in styles.css
 */
const START_POSITION_VW = 170;
const END_POSITION_VW = -115;

export const WAVE_ANIMATION = {
  /** Starting position off-screen right (vw) */
  START_POSITION_VW,
  /** Ending position off-screen left (vw) */
  END_POSITION_VW,
  /** Total travel distance (vw) - derived from START - END */
  TRAVEL_DISTANCE_VW: START_POSITION_VW - END_POSITION_VW,
  /** Progress point (0-1) at which wave opacity fade begins */
  OPACITY_FADE_START: 0.3,
} as const;

/**
 * Default configuration for wave transitions
 */
export const WAVE_TRANSITION_CONFIG: WaveTransitionConfig = {
  /** Path to the wave SVG asset */
  waveImagePath: "/wave.webp",
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
  /** Wave position (in vw) at which text opacity changes begin */
  opacityTriggerVw: 200,
  /** Bias for the gravity snap animation. POsitive number means the gravity will snap to the next slide, negative number means the gravity will snap to the previous slide. */
  transitionBias: 0.15,
  /** Per-wave configuration (front to back) */
  waves: [
    {
      stagger: -1,
      opacity: 1,
      phaseOffset: Math.PI * 0,
      topOffset: 20,
      startScaleFactor: 1.0,
      endScaleFactor: 0.0,
      slope: 10,
    },
    {
      stagger: -0.5,
      opacity: 1,
      phaseOffset: Math.PI * 0.25,
      topOffset: 10,
      startScaleFactor: 1.5,
      endScaleFactor: 0.0,
      slope: 20.0,
    },
    {
      stagger: 0.0,
      opacity: 1,
      phaseOffset: Math.PI * 0.0,
      topOffset: -5,
      startScaleFactor: 2.5,
      endScaleFactor: 0.0,
      slope: 30,
    },
  ],
  /** Delay before scroll gravity kicks in after user stops scrolling */
  scrollIdleDelayMs: 50,
  /** Duration of the gravity snap animation */
  gravityAnimationDurationMs: 3000,
};
