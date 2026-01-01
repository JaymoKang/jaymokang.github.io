/**
 * Personal Website - Wave Transition System
 * Entry point that initializes the wave transition controller
 */

import { WaveTransitionController } from './transitions/wave';
import type { WaveTransitionElements } from './types';

/**
 * Queries the DOM for required transition elements
 * Returns null if required elements are missing
 */
function getTransitionElements(): WaveTransitionElements | null {
  const slideContents = document.querySelectorAll<HTMLElement>('.slide-content');
  const waveTransitions = document.querySelectorAll<HTMLElement>('.wave-transition');
  const progressFill = document.querySelector<HTMLElement>('.progress-fill');

  // Validate required elements
  if (slideContents.length === 0) {
    console.error('WaveTransition: No .slide-content elements found');
    return null;
  }

  if (waveTransitions.length === 0) {
    console.error('WaveTransition: No .wave-transition elements found');
    return null;
  }

  if (waveTransitions.length !== slideContents.length - 1) {
    console.warn(
      `WaveTransition: Expected ${slideContents.length - 1} .wave-transition elements ` +
      `for ${slideContents.length} slides, found ${waveTransitions.length}`
    );
  }

  return { slideContents, waveTransitions, progressFill };
}

/**
 * Initializes the wave transition system
 */
function init(): void {
  const elements = getTransitionElements();
  
  if (!elements) {
    console.error('WaveTransition: Initialization aborted due to missing elements');
    return;
  }

  const controller = new WaveTransitionController(elements);
  controller.init();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
