import type { WaveTransitionConfig } from "../../types";
import { clamp, easeInOutCubic } from "../../utils/math";

/**
 * Handles scroll gravity behavior - automatically snaps to the nearest slide
 * center when the user stops scrolling
 */
export class ScrollGravity {
  private readonly config: WaveTransitionConfig;
  private readonly totalSlides: number;
  private readonly totalTransitions: number;

  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private animationFrameId: number | null = null;
  private isAnimating = false;

  // Animation state
  private animationStartTime = 0;
  private animationStartScroll = 0;
  private animationTargetScroll = 0;

  // Bound handler for user input detection
  private readonly handleUserInput: () => void;

  constructor(
    totalSlides: number,
    totalTransitions: number,
    config: WaveTransitionConfig
  ) {
    this.totalSlides = totalSlides;
    this.totalTransitions = totalTransitions;
    this.config = config;

    // Bind handler for user input detection
    this.handleUserInput = this.onUserInput.bind(this);
  }

  /**
   * Called on each scroll event - resets idle timer unless we're animating
   */
  onScroll(): void {
    // Ignore scroll events triggered by our own animation
    if (this.isAnimating) return;

    this.resetIdleTimer();
  }

  /**
   * Cleans up timers and animations
   */
  destroy(): void {
    this.cancelAnimation();
    this.removeInputListeners();
    if (this.idleTimeout !== null) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
  }

  /**
   * Resets the idle detection timer
   */
  private resetIdleTimer(): void {
    if (this.idleTimeout !== null) {
      clearTimeout(this.idleTimeout);
    }

    this.idleTimeout = setTimeout(() => {
      this.onScrollIdle();
    }, this.config.scrollIdleDelayMs);
  }

  /**
   * Called when scrolling has been idle for the configured delay
   */
  private onScrollIdle(): void {
    const scrollY = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    // Don't do anything if there's nowhere to scroll
    if (maxScroll <= 0) return;

    const currentProgress = clamp(scrollY / maxScroll, 0, 1);
    const targetProgress = this.findNearestSlideCenter(currentProgress);

    // Only animate if we're not already at the target
    const targetScroll = targetProgress * maxScroll;
    const distance = Math.abs(targetScroll - scrollY);

    // Use a small threshold to avoid micro-animations
    if (distance > 1) {
      this.animateToPosition(scrollY, targetScroll);
    }
  }

  /**
   * Finds the nearest slide center progress value
   *
   * Slide centers are at:
   * - Slide 0: progress = 0
   * - Slide N: progress = N / totalTransitions (after transition N-1)
   */
  private findNearestSlideCenter(currentProgress: number): number {
    // Generate all slide center positions
    const slideCenters: number[] = [];

    for (let i = 0; i < this.totalSlides; i++) {
      // Slide i is fully visible after transition i-1 completes
      // Transition size is 1/totalTransitions
      const center = i / this.totalTransitions;
      slideCenters.push(clamp(center, 0, 1));
    }

    // Find the nearest center
    let nearestCenter = slideCenters[0];
    let minDistance = Math.abs(currentProgress - nearestCenter);

    for (const center of slideCenters) {
      const distance = Math.abs(currentProgress - center);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCenter = center;
      }
    }

    return nearestCenter;
  }

  /**
   * Starts a smooth animation to the target scroll position
   */
  private animateToPosition(startScroll: number, targetScroll: number): void {
    this.isAnimating = true;
    this.animationStartTime = performance.now();
    this.animationStartScroll = startScroll;
    this.animationTargetScroll = targetScroll;

    // Listen for user input to allow interruption
    this.addInputListeners();

    this.animationStep();
  }

  /**
   * Animation frame step - updates scroll position with easing
   */
  private animationStep = (): void => {
    if (!this.isAnimating) return;

    const elapsed = performance.now() - this.animationStartTime;
    const duration = this.config.gravityAnimationDurationMs;
    const progress = clamp(elapsed / duration, 0, 1);
    const easedProgress = easeInOutCubic(progress);

    const currentScroll =
      this.animationStartScroll +
      (this.animationTargetScroll - this.animationStartScroll) * easedProgress;

    window.scrollTo(0, currentScroll);

    if (progress < 1) {
      this.animationFrameId = requestAnimationFrame(this.animationStep);
    } else {
      this.isAnimating = false;
      this.animationFrameId = null;
      this.removeInputListeners();
    }
  };

  /**
   * Cancels any in-progress animation
   */
  private cancelAnimation(): void {
    this.isAnimating = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.removeInputListeners();
  }

  /**
   * Handles user input events (wheel, touch, keyboard) during animation
   * Cancels animation to allow user to take control
   */
  private onUserInput(): void {
    if (this.isAnimating) {
      this.cancelAnimation();
    }
  }

  /**
   * Adds event listeners for user scroll input
   */
  private addInputListeners(): void {
    window.addEventListener("wheel", this.handleUserInput, { passive: true });
    window.addEventListener("touchstart", this.handleUserInput, {
      passive: true,
    });
    window.addEventListener("keydown", this.handleUserInput, { passive: true });
  }

  /**
   * Removes event listeners for user scroll input
   */
  private removeInputListeners(): void {
    window.removeEventListener("wheel", this.handleUserInput);
    window.removeEventListener("touchstart", this.handleUserInput);
    window.removeEventListener("keydown", this.handleUserInput);
  }
}
