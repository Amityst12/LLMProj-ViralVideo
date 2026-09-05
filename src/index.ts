/**
 * LLMProj-ViralVideo: Viral Hook & Retention Deconstructor
 * Main public entry point exposing type contracts, validators, and core services.
 */

// Types & Contracts
export * from './types/script.js';
export * from './types/agents.js';

// Validators & Schemas
export * from './validators/scriptValidator.js';

// Cadence & Pacing Services
export * from './services/cadenceEstimator.js';

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
