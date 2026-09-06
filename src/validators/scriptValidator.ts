/**
 * Server-side Zod validation and invariant enforcement.
 * Enforces SC-1.1, SC-1.4, SC-2.1, and Anti-Sycophancy Invariants.
 */

import { z } from 'zod';
import type { InputScript } from '../types/script.js';

export class ValidationError extends Error {
  public readonly issues?: readonly z.ZodIssue[];

  constructor(message: string, issues?: readonly z.ZodIssue[]) {
    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Zod schema for script text:
 * - Requires non-empty string.
 * - Trims leading/trailing whitespace automatically.
 * - Rejects empty or whitespace-only inputs.
 * - Caps length at 2,000 characters.
 */
export const ScriptTextSchema = z
  .string({
    required_error: 'Script text is required',
    invalid_type_error: 'Script text must be a string',
  })
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, {
    message: 'Script cannot be empty or contain only whitespace',
  })
  .refine((val) => val.length <= 2000, {
    message: 'Script exceeds 2,000 characters limit',
  });

/**
 * Monotonic timestamp schema conforming to SC-1.4.
 */
export const CustomTimestampSchema = z
  .object({
    startSeconds: z.number().min(0, 'startSeconds must be non-negative'),
    endSeconds: z.number().min(0, 'endSeconds must be non-negative'),
    text: z.string().min(1, 'Timestamp text cannot be empty'),
  })
  .refine((data) => data.startSeconds < data.endSeconds, {
    message: 'Timestamp must satisfy monotonic time ordering (startSeconds < endSeconds)',
  });

/**
 * Input Script validation schema conforming to SC-1.1 & SC-1.4.
 */
export const InputScriptSchema = z.object({
  text: ScriptTextSchema,
  wpm: z.number().positive('WPM must be positive').default(150),
  customTimestamps: z.array(CustomTimestampSchema).optional(),
});

/**
 * Temporal segment schema (SC-1.3).
 */
export const TemporalSegmentSchema = z.object({
  window: z.enum(['swipe_zone', 'value_delivery', 'body_and_resolution']),
  startSeconds: z.number(),
  endSeconds: z.number(),
  text: z.string(),
  wordCount: z.number(),
});

/**
 * 5-Dimensional retention evaluation schema (SC-2.2).
 */
export const RetentionDimensionsSchema = z.object({
  curiosityGap: z.number().min(0).max(100),
  cognitiveFriction: z.number().min(0).max(100),
  patternInterrupt: z.number().min(0).max(100),
  emotionalStake: z.number().min(0).max(100),
  sensorySpecificity: z.number().min(0).max(100),
  compositeScore: z.number().min(0).max(100),
});

/**
 * Hook Auditor output schema enforcing Anti-Sycophancy invariant (SC-2.1).
 */
export const HookAuditorOutputSchema = z.object({
  dimensions: RetentionDimensionsSchema,
  negativeCritique: z
    .array(z.string().min(5))
    .min(2, 'Anti-Sycophancy Invariant Violated: Must identify at least 2 negative failure points in the hook'),
  hookVelocityScore: z.number().min(0).max(100),
});

/**
 * Pacing Tracker output schema.
 */
export const PacingTrackerOutputSchema = z.object({
  syllableDensity: z.number().min(0),
  preambleLagMs: z.number().min(0),
  wordsPerMinute: z.number().positive(),
  totalDurationSeconds: z.number().min(0),
  isPreambleDetected: z.boolean(),
});

/**
 * Adversarial Swiper simulation output schema (SC-3.2).
 */
export const SkepticSwiperOutputSchema = z.object({
  swipeAtSecond: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal('survived')]),
  brutalVerdict: z.string().min(1).max(150),
  predictedRetentionScore: z.number().min(0).max(100),
});

export const SwiperSimulationSchema = SkepticSwiperOutputSchema;

/**
 * Tri-Archetype rewrite schema (SC-4.1 & SC-4.2).
 */
export const ArchetypeRewriteSchema = z.object({
  archetype: z.enum(['negative_frame', 'high_stakes_intrigue', 'visceral_pattern_interrupt']),
  hookText: z.string().min(1),
  estimatedDurationSeconds: z.number().max(4.0),
  engineeringRationale: z.string().min(1),
});

/**
 * Remake Architect output schema (SC-4).
 */
export const RemakeOutputSchema = z.object({
  prescriptiveRewrites: z
    .array(ArchetypeRewriteSchema)
    .length(3, 'Must provide exactly 3 archetypal rewrites'),
  rewrites: z
    .array(ArchetypeRewriteSchema)
    .length(3, 'Must provide exactly 3 archetypal rewrites')
    .optional(),
});

/**
 * Token usage schema.
 */
export const TokenUsageSchema = z.object({
  prompt: z.number().min(0),
  completion: z.number().min(0),
  total: z.number().min(0),
});

/**
 * Execution economics & performance schema.
 */
export const ExecutionEconomicsSchema = z.object({
  wallTimeMs: z.number().min(0),
  cumulativeTimeMs: z.number().min(0),
  tokensUsed: TokenUsageSchema,
  estimatedCostUsd: z.number().min(0),
  modelUsed: z.string().min(1),
  isLiveExecution: z.boolean(),
});

/**
 * Full deconstructor report schema with strict Anti-Sycophancy invariant (SC-2.1).
 */
export const DeconstructorReportSchema = z.object({
  metadata: z.object({
    evaluatedAt: z.string().datetime(),
    totalWordCount: z.number(),
    estimatedDurationSeconds: z.number(),
  }),
  segments: z.array(TemporalSegmentSchema),
  dimensions: RetentionDimensionsSchema,
  negativeCritique: z
    .array(z.string().min(5))
    .min(2, 'Anti-Sycophancy Invariant Violated: Must identify at least 2 negative failure points in the hook'),
  swiperVerdict: SkepticSwiperOutputSchema,
  prescriptiveRewrites: z.array(ArchetypeRewriteSchema).length(3, 'Must provide exactly 3 archetypal rewrites'),
  economics: ExecutionEconomicsSchema.optional(),
  id: z.string().optional(),
});

/**
 * Calculates hook velocity composite score according to SC-2.3:
 * Score = 0.25 * curiosityGap + 0.20 * cognitiveFriction + 0.20 * patternInterrupt + 0.20 * emotionalStake + 0.15 * sensorySpecificity
 */
export function calculateHookVelocityScore(dimensions: {
  readonly curiosityGap: number;
  readonly cognitiveFriction: number;
  readonly patternInterrupt: number;
  readonly emotionalStake: number;
  readonly sensorySpecificity: number;
}): number {
  const score =
    0.25 * dimensions.curiosityGap +
    0.20 * dimensions.cognitiveFriction +
    0.20 * dimensions.patternInterrupt +
    0.20 * dimensions.emotionalStake +
    0.15 * dimensions.sensorySpecificity;
  return Math.round(score * 100) / 100;
}

/**
 * Validates raw script string or input object, throwing an explicit ValidationError on failure.
 */
export function validateScript(input: unknown): string {
  if (input === null || input === undefined) {
    throw new ValidationError('Script input cannot be null or undefined');
  }

  if (typeof input === 'string') {
    const result = ScriptTextSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((i) => i.message).join('; '),
        result.error.issues
      );
    }
    return result.data;
  }

  if (typeof input === 'object' && 'text' in input) {
    const result = InputScriptSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((i) => i.message).join('; '),
        result.error.issues
      );
    }
    return result.data.text;
  }

  throw new ValidationError('Input must be a non-empty string or an InputScript object with valid text');
}

/**
 * Validates script text strictly, throwing ValidationError on failure.
 */
export function validateScriptText(text: unknown): string {
  if (typeof text !== 'string') {
    throw new ValidationError('Script text must be a string');
  }
  const result = ScriptTextSchema.safeParse(text);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((i) => i.message).join('; '),
      result.error.issues
    );
  }
  return result.data;
}

/**
 * Validates InputScript object strictly, throwing ValidationError on failure.
 */
export function validateInputScript(input: unknown): InputScript {
  if (input === null || input === undefined) {
    throw new ValidationError('InputScript cannot be null or undefined');
  }
  const result = InputScriptSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((i) => i.message).join('; '),
      result.error.issues
    );
  }
  return result.data;
}
