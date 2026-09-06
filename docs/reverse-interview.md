# Reverse Interview: Viral Hook & Retention Deconstructor (Module 2)

**Participants**:
- **Interviewer**: Lead Architect & System Designer
- **Interviewee**: Product Stakeholder & Viral Content Strategist
- **Date**: 2026-09-06
- **Context**: Modules 1–3 Problem Framing, Boundary Clarification & Anti-Sycophancy Alignment

---

## 1. Problem Space & Value Proposition

**Lead Architect**: Why do creators need an agentic AI system to deconstruct scripts rather than just asking ChatGPT or Claude directly?

**Strategist**: Because standard foundation models suffer from extreme **AI Sycophancy**. When a creator pastes a draft script into ChatGPT, the default response is almost always polite and encouraging: *"This is a great hook! It's very catchy and engaging."* But in the real world of TikTok, Reels, and Shorts, viewer attention is brutal: 60–80% of viewers swipe away within the first **3 seconds** (the "Swipe Zone"). Creators don't need flattery; they need an adversarial auditor that tells them exactly why, where, and when viewers will drop off.

---

## 2. Input Constraints & Deterministic Cadence

**Lead Architect**: Should the system accept video/audio files directly, or start with raw text scripts?

**Strategist**: We must start with raw text scripts (up to 2,000 characters). Audio/video ingestion adds latency, transcription variance, and massive token/compute costs. By focusing strictly on text, we isolate the cognitive structure and rhetorical hook mechanics.

**Lead Architect**: If we don't have an audio timeline, how do we evaluate what happens at second 1, 2, and 3?

**Strategist**: We use a deterministic cadence standard: **150 Words Per Minute (WPM)**, which translates to exactly **2.5 words per second**. At 150 WPM:
- **0.0–3.0s (The Swipe Zone)**: Contains the first 7–8 spoken words.
- **3.0–15.0s (Value Delivery)**: Contains the next ~30 words where the premise must be validated.
- **15.0s+ (Body & Resolution)**: The remaining payload.

This calculation must be deterministic code (zero LLM hallucination on math).

---

## 3. Cognitive Retention Taxonomy & The Anti-Sycophancy Gate

**Lead Architect**: What dimensions determine whether a viewer swipes away?

**Strategist**: Five core psychological levers:
1. **Curiosity Gap**: An unresolved information deficit compelling continuation.
2. **Cognitive Friction**: Delay in getting to the point, filler phrases ("Hey guys, what's up?"), or high cognitive load.
3. **Pattern Interrupt**: Breaking expected feed inertia visually or verbally.
4. **Emotional Stake**: Immediate perceived risk or high-value upside.
5. **Sensory Specificity**: Concrete imagery rather than vague abstractions.

**Lead Architect**: How do we guarantee the AI won't become flattering?

**Strategist**: By implementing a hard, server-side invariant gate in code:
Every deconstruction report **must contain at least two localized, unvarnished negative critiques** targeting the opening 3 seconds (`negativeCritique.length >= 2`). If a model produces a report without at least 2 negative failure points, the validation gate rejects it.

---

## 4. Adversarial Simulation & Prescriptive Remakes

**Lead Architect**: What agents should comprise the pipeline?

**Strategist**:
1. **Hook Auditor & Pacing Tracker**: Deconstructs the 5 dimensions and scores hook velocity.
2. **The Skeptic Swiper**: An adversarial agent simulating an impatient viewer. Decides whether to swipe at 1s, 2s, 3s, or "survived", with a brutal single-sentence verdict.
3. **The Remake Architect**: A prescriptive synthesizer that generates 3 high-retention alternatives grounded in viral archetypes:
   - *The Negative Frame*: Attacking a common habit or misconception.
   - *High-Stakes Intrigue*: Revealing a hidden risk or immediate consequence.
   - *Visceral Pattern Interrupt*: A counter-intuitive claim that disrupts scrolling.
   Each hook must be $\le 8$ words ($\le 3.2$ seconds at 150 WPM) so it fits entirely inside The Swipe Zone.

---

## 5. Token Economics & Deployment

**Lead Architect**: How do we make this production-ready and cost-effective?

**Strategist**:
- Use OpenRouter for flexible model routing.
- Support affordable, high-speed models (`google/gemini-2.0-flash-exp:free`, `deepseek/deepseek-chat`).
- Expose real-time token economics telemetry (prompt/completion tokens, latency, cost in USD).
- Deliver as a full-stack web application with Express backend, serverless deployment via Netlify Functions, and persistent analysis history for user retrospectives.
