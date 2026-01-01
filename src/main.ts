/**
 * Personal Website - SVG Wipe Transition System
 * Entry point that initializes the wipe transition controller
 */

import { WipeTransitionController } from './transitions/wipe';
import type { WipeTransitionElements } from './types';

/**
 * Queries the DOM for required transition elements
 */
function getTransitionElements(): WipeTransitionElements {
  return {
    slideContents: document.querySelectorAll<HTMLElement>('.slide-content'),
    svgWrappers: document.querySelectorAll<HTMLElement>('.transition-svg-wrapper'),
    progressFill: document.querySelector<HTMLElement>('.progress-fill'),
  };
}

/**
 * Initializes the wipe transition system
 */
function init(): void {
  const elements = getTransitionElements();
  const controller = new WipeTransitionController(elements);
  controller.init();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
