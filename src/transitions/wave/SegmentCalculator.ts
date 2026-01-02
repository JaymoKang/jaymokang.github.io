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

  constructor(totalSlides: number, totalTransitions: number) {
    this.totalSlides = totalSlides;
    this.totalTransitions = totalTransitions;
    this.slideLayout = new SlideLayout(totalSlides, totalTransitions);
  }

  /**
   * Calculates which segment (dwell or transition) we're in based on scroll progress
   *
   * Layout: [dwell0][trans0][dwell1][trans1][dwell2]
   * With 3 slides and 2 transitions, we have 5 segments total
   */
  calculate(overallProgress: number): SegmentInfo {
    const singleTransitionSize = this.slideLayout.getTransitionSize();

    // Find which segment we're in
    let position = 0;

    for (let i = 0; i < this.totalSlides; i++) {
      // Check if in dwell for slide i
      const dwellEnd = position;
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
    }

    // At the very end - last slide dwell
    return {
      isInDwell: true,
      currentSlideIndex: this.totalSlides - 1,
      activeTransitionIndex: this.totalTransitions - 1,
      withinTransitionProgress: 1,
    };
  }
}
