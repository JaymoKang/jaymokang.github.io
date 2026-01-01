import type { WaveTransitionConfig } from '../../types';
import { WAVE_ANIMATION } from '../../constants';
import { clamp, easeInOutCubic } from '../../utils/math';

/**
 * Manages slide visibility and opacity during wave transitions
 * Calculates and applies opacity based on scroll position and wave position
 */
export class SlideVisibility {
  private readonly leadingEdge: number;
  private readonly trailingEdge: number;
  private readonly opacityTriggerVw: number;

  constructor(config: WaveTransitionConfig) {
    this.leadingEdge = config.leadingEdge;
    this.trailingEdge = config.trailingEdge;
    this.opacityTriggerVw = config.opacityTriggerVw;
  }

  /**
   * Updates visibility/opacity for all slides based on current transition state
   */
  updateVisibility(
    slideContents: NodeListOf<HTMLElement>,
    activeTransitionIndex: number,
    withinTransitionProgress: number,
    isInDwell: boolean,
    currentSlideIndex: number
  ): void {
    // Calculate the eased progress threshold at which the wave reaches the trigger position
    // Wave translateX = START_POSITION_VW - easedProgress * TRAVEL_DISTANCE_VW, so:
    // easedProgress = (START_POSITION_VW - opacityTriggerVw) / TRAVEL_DISTANCE_VW
    const triggerEasedProgress = (WAVE_ANIMATION.START_POSITION_VW - this.opacityTriggerVw) / WAVE_ANIMATION.TRAVEL_DISTANCE_VW;
    
    // Calculate current eased progress
    const easedProgress = easeInOutCubic(clamp(withinTransitionProgress, 0, 1));
    
    // Check if we've reached the trigger point
    const hasReachedTrigger = easedProgress >= triggerEasedProgress;

    // Calculate opacity for each slide
    slideContents.forEach((slide, index) => {
      const opacity = this.calculateSlideOpacity(
        index,
        activeTransitionIndex,
        withinTransitionProgress,
        isInDwell,
        currentSlideIndex,
        hasReachedTrigger,
        triggerEasedProgress
      );

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
    triggerEasedProgress: number
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
        triggerEasedProgress
      );
    }
    
    if (slideIndex === activeTransitionIndex + 1) {
      // This is the incoming slide (being revealed by waves)
      return this.calculateIncomingOpacity(
        withinTransitionProgress,
        hasReachedTrigger
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
    triggerEasedProgress: number
  ): number {
    // Delay fade until wave reaches trigger position
    if (!hasReachedTrigger) {
      return 1;
    }
    
    if (withinTransitionProgress >= this.leadingEdge) {
      return 0;
    }
    
    // Remap: fade from 1 → 0 between trigger point and leadingEdge
    const fadeStart = this.easedProgressToRaw(triggerEasedProgress);
    const fadeRange = this.leadingEdge - fadeStart;
    
    if (fadeRange <= 0) {
      return 0;
    }
    
    return 1 - ((withinTransitionProgress - fadeStart) / fadeRange);
  }

  /**
   * Calculates opacity for the incoming (destination) slide
   */
  private calculateIncomingOpacity(
    withinTransitionProgress: number,
    hasReachedTrigger: boolean
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

  /**
   * Approximate inverse of easeInOutCubic for the first half of the curve
   * Used to convert an eased progress value back to raw progress
   */
  private easedProgressToRaw(easedProgress: number): number {
    if (easedProgress <= 0) return 0;
    if (easedProgress >= 1) return 1;
    
    // For easeInOutCubic, first half: y = 4x³
    // Inverse: x = (y/4)^(1/3)
    if (easedProgress < 0.5) {
      return Math.pow(easedProgress / 4, 1 / 3);
    }
    
    // Second half: y = 1 - ((-2x + 2)³) / 2
    // Inverse is more complex, use approximation via binary search
    let low = 0.5;
    let high = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      const eased = easeInOutCubic(mid);
      if (eased < easedProgress) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return (low + high) / 2;
  }
}

