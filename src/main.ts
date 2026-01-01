/**
 * Personal Website - Scroll-based SVG Animations
 * Animates nature-themed SVGs from right to left as user scrolls
 */

interface TransitionConfig {
  element: HTMLElement;
  svg: HTMLImageElement;
  start: number;
  end: number;
}

/**
 * Calculates the scroll progress within a specific range
 * @returns A value between 0 and 1
 */
function getScrollProgress(scrollY: number, start: number, end: number): number {
  if (scrollY <= start) return 0;
  if (scrollY >= end) return 1;
  return (scrollY - start) / (end - start);
}

/**
 * Applies easing function for smoother animation
 * Uses ease-out cubic for natural deceleration
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Updates the transform of an SVG based on scroll progress
 * Moves from translateX(100vw) to translateX(-100vw)
 */
function updateSvgTransform(svg: HTMLImageElement, progress: number): void {
  const easedProgress = easeOutCubic(progress);
  // Start at 100vw (off-screen right), end at -100vw (off-screen left)
  const translateX = 100 - (easedProgress * 200);
  svg.style.transform = `translateX(${translateX}vw)`;
}

/**
 * Sets up scroll-based animations for transition zones
 */
function initScrollAnimations(): void {
  const transitionZones = document.querySelectorAll<HTMLElement>('.transition-zone');
  const transitions: TransitionConfig[] = [];

  transitionZones.forEach((zone) => {
    const svg = zone.querySelector<HTMLImageElement>('.transition-svg');
    if (!svg) return;

    // Calculate the scroll range for this transition
    const rect = zone.getBoundingClientRect();
    const scrollTop = window.scrollY;
    
    // Start animation when zone enters viewport, end when it leaves
    const start = scrollTop + rect.top - window.innerHeight;
    const end = scrollTop + rect.bottom;

    transitions.push({
      element: zone,
      svg,
      start,
      end,
    });
  });

  // Scroll handler with requestAnimationFrame for performance
  let ticking = false;

  function onScroll(): void {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        transitions.forEach((config) => {
          const progress = getScrollProgress(scrollY, config.start, config.end);
          updateSvgTransform(config.svg, progress);
        });

        ticking = false;
      });
      ticking = true;
    }
  }

  // Initial update
  onScroll();

  // Listen for scroll events
  window.addEventListener('scroll', onScroll, { passive: true });

  // Recalculate positions on resize
  window.addEventListener('resize', () => {
    // Debounce resize handling
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      // Recalculate transition positions
      transitions.length = 0;
      
      transitionZones.forEach((zone) => {
        const svg = zone.querySelector<HTMLImageElement>('.transition-svg');
        if (!svg) return;

        const rect = zone.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const start = scrollTop + rect.top - window.innerHeight;
        const end = scrollTop + rect.bottom;

        transitions.push({
          element: zone,
          svg,
          start,
          end,
        });
      });

      onScroll();
    }, 100);
  });
}

let resizeTimeout: number;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}

