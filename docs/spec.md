# Technical Specification: Viral Hook & Retention Deconstructor (LLMProj-ViralVideo)
**Version:** 1.0.0  
**Status:** Locked  
**Methodology:** Agentic Software Engineering (Knuth-Style 5-Part Specification)

---

## Part 1: Goal and Reason

### 1.1 The Cognitive Reality of Short-Form Retention
In algorithmic media ecosystems (TikTok, Instagram Reels, YouTube Shorts), human attention is governed by sub-second cognitive gating. When a viewer enters a video, an involuntary evaluation occurs within **0 to 3 seconds** ("The Swipe Zone"). 

Viewers do not leave because a video is "bad" in the aggregate; they leave because the initial cognitive load exceeds the anticipated value reward. Friction manifests in several forms:
- **Preamble Fatigue**: Greetings, channel introductions, or logistical throat-clearing ("Hey guys, today I want to show you...").
- **Abstract Vagueness**: Statements lacking sensory anchors or tangible stakes ("Let's talk about success").
- **Absence of Curiosity Gaps**: Stating conclusions immediately without creating an open cognitive loop.
- **Visual/Textual Inaction**: Failing to disrupt the rhythmic inertia of continuous thumb-scrolling.

### 1.2 The Failure of Generic LLMs: Systematic Sycophancy
Current foundation models fine-tuned with Reinforcement Learning from Human Feedback (RLHF) exhibit a documented defect: **Sycophancy Bias**. When presented with a creator's draft script, an off-the-shelf chatbot reliably provides flattering affirmations ("*This is a compelling and energetic hook!*"), masking critical retention leaks. 

Generic models fail to:
1. Penalize delayed value payoff.
2. Calculate second-by-second viewer abandonment probabilities.
3. Distinguish between grammatically correct prose and high-velocity retention copywriting.
4. Provide structured, reproducible engineering outputs.

### 1.3 The System Mandate
**LLMProj-ViralVideo** is an adversarial, agentic pipeline designed to deconstruct short-form video scripts without flattery. It partitions scripts into precise temporal windows, subjects the first 3 seconds to adversarial critique, enforces a mathematical anti-sycophancy invariant, and outputs three calibrated hook rewrites engineered to survive the swipe threshold.

---

## Part 2: Testable Success Criteria

The behavior of the system is governed by four deterministic Success Criteria (**SC-1** through **SC-4**). Every criterion is machine-verifiable via automated unit and integration tests.

### SC-1: Ingestion Validation & Deterministic Cadence Partitioning
- **SC-1.1**: The system must accept raw text scripts up to **2,000 characters**. Any input exceeding 2,000 characters or containing empty/whitespace-only content must be rejected with an explicit `ValidationError`.
- **SC-1.2**: In the absence of manual millisecond timestamps, the system must execute a deterministic, pure-code Cadence Estimator operating at a baseline rate of **150 Words Per Minute (WPM)** (equivalent to 2.5 words per second).
- **SC-1.3**: The script must be segmented into three discrete temporal windows:
  - `The Swipe Zone`: $t \in [0.0, 3.0]$ seconds (approximately words 1 through 7–8).
  - `Value Delivery Window`: $t \in (3.0, 15.0]$ seconds.
  - `Body & Resolution Window`: $t > 15.0$ seconds.
- **SC-1.4**: If explicit timestamps are provided in the input, the system must parse and validate them against monotonic time ordering ($t_{start} < t_{end}$).

### SC-2: Anti-Sycophancy Invariant & 5-Dimensional Retention Evaluation
- **SC-2.1 (Strict Invariant)**: The deconstruction output must include a `negativeCritique` array containing **at least 2 distinct, concrete failure points** localized within seconds 0.0 to 3.0. Output payloads where `negativeCritique.length < 2` must fail schema validation.
- **SC-2.2**: The deconstructor must evaluate and score exactly five discrete retention dimensions on a continuous integer scale of $[0, 100]$:
  1. `curiosityGap`: Degree to which an unanswered question or information deficit is established.
  2. `cognitiveFriction`: Inverted penalty score (lower friction = higher score) reflecting lexical simplicity and absence of throat-clearing.
  3. `patternInterrupt`: Degree of disruption to feed scroll inertia.
  4. `emotionalStake`: Clarity of immediate risk, loss, or benefit to the viewer.
  5. `sensorySpecificity`: Presence of tangible, concrete imagery vs. abstract generalities.
- **SC-2.3**: An overall `hookVelocityScore` must be computed as the weighted composite:
  $$\text{Score} = 0.25 \times \text{curiosityGap} + 0.20 \times \text{cognitiveFriction} + 0.20 \times \text{patternInterrupt} + 0.20 \times \text{emotionalStake} + 0.15 \times \text{sensorySpecificity}$$

### SC-3: Adversarial Swiper Simulation & Retention Curve Projection
- **SC-3.1**: The system must include an adversarial agent ("The Skeptic Swiper") simulating an impatient, distracted user.
- **SC-3.2**: The agent must output:
  - `swipeAtSecond`: A discrete value strictly belonging to the union set $\{1, 2, 3, \text{"survived"}\}$.
  - `brutalVerdict`: Exactly one concise sentence (maximum 20 words) explaining the primary impulse to swipe away.
  - `predictedRetentionScore`: An estimated percentage $[0, 100]\%$ indicating the probability of a viewer staying past second 3.0.
- **SC-3.3**: The simulation must be calibrated such that generic introductions ("Hi everyone", "In this video") deterministically yield `swipeAtSecond` $\le 2$ with retention $< 40\%$.

### SC-4: Tri-Archetype Prescriptive Remake & Engineering Rationale
- **SC-4.1**: The system must synthesize exactly three alternative hooks, each adhering to an established viral archetype:
  1. `The Negative Frame Hook`: Attacks a pervasive error, myth, or counterproductive habit (e.g., *"Stop doing X..."*).
  2. `The High-Stakes Intrigue`: Introduces immediate downside exposure or concealed jeopardy (e.g., *"If you do X, you are quietly losing Y..."*).
  3. `The Visceral Pattern Interrupt`: Confronts the viewer with an immediate counter-intuitive paradox (e.g., *"Everything you were taught about X is mathematically backwards..."*).
- **SC-4.2**: Each rewrite must fit within the 3.0-second window ($\le 8$ words at 150 WPM cadence).
- **SC-4.3**: Each archetype must include an `engineeringRationale` articulating the specific cognitive friction reduction and curiosity uplift achieved over the baseline input.

---

## Part 3: Architectural Guidance & Boundaries

### 3.1 Multi-Agent Pipeline Flow
```
[Raw User Script] (<= 2,000 chars)
        |
        v
+-------------------------------------------------------------+
| Stage 1: Ingestion & Cadence Partitioning                   |
| - Zod Input Validation                                      |
| - Pure-code 150 WPM Cadence Estimator                       |
| - Temporal Window Slicing (0-3s, 3-15s, 15s+)               |
+-------------------------------------------------------------+
        |
        +----------------------------+----------------------------+
        |                            |                            |
        v                            v                            v
+------------------------+  +------------------------+  +------------------------+
| Stage 2A: Hook Auditor |  | Stage 2B: Pacing       |  | Stage 2C: The Skeptic  |
| - 5-Dim Retention Eval |  | Tracker                |  | Swiper                 |
| - Anti-Sycophancy Gate |  | - Syllable Density     |  | - Adversarial Decision |
| - >= 2 Negative Points |  | - Preamble Lag (ms)    |  | - Swipe Timestamp      |
+------------------------+  +------------------------+  +------------------------+
        |                            |                            |
        +----------------------------+----------------------------+
                                     |
                                     v
+-------------------------------------------------------------+
| Stage 3: The Remake Architect (Prescriptive Synthesis)       |
| - Synthesizes Audit Diagnostics + Swiper Verdict            |
| - Produces 3 Viral Archetype Rewrites (<= 8 words each)     |
| - Formulates Cognitive Engineering Rationales               |
+-------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------+
| Final Output Validator (Zod Invariant Enforcement)         |
| - Rejects malformed JSON                                    |
| - Verifies non-sycophancy invariant                         |
| - Serializes structured JSON / CLI Markdown Report          |
+-------------------------------------------------------------+
```

### 3.2 Strict Data Contracts (TypeScript & Zod)

```typescript
import { z } from 'zod';

export const InputScriptSchema = z.object({
  text: z.string().min(1, 'Script cannot be empty').max(2000, 'Script exceeds 2,000 characters limit'),
  wpm: z.number().positive().default(150),
  customTimestamps: z.array(z.object({
    startSeconds: z.number().min(0),
    endSeconds: z.number().min(0),
    text: z.string().min(1),
  })).optional(),
});

export type InputScript = z.infer<typeof InputScriptSchema>;

export const TemporalSegmentSchema = z.object({
  window: z.enum(['swipe_zone', 'value_delivery', 'body_and_resolution']),
  startSeconds: z.number(),
  endSeconds: z.number(),
  text: z.string(),
  wordCount: z.number(),
});

export type TemporalSegment = z.infer<typeof TemporalSegmentSchema>;

export const RetentionDimensionsSchema = z.object({
  curiosityGap: z.number().min(0).max(100),
  cognitiveFriction: z.number().min(0).max(100),
  patternInterrupt: z.number().min(0).max(100),
  emotionalStake: z.number().min(0).max(100),
  sensorySpecificity: z.number().min(0).max(100),
  compositeScore: z.number().min(0).max(100),
});

export const SwiperSimulationSchema = z.object({
  swipeAtSecond: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal('survived')]),
  brutalVerdict: z.string().min(1).max(150),
  predictedRetentionScore: z.number().min(0).max(100),
});

export const ArchetypeRewriteSchema = z.object({
  archetype: z.enum(['negative_frame', 'high_stakes_intrigue', 'visceral_pattern_interrupt']),
  hookText: z.string().min(1),
  estimatedDurationSeconds: z.number().max(4.0),
  engineeringRationale: z.string().min(1),
});

export const DeconstructorReportSchema = z.object({
  metadata: z.object({
    evaluatedAt: z.string().datetime(),
    totalWordCount: z.number(),
    estimatedDurationSeconds: z.number(),
  }),
  segments: z.array(TemporalSegmentSchema),
  dimensions: RetentionDimensionsSchema,
  negativeCritique: z.array(z.string().min(5)).min(2, 'Anti-Sycophancy Invariant Violated: Must identify at least 2 negative failure points in the hook'),
  swiperVerdict: SwiperSimulationSchema,
  prescriptiveRewrites: z.array(ArchetypeRewriteSchema).length(3, 'Must provide exactly 3 archetypal rewrites'),
});

export type DeconstructorReport = z.infer<typeof DeconstructorReportSchema>;
```

### 3.3 Security & Isolation Boundaries
1. **Prompt Injection Prevention**: User scripts are treated strictly as passive string data. Prompts encapsulate script payloads within explicit boundary tags (`<user_script_content>...</user_script_content>`) and instruct the LLM to ignore system directive overrides within the payload.
2. **Schema Sanitization**: All model outputs pass through `DeconstructorReportSchema.parse()`. If validation fails, raw output is logged to diagnostic trace and an immediate deterministic fallback or error is raised.
3. **Environment Security**: No API credentials appear in CLI arguments or serialized payloads. The pipeline reads keys exclusively via `process.env`.

---

## Part 4: Validation Approach & Test Strategy

### 4.1 Test-Driven Development (TDD) Lifecycle
Development proceeds strictly from tests to implementation:
1. Write failing unit tests defining boundary behaviors.
2. Implement pure-code domain logic (WPM estimator, segmenter, schemas).
3. Implement mock LLM adapters returning deterministic fixture outputs.
4. Execute `npm run verify` to guarantee zero regression.

### 4.2 Local Golden Dataset (`tests/fixtures/`)
To eliminate token costs and prevent CI flakiness, automated tests run against a curated local dataset:
- `golden-viral.json`: A battle-tested viral hook (high curiosity, visceral pattern interrupt, low friction).
  - *Expected Result*: `swipeAtSecond: "survived"`, composite score $\ge 80$, retention $\ge 75\%$.
- `golden-mediocre.json`: A standard informative hook with moderate throat-clearing.
  - *Expected Result*: `swipeAtSecond: 3`, composite score $40–65$, retention $40–60\%$.
- `golden-terrible.json`: A generic corporate/greeting opener ("Hello everyone, welcome back to my channel...").
  - *Expected Result*: `swipeAtSecond: 1`, composite score $< 30$, retention $< 25\%$.

### 4.3 Pluggable LLM Driver Architecture
The system employs an abstract `LlmDriver` interface:
- `MockLlmDriver`: Returns fixture-backed deterministic payloads for 100% of automated test suites.
- `OpenRouterLlmDriver`: Real-world LLM execution supporting Anthropic Claude, OpenAI GPT-4o, and Google Gemini via OpenRouter/native APIs.
- `DemoLlmDriver`: Algorithmic rule-based local generator for offline interactive demos without external network requirements.

### 4.4 Guarding Against Self-Confirming Tests
- Tests verify mathematical properties independently of LLM prompt wording.
- Zod invariants are tested with deliberate negative test cases (e.g., verifying that a payload with 1 or 0 negative critiques throws a `ZodError`).
- WPM boundary tests assert exact word slices against known timestamp math.

---

## Part 5: Known Pitfalls & Mitigations

### 5.1 Pitfall 1: Sycophancy Leakage
- **Failure Mode**: The model generates cosmetic critiques that are secretly complimentary (e.g., *"The hook is almost too exciting, which might overwhelm the viewer"*).
- **Mitigation**: The system prompt provides few-shot negative examples demonstrating ruthless brevity. The anti-sycophancy validation asserts that critique strings do not contain blacklisted praise tokens (*"great"*, *"awesome"*, *"engaging"*, *"perfect"*).

### 5.2 Pitfall 2: Temporal Window Bleed
- **Failure Mode**: The model generates a "hook" rewrite that contains 25 words, requiring 10 seconds to speak at normal pace, thereby failing the 3-second boundary.
- **Mitigation**: The `ArchetypeRewriteSchema` computes word count on generated hooks and asserts that duration at 150 WPM does not exceed 3.5 seconds ($\le 9$ words).

### 5.3 Pitfall 3: JSON Parsing Fragility & Markdown Code Block Wrapping
- **Failure Mode**: The LLM outputs markdown wrappers (e.g. ````json ... ````) or conversational preambles that break `JSON.parse()`.
- **Mitigation**: An extraction preprocessor isolates the outermost `{ ... }` substring and strips markdown fences before passing the string to `JSON.parse()` and Zod.

### 5.4 Pitfall 4: Metric Hallucination
- **Failure Mode**: The model outputs random numerical scores detached from textual reality (e.g., a score of 95 for a script with high friction).
- **Mitigation**: Rubric calibration prompts anchor specific score ranges to concrete syntactic patterns (e.g., presence of personal pronouns in the first 3 words deducts 20 points from pattern interrupt).
