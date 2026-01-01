import type { WaveTransitionConfig } from './types';

/**
 * Default configuration for wave transitions
 */
export const WAVE_TRANSITION_CONFIG: WaveTransitionConfig = {
  /** When leading wave covers the center of the viewport */
  leadingEdge: 0.4,
  /** When trailing wave reveals the center of the viewport */
  trailingEdge: 0.6,
  /** Ratio of scroll spent on dwell zones (0.3 = 30% dwell, 70% transition) */
  dwellRatio: 0.3,
  /** Debounce delay for window resize events */
  resizeDebounceMs: 100,
  /** Amplitude of vertical undulation in vh units */
  undulationAmplitude: 8,
  /** Frequency of undulation (number of complete sine waves during transition) */
  undulationFrequency: 2.5,
  /** Per-wave configuration (front to back) */
  waves: [
    { scale: 0.5, stagger: 0.16, opacity: 1, phaseOffset: 0, topOffset: -15 },
    { scale: 0.5, stagger: 0.08, opacity: 1, phaseOffset: 0, topOffset: 0 },
    { scale: 0.5, stagger: 0.0, opacity: 1, phaseOffset: Math.PI * 0.5, topOffset: 15 },
    { scale: 0.5, stagger: -0.08, opacity: 1, phaseOffset: Math.PI, topOffset: 30 },
    { scale: 0.5, stagger: -0.16, opacity: 1, phaseOffset: Math.PI * 1.5, topOffset: 55 },
  ],
};

