import type { WipeTransitionConfig, WipeTransitionElements } from '../types';
import { WIPE_TRANSITION_CONFIG } from '../constants';
import { clamp, easeInOutCubic } from '../utils/math';

/**
 * Controls scroll-driven SVG wipe transitions between content slides
 */
export class WipeTransitionController {
  private readonly config: WipeTransitionConfig;
  private readonly slideContents: NodeListOf<HTMLElement>;
  private readonly svgWrappers: NodeListOf<HTMLElement>;
  private readonly progressFill: HTMLElement | null;

  private readonly totalSlides: number;
  private readonly totalTransitions: number;

  private currentSlide: number | null = 0;
  private ticking = false;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Bound event handlers for cleanup
  private readonly handleScroll: () => void;
  private readonly handleResize: () => void;

  constructor(
    elements: WipeTransitionElements,
    config: Partial<WipeTransitionConfig> = {}
  ) {
    this.config = { ...WIPE_TRANSITION_CONFIG, ...config };
    this.slideContents = elements.slideContents;
    this.svgWrappers = elements.svgWrappers;
    this.progressFill = elements.progressFill;

    this.totalSlides = this.slideContents.length;
    this.totalTransitions = this.svgWrappers.length;

    // Bind handlers
    this.handleScroll = this.onScroll.bind(this);
    this.handleResize = this.onResize.bind(this);
  }

  /**
   * Initializes the controller and starts listening for scroll/resize events
   */
  init(): void {
    if (this.totalSlides === 0) {
      console.error('No slide content found');
      return;
    }

    // Initialize first slide as visible
    this.slideContents[0]?.classList.add('active');

    // Initial update
    this.updateTransitions();

    // Attach event listeners
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Cleans up event listeners and timeouts
   */
  destroy(): void {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);

    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout);
    }
  }

  /**
   * Scroll event handler with RAF throttling
   */
  private onScroll(): void {
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
   * Updates SVG positions and slide visibility based on scroll position
   */
  private updateTransitions(): void {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const overallProgress = clamp(scrollY / maxScroll, 0, 1);

    this.updateProgressBar(overallProgress);

    const transitionProgress = overallProgress * this.totalTransitions;
    const activeTransitionIndex = Math.floor(transitionProgress);
    const withinTransitionProgress = transitionProgress - activeTransitionIndex;

    this.updateSvgPositions(activeTransitionIndex, withinTransitionProgress);
    this.updateSlideVisibility(
      overallProgress,
      activeTransitionIndex,
      withinTransitionProgress
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

  /**
   * Positions each SVG wrapper based on transition progress
   */
  private updateSvgPositions(
    activeIndex: number,
    withinProgress: number
  ): void {
    this.svgWrappers.forEach((wrapper, index) => {
      let translateX: number;

      if (index < activeIndex) {
        // This transition has passed - SVG is off-screen left
        translateX = -100;
      } else if (index > activeIndex) {
        // This transition hasn't started - SVG is off-screen right
        translateX = 100;
      } else {
        // This is the active transition - animate across screen
        // Start at 100vw (right), end at -100vw (left)
        const easedProgress = easeInOutCubic(withinProgress);
        translateX = 100 - easedProgress * 200;
      }

      wrapper.style.transform = `translateX(${translateX}vw)`;
    });
  }

  /**
   * Determines and updates which slide should be visible
   */
  private updateSlideVisibility(
    overallProgress: number,
    activeTransitionIndex: number,
    withinTransitionProgress: number
  ): void {
    const { leadingEdge, trailingEdge } = this.config;

    let newSlide: number | null;

    if (overallProgress === 0) {
      // At start, show first slide
      newSlide = 0;
    } else if (overallProgress >= 1) {
      // At end, show last slide
      newSlide = this.totalSlides - 1;
    } else if (withinTransitionProgress < leadingEdge) {
      // SVG hasn't covered center yet - show current slide
      newSlide = activeTransitionIndex;
    } else if (withinTransitionProgress > trailingEdge) {
      // SVG has passed center - show next slide
      newSlide = Math.min(activeTransitionIndex + 1, this.totalSlides - 1);
    } else {
      // SVG is covering center - hide all text
      newSlide = null;
    }

    // Update slide visibility if changed
    if (newSlide !== this.currentSlide) {
      if (this.currentSlide !== null) {
        this.slideContents[this.currentSlide]?.classList.remove('active');
      }
      if (newSlide !== null) {
        this.slideContents[newSlide]?.classList.add('active');
      }
      this.currentSlide = newSlide;
    }
  }
}

