/**
 * RemakeArchitect Agent (SC-4).
 * Synthesizes 3 viral archetypes rewrites (negative_frame, high_stakes_intrigue,
 * visceral_pattern_interrupt) fitting the 3-second window (<= 8 words)
 * with actionable engineering rationales.
 */

import type { LlmDriver } from '../../drivers/llmDriver.js';
import type {
  HookAuditorOutput,
  PacingTrackerOutput,
  RemakeOutput,
  SkepticSwiperOutput,
} from '../../types/agents.js';
import { RemakeOutputSchema } from '../../validators/scriptValidator.js';

export interface RemakeInput {
  readonly fullScript: string;
  readonly swipeZoneText: string;
  readonly hookAudit: HookAuditorOutput;
  readonly swiperVerdict: SkepticSwiperOutput;
  readonly pacing?: PacingTrackerOutput;
}

export class RemakeArchitect {
  constructor(private readonly driver: LlmDriver) {}

  public async remake(input: RemakeInput): Promise<RemakeOutput> {
    const systemPrompt = `You are "The Remake Architect" in a short-form video retention pipeline.
Your role is prescriptive synthesis: converting diagnostic audit data and adversarial swiper verdicts into 3 high-velocity, survival-engineered hook rewrites.

You must synthesize EXACTLY THREE alternative hooks adhering to these viral archetypes:
1. "negative_frame": Attacks a pervasive error, myth, or bad habit (e.g. "Stop doing X...").
2. "high_stakes_intrigue": Introduces immediate downside risk or concealed jeopardy (e.g. "You are quietly losing Y...").
3. "visceral_pattern_interrupt": Confronts the viewer with an immediate counter-intuitive paradox.

CONSTRAINTS:
- Each hookText MUST be short and punchy: <= 8 words (speaks in <= 3.2 seconds at 150 WPM).
- estimatedDurationSeconds must be <= 4.0.
- engineeringRationale must clearly articulate how the rewrite reduces cognitive friction and elevates curiosity over the original baseline.

Output JSON format:
{
  "prescriptiveRewrites": [
    {
      "archetype": "negative_frame",
      "hookText": "string (<= 8 words)",
      "estimatedDurationSeconds": number (<= 4.0),
      "engineeringRationale": "string explaining friction reduction"
    },
    {
      "archetype": "high_stakes_intrigue",
      "hookText": "string (<= 8 words)",
      "estimatedDurationSeconds": number (<= 4.0),
      "engineeringRationale": "string explaining jeopardy elevation"
    },
    {
      "archetype": "visceral_pattern_interrupt",
      "hookText": "string (<= 8 words)",
      "estimatedDurationSeconds": number (<= 4.0),
      "engineeringRationale": "string explaining pattern interrupt"
    }
  ]
}`;

    const prompt = `Synthesize 3 viral hook rewrites based on these diagnostic findings:

<original_hook_0_to_3s>
${input.swipeZoneText}
</original_hook_0_to_3s>

<diagnostics>
Hook Velocity Score: ${input.hookAudit.hookVelocityScore}
Negative Critiques:
${input.hookAudit.negativeCritique.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
Swiper Verdict: ${input.swiperVerdict.brutalVerdict} (Swiped at second: ${input.swiperVerdict.swipeAtSecond})
Predicted Retention: ${input.swiperVerdict.predictedRetentionScore}%
</diagnostics>

<user_script>
${input.fullScript}
</user_script>

Synthesize exactly 3 rewrites (<= 8 words each). Return pure JSON.`;

    const result = await this.driver.generateJson<RemakeOutput>({
      prompt,
      schema: RemakeOutputSchema,
      systemPrompt,
      temperature: 0.3,
    });

    const rewrites = result.prescriptiveRewrites ?? result.rewrites ?? [];
    return {
      prescriptiveRewrites: rewrites,
      rewrites,
    };
  }
}
