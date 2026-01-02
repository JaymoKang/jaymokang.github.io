/**
 * Wave Transition System
 *
 * A scroll-driven transition effect using animated wave elements.
 *
 * Components:
 * - WaveTransitionController: Main orchestrator
 * - SegmentCalculator: Determines scroll position within dwell/transition zones
 * - WavePositioner: Handles wave element positioning and animation
 * - SlideVisibility: Manages slide opacity during transitions
 * - ScrollGravity: Snaps to nearest slide when scrolling stops
 * - SlideLayout: Shared utility for slide position calculations
 */
export { WaveTransitionController } from "./WaveTransitionController";
export { SegmentCalculator } from "./SegmentCalculator";
export { WavePositioner } from "./WavePositioner";
export { SlideVisibility } from "./SlideVisibility";
export { ScrollGravity } from "./ScrollGravity";
export { SlideLayout } from "./SlideLayout";
