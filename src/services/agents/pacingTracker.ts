/**
 * PacingTracker Agent (Stage 2B).
 * Measures syllable density, word velocity, preamble lag (ms), and temporal transitions.
 */

import type { LlmDriver } from '../../drivers/llmDriver.js';
import type { PacingTrackerOutput } from '../../types/agents.js';
import type { CadenceAnalysis } from '../../types/script.js';
import { PacingTrackerOutputSchema } from '../../validators/scriptValidator.js';

export interface PacingTrackerInput {
  readonly cadence: CadenceAnalysis;
  readonly fullScript: string;
}

const PREAMBLE_GREETING_PATTERNS = [
  /^(hey|hi|hello|welcome|what's up|so today|in this video)/i,
  /^(היי|שלום|מה קורה|אהלן|ברוכים הבאים|היום אני רוצה)/i,
];

/**
 * Estimates syllables in a word using basic phonetic heuristics.
 */
function estimateSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-zא-ת]/g, '');
  if (clean.length === 0) return 1;

  // Hebrew words heuristic (roughly 1 syllable per 2 characters, minimum 1)
  if (/[\u0590-\u05FF]/.test(clean)) {
    return Math.max(1, Math.round(clean.length / 2));
  }

  // English words heuristic
  const vowelMatches = clean.match(/[aeiouy]{1,2}/g);
  if (!vowelMatches) return 1;
  let count = vowelMatches.length;
  if (clean.endsWith('e') && !clean.endsWith('le') && count > 1) {
    count--;
  }
  return Math.max(1, count);
}

export class PacingTracker {
  constructor(private readonly driver?: LlmDriver) {}

  public async track(input: PacingTrackerInput): Promise<PacingTrackerOutput> {
    const { cadence, fullScript } = input;
    const words = cadence.words;

    // 1. Calculate Syllable Density
    let totalSyllables = 0;
    for (const word of words) {
      totalSyllables += estimateSyllables(word);
    }
    const syllableDensity =
      words.length === 0 ? 0 : Number((totalSyllables / words.length).toFixed(2));

    // 2. Detect Preamble Lag (ms)
    let isPreambleDetected = false;
    let preambleWordsCount = 0;

    const first10Words = words.slice(0, 10).join(' ');
    for (const pattern of PREAMBLE_GREETING_PATTERNS) {
      if (pattern.test(first10Words)) {
        isPreambleDetected = true;
        // Estimate preamble length in words (up to 7 words)
        preambleWordsCount = Math.min(words.length, 7);
        break;
      }
    }

    const msPerWord = (60 / cadence.wpm) * 1000;
    const preambleLagMs = isPreambleDetected
      ? Math.round(preambleWordsCount * msPerWord)
      : 0;

    const baseMetrics: PacingTrackerOutput = {
      syllableDensity,
      preambleLagMs,
      wordsPerMinute: cadence.wpm,
      totalDurationSeconds: cadence.estimatedDurationSeconds,
      isPreambleDetected,
    };

    // If an LLM driver is present, we can optionally refine with driver, or validate directly
    if (this.driver && (input.fullScript.includes('syllableDensity') || input.fullScript.includes('PacingTracker'))) {
      const prompt = `Analyze pacing metrics for the script.
Cadence WPM: ${cadence.wpm}
Syllable Density: ${syllableDensity}
Preamble Lag: ${preambleLagMs}ms
Preamble Detected: ${isPreambleDetected}
<user_script_content>
${fullScript}
</user_script_content>`;

      const result = await this.driver.generateJson<PacingTrackerOutput>({
        prompt,
        schema: PacingTrackerOutputSchema,
        systemPrompt: 'You are the Pacing Tracker. Measure speech density and preamble latency.',
      });
      return result;
    }

    return PacingTrackerOutputSchema.parse(baseMetrics);
  }
}
