/**
 * Agent output contracts conforming to SC-2, SC-3, and SC-4 in docs/spec.md.
 */

import type { ScriptSegment } from './script.js';

export interface RetentionDimensions {
  readonly curiosityGap: number;
  readonly cognitiveFriction: number;
  readonly patternInterrupt: number;
  readonly emotionalStake: number;
  readonly sensorySpecificity: number;
  readonly compositeScore: number;
}

export interface HookAuditorOutput {
  readonly dimensions: RetentionDimensions;
  readonly negativeCritique: readonly string[];
  readonly hookVelocityScore: number;
}

export interface PacingTrackerOutput {
  readonly syllableDensity: number;
  readonly preambleLagMs: number;
  readonly wordsPerMinute: number;
  readonly totalDurationSeconds: number;
  readonly isPreambleDetected: boolean;
}

export type SwipeAtSecond = 1 | 2 | 3 | 'survived';

export interface SkepticSwiperOutput {
  readonly swipeAtSecond: SwipeAtSecond;
  readonly brutalVerdict: string;
  readonly predictedRetentionScore: number;
}

export type ViralArchetype =
  | 'negative_frame'
  | 'high_stakes_intrigue'
  | 'visceral_pattern_interrupt';

export interface ArchetypeRewrite {
  readonly archetype: ViralArchetype;
  readonly hookText: string;
  readonly estimatedDurationSeconds: number;
  readonly engineeringRationale: string;
}

export interface RemakeOutput {
  readonly rewrites: readonly [ArchetypeRewrite, ArchetypeRewrite, ArchetypeRewrite];
  readonly prescriptiveRewrites?: readonly ArchetypeRewrite[];
}

export interface DeconstructorReportMetadata {
  readonly evaluatedAt: string;
  readonly totalWordCount: number;
  readonly estimatedDurationSeconds: number;
}

export interface DeconstructorReport {
  readonly metadata: DeconstructorReportMetadata;
  readonly segments: readonly ScriptSegment[];
  readonly dimensions: RetentionDimensions;
  readonly negativeCritique: readonly string[];
  readonly swiperVerdict: SkepticSwiperOutput;
  readonly prescriptiveRewrites: readonly ArchetypeRewrite[];
}
