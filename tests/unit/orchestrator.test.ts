import { describe, it, expect } from 'vitest';
import {
  deconstructScript,
  DeconstructorOrchestrator,
  MockLlmDriver,
  OpenRouterLlmDriver,
  extractJsonFromText,
  ValidationError,
  DeconstructorReportSchema,
} from '../../src/index.js';
import {
  viralScript,
  mediocreScript,
  oversizedScript,
  emptyScript,
  whitespaceScript,
} from '../fixtures/scripts.js';

describe('Multi-Agent Deconstructor Engine (Modules 14-15)', () => {
  describe('JSON Extractor Preprocessor', () => {
    it('parses raw clean JSON string', () => {
      const json = '{"key": "value", "num": 123}';
      expect(extractJsonFromText(json)).toEqual({ key: 'value', num: 123 });
    });

    it('extracts JSON from markdown code fences (```json ... ```)', () => {
      const fenced = 'Here is your output:\n```json\n{"score": 95, "status": "ok"}\n```\nHope that helps!';
      expect(extractJsonFromText(fenced)).toEqual({ score: 95, status: 'ok' });
    });

    it('extracts JSON from unlabelled markdown code fences (``` ... ```)', () => {
      const fenced = '```\n{"archetype": "negative_frame", "words": 6}\n```';
      expect(extractJsonFromText(fenced)).toEqual({ archetype: 'negative_frame', words: 6 });
    });

    it('extracts outer JSON object when conversational preamble and trailer surround it', () => {
      const conversational = 'Sure! Here is the response you requested: {"valid": true, "items": [1, 2]} Please let me know if you need anything else.';
      expect(extractJsonFromText(conversational)).toEqual({ valid: true, items: [1, 2] });
    });

    it('throws descriptive error on malformed non-JSON text', () => {
      expect(() => extractJsonFromText('Not JSON at all')).toThrow(/Failed to extract valid JSON/);
    });
  });

  describe('End-to-End Orchestrator Pipeline on Golden Dataset', () => {
    it('deconstructs viralScript through full multi-agent pipeline (SC-1 to SC-4)', async () => {
      const report = await deconstructScript(viralScript);

      // Verify overall report conforms to strict Zod schema
      expect(DeconstructorReportSchema.safeParse(report).success).toBe(true);

      // SC-1: Ingestion & Cadence
      expect(report.metadata.totalWordCount).toBeGreaterThan(30);
      expect(report.metadata.estimatedDurationSeconds).toBeGreaterThan(10);
      expect(report.segments).toHaveLength(3);
      expect(report.segments[0]?.window).toBe('swipe_zone');
      expect(report.segments[0]?.wordCount).toBeGreaterThanOrEqual(7);
      expect(report.segments[0]?.wordCount).toBeLessThanOrEqual(8);

      // SC-2: Anti-Sycophancy Invariant & 5-Dim Evaluation
      expect(report.negativeCritique.length).toBeGreaterThanOrEqual(2);
      expect(report.dimensions.compositeScore).toBeGreaterThanOrEqual(75);
      expect(report.dimensions.curiosityGap).toBeGreaterThanOrEqual(80);

      // SC-3: Skeptic Swiper Simulation
      expect(report.swiperVerdict.swipeAtSecond).toBe('survived');
      expect(report.swiperVerdict.predictedRetentionScore).toBeGreaterThanOrEqual(75);
      expect(report.swiperVerdict.brutalVerdict.length).toBeGreaterThan(0);

      // SC-4: Tri-Archetype Prescriptive Remake
      expect(report.prescriptiveRewrites).toHaveLength(3);
      const archetypes = report.prescriptiveRewrites.map((r) => r.archetype);
      expect(archetypes).toContain('negative_frame');
      expect(archetypes).toContain('high_stakes_intrigue');
      expect(archetypes).toContain('visceral_pattern_interrupt');

      for (const rewrite of report.prescriptiveRewrites) {
        const words = rewrite.hookText.trim().split(/\s+/);
        expect(words.length).toBeLessThanOrEqual(8);
        expect(rewrite.estimatedDurationSeconds).toBeLessThanOrEqual(4.0);
        expect(rewrite.engineeringRationale.length).toBeGreaterThan(10);
      }
    });

    it('deconstructs mediocreScript with adversarial swipe penalty (SC-3.3)', async () => {
      const report = await deconstructScript(mediocreScript);

      // Must conform to schema
      expect(DeconstructorReportSchema.safeParse(report).success).toBe(true);

      // SC-2: Negative critiques identify preamble flaw
      expect(report.negativeCritique.length).toBeGreaterThanOrEqual(2);
      const mentionsPreambleOrGreeting = report.negativeCritique.some(
        (c) => c.toLowerCase().includes('preamble') || c.toLowerCase().includes('greeting')
      );
      expect(mentionsPreambleOrGreeting).toBe(true);

      // SC-3.3: Early drop-off for greeting throat-clearing
      expect(report.swiperVerdict.swipeAtSecond).toBe(1);
      expect(report.swiperVerdict.predictedRetentionScore).toBeLessThan(40);
      expect(report.swiperVerdict.brutalVerdict.toLowerCase()).toContain('greeting');

      // SC-4: Exactly 3 high-retention alternatives provided
      expect(report.prescriptiveRewrites).toHaveLength(3);
    });

    it('strictly enforces input validation boundaries during deconstruction', async () => {
      await expect(deconstructScript(emptyScript)).rejects.toThrow(ValidationError);
      await expect(deconstructScript(whitespaceScript)).rejects.toThrow(ValidationError);
      await expect(deconstructScript(oversizedScript)).rejects.toThrow(ValidationError);
    });
  });

  describe('Custom Driver Injection & OpenRouter Driver', () => {
    it('supports custom MockLlmDriver injection into DeconstructorOrchestrator', async () => {
      const customDriver = new MockLlmDriver();
      const orchestrator = new DeconstructorOrchestrator(customDriver);

      const report = await orchestrator.deconstruct(viralScript);
      expect(report.segments).toHaveLength(3);
      expect(report.prescriptiveRewrites).toHaveLength(3);
    });

    it('OpenRouterLlmDriver throws when apiKey is missing and not in environment', async () => {
      const originalKey = process.env['OPENROUTER_API_KEY'];
      delete process.env['OPENROUTER_API_KEY'];

      try {
        const driver = new OpenRouterLlmDriver({ apiKey: '' });
        await expect(
          driver.generateJson({ prompt: 'test' })
        ).rejects.toThrow(/OPENROUTER_API_KEY is not configured/);
      } finally {
        if (originalKey) {
          process.env['OPENROUTER_API_KEY'] = originalKey;
        }
      }
    });

    it('OpenRouterLlmDriver parses response using mock fetchFn', async () => {
      const mockFetch = (async () => {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({
            choices: [
              {
                message: {
                  content: '```json\n{"result": "success", "val": 42}\n```',
                },
              },
            ],
          }),
        };
      }) as unknown as typeof fetch;

      const driver = new OpenRouterLlmDriver({
        apiKey: 'dummy-test-key',
        fetchFn: mockFetch,
      });

      const result = await driver.generateJson<{ result: string; val: number }>({
        prompt: 'test prompt',
      });

      expect(result).toEqual({ result: 'success', val: 42 });
    });
  });
});
