import type { WaveTransitionConfig } from "../../types";
import { SCROLL_GRAVITY } from "../../constants";
import {
  addWindowListeners,
  removeWindowListeners,
  type EventListenerSpec,
} from "../../utils/events";
import { clamp, easeInOutCubic } from "../../utils/math";
import { SlideLayout } from "./SlideLayout";

/**
 * Gravity state machine types
 * Uses discriminated unions to make state transitions explicit
 */
type GravityState =
  | { type: "idle" }
  | { type: "waiting"; timeoutId: ReturnType<typeof setTimeout> }
  | {
      type: "animating";
      frameId: number | null;
      startTime: number;
      startScroll: number;
      targetScroll: number;
    };

/**
 * Handles scroll gravity behavior - automatically snaps to the nearest slide
 * center when the user stops scrolling
 */
export class ScrollGravity {
  private readonly config: WaveTransitionConfig;
  private readonly slideLayout: SlideLayout;

  // State machine for gravity behavior
  private state: GravityState = { type: "idle" };

  // Track if user is actively touching (prevents gravity during interaction)
  private isUserTouching = false;

  // Bound handler for user input detection
  private readonly handleUserInput: () => void;

  // Bound handlers for touch/mouse state tracking
  private readonly handleTouchStart: () => void;
  private readonly handleTouchEnd: () => void;

  // Event listener specifications for easier management
  private readonly touchStateListeners: EventListenerSpec[];
  private readonly inputListeners: EventListenerSpec[];

  constructor(
    totalSlides: number,
    totalTransitions: number,
    config: WaveTransitionConfig
  ) {
    this.config = config;
    this.slideLayout = new SlideLayout(totalSlides, totalTransitions);

    // Bind handler for user input detection
    this.handleUserInput = this.onUserInput.bind(this);

    // Bind handlers for touch/mouse state tracking
    this.handleTouchStart = () => {
      this.isUserTouching = true;
    };
    this.handleTouchEnd = () => {
      this.isUserTouching = false;
    };

    // Define event listener specifications
    this.touchStateListeners = [
      { type: "touchstart", handler: this.handleTouchStart },
      { type: "touchend", handler: this.handleTouchEnd },
      { type: "touchcancel", handler: this.handleTouchEnd },
      { type: "mousedown", handler: this.handleTouchStart },
      { type: "mouseup", handler: this.handleTouchEnd },
    ];

    this.inputListeners = [
      { type: "wheel", handler: this.handleUserInput },
      { type: "touchstart", handler: this.handleUserInput },
      { type: "keydown", handler: this.handleUserInput },
    ];
  }

  /**
   * Initializes touch/mouse state tracking listeners
   */
  init(): void {
    addWindowListeners(this.touchStateListeners, { passive: true });
  }

  /**
   * Called on each scroll event - resets idle timer unless we're animating
   */
  onScroll(): void {
    // Ignore scroll events triggered by our own animation
    if (this.state.type === "animating") return;

    this.transitionToWaiting();
  }

  /**
   * Cleans up timers and animations
   */
  destroy(): void {
    this.transitionToIdle();
    removeWindowListeners(this.touchStateListeners);
  }

  /**
   * Transitions to waiting state, starting the idle timer
   */
  private transitionToWaiting(): void {
    // Clean up any existing state first
    if (this.state.type === "waiting") {
      clearTimeout(this.state.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      this.onScrollIdle();
    }, this.config.scrollIdleDelayMs);

    this.state = { type: "waiting", timeoutId };
  }

  /**
   * Transitions to idle state, cleaning up any active timers or animations
   */
  private transitionToIdle(): void {
    switch (this.state.type) {
      case "waiting":
        clearTimeout(this.state.timeoutId);
        break;
      case "animating":
        if (this.state.frameId !== null) {
          cancelAnimationFrame(this.state.frameId);
        }
        removeWindowListeners(this.inputListeners);
        break;
    }
    this.state = { type: "idle" };
  }

  /**
   * Called when scrolling has been idle for the configured delay
   */
  private onScrollIdle(): void {
    // Don't trigger gravity while user is actively touching/clicking
    if (this.isUserTouching) {
      this.state = { type: "idle" };
      return;
    }

    const scrollY = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    // Don't do anything if there's nowhere to scroll
    if (maxScroll <= 0) {
      this.state = { type: "idle" };
      return;
    }

    const currentProgress = clamp(scrollY / maxScroll, 0, 1);
    const targetProgress =
      this.slideLayout.findSlideToSlideTowards(currentProgress, this.config.transitionBias);

    // Only animate if we're not already at the target
    const targetScroll = targetProgress * maxScroll;
    const distance = Math.abs(targetScroll - scrollY);

    // Use a small threshold to avoid micro-animations
    if (distance > SCROLL_GRAVITY.MIN_SNAP_DISTANCE_PX) {
      this.transitionToAnimating(scrollY, targetScroll);
    } else {
      this.state = { type: "idle" };
    }
  }

  /**
   * Transitions to animating state
   */
  private transitionToAnimating(
    startScroll: number,
    targetScroll: number
  ): void {
    this.state = {
      type: "animating",
      frameId: null,
      startTime: performance.now(),
      startScroll,
      targetScroll,
    };

    // Listen for user input to allow interruption
    addWindowListeners(this.inputListeners, { passive: true });

    this.animationStep();
  }

  /**
   * Animation frame step - updates scroll position with easing
   */
  private animationStep = (): void => {
    if (this.state.type !== "animating") return;

    const { startTime, startScroll, targetScroll } = this.state;
    const elapsed = performance.now() - startTime;
    const duration = this.config.gravityAnimationDurationMs;
    const progress = clamp(elapsed / duration, 0, 1);
    const easedProgress = easeInOutCubic(progress);

    const currentScroll =
      startScroll + (targetScroll - startScroll) * easedProgress;

    window.scrollTo(0, currentScroll);

    if (progress < 1) {
      this.state = {
        ...this.state,
        frameId: requestAnimationFrame(this.animationStep),
      };
    } else {
      removeWindowListeners(this.inputListeners);
      this.state = { type: "idle" };
    }
  };

  /**
   * Handles user input events (wheel, touch, keyboard) during animation
   * Cancels animation to allow user to take control
   */
  private onUserInput(): void {
    if (this.state.type === "animating") {
      this.transitionToIdle();
    }
  }
}
