import type { SegmentInfo } from "../../types";
import { SlideLayout } from "./SlideLayout";

/**
 * Calculates scroll segment information for wave transitions
 * Determines whether we're in a dwell zone or transition based on scroll progress
 */
export class SegmentCalculator {
  private readonly totalSlides: number;
  private readonly totalTransitions: number;
  private readonly slideLayout: SlideLayout;

  constructor(slideLayout: SlideLayout) {
    this.slideLayout = slideLayout;
    this.totalSlides = slideLayout.getTotalSlides();
    this.totalTransitions = slideLayout.getTotalTransitions();
  }

  /**
   * Calculates which segment (dwell or transition) we're in based on scroll progress
   *
   * Layout: [trans0][trans1]...[transN]
   * With 3 slides and 2 transitions, progress maps to transitions:
   * - [0, 0.5): transition 0 (slide 0 → 1)
   * - [0.5, 1): transition 1 (slide 1 → 2)
   * - 1.0: complete (on final slide)
   *
   * Visual "dwell" on slides is achieved at transition boundaries
   * (withinTransitionProgress = 0 or 1)
   */
  calculate(overallProgress: number): SegmentInfo {
    const singleTransitionSize = this.slideLayout.getTransitionSize();

    // Find which transition we're in
    let position = 0;

    for (let i = 0; i < this.totalTransitions; i++) {
      const transitionEnd = position + singleTransitionSize;

      if (overallProgress < transitionEnd) {
        const withinProgress =
          (overallProgress - position) / singleTransitionSize;
        return {
          isInDwell: false,
          currentSlideIndex: i,
          activeTransitionIndex: i,
          withinTransitionProgress: withinProgress,
        };
      }

      position = transitionEnd;
    }

    // At the very end - on final slide
    return {
      isInDwell: true,
      currentSlideIndex: this.totalSlides - 1,
      activeTransitionIndex: this.totalTransitions - 1,
      withinTransitionProgress: 1,
    };
  }
}
