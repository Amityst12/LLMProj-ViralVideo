/**
 * tests/integration/apiRoute.test.ts
 *
 * Acceptance & Integration tests for Delivery Layer & Web Server (Module 7 & Module 8).
 * Tests HTTP API endpoints, database persistence, and static delivery.
 *
 * Invariants tested:
 * 1. POST /api/deconstruct:
 *    - Status 200 with full DeconstructorReport (Cadence, Diagnostics, 3 Rewrites) for valid scripts.
 *    - Status 400 with detailed ValidationError for empty, whitespace-only, or oversized (> 2,000 chars) scripts.
 *    - Automatically persists result in Database and returns unique record id.
 * 2. GET /api/health:
 *    - Status 200 with health metadata.
 * 3. Static Web Serving:
 *    - GET / returns 200 OK with index.html (text/html content).
 * 4. GET /api/models:
 *    - Status 200 with recommended OpenRouter models and pricing rates.
 * 5. GET /api/history & GET /api/history/:id (Turn 6 Persistence):
 *    - GET /api/history returns 200 with array of past analyses (preview, score, model).
 *    - GET /api/history/:id returns 200 with full deconstruction report, or 404 if not found.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { DeconstructorReportSchema } from '../../src/validators/scriptValidator.js';
import {
  viralScript,
  mediocreScript,
  oversizedScript,
  emptyScript,
  whitespaceScript,
} from '../fixtures/scripts.js';

type AppTarget = Parameters<typeof request>[0];

let app: AppTarget | null = null;

try {
  // @ts-expect-error - Server implementation pending in src/server.ts by Alan
  const mod = await import('../../src/server.js');
  app = (mod.app ?? (typeof mod.createApp === 'function' ? mod.createApp() : mod.default)) as AppTarget;
} catch {
  try {
    // @ts-expect-error - Fallback to src/app.js if implemented there
    const mod = await import('../../src/app.js');
    app = (mod.app ?? (typeof mod.createApp === 'function' ? mod.createApp() : mod.default)) as AppTarget;
  } catch {
    try {
      // @ts-expect-error - Fallback to src/index.js if exported there
      const mod = await import('../../src/index.js');
      app = (mod.app ?? (typeof mod.createApp === 'function' ? mod.createApp() : undefined)) as AppTarget;
    } catch {
      app = null;
    }
  }
}

function getApp(): AppTarget {
  if (!app) {
    throw new Error(
      'API server application is not yet implemented in src/server.ts or src/app.ts (TDD Red Phase - awaiting Alan implementation)'
    );
  }
  return app;
}

describe('Delivery Layer & API Integration Tests (Turn 4 - Turn 6)', () => {
  describe('GET /api/health', () => {
    it('returns status 200 OK with health status metadata', async () => {
      const response = await request(getApp()).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeDefined();
      expect(response.body.status).toBeDefined();
    });
  });

  describe('Static Asset Serving (GET /)', () => {
    it('serves the web dashboard index.html on root path with status 200', async () => {
      const response = await request(getApp()).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.text.toLowerCase()).toContain('<html');
    });
  });

  describe('POST /api/deconstruct', () => {
    it('returns 200 OK with a complete DeconstructorReport for valid viralScript', async () => {
      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: viralScript })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);

      // Verify response body complies strictly with DeconstructorReportSchema
      const parsedReport = DeconstructorReportSchema.safeParse(response.body);
      expect(parsedReport.success).toBe(true);

      if (parsedReport.success) {
        const report = parsedReport.data;

        // 1. Cadence & Temporal Windows (SC-1)
        expect(report.segments).toHaveLength(3);
        expect(report.segments[0].window).toBe('swipe_zone');
        expect(report.segments[1].window).toBe('value_delivery');
        expect(report.segments[2].window).toBe('body_and_resolution');
        expect(report.segments[0].wordCount).toBeGreaterThanOrEqual(7);
        expect(report.segments[0].wordCount).toBeLessThanOrEqual(8);

        // 2. Diagnostics & Retention Dimensions (SC-2)
        expect(report.dimensions.compositeScore).toBeGreaterThanOrEqual(0);
        expect(report.dimensions.compositeScore).toBeLessThanOrEqual(100);

        // 3. Strict Anti-Sycophancy Invariant: >= 2 concrete failure points
        expect(report.negativeCritique.length).toBeGreaterThanOrEqual(2);

        // 4. Adversarial Skeptic Swiper Simulation (SC-3)
        expect(['1', '2', '3', 'survived', 1, 2, 3]).toContain(report.swiperVerdict.swipeAtSecond);
        expect(report.swiperVerdict.brutalVerdict.length).toBeGreaterThan(0);
        expect(report.swiperVerdict.predictedRetentionScore).toBeGreaterThanOrEqual(0);

        // 5. Prescriptive Tri-Archetype Remake (SC-4)
        expect(report.prescriptiveRewrites).toHaveLength(3);
        const archetypes = report.prescriptiveRewrites.map((r) => r.archetype);
        expect(archetypes).toContain('negative_frame');
        expect(archetypes).toContain('high_stakes_intrigue');
        expect(archetypes).toContain('visceral_pattern_interrupt');

        for (const rewrite of report.prescriptiveRewrites) {
          expect(rewrite.hookText.trim().split(/\s+/).length).toBeLessThanOrEqual(8);
          expect(rewrite.engineeringRationale.length).toBeGreaterThan(0);
        }
      }
    });

    it('returns 200 OK with full deconstruction report for mediocreScript', async () => {
      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: mediocreScript })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      const parsedReport = DeconstructorReportSchema.safeParse(response.body);
      expect(parsedReport.success).toBe(true);

      if (parsedReport.success) {
        expect(parsedReport.data.negativeCritique.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('returns 400 Bad Request with ValidationError for empty script', async () => {
      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: emptyScript })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      const errorMsg = JSON.stringify(response.body);
      expect(errorMsg).toMatch(/empty|validation/i);
    });

    it('returns 400 Bad Request with ValidationError for whitespace-only script', async () => {
      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: whitespaceScript })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      const errorMsg = JSON.stringify(response.body);
      expect(errorMsg).toMatch(/empty|whitespace|validation/i);
    });

    it('returns 400 Bad Request with ValidationError for script exceeding 2,000 characters', async () => {
      expect(oversizedScript.length).toBeGreaterThan(2000);

      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: oversizedScript })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      const errorMsg = JSON.stringify(response.body);
      expect(errorMsg).toMatch(/2,?000|limit|exceed|validation/i);
    });

    it('returns 400 Bad Request when request body is missing required script text', async () => {
      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
    });

    it('returns 200 OK with Token Economics metadata in response (Turn 5)', async () => {
      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: viralScript })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.economics).toBeDefined();
      expect(response.body.economics.wallTimeMs).toBeGreaterThan(0);
      expect(response.body.economics.cumulativeTimeMs).toBeGreaterThan(0);
      expect(response.body.economics.tokensUsed.total).toBeGreaterThan(0);
      expect(typeof response.body.economics.estimatedCostUsd).toBe('number');
      expect(typeof response.body.economics.isLiveExecution).toBe('boolean');
    });

    it('automatically persists the deconstruction result in database and returns record id in response (Turn 6)', async () => {
      const response = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: viralScript })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(typeof response.body.id).toBe('string');
      expect(response.body.id.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/models (Turn 5 Token Economics)', () => {
    it('returns 200 OK with recommended OpenRouter models and pricing rates', async () => {
      const response = await request(getApp()).get('/api/models');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(Array.isArray(response.body.models)).toBe(true);
      expect(response.body.models.length).toBeGreaterThanOrEqual(3);

      const firstModel = response.body.models[0];
      expect(firstModel).toHaveProperty('id');
      expect(firstModel).toHaveProperty('name');
      expect(firstModel).toHaveProperty('description');
      expect(firstModel).toHaveProperty('promptCostPerMillion');
      expect(firstModel).toHaveProperty('completionCostPerMillion');
    });
  });

  describe('History Persistence Endpoints (Turn 6: GET /api/history & GET /api/history/:id)', () => {
    it('GET /api/history returns 200 OK with an array of past analyses including script preview, retention score, and model', async () => {
      // Seed an analysis through POST /api/deconstruct
      const postRes = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: viralScript, model: 'test-model' })
        .set('Content-Type', 'application/json');

      expect(postRes.status).toBe(200);

      const historyRes = await request(getApp()).get('/api/history');

      expect(historyRes.status).toBe(200);
      expect(historyRes.headers['content-type']).toMatch(/json/);

      const items = Array.isArray(historyRes.body)
        ? historyRes.body
        : (historyRes.body.history as unknown[]);

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(1);

      const item = items[0] as Record<string, unknown>;
      expect(item).toHaveProperty('id');
      expect(item['scriptPreview'] ?? item['scriptText'] ?? item['text']).toBeDefined();
      expect(item['retentionScore'] ?? item['compositeScore'] ?? item['score']).toBeDefined();
      expect(item['model'] ?? item['modelId']).toBeDefined();
    });

    it('GET /api/history/:id returns 200 OK with the full deconstruction report for a valid id', async () => {
      const postRes = await request(getApp())
        .post('/api/deconstruct')
        .send({ text: viralScript })
        .set('Content-Type', 'application/json');

      expect(postRes.status).toBe(200);
      const savedId = postRes.body.id as string | undefined;
      expect(savedId).toBeDefined();

      const detailRes = await request(getApp()).get(`/api/history/${savedId}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.headers['content-type']).toMatch(/json/);

      const reportPayload = detailRes.body.report ?? detailRes.body;
      const parsed = DeconstructorReportSchema.safeParse(reportPayload);
      expect(parsed.success).toBe(true);
    });

    it('GET /api/history/:id returns 404 Not Found for non-existent id', async () => {
      const response = await request(getApp()).get('/api/history/non-existent-analysis-id-99999');

      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/json/);
      const errorMsg = JSON.stringify(response.body);
      expect(errorMsg).toMatch(/not found|404/i);
    });
  });
});
