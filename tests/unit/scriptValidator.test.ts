import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  ScriptTextSchema,
  InputScriptSchema,
  CustomTimestampSchema,
  calculateHookVelocityScore,
  validateScript,
  validateScriptText,
  validateInputScript,
  PacingTrackerOutputSchema,
} from '../../src/index.js';

describe('Server-Side Script Validation (SC-1.1, SC-1.4, SC-2.3)', () => {
  describe('ScriptTextSchema and validateScript', () => {
    it('trims whitespace and validates clean text', () => {
      const input = '   Valid script text   ';
      const output = validateScript(input);
      expect(output).toBe('Valid script text');

      const parsedBySchema = ScriptTextSchema.parse(input);
      expect(parsedBySchema).toBe('Valid script text');
    });

    it('validates InputScript object format', () => {
      const input = { text: '  Structured script  ', wpm: 140 };
      const output = validateScript(input);
      expect(output).toBe('Structured script');

      const parsedBySchema = InputScriptSchema.parse(input);
      expect(parsedBySchema.text).toBe('Structured script');
      expect(parsedBySchema.wpm).toBe(140);
    });

    it('rejects invalid object without text property', () => {
      expect(() => validateScript({ foo: 'bar' })).toThrow(ValidationError);
    });

    it('rejects numbers, booleans, and non-script types', () => {
      expect(() => validateScript(42)).toThrow(ValidationError);
      expect(() => validateScript(true)).toThrow(ValidationError);
      expect(() => validateScriptText(null)).toThrow(ValidationError);
      expect(() => validateInputScript(undefined)).toThrow(ValidationError);
    });

    it('validates exact character limit bounds', () => {
      const exact2000 = 'x'.repeat(2000);
      expect(validateScriptText(exact2000)).toBe(exact2000);

      const exact2001 = 'x'.repeat(2001);
      expect(() => validateScriptText(exact2001)).toThrow(ValidationError);
    });
  });

  describe('CustomTimestampSchema and monotonic ordering', () => {
    it('accepts valid timestamps', () => {
      const valid = { startSeconds: 0, endSeconds: 2.5, text: 'Hook line' };
      const result = CustomTimestampSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects equal start and end seconds', () => {
      const invalid = { startSeconds: 2.0, endSeconds: 2.0, text: 'Instant line' };
      const result = CustomTimestampSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects negative start or end seconds', () => {
      expect(CustomTimestampSchema.safeParse({ startSeconds: -1, endSeconds: 2, text: 'a' }).success).toBe(false);
      expect(CustomTimestampSchema.safeParse({ startSeconds: 0, endSeconds: -2, text: 'a' }).success).toBe(false);
    });
  });

  describe('PacingTrackerOutputSchema', () => {
    it('validates a valid pacing tracker payload', () => {
      const payload = {
        syllableDensity: 1.4,
        preambleLagMs: 250,
        wordsPerMinute: 155,
        totalDurationSeconds: 12.5,
        isPreambleDetected: false,
      };
      const result = PacingTrackerOutputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects negative values for duration or preamble lag', () => {
      const invalid = {
        syllableDensity: -1,
        preambleLagMs: -10,
        wordsPerMinute: -50,
        totalDurationSeconds: -5,
        isPreambleDetected: false,
      };
      const result = PacingTrackerOutputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('calculateHookVelocityScore (SC-2.3)', () => {
    it('computes weighted composite score according to formula', () => {
      // Score = 0.25*curiosityGap + 0.20*cognitiveFriction + 0.20*patternInterrupt + 0.20*emotionalStake + 0.15*sensorySpecificity
      const dims = {
        curiosityGap: 80, // 0.25 * 80 = 20
        cognitiveFriction: 90, // 0.20 * 90 = 18
        patternInterrupt: 85, // 0.20 * 85 = 17
        emotionalStake: 70, // 0.20 * 70 = 14
        sensorySpecificity: 60, // 0.15 * 60 = 9
      };
      // Total = 20 + 18 + 17 + 14 + 9 = 78
      const score = calculateHookVelocityScore(dims);
      expect(score).toBe(78);
    });
  });
});
