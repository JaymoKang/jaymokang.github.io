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

    // Initial update (sets opacity based on scroll position)
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
   * Accounts for dwell zones between transitions
   */
  private updateTransitions(): void {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const overallProgress = clamp(scrollY / maxScroll, 0, 1);

    this.updateProgressBar(overallProgress);

    // Calculate segment info accounting for dwell zones
    const segmentInfo = this.calculateSegmentInfo(overallProgress);

    this.updateSvgPositions(segmentInfo.activeTransitionIndex, segmentInfo.withinTransitionProgress);
    this.updateSlideVisibility(
      overallProgress,
      segmentInfo.activeTransitionIndex,
      segmentInfo.withinTransitionProgress,
      segmentInfo.isInDwell,
      segmentInfo.currentSlideIndex
    );

    this.ticking = false;
  }

  /**
   * Calculates which segment (dwell or transition) we're in based on scroll progress
   * 
   * Layout: [dwell0][trans0][dwell1][trans1][dwell2]
   * With 3 slides and 2 transitions, we have 5 segments total
   */
  private calculateSegmentInfo(overallProgress: number): {
    isInDwell: boolean;
    currentSlideIndex: number;
    activeTransitionIndex: number;
    withinTransitionProgress: number;
  } {
    const { dwellRatio } = this.config;
    
    // Total segments: slides (dwells) + transitions
    // Pattern: dwell, trans, dwell, trans, dwell... 
    // For 3 slides: dwell0, trans0, dwell1, trans1, dwell2 = 5 segments
    const totalSegments = this.totalSlides + this.totalTransitions;
    
    // Calculate the size of each segment type
    // dwellRatio determines what fraction of total scroll is dwell vs transition
    const totalDwellRatio = dwellRatio * this.totalSlides;
    const totalTransitionRatio = (1 - dwellRatio) * this.totalSlides;
    
    // Normalize: each dwell and transition segment size
    const dwellSize = totalDwellRatio / totalSegments;
    const transitionSize = totalTransitionRatio / totalSegments;
    
    // Simplified: divide equally but scale by ratio
    const singleDwellSize = dwellRatio / this.totalSlides;
    const singleTransitionSize = (1 - dwellRatio) / this.totalTransitions;
    
    // Find which segment we're in
    let position = 0;
    
    for (let i = 0; i < this.totalSlides; i++) {
      // Check if in dwell for slide i
      const dwellEnd = position + singleDwellSize;
      if (overallProgress < dwellEnd) {
        return {
          isInDwell: true,
          currentSlideIndex: i,
          activeTransitionIndex: i - 1, // No active transition
          withinTransitionProgress: 0,
        };
      }
      position = dwellEnd;
      
      // Check if in transition i (if there is one)
      if (i < this.totalTransitions) {
        const transitionEnd = position + singleTransitionSize;
        if (overallProgress < transitionEnd) {
          const withinProgress = (overallProgress - position) / singleTransitionSize;
          return {
            isInDwell: false,
            currentSlideIndex: i,
            activeTransitionIndex: i,
            withinTransitionProgress: withinProgress,
          };
        }
        position = transitionEnd;
      }
    }
    
    // At the very end - last slide dwell
    return {
      isInDwell: true,
      currentSlideIndex: this.totalSlides - 1,
      activeTransitionIndex: this.totalTransitions - 1,
      withinTransitionProgress: 1,
    };
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
      } else if (index > activeIndex || activeIndex < 0) {
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
   * Calculates and applies opacity for all slides based on scroll position
   * Opacity is directly tied to scroll, no CSS transitions
   */
  private updateSlideVisibility(
    overallProgress: number,
    activeTransitionIndex: number,
    withinTransitionProgress: number,
    isInDwell: boolean,
    currentSlideIndex: number
  ): void {
    const { leadingEdge, trailingEdge } = this.config;

    // Calculate opacity for each slide
    this.slideContents.forEach((slide, index) => {
      let opacity: number;

      if (isInDwell) {
        // In a dwell zone - only the current slide is visible
        opacity = index === currentSlideIndex ? 1 : 0;
      } else if (index === activeTransitionIndex) {
        // This is the outgoing slide (being covered by SVG)
        // Fade from 1 → 0 as progress goes from 0 → leadingEdge
        if (withinTransitionProgress <= 0) {
          opacity = 1;
        } else if (withinTransitionProgress >= leadingEdge) {
          opacity = 0;
        } else {
          // Linear fade: 1 at 0%, 0 at leadingEdge
          opacity = 1 - (withinTransitionProgress / leadingEdge);
        }
      } else if (index === activeTransitionIndex + 1) {
        // This is the incoming slide (being revealed by SVG)
        // Fade from 0 → 1 as progress goes from trailingEdge → 1
        if (withinTransitionProgress <= trailingEdge) {
          opacity = 0;
        } else if (withinTransitionProgress >= 1) {
          opacity = 1;
        } else {
          // Linear fade: 0 at trailingEdge, 1 at 100%
          const fadeRange = 1 - trailingEdge;
          opacity = (withinTransitionProgress - trailingEdge) / fadeRange;
        }
      } else {
        // All other slides are hidden
        opacity = 0;
      }

      // Apply opacity directly
      slide.style.opacity = String(opacity);

      // Toggle pointer-events based on visibility
      if (opacity > 0) {
        slide.classList.add('visible');
      } else {
        slide.classList.remove('visible');
      }
    });
  }
}

