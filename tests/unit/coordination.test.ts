import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  HookAuditorOutputSchema,
  SkepticSwiperOutputSchema,
  RemakeOutputSchema,
  DeconstructorReportSchema,
} from '../../src/index.js';

describe('Multi-Agent Coordination & Invariant Contracts (SC-2, SC-3, SC-4)', () => {
  describe('Stage 2A: Hook Auditor & Anti-Sycophancy Invariant (SC-2)', () => {
    const validDimensions = {
      curiosityGap: 85,
      cognitiveFriction: 90,
      patternInterrupt: 80,
      emotionalStake: 75,
      sensorySpecificity: 70,
      compositeScore: 80.75,
    };

    it('should accept valid HookAuditor output with at least 2 negative critiques', () => {
      const validPayload = {
        dimensions: validDimensions,
        negativeCritique: [
          'Failure Point 1: Delayed sensory anchor in the opening second.',
          'Failure Point 2: Abstract phrasing creates cognitive hesitation before payoff.',
        ],
        hookVelocityScore: 81,
      };

      const parsed = HookAuditorOutputSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('should strictly REJECT HookAuditor output with only 1 negative critique (Anti-Sycophancy Invariant Violation)', () => {
      const sycophanticPayload = {
        dimensions: validDimensions,
        negativeCritique: [
          'Failure Point 1: Only one single critique point provided.',
        ],
        hookVelocityScore: 81,
      };

      const result = HookAuditorOutputSchema.safeParse(sycophanticPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
        const hasInvariantMessage = result.error.issues.some((issue) =>
          issue.message.includes('Anti-Sycophancy Invariant Violated')
        );
        expect(hasInvariantMessage).toBe(true);
      }
    });

    it('should strictly REJECT HookAuditor output with 0 negative critiques', () => {
      const flatteringPayload = {
        dimensions: validDimensions,
        negativeCritique: [],
        hookVelocityScore: 95,
      };

      const result = HookAuditorOutputSchema.safeParse(flatteringPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });

    it('should reject dimension scores outside [0, 100]', () => {
      const invalidScorePayload = {
        dimensions: {
          ...validDimensions,
          curiosityGap: 105, // Exceeds 100
        },
        negativeCritique: [
          'Failure Point 1: Phrasing is too generic.',
          'Failure Point 2: Missing clear stakes in first two seconds.',
        ],
        hookVelocityScore: 80,
      };

      const result = HookAuditorOutputSchema.safeParse(invalidScorePayload);
      expect(result.success).toBe(false);
    });
  });

  describe('Stage 2C: Skeptic Swiper Simulation Contract (SC-3)', () => {
    it('should validate allowed swipeAtSecond states: 1, 2, 3, and "survived"', () => {
      const states: Array<1 | 2 | 3 | 'survived'> = [1, 2, 3, 'survived'];

      for (const swipeAt of states) {
        const payload = {
          swipeAtSecond: swipeAt,
          brutalVerdict: 'Swiped away due to boring intro.',
          predictedRetentionScore: 35,
        };
        const result = SkepticSwiperOutputSchema.safeParse(payload);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid swipeAtSecond values like 0, 4, or arbitrary strings', () => {
      const invalidPayload = {
        swipeAtSecond: 4, // Not in union {1, 2, 3, "survived"}
        brutalVerdict: 'Invalid second value.',
        predictedRetentionScore: 20,
      };

      const result = SkepticSwiperOutputSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject brutalVerdict exceeding 150 characters', () => {
      const oversizedVerdict = {
        swipeAtSecond: 1,
        brutalVerdict: 'A'.repeat(151),
        predictedRetentionScore: 10,
      };

      const result = SkepticSwiperOutputSchema.safeParse(oversizedVerdict);
      expect(result.success).toBe(false);
    });
  });

  describe('Stage 3: Remake Architect Tri-Archetype Contract (SC-4)', () => {
    const validRewrites = [
      {
        archetype: 'negative_frame' as const,
        hookText: 'Stop writing weak hooks that bleed viewers.',
        estimatedDurationSeconds: 2.8,
        engineeringRationale: 'Inverts generic advice into an immediate loss-prevention alert.',
      },
      {
        archetype: 'high_stakes_intrigue' as const,
        hookText: 'Your retention drops because of this hidden flaw.',
        estimatedDurationSeconds: 3.2,
        engineeringRationale: 'Introduces immediate downside jeopardy.',
      },
      {
        archetype: 'visceral_pattern_interrupt' as const,
        hookText: 'Every viral hook rule you know is wrong.',
        estimatedDurationSeconds: 3.0,
        engineeringRationale: 'Disrupts feed scroll inertia with counter-intuitive paradox.',
      },
    ];

    it('should accept exactly 3 archetypal rewrites', () => {
      const payload = {
        prescriptiveRewrites: validRewrites,
      };

      const result = RemakeOutputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject when fewer than 3 archetypes are provided', () => {
      const incompletePayload = {
        prescriptiveRewrites: validRewrites.slice(0, 2),
      };

      const result = RemakeOutputSchema.safeParse(incompletePayload);
      expect(result.success).toBe(false);
    });

    it('should reject rewrite exceeding maximum duration threshold (4.0s)', () => {
      const slowPayload = {
        prescriptiveRewrites: [
          {
            ...validRewrites[0],
            estimatedDurationSeconds: 4.5, // Exceeds 4.0s
          },
          validRewrites[1],
          validRewrites[2],
        ],
      };

      const result = RemakeOutputSchema.safeParse(slowPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('Full Deconstructor Report Schema Enforcement', () => {
    it('should validate a complete deconstruction report meeting all invariants', () => {
      const completeReport = {
        metadata: {
          evaluatedAt: new Date().toISOString(),
          totalWordCount: 42,
          estimatedDurationSeconds: 16.8,
        },
        segments: [
          {
            window: 'swipe_zone',
            startSeconds: 0,
            endSeconds: 3,
            text: 'Stop writing weak hooks that bleed viewers.',
            wordCount: 8,
          },
          {
            window: 'value_delivery',
            startSeconds: 3,
            endSeconds: 15,
            text: 'If your retention drops in three seconds your video is dead.',
            wordCount: 30,
          },
          {
            window: 'body_and_resolution',
            startSeconds: 15,
            endSeconds: 16.8,
            text: 'Here is the fix.',
            wordCount: 4,
          },
        ],
        dimensions: {
          curiosityGap: 85,
          cognitiveFriction: 90,
          patternInterrupt: 85,
          emotionalStake: 80,
          sensorySpecificity: 75,
          compositeScore: 83.25,
        },
        negativeCritique: [
          'Failure Point 1: Second word has slight phonetic drag.',
          'Failure Point 2: Does not identify the platform explicitly in first 2 seconds.',
        ],
        swiperVerdict: {
          swipeAtSecond: 'survived',
          brutalVerdict: 'Hook held attention past 3 seconds.',
          predictedRetentionScore: 88,
        },
        prescriptiveRewrites: [
          {
            archetype: 'negative_frame',
            hookText: 'Stop writing weak hooks that bleed viewers.',
            estimatedDurationSeconds: 2.8,
            engineeringRationale: 'Immediate pattern interrupt via error attack.',
          },
          {
            archetype: 'high_stakes_intrigue',
            hookText: 'Your retention drops because of this hidden flaw.',
            estimatedDurationSeconds: 3.2,
            engineeringRationale: 'Curiosity gap through concealed jeopardy.',
          },
          {
            archetype: 'visceral_pattern_interrupt',
            hookText: 'Every viral hook rule you know is wrong.',
            estimatedDurationSeconds: 3.0,
            engineeringRationale: 'Violates cognitive expectation immediately.',
          },
        ],
      };

      const result = DeconstructorReportSchema.safeParse(completeReport);
      expect(result.success).toBe(true);
    });

    it('should fail full report validation if anti-sycophancy invariant is violated', () => {
      const flatteryReport = {
        metadata: {
          evaluatedAt: new Date().toISOString(),
          totalWordCount: 10,
          estimatedDurationSeconds: 4.0,
        },
        segments: [
          {
            window: 'swipe_zone',
            startSeconds: 0,
            endSeconds: 3,
            text: 'Hello awesome world welcome to this great video',
            wordCount: 8,
          },
          {
            window: 'value_delivery',
            startSeconds: 3,
            endSeconds: 4,
            text: 'enjoy it',
            wordCount: 2,
          },
          {
            window: 'body_and_resolution',
            startSeconds: 15,
            endSeconds: 15,
            text: '',
            wordCount: 0,
          },
        ],
        dimensions: {
          curiosityGap: 50,
          cognitiveFriction: 50,
          patternInterrupt: 50,
          emotionalStake: 50,
          sensorySpecificity: 50,
          compositeScore: 50,
        },
        negativeCritique: [
          // Flattery violation: only 1 critique point!
          'Cosmetic issue: hook could be slightly punchier.',
        ],
        swiperVerdict: {
          swipeAtSecond: 1,
          brutalVerdict: 'Swiped on greeting.',
          predictedRetentionScore: 15,
        },
        prescriptiveRewrites: [
          {
            archetype: 'negative_frame',
            hookText: 'Stop saying hello on video.',
            estimatedDurationSeconds: 2.0,
            engineeringRationale: 'Removes greeting throat-clearing.',
          },
          {
            archetype: 'high_stakes_intrigue',
            hookText: 'Your opening greeting loses 80% viewers.',
            estimatedDurationSeconds: 2.5,
            engineeringRationale: 'Direct loss quantification.',
          },
          {
            archetype: 'visceral_pattern_interrupt',
            hookText: 'Never greet your audience.',
            estimatedDurationSeconds: 1.6,
            engineeringRationale: 'Radical instruction.',
          },
        ],
      };

      const result = DeconstructorReportSchema.safeParse(flatteryReport);
      expect(result.success).toBe(false);
    });
  });
});
