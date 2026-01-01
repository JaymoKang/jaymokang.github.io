import type { WaveTransitionConfig, WaveConfig } from '../../types';
import { WAVE_ANIMATION } from '../../constants';
import { clamp, easeInOutCubic } from '../../utils/math';

/**
 * Handles positioning of wave elements during transitions
 * Manages horizontal translation, vertical undulation, and scale
 */
export class WavePositioner {
  private readonly waves: WaveConfig[];
  private readonly undulationAmplitude: number;
  private readonly undulationFrequency: number;

  constructor(config: WaveTransitionConfig) {
    this.waves = config.waves;
    this.undulationAmplitude = config.undulationAmplitude;
    this.undulationFrequency = config.undulationFrequency;
  }

  /**
   * Updates the position and style of all wave elements
   */
  updatePositions(
    waveTransitions: NodeListOf<HTMLElement>,
    activeIndex: number,
    withinProgress: number
  ): void {
    waveTransitions.forEach((transition, transitionIndex) => {
      const waveElements = transition.querySelectorAll<HTMLElement>('.wave');

      waveElements.forEach((wave, waveIndex) => {
        const waveConfig = this.waves[waveIndex] || this.waves[this.waves.length - 1];
        
        let translateX: number;
        let translateY: number;

        let dynamicScale: number;
        let dynamicOpacity: number;

        if (transitionIndex < activeIndex) {
          // This transition has passed - waves are off-screen left
          translateX = WAVE_ANIMATION.END_POSITION_VW;
          translateY = 0;
          dynamicScale = waveConfig.scale * WAVE_ANIMATION.END_SCALE_FACTOR;
          dynamicOpacity = 0;
        } else if (transitionIndex > activeIndex || activeIndex < 0) {
          // This transition hasn't started - waves are off-screen right
          translateX = WAVE_ANIMATION.START_POSITION_VW;
          translateY = 0;
          dynamicScale = waveConfig.scale * WAVE_ANIMATION.START_SCALE_FACTOR;
          dynamicOpacity = waveConfig.opacity;
        } else {
          // This is the active transition - animate waves across screen
          // Apply stagger to each wave's progress
          const staggeredProgress = clamp(
            (withinProgress - waveConfig.stagger) / (1 - waveConfig.stagger),
            0,
            1
          );
          
          const easedProgress = easeInOutCubic(staggeredProgress);
          
          // Horizontal: Start at START_POSITION_VW (right), end at END_POSITION_VW (left)
          translateX = WAVE_ANIMATION.START_POSITION_VW - easedProgress * WAVE_ANIMATION.TRAVEL_DISTANCE_VW;
          
          // Vertical undulation using sine wave
          const undulationPhase = staggeredProgress * Math.PI * 2 * this.undulationFrequency + waveConfig.phaseOffset;
          translateY = Math.sin(undulationPhase) * this.undulationAmplitude;

          // Dynamic scale: lerp from START_SCALE_FACTOR to END_SCALE_FACTOR
          const scaleFactor = WAVE_ANIMATION.START_SCALE_FACTOR + 
            staggeredProgress * (WAVE_ANIMATION.END_SCALE_FACTOR - WAVE_ANIMATION.START_SCALE_FACTOR);
          dynamicScale = waveConfig.scale * scaleFactor;

          // Dynamic opacity: stay at full until OPACITY_FADE_START, then lerp to 0
          if (staggeredProgress < WAVE_ANIMATION.OPACITY_FADE_START) {
            dynamicOpacity = waveConfig.opacity;
          } else {
            const fadeProgress = (staggeredProgress - WAVE_ANIMATION.OPACITY_FADE_START) / 
              (1 - WAVE_ANIMATION.OPACITY_FADE_START);
            dynamicOpacity = waveConfig.opacity * (1 - fadeProgress);
          }
        }

        // Apply transform with dynamic scale
        wave.style.transform = `translateX(${translateX}vw) translateY(${translateY}vh) scale(${dynamicScale})`;
        wave.style.opacity = String(dynamicOpacity);
        wave.style.top = `${waveConfig.topOffset}%`;
      });
    });
  }
}

