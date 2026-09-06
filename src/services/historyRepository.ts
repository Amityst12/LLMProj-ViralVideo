/**
 * src/services/historyRepository.ts
 *
 * Database Persistence Layer (Module 7: Web App Architecture).
 * Persists script analysis history to a JSON file (.data/history.json)
 * with an in-memory fallback for read-only serverless environments.
 */

import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { DeconstructorReport } from '../types/agents.js';

export interface HistoryRecord {
  readonly id: string;
  readonly scriptText: string;
  readonly report: DeconstructorReport;
  readonly model?: string;
  readonly createdAt: string;
}

export interface HistoryItemSummary {
  readonly id: string;
  readonly scriptPreview: string;
  readonly previewText: string;
  readonly scriptText: string;
  readonly retentionScore: number;
  readonly compositeScore: number;
  readonly hookVelocity: number;
  readonly model: string;
  readonly activeModel: string;
  readonly createdAt: string;
}

export interface SaveAnalysisInput {
  readonly scriptText: string;
  readonly report: DeconstructorReport;
  readonly model?: string;
}

export class HistoryRepository {
  private readonly filePath: string;
  private memoryRecords: HistoryRecord[] = [];
  private isLoaded = false;
  private isReadOnly = false;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.resolve(process.cwd(), '.data', 'history.json');
  }

  /**
   * Loads records from disk if not yet loaded.
   */
  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    this.isLoaded = true;

    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        this.memoryRecords = parsed;
      }
    } catch {
      // File does not exist or cannot be read yet; keep memoryRecords empty
    }
  }

  /**
   * Persists current memory records to the JSON file, falling back to memory if write fails.
   */
  private async persist(): Promise<void> {
    if (this.isReadOnly) return;

    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(this.memoryRecords, null, 2), 'utf-8');
    } catch {
      // Fallback: If filesystem is read-only (e.g. AWS Lambda / Netlify read-only /var/task), switch to memory-only
      this.isReadOnly = true;
    }
  }

  /**
   * Saves an analysis record. Supports both object input and parameter list.
   */
  async saveAnalysis(
    inputOrReport: SaveAnalysisInput | DeconstructorReport,
    scriptTextParam?: string,
    modelParam?: string
  ): Promise<HistoryRecord> {
    await this.ensureLoaded();

    let scriptText: string;
    let report: DeconstructorReport;
    let model: string | undefined;

    if ('scriptText' in inputOrReport && typeof inputOrReport.scriptText === 'string') {
      scriptText = inputOrReport.scriptText;
      report = inputOrReport.report;
      model = inputOrReport.model;
    } else {
      report = inputOrReport as DeconstructorReport;
      scriptText = scriptTextParam ?? '';
      model = modelParam;
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const record: HistoryRecord = {
      id,
      scriptText,
      report,
      model,
      createdAt,
    };

    // Prepend new record so newest is first
    this.memoryRecords.unshift(record);
    await this.persist();

    return record;
  }

  /**
   * Alias for saveAnalysis to satisfy Module 7 method specification: save(report, scriptText, model).
   */
  async save(
    reportOrInput: DeconstructorReport | SaveAnalysisInput,
    scriptText?: string,
    model?: string
  ): Promise<HistoryRecord> {
    return this.saveAnalysis(reportOrInput, scriptText, model);
  }

  /**
   * Retrieves summary list of all past analyses, sorted newest to oldest.
   */
  async listAnalyses(limit?: number): Promise<HistoryItemSummary[]> {
    await this.ensureLoaded();

    // Sort descending by creation timestamp
    const sorted = [...this.memoryRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const targetList = limit !== undefined && limit > 0 ? sorted.slice(0, limit) : sorted;

    return targetList.map((rec) => {
      const preview = rec.scriptText.length > 80 ? `${rec.scriptText.slice(0, 80)}...` : rec.scriptText;
      const compositeScore = rec.report.dimensions?.compositeScore ?? 0;
      const retentionScore = compositeScore > 0 ? compositeScore : (rec.report.swiperVerdict?.predictedRetentionScore ?? 0);
      const hookVelocity = rec.report.dimensions?.compositeScore ?? 0;
      const modelName = rec.model ?? rec.report.economics?.modelUsed ?? 'simulation';

      return {
        id: rec.id,
        scriptPreview: preview,
        previewText: preview,
        scriptText: rec.scriptText,
        retentionScore,
        compositeScore,
        hookVelocity,
        model: modelName,
        activeModel: modelName,
        createdAt: rec.createdAt,
      };
    });
  }

  /**
   * Alias for listAnalyses to satisfy Module 7 method specification: list(limit = 20).
   */
  async list(limit = 20): Promise<HistoryItemSummary[]> {
    return this.listAnalyses(limit);
  }

  /**
   * Retrieves full analysis record by unique ID, or null if not found.
   */
  async getAnalysisById(id: string): Promise<HistoryRecord | null> {
    await this.ensureLoaded();
    const found = this.memoryRecords.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  /**
   * Alias for getAnalysisById to satisfy Module 7 method specification: getById(id).
   */
  async getById(id: string): Promise<HistoryRecord | null> {
    return this.getAnalysisById(id);
  }

  /**
   * Clears all stored records (useful for test isolation).
   */
  async clear(): Promise<void> {
    this.memoryRecords = [];
    this.isLoaded = true;
    try {
      await fs.unlink(this.filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  async clearHistory(): Promise<void> {
    return this.clear();
  }
}

/**
 * Singleton repository instance for application-wide use.
 */
export const historyRepository = new HistoryRepository();

export const saveAnalysis = (
  inputOrReport: SaveAnalysisInput | DeconstructorReport,
  scriptText?: string,
  model?: string
) => historyRepository.saveAnalysis(inputOrReport, scriptText, model);

export const listAnalyses = (limit?: number) => historyRepository.listAnalyses(limit);

export const getAnalysisById = (id: string) => historyRepository.getAnalysisById(id);

export const clearHistory = () => historyRepository.clear();
