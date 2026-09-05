/**
 * LLMProj-ViralVideo: Viral Hook & Retention Deconstructor
 * Main public entry point exposing type contracts, validators, drivers, agents, and orchestrator.
 */

// Types & Contracts
export * from './types/script.js';
export * from './types/agents.js';

// Validators & Schemas
export * from './validators/scriptValidator.js';

// Drivers
export * from './drivers/llmDriver.js';

// Cadence & Pacing Services
export * from './services/cadenceEstimator.js';

// Diagnostic & Generative Agents
export * from './services/agents/hookAuditor.js';
export * from './services/agents/pacingTracker.js';
export * from './services/agents/skepticSwiper.js';
export * from './services/agents/remakeArchitect.js';

// Main Orchestrator
export * from './services/deconstructorOrchestrator.js';

// System Metadata (Backwards-compatibility)
export interface SystemMetadata {
  readonly name: string;
  readonly version: string;
  readonly status: 'initialized' | 'ready' | 'active';
}

export const SYSTEM_INFO: SystemMetadata = {
  name: 'LLMProj-ViralVideo',
  version: '0.1.0',
  status: 'initialized',
};
