import type { WipeTransitionConfig } from './types';

/**
 * Default configuration for wipe transitions
 */
export const WIPE_TRANSITION_CONFIG: WipeTransitionConfig = {
  /** When SVG leading edge covers the center of the viewport */
  leadingEdge: 0.4,
  /** When SVG trailing edge reveals the center of the viewport */
  trailingEdge: 0.6,
  /** Debounce delay for window resize events */
  resizeDebounceMs: 100,
};

