# Problem Framing: Viral Hook & Retention Deconstructor (LLMProj-ViralVideo)

## 1. Problem Statement
Short-form video creators (TikTok, Instagram Reels, YouTube Shorts) compete in an ultra-high friction attention economy. Algorithmic retention curves drop precipitously within the first **3 seconds** ("the swipe zone"). If a hook fails to establish immediate curiosity, emotional tension, pattern interrupt, or a high-stakes premise, viewers swipe away before any core value is delivered.

Existing LLM tools and off-the-shelf chatbots fail creators due to **AI Sycophancy**:
- When presented with a script or hook, generic models offer uncritical praise ("Great hook! Very engaging!").
- They fail to deconstruct cognitive retention mechanics (e.g., information gaps, payoff velocity, cognitive load, negative framing, sensory anchors).
- They do not quantify second-by-second drop-off risk or pinpoint exact failure timestamps.
- They lack adversarial critique and prescriptive, high-retention alternatives grounded in empirical viral mechanics.

**LLMProj-ViralVideo** solves this by operating as an uncompromising, agentic deconstructor that evaluates video hooks and retention structures without sycophancy, exposes drop-off vulnerabilities, and outputs rigorous, actionable deconstructions and archetypal rewrites.

---

## 2. Input Modality & Timing Specification
- **Input Types**:
  - Raw Script text: up to **2,000 characters** maximum.
  - Optional explicit timestamp markers (seconds per segment / line).
- **Deterministic Cadence & WPM Estimator**:
  - In the absence of explicit timestamps, a pure-code deterministic algorithm calculates spoken cadence based on a baseline rate of **150 Words Per Minute (WPM)**.
  - The script is automatically partitioned into discrete temporal windows:
    1. **The Swipe Zone (0–3 seconds)**: The critical hook window where retention decisions occur.
    2. **Value Delivery Window (3–15 seconds)**: The initial thesis payoff and bridge to core content.
    3. **Body & Resolution Window (15+ seconds)**: Sustained engagement, payoff, and closing call-to-action.

---

## 3. Evaluation Taxonomy & Anti-Sycophancy Gate
- **5 Discrete Evaluation Dimensions (0–100 score scale)**:
  1. **Curiosity Gap**: Does the opening introduce an unresolved information deficit that compels continued watching?
  2. **Cognitive Friction**: Does the opener create unnecessary mental resistance (complex jargon, filler phrases, delayed setup)?
  3. **Pattern Interrupt**: Does the opener break expected feed inertia via jarring contrast or unexpected positioning?
  4. **Emotional Stake**: Does the viewer perceive immediate upside or downside risk within the first 3 seconds?
  5. **Sensory / Visual Specificity**: How concrete and tangible is the opening line versus vague abstractions?
- **Strict Anti-Sycophancy Invariant**:
  - The system validation layer enforces a non-negotiable Zod invariant: the output must include a `negativeCritique` array containing **at least 2 concrete, specific failure points** localized within seconds 0–3.
  - Any model generation failing this invariant is rejected and retried with heightened adversarial constraints.

---

## 4. Multi-Agent System Roles & Architecture
1. **Ingestion & Cadence Agent**: Validates input character limits and partitions script into temporal slots using the deterministic 150 WPM estimator.
2. **Hook Auditor & Pacing Tracker**: Deconstructs cognitive mechanics and scores the 5 core dimensions.
3. **The Skeptic Swiper (Adversarial Drop-Off Simulator)**:
   - Simulates a hyper-distracted, impatient short-form viewer.
   - Outputs:
     - `swipeAtSecond`: `1` | `2` | `3` | `"survived"`
     - `brutalVerdict`: Single punchy, unvarnished sentence explaining the swipe trigger.
     - `predictedRetentionScore`: Estimated 3-second retention probability (0–100%).
4. **The Remake Architect (Prescriptive Synthesizer)**:
   - Ingests diagnostic critique and generates 3 distinct, high-retention hook rewrites grounded in proven viral archetypes:
     1. *The Negative Frame Hook* (Attacking a common mistake / belief).
     2. *The High-Stakes Intrigue* (Immediate tangible risk or hidden cost).
     3. *The Visceral Pattern Interrupt* (Counter-intuitive revelation breaking feed inertia).
   - Provides an engineering rationale for why each alternative mitigates friction and improves survival across second 3.

---

## 5. Stakeholder List
1. **Short-Form Content Creators**: Receive brutal, objective, second-by-second diagnostic feedback and concrete hook rewrites before filming or posting.
2. **End Viewers / Audience**: Modelled attention dynamics reflect their cognitive thresholds, boredom triggers, and swipe instincts.
3. **Course Evaluators / Lecturer**: Assess engineering rigor, testable contracts, architectural hygiene, atomic Git progression, and LLM-agent design patterns.
4. **Autonomous Pipeline Agents**: Function as bounded, contract-adherent components communicating via strictly validated TypeScript/Zod schemas.

---

## 6. Definition of Done (DoD)
A delivery phase or release is considered **Done** only when:
1. **Verifiable Gate**: `npm run verify` passes completely (`lint` + `build` + `test`) with zero errors and zero warnings.
2. **Zero-Secret Compliance**: `scripts/check-secrets.mjs` executes cleanly on all staged/committed files.
3. **Strict Contract Adherence**: All inputs and outputs conform to validated Zod schemas.
4. **Anti-Sycophancy Enforcement**: Output payload provably contains at least 2 distinct negative critiques in seconds 0–3.
5. **Deterministic No-Cost Verification**: A local Golden Dataset (`tests/fixtures/`) powers comprehensive CI/CD tests via deterministic mock/demo mode without token burn.
6. **Triple Hook Generation**: Exactly 3 distinct viral archetypes are synthesized with valid engineering rationales.
7. **Atomic Provenance**: Every commit strictly follows `<type>(<scope>): <WHY>` and reflects a single logical unit of change.

---

## 7. Explicit Out-of-Scope
The following features are explicitly rejected to prevent scope drift:
- **Raw Video Rendering / NLE Export**: No video transcoding, cutting, or FFmpeg media generation.
- **Heavy Media Scraping / Video Binary Downloads**: No downloading gigabytes of MP4s from social platforms.
- **User Authentication / DB Persistence**: No OAuth, user accounts, JWT sessions, or persistent SQL/NoSQL stores.
- **Social Platform Automated Publishing**: No direct posting to TikTok, Instagram, or YouTube APIs.
- **Graphical Video Player UI**: Primary interface is a resilient CLI pipeline accompanied by structured JSON/Markdown analytical reports.

---

## 8. Assumptions & Risk Register

### Assumptions
- Input scripts are in English or Hebrew, capped at 2,000 characters.
- Spoken cadence defaults to 150 WPM when manual timestamps are absent.
- API connectivity supports standard LLM endpoints (OpenAI / OpenRouter / Anthropic / Gemini).

### Risk Register
| Risk ID | Description | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **LLM Sycophancy Drift**: Model defaults to flattering the user's script. | High | High | Zod schema validation gate rejecting output without >= 2 concrete negative failure points; adversarial prompt engineering. |
| **R-02** | **Timing Inaccuracy**: Word pacing varies wildly across speakers. | Medium | Medium | Deterministic 150 WPM baseline with syllable/word boundary heuristic, plus optional explicit manual timestamp support. |
| **R-03** | **Hallucinated Retention Metrics**: Scores do not correlate with text flaws. | High | Medium | Direct mapping between identified friction markers and score deductions; deterministic Golden Dataset calibration. |
| **R-04** | **CI Flakiness & Token Costs**: Tests failing due to external API latency or costs. | High | Low | Pure-code mock/demo fixtures in `tests/fixtures/` decoupling automated test suite from live external API access. |
| **R-05** | **Malformed JSON from LLM**: Structured outputs fail parsing. | High | Medium | Strict Zod validation with JSON Schema enforcement and automated fallback retry loop. |
