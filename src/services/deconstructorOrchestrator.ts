/**
 * Multi-Agent Deconstructor Orchestrator.
 * Implements the full pipeline flow:
 * Ingestion -> Cadence -> Parallel Diagnostic Agents -> Chained Remake -> Final Schema Invariant Gate.
 */

import { type LlmDriver, MockLlmDriver } from '../drivers/llmDriver.js';
import type { DeconstructorReport } from '../types/agents.js';
import type { CustomTimestamp, InputScript } from '../types/script.js';
import { DeconstructorReportSchema } from '../validators/scriptValidator.js';
import { HookAuditor } from './agents/hookAuditor.js';
import { PacingTracker } from './agents/pacingTracker.js';
import { RemakeArchitect } from './agents/remakeArchitect.js';
import { SkepticSwiper } from './agents/skepticSwiper.js';
import { estimateCadence } from './cadenceEstimator.js';

export interface DeconstructOptions {
  readonly driver?: LlmDriver;
  readonly wpm?: number;
  readonly customTimestamps?: readonly CustomTimestamp[];
}

export class DeconstructorOrchestrator {
  private readonly driver: LlmDriver;
  private readonly hookAuditor: HookAuditor;
  private readonly pacingTracker: PacingTracker;
  private readonly skepticSwiper: SkepticSwiper;
  private readonly remakeArchitect: RemakeArchitect;

  constructor(driver?: LlmDriver) {
    this.driver = driver ?? new MockLlmDriver();
    this.hookAuditor = new HookAuditor(this.driver);
    this.pacingTracker = new PacingTracker(this.driver);
    this.skepticSwiper = new SkepticSwiper(this.driver);
    this.remakeArchitect = new RemakeArchitect(this.driver);
  }

  public async deconstruct(
    input: string | InputScript,
    options?: DeconstructOptions
  ): Promise<DeconstructorReport> {
    const activeDriver = options?.driver ?? this.driver;
    const hookAuditor = activeDriver === this.driver ? this.hookAuditor : new HookAuditor(activeDriver);
    const pacingTracker = activeDriver === this.driver ? this.pacingTracker : new PacingTracker(activeDriver);
    const skepticSwiper = activeDriver === this.driver ? this.skepticSwiper : new SkepticSwiper(activeDriver);
    const remakeArchitect =
      activeDriver === this.driver ? this.remakeArchitect : new RemakeArchitect(activeDriver);

    // Stage 1: Ingestion & Deterministic Cadence Partitioning
    const cadence = estimateCadence(input, {
      wpm: options?.wpm,
      customTimestamps: options?.customTimestamps,
    });

    const scriptText = typeof input === 'string' ? input : input.text;

    // Stage 2: Parallel Diagnostic Agents (Context Isolation)
    const [hookAudit, pacingMetrics, swiperVerdict] = await Promise.all([
      hookAuditor.audit({
        swipeZoneText: cadence.swipeZoneText,
        fullScript: scriptText,
      }),
      pacingTracker.track({
        cadence,
        fullScript: scriptText,
      }),
      skepticSwiper.simulate({
        swipeZoneText: cadence.swipeZoneText,
        fullScript: scriptText,
      }),
    ]);

    // Stage 3: Chained Prescriptive Remake Synthesis
    const remake = await remakeArchitect.remake({
      fullScript: scriptText,
      swipeZoneText: cadence.swipeZoneText,
      hookAudit,
      swiperVerdict,
      pacing: pacingMetrics,
    });

    // Stage 4: Assembly & Final Output Invariant Enforcement
    const assembledReport: DeconstructorReport = {
      metadata: {
        evaluatedAt: new Date().toISOString(),
        totalWordCount: cadence.totalWordCount,
        estimatedDurationSeconds: cadence.estimatedDurationSeconds,
      },
      segments: cadence.segments,
      dimensions: hookAudit.dimensions,
      negativeCritique: hookAudit.negativeCritique,
      swiperVerdict,
      prescriptiveRewrites: remake.prescriptiveRewrites ?? remake.rewrites,
    };

    return DeconstructorReportSchema.parse(assembledReport);
  }
}

/**
 * Functional entry point for one-shot script deconstruction.
 */
export async function deconstructScript(
  input: string | InputScript,
  options?: DeconstructOptions
): Promise<DeconstructorReport> {
  const orchestrator = new DeconstructorOrchestrator(options?.driver);
  return orchestrator.deconstruct(input, options);
}
