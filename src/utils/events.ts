/**
 * Event listener management utilities
 * Simplifies adding and removing multiple event listeners
 */

/**
 * Specification for a window event listener
 */
export interface EventListenerSpec {
  type: keyof WindowEventMap;
  handler: EventListener;
}

/**
 * Adds multiple event listeners to the window
 * Returns a cleanup function to remove all listeners
 */
export function addWindowListeners(
  specs: EventListenerSpec[],
  options?: AddEventListenerOptions,
): () => void {
  for (const { type, handler } of specs) {
    window.addEventListener(type, handler, options);
  }

  return () => {
    for (const { type, handler } of specs) {
      window.removeEventListener(type, handler);
    }
  };
}
