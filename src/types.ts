/**
 * Configuration for individual wave properties
 */
export interface WaveConfig {
  /** Horizontal stagger offset (0-1, delays wave start) */
  stagger: number;
  /** Opacity of the wave (0-1) */
  opacity: number;
  /** Phase offset for undulation (radians) */
  phaseOffset: number;
  /** Vertical position as percentage (0-100) */
  topOffset: number;
  /** Scale multiplier at start of journey */
  startScaleFactor: number;
  /** Scale multiplier at end of journey */
  endScaleFactor: number;
  /** Slope of the wave (0-1) */
  slope: number;
}

/**
 * Configuration for the wave transition system
 */
export interface WaveTransitionConfig {
  /** Path to the wave SVG asset */
  waveImagePath: string;
  /** Progress threshold when leading wave covers center (0-1) */
  leadingEdge: number;
  /** Progress threshold when trailing wave reveals center (0-1) */
  trailingEdge: number;
  /** Debounce delay for resize handler in milliseconds */
  resizeDebounceMs: number;
  /** Amplitude of vertical undulation in vh units */
  undulationAmplitude: number;
  /** Frequency of undulation (number of complete waves during transition) */
  undulationFrequency: number;
  /** Wave position (in vw) at which opacity changes begin */
  opacityTriggerVw: number;
  /** Per-wave configuration */
  waves: WaveConfig[];
  /** Delay in ms before scroll gravity activates after scrolling stops */
  scrollIdleDelayMs: number;
  /** Duration in ms for the gravity snap animation */
  gravityAnimationDurationMs: number;
  /** Bias for the gravity snap animation */
  transitionBias: number;
}

/**
 * Information about the current scroll segment (dwell or transition)
 */
export interface SegmentInfo {
  /** Whether currently in a dwell zone (vs transition) */
  isInDwell: boolean;
  /** Index of the current/source slide */
  currentSlideIndex: number;
  /** Index of the active transition (-1 if none) */
  activeTransitionIndex: number;
  /** Progress within the current transition (0-1) */
  withinTransitionProgress: number;
}

/**
 * DOM elements required by the wave transition controller
 */
export interface WaveTransitionElements {
  slideContents: NodeListOf<HTMLElement>;
  waveTransitions: NodeListOf<HTMLElement>;
  progressFill: HTMLElement | null;
}
