/**
 * Configuration for the wipe transition system
 */
export interface WipeTransitionConfig {
  /** Progress threshold when SVG leading edge covers center (0-1) */
  leadingEdge: number;
  /** Progress threshold when SVG trailing edge reveals center (0-1) */
  trailingEdge: number;
  /** Debounce delay for resize handler in milliseconds */
  resizeDebounceMs: number;
}

/**
 * DOM elements required by the wipe transition controller
 */
export interface WipeTransitionElements {
  slideContents: NodeListOf<HTMLElement>;
  svgWrappers: NodeListOf<HTMLElement>;
  progressFill: HTMLElement | null;
}

