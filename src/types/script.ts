/**
 * Data contracts for script ingestion, temporal segmentation, and cadence analysis.
 * Adheres to SC-1.1 through SC-1.4 in docs/spec.md.
 */

export type TimeWindow = 'swipe_zone' | 'value_delivery' | 'body_and_resolution';

export interface ScriptSegment {
  readonly window: TimeWindow;
  readonly startSeconds: number;
  readonly endSeconds: number;
  readonly text: string;
  readonly wordCount: number;
}

export type TemporalSegment = ScriptSegment;

export interface CustomTimestamp {
  readonly startSeconds: number;
  readonly endSeconds: number;
  readonly text: string;
}

export interface InputScript {
  readonly text: string;
  readonly wpm?: number;
  readonly customTimestamps?: readonly CustomTimestamp[];
}

export interface CadenceAnalysis {
  readonly totalWordCount: number;
  readonly totalWords: number;
  readonly estimatedDurationSeconds: number;
  readonly wpm: number;
  readonly wordsPerSecond: number;
  readonly segments: readonly ScriptSegment[];
  readonly swipeZoneText: string;
  readonly swipeZone: string;
  readonly words: readonly string[];
  readonly paragraphs: readonly string[];
}
