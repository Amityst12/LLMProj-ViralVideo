# Problem Framing: Viral Hook & Retention Deconstructor (LLMProj-ViralVideo)

## 1. Problem Statement
Short-form video creators (TikTok, Instagram Reels, YouTube Shorts) compete in an ultra-high friction attention economy. Algorithmic retention curves drop precipitously within the first **3 seconds** ("the swipe zone"). If a hook fails to establish immediate curiosity, emotional tension, pattern interrupt, or a high-stakes premise, viewers swipe away before any core value is delivered.

Existing LLM tools and off-the-shelf chatbots fail creators due to **AI Sycophancy**:
- When presented with a script or hook, generic models offer uncritical praise ("Great hook! Very engaging!").
- They fail to deconstruct cognitive retention mechanics (e.g., information gaps, payoff velocity, cognitive load, negative framing, sensory anchors).
- They do not quantify second-by-second drop-off risk or pinpoint exact failure timestamps.
- They lack adversarial critique and prescriptive, high-retention alternatives grounded in empirical viral mechanics.

**LLMProj-ViralVideo** solves this by operating as an uncompromising, agentic deconstructor that evaluates video hooks and retention structures without sycophancy, exposes drop-off vulnerabilities, and outputs rigorous, actionable deconstructions.

---

## 2. Stakeholder List
1. **Short-Form Content Creators**: Need brutal, objective, second-by-second diagnostic feedback and concrete hook rewrites before filming or posting.
2. **End Viewers / Audience**: Experience the content; their attention span, swipe triggers, and curiosity thresholds form the empirical benchmark for analysis.
3. **Course Evaluators / Lecturer**: Assess engineering rigor, testable contracts, architectural hygiene, atomic Git progression, and LLM-agent design patterns.
4. **Autonomous System Agents**:
   - *Ingestion/Parser Agent*: Normalizes transcripts, timing markers, and pacing metadata.
   - *Deconstruction & Diagnostic Agent*: Evaluates hook anatomy, cognitive load, information gaps, and sycophancy-free friction points.
   - *Adversarial Red-Team Evaluator*: Simulates ruthless viewer drop-off decisions at second 1, 2, and 3.
   - *Prescriptive Synthesizer*: Generates calibrated alternatives with predicted retention gains.

---

## 3. Definition of Done (DoD)
A delivery phase or release is considered **Done** only when:
1. **Verifiable Gate**: `npm run verify` passes completely (`lint` + `build` + `test`) with zero errors and zero warnings.
2. **Zero-Secret Compliance**: `scripts/check-secrets.mjs` executes cleanly on all staged/committed files.
3. **Contract Adherence**: Input and output schemas strictly adhere to validated Zod/TypeScript types.
4. **Non-Sycophancy Guarantee**: Evaluation outputs include explicit, actionable critique, identified drop-off triggers, and calibrated retention scores rather than generic complimentary text.
5. **Determinism & Reproducibility**: Given a standardized test transcript and seed/temperature configuration, diagnostic output flags are consistent across repeated runs.
6. **Atomic Provenance**: All code and artifact progressions are recorded in Git commits following the `<type>(<scope>): <WHY>` convention.

---

## 4. Explicit Out-of-Scope (What Will NOT Be Built)
To ensure high signal-to-noise ratio and prevent scope creep, the following areas are strictly out-of-scope:
- **Raw Video Rendering & NLE Editing**: The system will not cut, stitch, encode, or export MP4/video files.
- **Heavy Media Scraping / Downloading**: No direct downloading or hosting of gigabyte video binaries from social platforms.
- **User Authentication & Multi-Tenancy**: No OAuth, user databases, password resets, or account tiers.
- **Social Media Publishing APIs**: No automated posting to TikTok, YouTube, or Instagram accounts.
- **Real-Time Video Player UI**: Focus remains on diagnostic pipeline, CLI interface, and structured analytical artifacts.

---

## 5. Assumptions & Risk Register

### Assumptions
- **Input Modality**: Input consists of text transcripts with timing/timestamp metadata (e.g., words per second, start/end timestamps), or raw script text tagged by segment.
- **LLM Availability**: Access to modern LLM APIs (OpenAI, Anthropic, or Gemini) configured via standard environment variables.
- **Retention Taxonomy**: Viral dynamics can be codified into discrete analytical dimensions (e.g., curiosity gap, stakes clarity, cognitive density, sensory specificity).

### Risk Register
| Risk ID | Description | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **LLM Sycophancy Drift**: Model defaults to flattering the user's script. | High | High | Few-shot adversarial system prompts, rigid negative evaluation criteria, rubrics penalizing vague praise. |
| **R-02** | **Transcript Timing Ambiguity**: User provides text without precise millisecond timestamps. | Medium | Medium | Implement smart cadence estimator (WPM / syllable model) to approximate second-by-second pacing when exact timestamps are absent. |
| **R-03** | **Hallucinatory Retention Metrics**: Deconstructor hallucinates arbitrary retention numbers without logical derivation. | High | Medium | Enforce structured schema mapping explicit textual markers to risk penalties with verifiable justifications. |
| **R-04** | **API Rate Limits / Cost**: High token consumption during multi-agent deconstruction. | Medium | Low | Efficient prompt token budgeting, structured JSON mode, and local caching of intermediate evaluations. |
