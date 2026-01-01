/**
 * Personal Website - SVG Wipe Transition System
 * Fixed text content with scrolling SVG wipe transitions
 */

interface TransitionState {
  wrapper: HTMLElement;
  index: number;
  progress: number;
}

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Easing function for smooth animation
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Main wipe transition controller
 */
function initWipeTransitions(): void {
  const slideContents = document.querySelectorAll<HTMLElement>('.slide-content');
  const svgWrappers = document.querySelectorAll<HTMLElement>('.transition-svg-wrapper');
  const progressFill = document.querySelector<HTMLElement>('.progress-fill');

  if (slideContents.length === 0) {
    console.error('No slide content found');
    return;
  }

  const totalSlides = slideContents.length;
  const totalTransitions = svgWrappers.length;
  
  // Each transition takes up 1 "unit" of scroll
  // We need space for all transitions
  const scrollUnits = totalTransitions;
  
  // Get scroll limits
  const docHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const maxScroll = docHeight - viewportHeight;

  // Current state
  let currentSlide = 0;
  let ticking = false;

  // Initialize first slide as visible
  slideContents[0]?.classList.add('active');

  /**
   * Determines which slide should be visible based on scroll
   * and positions SVG transitions accordingly
   */
  function updateTransitions(): void {
    const scrollY = window.scrollY;
    const overallProgress = clamp(scrollY / maxScroll, 0, 1);
    
    // Update progress bar
    if (progressFill) {
      progressFill.style.width = `${overallProgress * 100}%`;
    }

    // Calculate which transition we're in
    // Progress 0 -> 0.5 = transition 0, 0.5 -> 1 = transition 1
    const transitionProgress = overallProgress * scrollUnits;
    const activeTransitionIndex = Math.floor(transitionProgress);
    const withinTransitionProgress = transitionProgress - activeTransitionIndex;

    // Update each SVG wrapper position
    svgWrappers.forEach((wrapper, index) => {
      let translateX: number;

      if (index < activeTransitionIndex) {
        // This transition has passed - SVG is off-screen left
        translateX = -100;
      } else if (index > activeTransitionIndex) {
        // This transition hasn't started - SVG is off-screen right
        translateX = 100;
      } else {
        // This is the active transition - animate across screen
        // Start at 100vw (right), end at -100vw (left)
        const easedProgress = easeInOutCubic(withinTransitionProgress);
        translateX = 100 - (easedProgress * 200);
      }

      wrapper.style.transform = `translateX(${translateX}vw)`;
    });

    // Determine which slide should be visible
    // Slide switches when SVG passes the center (50% of transition)
    let newSlide: number;
    
    if (overallProgress === 0) {
      newSlide = 0;
    } else if (overallProgress >= 1) {
      newSlide = totalSlides - 1;
    } else {
      // Switch happens at midpoint of each transition
      const switchThreshold = withinTransitionProgress >= 0.5 ? 1 : 0;
      newSlide = Math.min(activeTransitionIndex + switchThreshold, totalSlides - 1);
    }

    // Update slide visibility if changed
    if (newSlide !== currentSlide) {
      slideContents[currentSlide]?.classList.remove('active');
      slideContents[newSlide]?.classList.add('active');
      currentSlide = newSlide;
    }

    ticking = false;
  }

  /**
   * Scroll event handler with RAF throttling
   */
  function onScroll(): void {
    if (!ticking) {
      requestAnimationFrame(updateTransitions);
      ticking = true;
    }
  }

  // Initial update
  updateTransitions();

  // Listen for scroll
  window.addEventListener('scroll', onScroll, { passive: true });

  // Handle resize
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      updateTransitions();
    }, 100);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWipeTransitions);
} else {
  initWipeTransitions();
}
