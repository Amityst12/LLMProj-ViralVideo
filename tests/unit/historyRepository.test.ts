/**
 * tests/unit/historyRepository.test.ts
 *
 * Unit tests for Database Persistence Layer (Module 7: Web App Architecture).
 * Verifies script analysis history storage, retrieval, and sorting.
 *
 * Requirements:
 * 1. saveAnalysis: Persists a script analysis with unique ID, timestamp, and report data.
 * 2. listAnalyses: Retrieves list of all analyses strictly sorted from newest to oldest.
 * 3. getAnalysisById: Retrieves full analysis by ID, returning null for non-existent IDs.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { DeconstructorReport } from '../../src/types/agents.js';
import { viralScript, mediocreScript } from '../fixtures/scripts.js';

export interface HistoryItemSummary {
  readonly id: string;
  readonly scriptPreview?: string;
  readonly scriptText?: string;
  readonly retentionScore?: number;
  readonly compositeScore?: number;
  readonly model?: string;
  readonly createdAt: string;
}

export interface HistoryRecord {
  readonly id: string;
  readonly scriptText: string;
  readonly report: DeconstructorReport;
  readonly model?: string;
  readonly createdAt: string;
}

export interface HistoryRepositoryContract {
  saveAnalysis(data: {
    scriptText: string;
    report: DeconstructorReport;
    model?: string;
  }): Promise<HistoryRecord> | HistoryRecord;
  listAnalyses(): Promise<HistoryItemSummary[]> | HistoryItemSummary[];
  getAnalysisById(id: string): Promise<HistoryRecord | null> | HistoryRecord | null;
  clear?(): Promise<void> | void;
}

interface RepoModuleShape {
  saveAnalysis?: (data: {
    scriptText: string;
    report: DeconstructorReport;
    model?: string;
  }) => Promise<HistoryRecord> | HistoryRecord;
  listAnalyses?: () => Promise<HistoryItemSummary[]> | HistoryItemSummary[];
  getAnalysisById?: (id: string) => Promise<HistoryRecord | null> | HistoryRecord | null;
  historyRepository?: HistoryRepositoryContract;
  HistoryRepository?: new () => HistoryRepositoryContract;
  clearHistory?: () => Promise<void> | void;
}

let repoModule: RepoModuleShape | null = null;

try {
  // @ts-expect-error - Implementation pending in src/services/historyRepository.ts by Alan
  repoModule = await import('../../src/services/historyRepository.js');
} catch {
  try {
    // @ts-expect-error - Fallback if placed in src/repository/historyRepository.ts
    repoModule = await import('../../src/repository/historyRepository.js');
  } catch {
    try {
      // @ts-expect-error - Fallback if exported from src/index.js
      repoModule = await import('../../src/index.js');
    } catch {
      repoModule = null;
    }
  }
}

function getRepo(): HistoryRepositoryContract {
  if (!repoModule) {
    throw new Error(
      'HistoryRepository is not yet implemented in src/services/historyRepository.ts (TDD Red Phase - awaiting Alan implementation)'
    );
  }

  if (
    typeof repoModule.saveAnalysis === 'function' &&
    typeof repoModule.listAnalyses === 'function' &&
    typeof repoModule.getAnalysisById === 'function'
  ) {
    return {
      saveAnalysis: repoModule.saveAnalysis,
      listAnalyses: repoModule.listAnalyses,
      getAnalysisById: repoModule.getAnalysisById,
      clear: repoModule.clearHistory,
    };
  }

  if (repoModule.historyRepository) {
    return repoModule.historyRepository;
  }

  if (repoModule.HistoryRepository) {
    return new repoModule.HistoryRepository();
  }

  throw new Error(
    'HistoryRepository exports (saveAnalysis, listAnalyses, getAnalysisById) are missing in repoModule (TDD Red Phase)'
  );
}

const mockReportA: DeconstructorReport = {
  metadata: {
    evaluatedAt: '2026-09-06T10:00:00.000Z',
    totalWordCount: 42,
    estimatedDurationSeconds: 16.8,
  },
  segments: [
    {
      window: 'swipe_zone',
      startSeconds: 0,
      endSeconds: 3,
      text: 'Stop drinking coffee immediately after waking up.',
      wordCount: 7,
    },
    {
      window: 'value_delivery',
      startSeconds: 3,
      endSeconds: 15,
      text: 'Cortisol peaks naturally in your body.',
      wordCount: 6,
    },
    {
      window: 'body_and_resolution',
      startSeconds: 15,
      endSeconds: 16.8,
      text: 'Wait ninety minutes before caffeine.',
      wordCount: 5,
    },
  ],
  dimensions: {
    curiosityGap: 85,
    cognitiveFriction: 90,
    patternInterrupt: 88,
    emotionalStake: 82,
    sensorySpecificity: 80,
    compositeScore: 85,
  },
  negativeCritique: [
    'Failure Point 1: Slightly abrupt transition to biological explanation.',
    'Failure Point 2: Missing visual anchor in the first second.',
  ],
  swiperVerdict: {
    swipeAtSecond: 'survived',
    brutalVerdict: 'Compelling pattern interrupt prevented swipe.',
    predictedRetentionScore: 88,
  },
  prescriptiveRewrites: [
    {
      archetype: 'negative_frame',
      hookText: 'Stop drinking coffee first thing every morning.',
      estimatedDurationSeconds: 2.8,
      engineeringRationale: 'Attacks routine habit.',
    },
    {
      archetype: 'high_stakes_intrigue',
      hookText: 'Your morning coffee is silently ruining focus.',
      estimatedDurationSeconds: 2.8,
      engineeringRationale: 'Introduces hidden cost.',
    },
    {
      archetype: 'visceral_pattern_interrupt',
      hookText: 'Caffeine does not give you real energy.',
      estimatedDurationSeconds: 2.8,
      engineeringRationale: 'Cognitive paradox breaks scroll inertia.',
    },
  ],
};

const mockReportB: DeconstructorReport = {
  ...mockReportA,
  dimensions: {
    ...mockReportA.dimensions,
    compositeScore: 45,
  },
  swiperVerdict: {
    swipeAtSecond: 2,
    brutalVerdict: 'Preamble fatigue caused quick swipe.',
    predictedRetentionScore: 35,
  },
};

describe('HistoryRepository (Module 7 Persistence Layer)', () => {
  beforeEach(async () => {
    try {
      const repo = getRepo();
      if (typeof repo.clear === 'function') {
        await repo.clear();
      }
    } catch {
      // Intentionally ignored in TDD Red Phase when repo is not yet implemented
    }
  });

  describe('saveAnalysis', () => {
    it('persists a new analysis record with a non-empty unique ID and valid createdAt timestamp', async () => {
      const repo = getRepo();
      const saved = await repo.saveAnalysis({
        scriptText: viralScript,
        report: mockReportA,
        model: 'anthropic/claude-3.5-haiku',
      });

      expect(saved).toBeDefined();
      expect(typeof saved.id).toBe('string');
      expect(saved.id.length).toBeGreaterThan(0);
      expect(saved.createdAt).toBeDefined();
      expect(new Date(saved.createdAt).getTime()).not.toBeNaN();
      expect(saved.scriptText).toBe(viralScript);
      expect(saved.report).toEqual(mockReportA);
      expect(saved.model).toBe('anthropic/claude-3.5-haiku');
    });

    it('generates distinct IDs for consecutive analysis records', async () => {
      const repo = getRepo();
      const first = await repo.saveAnalysis({
        scriptText: viralScript,
        report: mockReportA,
      });

      const second = await repo.saveAnalysis({
        scriptText: mediocreScript,
        report: mockReportB,
      });

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('listAnalyses', () => {
    it('retrieves all past analyses strictly sorted from newest to oldest', async () => {
      const repo = getRepo();

      const item1 = await repo.saveAnalysis({
        scriptText: viralScript,
        report: mockReportA,
        model: 'model-1',
      });

      // Brief delay to ensure distinct creation timestamps
      await new Promise((resolve) => setTimeout(resolve, 25));

      const item2 = await repo.saveAnalysis({
        scriptText: mediocreScript,
        report: mockReportB,
        model: 'model-2',
      });

      const list = await repo.listAnalyses();

      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(2);

      // Verify newest to oldest sorting (item2 created after item1)
      const ids = list.map((item) => item.id);
      const indexItem2 = ids.indexOf(item2.id);
      const indexItem1 = ids.indexOf(item1.id);

      expect(indexItem2).toBeLessThan(indexItem1);

      const timestamp2 = new Date(list[indexItem2]!.createdAt).getTime();
      const timestamp1 = new Date(list[indexItem1]!.createdAt).getTime();
      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);

      // Verify summary fields
      const summary = list[indexItem2]!;
      expect(summary.id).toBe(item2.id);
      const score = summary.retentionScore ?? summary.compositeScore;
      expect(score).toBe(45);
      const preview = summary.scriptPreview ?? summary.scriptText;
      expect(typeof preview).toBe('string');
      expect(preview?.length).toBeGreaterThan(0);
    });
  });

  describe('getAnalysisById', () => {
    it('returns the complete analysis record when queried by valid ID', async () => {
      const repo = getRepo();
      const saved = await repo.saveAnalysis({
        scriptText: viralScript,
        report: mockReportA,
        model: 'test-model',
      });

      const retrieved = await repo.getAnalysisById(saved.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(saved.id);
      expect(retrieved?.scriptText).toBe(viralScript);
      expect(retrieved?.report).toEqual(mockReportA);
      expect(retrieved?.model).toBe('test-model');
    });

    it('returns null when querying with a non-existent ID', async () => {
      const repo = getRepo();
      const result = await repo.getAnalysisById('non-existent-uuid-99999');

      expect(result).toBeNull();
    });
  });
});
