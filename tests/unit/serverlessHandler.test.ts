/**
 * tests/unit/serverlessHandler.test.ts
 *
 * Acceptance & Unit tests for Netlify Serverless Function Handler (Module 7: Netlify Deployment).
 * Verifies that the serverless function wrapper correctly delegates requests to the API and returns valid HTTP responses.
 *
 * Requirements:
 * 1. Responds to GET /api/health with status 200 OK.
 * 2. Responds to POST /api/deconstruct with status 200 OK and full report for valid script.
 * 3. Rejects invalid script input with status 400 Bad Request.
 */

import { describe, it, expect } from 'vitest';
import { viralScript } from '../fixtures/scripts.js';

export interface HandlerEvent {
  path: string;
  httpMethod: string;
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined> | null;
  body?: string | null;
  isBase64Encoded?: boolean;
}

export interface HandlerContext {
  [key: string]: unknown;
}

export interface HandlerResponse {
  statusCode: number;
  headers?: Record<string, string | number | boolean>;
  body?: string;
}

export type NetlifyHandler = (
  event: HandlerEvent,
  context?: HandlerContext
) => Promise<HandlerResponse>;

interface ServerlessModuleShape {
  handler?: NetlifyHandler;
  default?: NetlifyHandler;
}

let serverlessModule: ServerlessModuleShape | null = null;

try {
  // @ts-expect-error - Netlify functions standard path
  serverlessModule = await import('../../netlify/functions/api.js');
} catch {
  try {
    // @ts-expect-error - Fallback to src/serverless.js
    serverlessModule = await import('../../src/serverless.js');
  } catch {
    try {
      // @ts-expect-error - Fallback to src/functions/api.js
      serverlessModule = await import('../../src/functions/api.js');
    } catch {
      try {
        // @ts-expect-error - Fallback to src/serverlessHandler.js
        serverlessModule = await import('../../src/serverlessHandler.js');
      } catch {
        serverlessModule = null;
      }
    }
  }
}

function getHandler(): NetlifyHandler {
  const h = serverlessModule?.handler ?? serverlessModule?.default;
  if (typeof h !== 'function') {
    throw new Error(
      'Netlify serverless function handler is not yet implemented in netlify/functions/api.ts or src/serverless.ts (TDD Red Phase - awaiting Alan implementation)'
    );
  }
  return h;
}

describe('Netlify Serverless Function Handler (Turn 6 Deployment)', () => {
  const dummyContext: HandlerContext = {
    functionName: 'api',
    functionVersion: '1.0',
  };

  it('responds to GET /api/health with status 200 and healthy status body', async () => {
    const handler = getHandler();
    const event: HandlerEvent = {
      path: '/api/health',
      httpMethod: 'GET',
      headers: {
        accept: 'application/json',
      },
    };

    const response = await handler(event, dummyContext);

    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    const parsedBody = JSON.parse(response.body ?? '{}') as Record<string, unknown>;
    expect(parsedBody['status']).toBe('ok');
  });

  it('responds to POST /api/deconstruct with status 200 and report payload for valid script', async () => {
    const handler = getHandler();
    const event: HandlerEvent = {
      path: '/api/deconstruct',
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ text: viralScript }),
    };

    const response = await handler(event, dummyContext);

    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    const report = JSON.parse(response.body ?? '{}') as Record<string, unknown>;
    expect(report['segments']).toBeDefined();
    expect(report['dimensions']).toBeDefined();
    expect(report['negativeCritique']).toBeDefined();
    expect(report['prescriptiveRewrites']).toBeDefined();
  });

  it('rejects empty script input on POST /api/deconstruct with status 400', async () => {
    const handler = getHandler();
    const event: HandlerEvent = {
      path: '/api/deconstruct',
      httpMethod: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ text: '' }),
    };

    const response = await handler(event, dummyContext);

    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const err = JSON.parse(response.body ?? '{}') as Record<string, unknown>;
    expect(JSON.stringify(err)).toMatch(/empty|validation/i);
  });
});
