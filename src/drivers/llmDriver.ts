/**
 * Pluggable LLM Driver Layer.
 * Supports deterministic Mock testing and live cloud inference via OpenRouter.
 */

import { z } from 'zod';
import type {
  HookAuditorOutput,
  PacingTrackerOutput,
  RemakeOutput,
  SkepticSwiperOutput,
} from '../types/agents.js';
import {
  HookAuditorOutputSchema,
  PacingTrackerOutputSchema,
  RemakeOutputSchema,
  SkepticSwiperOutputSchema,
} from '../validators/scriptValidator.js';

export interface GenerateJsonOptions<T> {
  readonly prompt: string;
  readonly schema?: z.ZodType<T>;
  readonly systemPrompt?: string;
  readonly temperature?: number;
}

export interface LlmDriver {
  generateJson<T>(options: GenerateJsonOptions<T>): Promise<T>;
}

/**
 * Extracts raw JSON from potential markdown wrappers (```json ... ``` or ``` ... ```)
 * or conversational text.
 */
export function extractJsonFromText(raw: string): unknown {
  const trimmed = raw.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to markdown extraction
  }

  // 2. Markdown fence extraction (```json ... ``` or ``` ... ```)
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to object boundary extraction
    }
  }

  // 3. Outermost curly braces extraction { ... }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue to bracket extraction
    }
  }

  // 4. Outermost array brackets extraction [ ... ]
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Failed to parse
    }
  }

  throw new Error(`Failed to extract valid JSON from LLM response:\n${raw.slice(0, 300)}`);
}

/**
 * MockLlmDriver: Zero-cost, deterministic driver calibrated against the Golden Dataset.
 * Strictly adheres to Anti-Sycophancy Invariants and SC-1 through SC-4.
 */
export class MockLlmDriver implements LlmDriver {
  private readonly customResponses: Map<string, unknown> = new Map();

  constructor(customResponses?: Record<string, unknown>) {
    if (customResponses) {
      for (const [k, v] of Object.entries(customResponses)) {
        this.customResponses.set(k, v);
      }
    }
  }

  public setMockResponse(key: string, response: unknown): void {
    this.customResponses.set(key, response);
  }

  public async generateJson<T>(options: GenerateJsonOptions<T>): Promise<T> {
    const { prompt, schema } = options;

    // Check for explicit custom mocks
    for (const [key, val] of this.customResponses.entries()) {
      if (prompt.includes(key)) {
        return (schema ? schema.parse(val) : val) as T;
      }
    }

    const isViral =
      prompt.includes('Stop drinking coffee') ||
      prompt.includes('mineral water') ||
      prompt.includes('viralScript');

    const isMediocre =
      prompt.includes('היי חברים') ||
      prompt.includes('מה קורה') ||
      prompt.includes('ברוכים הבאים') ||
      prompt.includes('welcome back') ||
      prompt.includes('mediocreScript');

    let payload: unknown;

    const combined = `${options.systemPrompt ?? ''}\n${options.prompt}`;
    const schemaRef = schema as unknown;

    // Detect target agent contract by schema reference or prompt/system directives
    if (
      schemaRef === SkepticSwiperOutputSchema ||
      combined.includes('SkepticSwiper') ||
      combined.includes('swipeAtSecond') ||
      combined.includes('predictedRetentionScore')
    ) {
      payload = this.getMockSkepticSwiper(isViral, isMediocre);
    } else if (
      schemaRef === HookAuditorOutputSchema ||
      combined.includes('HookAuditor') ||
      combined.includes('hookVelocityScore') ||
      combined.includes('curiosityGap')
    ) {
      payload = this.getMockHookAuditor(isViral);
    } else if (
      schemaRef === PacingTrackerOutputSchema ||
      combined.includes('PacingTracker') ||
      combined.includes('syllableDensity')
    ) {
      payload = this.getMockPacingTracker(isViral, isMediocre);
    } else if (
      schemaRef === RemakeOutputSchema ||
      combined.includes('RemakeArchitect') ||
      combined.includes('prescriptiveRewrites')
    ) {
      payload = this.getMockRemakeOutput(isViral);
    } else {
      payload = this.getMockHookAuditor(isViral);
    }

    if (schema) {
      return schema.parse(payload);
    }
    return payload as T;
  }

  private getMockHookAuditor(isViral: boolean): HookAuditorOutput {
    if (isViral) {
      return {
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
        hookVelocityScore: 83.25,
      };
    }

    return {
      dimensions: {
        curiosityGap: 30,
        cognitiveFriction: 25,
        patternInterrupt: 20,
        emotionalStake: 30,
        sensorySpecificity: 25,
        compositeScore: 26.25,
      },
      negativeCritique: [
        'Failure Point 1: Preamble throat-clearing greeting drains viewer patience in the first 2 seconds.',
        'Failure Point 2: Zero stakes or curiosity gap established prior to second 3.0.',
      ],
      hookVelocityScore: 26.25,
    };
  }

  private getMockPacingTracker(isViral: boolean, isMediocre: boolean): PacingTrackerOutput {
    if (isViral) {
      return {
        syllableDensity: 1.4,
        preambleLagMs: 0,
        wordsPerMinute: 150,
        totalDurationSeconds: 16.8,
        isPreambleDetected: false,
      };
    }

    return {
      syllableDensity: 1.8,
      preambleLagMs: isMediocre ? 2800 : 1200,
      wordsPerMinute: 150,
      totalDurationSeconds: 22.0,
      isPreambleDetected: true,
    };
  }

  private getMockSkepticSwiper(isViral: boolean, isMediocre: boolean): SkepticSwiperOutput {
    if (isViral) {
      return {
        swipeAtSecond: 'survived',
        brutalVerdict: 'Hook held attention past 3 seconds.',
        predictedRetentionScore: 88,
      };
    }

    return {
      swipeAtSecond: isMediocre ? 1 : 2,
      brutalVerdict: isMediocre
        ? 'Swiped immediately on generic channel greeting.'
        : 'Swiped at second 2 due to lack of curiosity gap.',
      predictedRetentionScore: isMediocre ? 15 : 32,
    };
  }

  private getMockRemakeOutput(isViral: boolean): RemakeOutput {
    if (isViral) {
      const rewrites = [
        {
          archetype: 'negative_frame' as const,
          hookText: 'Stop drinking coffee immediately after waking up.',
          estimatedDurationSeconds: 2.8,
          engineeringRationale: 'Immediate pattern interrupt attacking habitual morning routine.',
        },
        {
          archetype: 'high_stakes_intrigue' as const,
          hookText: 'Your cortisol spikes if you drink early coffee.',
          estimatedDurationSeconds: 3.2,
          engineeringRationale: 'Introduces hidden biological downside risk.',
        },
        {
          archetype: 'visceral_pattern_interrupt' as const,
          hookText: 'Never drink morning coffee before mineral water.',
          estimatedDurationSeconds: 2.8,
          engineeringRationale: 'Violates expectation with concrete counter-intuitive directive.',
        },
      ] as const;

      return {
        rewrites,
        prescriptiveRewrites: rewrites,
      };
    }

    const rewrites = [
      {
        archetype: 'negative_frame' as const,
        hookText: 'Stop wasting your morning on endless scrolling.',
        estimatedDurationSeconds: 2.8,
        engineeringRationale: 'Eliminates greeting preambles and targets viewer guilt.',
      },
      {
        archetype: 'high_stakes_intrigue' as const,
        hookText: 'You are quietly losing two hours every day.',
        estimatedDurationSeconds: 3.2,
        engineeringRationale: 'Quantifies immediate time loss to provoke retention.',
      },
      {
        archetype: 'visceral_pattern_interrupt' as const,
        hookText: 'Everything you know about time management is backwards.',
        estimatedDurationSeconds: 3.2,
        engineeringRationale: 'Shatters cognitive inertia with strong contrarian paradox.',
      },
    ] as const;

    return {
      rewrites,
      prescriptiveRewrites: rewrites,
    };
  }
}

export interface OpenRouterDriverOptions {
  readonly apiKey?: string;
  readonly model?: string;
  readonly baseUrl?: string;
  readonly fetchFn?: typeof fetch;
}

/**
 * OpenRouterLlmDriver: Production driver connecting to OpenRouter API.
 */
export class OpenRouterLlmDriver implements LlmDriver {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options?: OpenRouterDriverOptions) {
    this.apiKey = options?.apiKey ?? process.env['OPENROUTER_API_KEY'] ?? '';
    this.model = options?.model ?? 'google/gemini-2.5-flash';
    this.baseUrl = options?.baseUrl ?? 'https://openrouter.ai/api/v1';
    this.fetchFn = options?.fetchFn ?? globalThis.fetch;
  }

  public async generateJson<T>(options: GenerateJsonOptions<T>): Promise<T> {
    if (!this.apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is not configured. Provide it via constructor options or process.env.OPENROUTER_API_KEY'
      );
    }

    const { prompt, schema, systemPrompt, temperature = 0.2 } = options;

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await this.fetchFn(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://github.com/Amityst12/LLMProj-ViralVideo',
        'X-Title': 'LLMProj-ViralVideo Deconstructor',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status} ${response.statusText}): ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from OpenRouter API');
    }

    const parsedJson = extractJsonFromText(content);

    if (schema) {
      return schema.parse(parsedJson);
    }

    return parsedJson as T;
  }
}
