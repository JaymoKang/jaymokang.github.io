/**
 * Configuration for individual wave properties
 */
export interface WaveConfig {
  /** Scale multiplier for wave size (1.0 = 100%) */
  scale: number;
  /** Horizontal stagger offset (0-1, delays wave start) */
  stagger: number;
  /** Opacity of the wave (0-1) */
  opacity: number;
  /** Phase offset for undulation (radians) */
  phaseOffset: number;
  /** Vertical position as percentage (0-100) */
  topOffset: number;
}

/**
 * Configuration for the wave transition system
 */
export interface WaveTransitionConfig {
  /** Progress threshold when leading wave covers center (0-1) */
  leadingEdge: number;
  /** Progress threshold when trailing wave reveals center (0-1) */
  trailingEdge: number;
  /** Ratio of scroll distance spent on dwell vs transition (0-1, e.g., 0.3 = 30% dwell) */
  dwellRatio: number;
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
}

/**
 * DOM elements required by the wave transition controller
 */
export interface WaveTransitionElements {
  slideContents: NodeListOf<HTMLElement>;
  waveTransitions: NodeListOf<HTMLElement>;
  progressFill: HTMLElement | null;
}

