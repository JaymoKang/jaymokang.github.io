import { clamp } from "../../utils/math";

/**
 * Utility for calculating slide positions and layout
 * Shared by ScrollGravity and SegmentCalculator to ensure consistent calculations
 */
export class SlideLayout {
  private readonly totalSlides: number;
  private readonly totalTransitions: number;
  private readonly transitionSize: number;

  constructor(totalSlides: number, totalTransitions: number) {
    this.totalSlides = totalSlides;
    this.totalTransitions = totalTransitions;
    this.transitionSize = totalTransitions > 0 ? 1 / totalTransitions : 1;
  }

  /**
   * Gets the size of a single transition as a fraction of total progress (0-1)
   */
  getTransitionSize(): number {
    return this.transitionSize;
  }

  /**
   * Gets the center progress value for a given slide index
   * Slide i is centered after transition i-1 completes
   */
  getSlideCenterProgress(slideIndex: number): number {
    const center = slideIndex / this.totalTransitions;
    return clamp(center, 0, 1);
  }

  /**
   * Gets all slide center progress values
   */
  getAllSlideCenters(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) =>
      this.getSlideCenterProgress(i),
    );
  }

  /**
   * Finds the nearest slide center to a given progress value
   */
  findSlideToSlideTowards(currentProgress: number, bias: number): number {
    const slideCenters = this.getAllSlideCenters();

    let nearestCenter: number = 0;
    let minDistance = Infinity;

    for (const center of slideCenters) {
      const distance = Math.abs(currentProgress - center + bias);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCenter = center;
      }
    }

    return nearestCenter;
  }
}
