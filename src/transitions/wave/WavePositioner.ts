import type { WaveTransitionConfig, WaveConfig } from "../../types";
import { WAVE_ANIMATION } from "../../constants";
import { clamp, easeInOutCubic } from "../../utils/math";

/**
 * Handles positioning of wave elements during transitions
 * Manages horizontal translation, vertical undulation, and scale
 */
export class WavePositioner {
  private readonly waves: WaveConfig[];
  private readonly undulationAmplitude: number;
  private readonly undulationFrequency: number;

  // Stored reference to wave transition containers
  private waveTransitions: NodeListOf<HTMLElement> | null = null;
  // Cached wave elements per transition (avoids DOM queries on every frame)
  private cachedWaveElements: HTMLElement[][] = [];

  constructor(config: WaveTransitionConfig) {
    this.waves = config.waves;
    this.undulationAmplitude = config.undulationAmplitude;
    this.undulationFrequency = config.undulationFrequency;
  }

  /**
   * Sets the wave transition containers and caches their child wave elements
   * Call this once after creating wave elements in the DOM
   */
  setWaveTransitions(waveTransitions: NodeListOf<HTMLElement>): void {
    this.waveTransitions = waveTransitions;
    this.cachedWaveElements = Array.from(waveTransitions).map((transition) =>
      Array.from(transition.querySelectorAll<HTMLElement>(".wave")),
    );
  }

  /**
   * Updates the position and style of all wave elements
   */
  updatePositions(activeIndex: number, withinProgress: number): void {
    if (!this.waveTransitions) return;
    // Cache viewport dimensions once per frame to avoid recalculations
    // Converting vw/vh to pixels prevents jank when mobile browsers show/hide URL bar
    const vw = window.innerWidth / 100;
    const vh = window.innerHeight / 100;

    this.waveTransitions.forEach((transition, transitionIndex) => {
      // Use cached elements if available, fallback to DOM query
      const waveElements =
        this.cachedWaveElements[transitionIndex] ||
        Array.from(transition.querySelectorAll<HTMLElement>(".wave"));

      waveElements.forEach((wave, waveIndex) => {
        const waveConfig =
          this.waves[waveIndex] || this.waves[this.waves.length - 1];

        let translateX: number;
        let translateY: number;

        let dynamicScale: number;
        let dynamicOpacity: number;

        if (transitionIndex < activeIndex) {
          // This transition has passed - waves are off-screen left
          translateX = WAVE_ANIMATION.END_POSITION_VW;
          translateY = 0;
          dynamicScale = waveConfig.endScaleFactor;
          dynamicOpacity = 0;
        } else if (transitionIndex > activeIndex || activeIndex < 0) {
          // This transition hasn't started - waves are off-screen right
          translateX = WAVE_ANIMATION.START_POSITION_VW;
          translateY = 0;
          dynamicScale = waveConfig.startScaleFactor;
          dynamicOpacity = waveConfig.opacity;
        } else {
          // This is the active transition - animate waves across screen
          // Apply stagger to each wave's progress
          const staggeredProgress = clamp(
            (withinProgress - waveConfig.stagger) / (1 - waveConfig.stagger),
            0,
            1,
          );

          const easedProgress = easeInOutCubic(staggeredProgress);

          // Horizontal: Start at START_POSITION_VW (right), end at END_POSITION_VW (left)
          translateX =
            WAVE_ANIMATION.START_POSITION_VW -
            easedProgress * WAVE_ANIMATION.TRAVEL_DISTANCE_VW;

          // Vertical undulation using sine wave
          const undulationPhase =
            staggeredProgress * Math.PI * 2 * this.undulationFrequency +
            waveConfig.phaseOffset;
          translateY =
            Math.sin(undulationPhase) * this.undulationAmplitude +
            waveConfig.slope * staggeredProgress;

          // Dynamic scale: lerp from startScaleFactor to endScaleFactor
          const scaleFactor =
            waveConfig.startScaleFactor +
            staggeredProgress *
              (waveConfig.endScaleFactor - waveConfig.startScaleFactor);
          dynamicScale = scaleFactor;

          // Dynamic opacity: stay at full until OPACITY_FADE_START, then lerp to 0
          if (staggeredProgress < WAVE_ANIMATION.OPACITY_FADE_START) {
            dynamicOpacity = waveConfig.opacity;
          } else {
            const fadeProgress =
              (staggeredProgress - WAVE_ANIMATION.OPACITY_FADE_START) /
              (1 - WAVE_ANIMATION.OPACITY_FADE_START);
            dynamicOpacity = waveConfig.opacity * (1 - fadeProgress);
          }
        }

        // Apply transform with dynamic scale
        // Use translate3d with rounded pixel values for GPU acceleration and to avoid subpixel jank
        const x = Math.round(translateX * vw);
        const y = Math.round(translateY * vh);
        wave.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${dynamicScale})`;
        wave.style.opacity = String(dynamicOpacity);
        wave.style.top = `${waveConfig.topOffset}%`;
      });
    });
  }
}
