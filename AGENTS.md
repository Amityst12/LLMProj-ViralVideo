# AGENTS.md - Agent Operating Contract

## 1. System & Architecture Constraints
- **Runtime**: Node.js >= 20.0.0 (LTS).
- **Language**: TypeScript 5.x with strict mode enabled (`noImplicitAny`, `strictNullChecks`, etc.).
- **Module System**: ESM (`NodeNext` resolution).
- **Framework & Libraries**: Modern CLI and LLM pipeline tooling. Avoid bloated runtimes.

## 2. Security & Zero-Leakage Policy
- **Absolute Prohibition**: Never commit secrets, API keys, credentials, or private access tokens into code, tests, docs, or git history.
- **Credential Storage**: Secrets reside solely in `.env` (git-ignored) and environment variables.
- **Pre-Commit Enforcement**: Every commit must pass `scripts/check-secrets.mjs` before being staged/committed.
- **Violation Protocol**: If a key is detected or accidentally committed, immediately revoke/rotate the key and scrub git history.

## 3. Git Discipline & Atomic Commits
- **Evidence-Driven**: The repository git history is the primary source of truth for evaluation.
- **Commit Structure**: Strictly enforce Conventional Commits with a clear explanation of *WHY* the change was made:
  ```text
  <type>(<scope>): <WHY the change was made>
  ```
  - Allowed types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`.
  - Scopes reflect pipeline boundaries (e.g., `setup`, `ingest`, `hook-eval`, `deconstructor`, `cli`).
- **Atomic Commits**: One logical change per commit. Do not combine unrelated refactoring, feature work, or framing docs.

## 4. Verification Gate (DoD & Pre-Commit)
- Before creating any commit or marking any task as complete, the verification gate MUST succeed:
  ```bash
  npm run verify
  ```
- **Execution Chain**: `npm run lint` -> `npm run build` -> `npm run test`.
- All linters must pass with zero errors/warnings.
- Build must compile TypeScript without diagnostic warnings or errors.
- Vitest suite must achieve 100% pass rate.
- Husky pre-commit hook automatically triggers `scripts/check-secrets.mjs` and `npm run verify`. Never use `--no-verify` to bypass gates.

## 5. Agent Workflow & Autonomy
- Work methodically through bounded turns: Setup -> Reverse Interview -> Architecture Specification -> TDD Implementation -> Evaluation -> Demo.
- Never write application logic without an approved framing specification, test harness, and strict input/output contract.
- Any architectural change or scope expansion requires explicit documentation in `docs/` and prior user alignment.
