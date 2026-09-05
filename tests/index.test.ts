import { describe, it, expect } from 'vitest';
import { SYSTEM_INFO } from '../src/index.js';

describe('System Initialization', () => {
  it('should expose system metadata correctly', () => {
    expect(SYSTEM_INFO.name).toBe('LLMProj-ViralVideo');
    expect(SYSTEM_INFO.version).toBe('0.1.0');
    expect(SYSTEM_INFO.status).toBe('initialized');
  });
});
