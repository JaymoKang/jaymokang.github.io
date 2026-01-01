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
    { scale: 1.2, stagger: 0, opacity: 1, phaseOffset: 0 },
    { scale: 1.0, stagger: 0.08, opacity: 0.85, phaseOffset: Math.PI * 0.5 },
    { scale: 0.85, stagger: 0.16, opacity: 0.7, phaseOffset: Math.PI },
    { scale: 0.7, stagger: 0.24, opacity: 0.55, phaseOffset: Math.PI * 1.5 },
  ],
};

