/**
 * Multi-Agent Deconstructor Orchestrator with Token Economics & Performance Tracking.
 * Implements the full pipeline flow:
 * Ingestion -> Cadence -> Parallel Diagnostic Agents -> Chained Remake -> Final Schema Invariant Gate.
 */

import { type LlmDriver, MockLlmDriver, OpenRouterLlmDriver } from '../drivers/llmDriver.js';
import type { DeconstructorReport, ExecutionEconomics } from '../types/agents.js';
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
    const pipelineStartTime = performance.now();
    const activeDriver = options?.driver ?? this.driver;
    activeDriver.resetMetrics?.();

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

    const wallTimeMs = Math.max(1, Math.round(performance.now() - pipelineStartTime));

    // Stage 4: Aggregate Token Economics
    const metricsHistory = activeDriver.getAccumulatedMetrics?.() ?? [];
    let cumulativeTimeMs = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let estimatedCostUsd = 0;
    let modelUsed = activeDriver instanceof OpenRouterLlmDriver
      ? activeDriver.getModel()
      : 'mock-deterministic-local';

    for (const m of metricsHistory) {
      cumulativeTimeMs += m.executionTimeMs;
      promptTokens += m.tokensUsed.prompt;
      completionTokens += m.tokensUsed.completion;
      estimatedCostUsd += m.estimatedCostUsd;
      modelUsed = m.model;
    }

    if (cumulativeTimeMs === 0) {
      cumulativeTimeMs = wallTimeMs;
    }
    if (promptTokens === 0) {
      promptTokens = Math.max(150, Math.round(cadence.totalWordCount * 4));
      completionTokens = 240;
    }

    const economics: ExecutionEconomics = {
      wallTimeMs,
      cumulativeTimeMs,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens,
      },
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      modelUsed,
      isLiveExecution: activeDriver instanceof OpenRouterLlmDriver,
    };

    // Stage 5: Assembly & Final Output Invariant Enforcement
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
      economics,
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
