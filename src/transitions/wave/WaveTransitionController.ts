import type { WaveTransitionConfig, WaveTransitionElements } from "../../types";
import { WAVE_TRANSITION_CONFIG } from "../../constants";
import { addWindowListeners } from "../../utils/events";
import { clamp } from "../../utils/math";
import { SegmentCalculator } from "./SegmentCalculator";
import { ScrollGravity } from "./ScrollGravity";
import { SlideLayout } from "./SlideLayout";
import { SlideVisibility } from "./SlideVisibility";
import { WavePositioner } from "./WavePositioner";

/**
 * Controls scroll-driven wave transitions between content slides
 * Waves undulate vertically while traveling horizontally across the screen
 *
 * This is the main orchestrator that delegates to focused helper classes:
 * - SegmentCalculator: determines scroll position within dwell/transition zones
 * - WavePositioner: handles wave element positioning and animation
 * - SlideVisibility: manages slide opacity during transitions
 */
export class WaveTransitionController {
  private readonly config: WaveTransitionConfig;
  private readonly slideContents: NodeListOf<HTMLElement>;
  private readonly waveTransitions: NodeListOf<HTMLElement>;
  private readonly progressFill: HTMLElement | null;

  private readonly totalSlides: number;
  private readonly totalTransitions: number;

  // Helper modules
  private readonly segmentCalculator: SegmentCalculator;
  private readonly wavePositioner: WavePositioner;
  private readonly slideVisibility: SlideVisibility;
  private readonly scrollGravity: ScrollGravity;

  private ticking = false;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Cleanup function for event listeners
  private cleanupListeners: (() => void) | null = null;

  constructor(
    elements: WaveTransitionElements,
    config: Partial<WaveTransitionConfig> = {},
  ) {
    this.config = { ...WAVE_TRANSITION_CONFIG, ...config };
    this.slideContents = elements.slideContents;
    this.waveTransitions = elements.waveTransitions;
    this.progressFill = elements.progressFill;

    this.totalSlides = this.slideContents.length;
    this.totalTransitions = this.waveTransitions.length;

    // Create shared SlideLayout instance
    const slideLayout = new SlideLayout(
      this.totalSlides,
      this.totalTransitions,
    );

    // Initialize helper modules with shared SlideLayout
    this.segmentCalculator = new SegmentCalculator(slideLayout);
    this.wavePositioner = new WavePositioner(this.config);
    this.slideVisibility = new SlideVisibility(this.config);
    this.scrollGravity = new ScrollGravity(slideLayout, this.config);
  }

  /**
   * Initializes the controller and starts listening for scroll/resize events
   */
  init(): void {
    if (this.totalSlides === 0) {
      console.error("No slide content found");
      return;
    }

    // Generate wave elements based on config
    this.generateWaveElements();

    // Initial update (sets opacity based on scroll position)
    this.updateTransitions();

    // Attach event listeners
    this.cleanupListeners = addWindowListeners([
      { type: "scroll", handler: this.onScroll.bind(this) },
      { type: "resize", handler: this.onResize.bind(this) },
    ]);

    // Initialize scroll gravity
    this.scrollGravity.init();
  }

  /**
   * Generates wave img elements inside each wave-transition container
   * based on the waves array in config
   */
  private generateWaveElements(): void {
    const { waves, waveSvgPath } = this.config;

    this.waveTransitions.forEach((container) => {
      // Clear any existing waves
      container.innerHTML = "";

      // Create wave elements based on config
      waves.forEach(() => {
        const img = document.createElement("img");
        img.src = waveSvgPath;
        img.alt = "";
        img.className = "wave";
        img.setAttribute("aria-hidden", "true");
        container.appendChild(img);
      });
    });

    // Cache wave elements for efficient updates during scroll
    this.wavePositioner.cacheWaveElements(this.waveTransitions);
  }

  /**
   * Cleans up event listeners and timeouts
   */
  destroy(): void {
    this.cleanupListeners?.();
    this.cleanupListeners = null;

    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout);
    }

    this.scrollGravity.destroy();
  }

  /**
   * Scroll event handler with RAF throttling
   */
  private onScroll(): void {
    // Notify scroll gravity of scroll activity
    this.scrollGravity.onScroll();

    if (!this.ticking) {
      requestAnimationFrame(() => this.updateTransitions());
      this.ticking = true;
    }
  }

  /**
   * Resize event handler with debouncing
   */
  private onResize(): void {
    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.updateTransitions();
    }, this.config.resizeDebounceMs);
  }

  /**
   * Updates wave positions and slide visibility based on scroll position
   * Accounts for dwell zones between transitions
   */
  private updateTransitions(): void {
    const scrollY = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const overallProgress = clamp(scrollY / maxScroll, 0, 1);

    this.updateProgressBar(overallProgress);

    // Calculate segment info accounting for dwell zones
    const segmentInfo = this.segmentCalculator.calculate(overallProgress);

    // Update wave positions
    this.wavePositioner.updatePositions(
      this.waveTransitions,
      segmentInfo.activeTransitionIndex,
      segmentInfo.withinTransitionProgress,
    );

    // Update slide visibility
    this.slideVisibility.updateVisibility(
      this.slideContents,
      segmentInfo.activeTransitionIndex,
      segmentInfo.withinTransitionProgress,
      segmentInfo.isInDwell,
      segmentInfo.currentSlideIndex,
    );

    this.ticking = false;
  }

  /**
   * Updates the progress bar width
   */
  private updateProgressBar(progress: number): void {
    if (this.progressFill) {
      this.progressFill.style.width = `${progress * 100}%`;
    }
  }
}
