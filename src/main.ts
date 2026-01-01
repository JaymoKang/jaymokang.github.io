/**
 * Personal Website - Wave Transition System
 * Entry point that initializes the wave transition controller
 */

import { WaveTransitionController } from './transitions/wipe';
import type { WaveTransitionElements } from './types';

/**
 * Queries the DOM for required transition elements
 */
function getTransitionElements(): WaveTransitionElements {
  return {
    slideContents: document.querySelectorAll<HTMLElement>('.slide-content'),
    waveTransitions: document.querySelectorAll<HTMLElement>('.wave-transition'),
    progressFill: document.querySelector<HTMLElement>('.progress-fill'),
  };
}

/**
 * Initializes the wave transition system
 */
function init(): void {
  const elements = getTransitionElements();
  const controller = new WaveTransitionController(elements);
  controller.init();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
