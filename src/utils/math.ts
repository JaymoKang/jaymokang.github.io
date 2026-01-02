/** Number of binary search iterations for inverse easing approximation */
const BINARY_SEARCH_ITERATIONS = 20;

/**
 * Clamps a value between min and max bounds
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns the maximum scrollable distance in pixels
 */
export function getMaxScroll(): number {
  return document.documentElement.scrollHeight - window.innerHeight;
}

/**
 * Cubic easing function for smooth animation
 * Creates an ease-in-out effect with acceleration at the start and deceleration at the end
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Approximate inverse of easeInOutCubic
 * Converts an eased progress value back to raw progress
 *
 * For the first half: uses analytical inverse x = (y/4)^(1/3)
 * For the second half: uses binary search approximation
 */
export function inverseEaseInOutCubic(easedProgress: number): number {
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
  for (let i = 0; i < BINARY_SEARCH_ITERATIONS; i++) {
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
