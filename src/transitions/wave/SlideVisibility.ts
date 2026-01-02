import type { WaveTransitionConfig } from "../../types";
import { inverseEaseInOutCubic } from "../../utils/math";

/**
 * Manages slide visibility and opacity during wave transitions
 * Calculates and applies opacity based on scroll position and wave position
 */
export class SlideVisibility {
  private readonly leadingEdge: number;
  private readonly trailingEdge: number;
  /** The eased progress value at which opacity transitions begin */
  private readonly triggerEasedProgress: number;

  constructor(config: WaveTransitionConfig, triggerEasedProgress: number) {
    this.leadingEdge = config.leadingEdge;
    this.trailingEdge = config.trailingEdge;
    this.triggerEasedProgress = triggerEasedProgress;
  }

  /**
   * Updates visibility/opacity for all slides based on current transition state
   * @param hasReachedTrigger - Whether the wave has reached the opacity trigger position (from WavePositioner)
   */
  updateVisibility(
    slideContents: NodeListOf<HTMLElement>,
    activeTransitionIndex: number,
    withinTransitionProgress: number,
    isInDwell: boolean,
    currentSlideIndex: number,
    hasReachedTrigger: boolean,
  ): void {
    // Calculate opacity for each slide
    slideContents.forEach((slide, index) => {
      const opacity = this.calculateSlideOpacity(
        index,
        activeTransitionIndex,
        withinTransitionProgress,
        isInDwell,
        currentSlideIndex,
        hasReachedTrigger,
      );

      // Apply opacity directly
      slide.style.opacity = String(opacity);

      // Toggle pointer-events based on visibility
      if (opacity > 0) {
        slide.classList.add("visible");
      } else {
        slide.classList.remove("visible");
      }
    });
  }

  /**
   * Calculates opacity for a single slide
   */
  private calculateSlideOpacity(
    slideIndex: number,
    activeTransitionIndex: number,
    withinTransitionProgress: number,
    isInDwell: boolean,
    currentSlideIndex: number,
    hasReachedTrigger: boolean,
  ): number {
    if (isInDwell) {
      // In a dwell zone - only the current slide is visible
      return slideIndex === currentSlideIndex ? 1 : 0;
    }

    if (slideIndex === activeTransitionIndex) {
      // This is the outgoing slide (being covered by waves)
      return this.calculateOutgoingOpacity(
        withinTransitionProgress,
        hasReachedTrigger,
      );
    }

    if (slideIndex === activeTransitionIndex + 1) {
      // This is the incoming slide (being revealed by waves)
      return this.calculateIncomingOpacity(
        withinTransitionProgress,
        hasReachedTrigger,
      );
    }

    // All other slides are hidden
    return 0;
  }

  /**
   * Calculates opacity for the outgoing (source) slide
   */
  private calculateOutgoingOpacity(
    withinTransitionProgress: number,
    hasReachedTrigger: boolean,
  ): number {
    // Delay fade until wave reaches trigger position
    if (!hasReachedTrigger) {
      return 1;
    }

    if (withinTransitionProgress >= this.leadingEdge) {
      return 0;
    }

    // Remap: fade from 1 → 0 between trigger point and leadingEdge
    const fadeStart = inverseEaseInOutCubic(this.triggerEasedProgress);
    const fadeRange = this.leadingEdge - fadeStart;

    if (fadeRange <= 0) {
      return 0;
    }

    return 1 - (withinTransitionProgress - fadeStart) / fadeRange;
  }

  /**
   * Calculates opacity for the incoming (destination) slide
   */
  private calculateIncomingOpacity(
    withinTransitionProgress: number,
    hasReachedTrigger: boolean,
  ): number {
    // Delay fade until wave reaches trigger position
    if (!hasReachedTrigger) {
      return 0;
    }

    if (withinTransitionProgress <= this.trailingEdge) {
      return 0;
    }

    if (withinTransitionProgress >= 1) {
      return 1;
    }

    // Linear fade: 0 at trailingEdge, 1 at 100%
    const fadeRange = 1 - this.trailingEdge;
    return (withinTransitionProgress - this.trailingEdge) / fadeRange;
  }
}
