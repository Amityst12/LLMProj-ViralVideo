import { describe, it, expect } from 'vitest';
import {
  estimateCadence,
  ValidationError,
  BASELINE_WPM,
} from '../../src/index.js';
import {
  viralScript,
  mediocreScript,
  oversizedScript,
} from '../fixtures/scripts.js';

describe('Cadence Estimator & Ingestion Service (SC-1)', () => {
  describe('Input Validation Boundaries (SC-1.1)', () => {
    it('should reject empty string with ValidationError', () => {
      expect(() => estimateCadence('')).toThrow(ValidationError);
    });

    it('should reject whitespace-only string with ValidationError', () => {
      expect(() => estimateCadence('   \n\t  \r\n  ')).toThrow(ValidationError);
    });

    it('should reject null or undefined input with ValidationError', () => {
      expect(() => estimateCadence(null)).toThrow(ValidationError);
      expect(() => estimateCadence(undefined)).toThrow(ValidationError);
    });

    it('should reject script exceeding 2,000 characters limit', () => {
      expect(oversizedScript.length).toBeGreaterThan(2000);
      expect(() => estimateCadence(oversizedScript)).toThrow(ValidationError);
    });

    it('should accept valid scripts within 2,000 characters limit', () => {
      expect(() => estimateCadence(viralScript)).not.toThrow();
      expect(() => estimateCadence(mediocreScript)).not.toThrow();
    });
  });

  describe('150 WPM Cadence Math & Duration (SC-1.2)', () => {
    it('should compute exact duration at baseline 150 WPM (2.5 words/sec)', () => {
      // 15 words at 2.5 words/sec = 6.0 seconds
      const test15Words =
        'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen';
      const analysis = estimateCadence(test15Words);

      expect(analysis.wpm).toBe(BASELINE_WPM);
      expect(analysis.totalWordCount).toBe(15);
      expect(analysis.estimatedDurationSeconds).toBe(6.0);
    });

    it('should allocate ~7.5 words (7-8 words) to The Swipe Zone (0-3.0s)', () => {
      const analysis = estimateCadence(viralScript);
      const swipeSegment = analysis.segments.find((s) => s.window === 'swipe_zone');

      expect(swipeSegment).toBeDefined();
      // At 150 WPM, 3.0 seconds * 2.5 words/second = 7.5 words (yielding 7-8 words)
      expect(swipeSegment!.wordCount).toBeGreaterThanOrEqual(7);
      expect(swipeSegment!.wordCount).toBeLessThanOrEqual(8);
      expect(swipeSegment!.startSeconds).toBe(0.0);
      expect(swipeSegment!.endSeconds).toBe(3.0);
    });

    it('should accurately extract swipeZoneText from the script', () => {
      const analysis = estimateCadence(viralScript);
      const expectedFirstWords = viralScript
        .trim()
        .split(/\s+/)
        .slice(0, 8)
        .join(' ');

      expect(analysis.swipeZoneText).toBe(expectedFirstWords);
    });
  });

  describe('Temporal Window Partitioning (SC-1.3)', () => {
    it('should segment scripts into exactly 3 discrete temporal windows', () => {
      const analysis = estimateCadence(viralScript);

      expect(analysis.segments).toHaveLength(3);
      expect(analysis.segments.map((s) => s.window)).toEqual([
        'swipe_zone',
        'value_delivery',
        'body_and_resolution',
      ]);
    });

    it('should maintain word integrity with zero lost or duplicated words', () => {
      const analysis = estimateCadence(viralScript);
      const totalSegmentWords = analysis.segments.reduce(
        (sum, seg) => sum + seg.wordCount,
        0
      );

      expect(totalSegmentWords).toBe(analysis.totalWordCount);
      expect(totalSegmentWords).toBe(analysis.words.length);
    });

    it('should handle short scripts gracefully (all words in swipe_zone)', () => {
      const shortScript = 'Stop doing this now!';
      const analysis = estimateCadence(shortScript);

      expect(analysis.totalWordCount).toBe(4);
      const [swipe, value, body] = analysis.segments;

      expect(swipe.wordCount).toBe(4);
      expect(swipe.text).toBe(shortScript);
      expect(value.wordCount).toBe(0);
      expect(body.wordCount).toBe(0);
    });
  });

  describe('Custom Timestamps Ordering (SC-1.4)', () => {
    it('should reject non-monotonic custom timestamps with ValidationError', () => {
      const invalidCustomScript = {
        text: 'Hello world this is a test script for timestamps.',
        customTimestamps: [
          { startSeconds: 2.0, endSeconds: 1.0, text: 'Hello' }, // start > end
        ],
      };

      expect(() => estimateCadence(invalidCustomScript)).toThrow(ValidationError);
    });

    it('should accept valid monotonic custom timestamps', () => {
      const validCustomScript = {
        text: 'Hello world this is a test script for timestamps.',
        customTimestamps: [
          { startSeconds: 0.0, endSeconds: 1.5, text: 'Hello world' },
          { startSeconds: 1.5, endSeconds: 3.5, text: 'this is a test' },
        ],
      };

      expect(() => estimateCadence(validCustomScript)).not.toThrow();
    });
  });
});
