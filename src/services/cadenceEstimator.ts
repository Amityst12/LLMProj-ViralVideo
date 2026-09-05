/**
 * Deterministic Cadence & WPM Estimator.
 * Implements SC-1.2, SC-1.3, and SC-1.4 in docs/spec.md.
 */

import type { CadenceAnalysis, CustomTimestamp, ScriptSegment } from '../types/script.js';
import { validateInputScript, validateScript, ValidationError } from '../validators/scriptValidator.js';

export const DEFAULT_WPM = 150;
export const BASELINE_WPM = 150;
export const DEFAULT_WORDS_PER_SECOND = 2.5; // 150 / 60
export const SWIPE_ZONE_DURATION_SECONDS = 3.0;
export const VALUE_DELIVERY_DURATION_SECONDS = 15.0;

/**
 * Splits raw text into an array of words, filtering out extraneous whitespace.
 */
export function splitWords(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }
  return trimmed.split(/\s+/).filter((w) => w.length > 0);
}

/**
 * Splits raw text into an array of distinct paragraphs.
 * Splits by newlines and trims each paragraph.
 */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Extracts the exact text corresponding to "The Swipe Zone" (0 to 3.0 seconds).
 * At 150 WPM (2.5 words/sec), this corresponds to the first 8 words.
 */
export function extractSwipeZone(text: string, wpm: number = DEFAULT_WPM): string {
  const words = splitWords(text);
  const wordsPerSecond = wpm / 60;
  const swipeCutoff = Math.round(SWIPE_ZONE_DURATION_SECONDS * wordsPerSecond);
  return words.slice(0, swipeCutoff).join(' ');
}

/**
 * Validates monotonic ordering for custom timestamps according to SC-1.4.
 */
export function validateCustomTimestamps(timestamps: readonly CustomTimestamp[]): void {
  for (let i = 0; i < timestamps.length; i++) {
    const current = timestamps[i];
    if (!current) continue;

    if (current.startSeconds >= current.endSeconds) {
      throw new ValidationError(
        `Invalid timestamp at index ${i}: startSeconds (${current.startSeconds}) must be strictly less than endSeconds (${current.endSeconds})`
      );
    }

    if (i > 0) {
      const prev = timestamps[i - 1];
      if (prev && current.startSeconds < prev.endSeconds) {
        throw new ValidationError(
          `Non-monotonic timestamps at index ${i}: startSeconds (${current.startSeconds}) is earlier than previous endSeconds (${prev.endSeconds})`
        );
      }
    }
  }
}

/**
 * Segments a script into three discrete temporal windows:
 * 1. The Swipe Zone: [0.0, 3.0] seconds (approximately words 1 through 8 at 150 WPM).
 * 2. Value Delivery Window: (3.0, 15.0] seconds.
 * 3. Body & Resolution Window: > 15.0 seconds.
 */
export function segmentScriptByCadence(
  words: readonly string[],
  wpm: number = DEFAULT_WPM,
  totalDurationSeconds: number
): ScriptSegment[] {
  const wordsPerSecond = wpm / 60;
  const swipeCutoff = Math.round(SWIPE_ZONE_DURATION_SECONDS * wordsPerSecond);
  const valueCutoff = Math.round(VALUE_DELIVERY_DURATION_SECONDS * wordsPerSecond);

  const swipeWords = words.slice(0, swipeCutoff);
  const valueWords = words.slice(swipeCutoff, valueCutoff);
  const bodyWords = words.slice(valueCutoff);

  const segments: ScriptSegment[] = [
    {
      window: 'swipe_zone',
      startSeconds: 0,
      endSeconds: 3,
      text: swipeWords.join(' '),
      wordCount: swipeWords.length,
    },
    {
      window: 'value_delivery',
      startSeconds: 3,
      endSeconds: 15,
      text: valueWords.join(' '),
      wordCount: valueWords.length,
    },
    {
      window: 'body_and_resolution',
      startSeconds: 15,
      endSeconds: Math.max(15, totalDurationSeconds),
      text: bodyWords.join(' '),
      wordCount: bodyWords.length,
    },
  ];

  return segments;
}

/**
 * Segments a script based on explicit custom timestamps.
 */
export function segmentScriptByCustomTimestamps(
  timestamps: readonly CustomTimestamp[]
): ScriptSegment[] {
  validateCustomTimestamps(timestamps);

  const swipeSegments: CustomTimestamp[] = [];
  const valueSegments: CustomTimestamp[] = [];
  const bodySegments: CustomTimestamp[] = [];

  for (const ts of timestamps) {
    if (ts.startSeconds < SWIPE_ZONE_DURATION_SECONDS) {
      swipeSegments.push(ts);
    } else if (ts.startSeconds < VALUE_DELIVERY_DURATION_SECONDS) {
      valueSegments.push(ts);
    } else {
      bodySegments.push(ts);
    }
  }

  const swipeText = swipeSegments.map((s) => s.text).join(' ');
  const valueText = valueSegments.map((s) => s.text).join(' ');
  const bodyText = bodySegments.map((s) => s.text).join(' ');

  const lastTimestamp = timestamps[timestamps.length - 1];
  const maxEndSeconds = lastTimestamp ? lastTimestamp.endSeconds : 15;

  return [
    {
      window: 'swipe_zone',
      startSeconds: 0,
      endSeconds: 3,
      text: swipeText,
      wordCount: splitWords(swipeText).length,
    },
    {
      window: 'value_delivery',
      startSeconds: 3,
      endSeconds: 15,
      text: valueText,
      wordCount: splitWords(valueText).length,
    },
    {
      window: 'body_and_resolution',
      startSeconds: 15,
      endSeconds: Math.max(15, maxEndSeconds),
      text: bodyText,
      wordCount: splitWords(bodyText).length,
    },
  ];
}

export interface EstimateCadenceOptions {
  readonly wpm?: number;
  readonly customTimestamps?: readonly CustomTimestamp[];
}

/**
 * Deterministic Cadence Estimator.
 * Accepts raw script text or InputScript object, parses words/paragraphs,
 * allocates temporal windows at baseline 150 WPM (2.5 words/sec), and isolates The Swipe Zone.
 */
export function estimateCadence(
  input: unknown,
  options?: EstimateCadenceOptions
): CadenceAnalysis {
  if (input === null || input === undefined) {
    throw new ValidationError('Script input cannot be null or undefined');
  }

  let rawText: string;
  let wpm = options?.wpm ?? DEFAULT_WPM;
  let customTimestamps = options?.customTimestamps;

  if (typeof input === 'string') {
    rawText = validateScript(input);
  } else if (typeof input === 'object') {
    const validated = validateInputScript(input);
    rawText = validated.text;
    wpm = options?.wpm ?? validated.wpm ?? DEFAULT_WPM;
    customTimestamps = options?.customTimestamps ?? validated.customTimestamps;
  } else {
    throw new ValidationError('Input must be a string or an InputScript object');
  }

  const words = splitWords(rawText);
  const paragraphs = splitParagraphs(rawText);
  const totalWordCount = words.length;

  const wordsPerSecond = wpm / 60;
  const estimatedDurationSeconds =
    totalWordCount === 0 ? 0 : Number((totalWordCount / wordsPerSecond).toFixed(2));

  let segments: ScriptSegment[];
  if (customTimestamps && customTimestamps.length > 0) {
    segments = segmentScriptByCustomTimestamps(customTimestamps);
  } else {
    segments = segmentScriptByCadence(words, wpm, estimatedDurationSeconds);
  }

  const swipeZoneText = extractSwipeZone(rawText, wpm);

  return {
    totalWordCount,
    totalWords: totalWordCount,
    estimatedDurationSeconds,
    wpm,
    wordsPerSecond,
    segments,
    swipeZoneText,
    swipeZone: swipeZoneText,
    words,
    paragraphs,
  };
}

// Canonical and convenient aliases
export const cadenceEstimator = estimateCadence;
export const analyzeCadence = estimateCadence;
