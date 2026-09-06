/**
 * netlify/functions/api.ts
 *
 * Netlify Serverless Function Handler (Module 7: Netlify Deployment).
 * Wraps the Express application using serverless-http to serve
 * all API routes in a serverless environment.
 */

import serverless from 'serverless-http';
import { createApp } from '../../src/app.js';

const app = createApp();
const serverlessApp = serverless(app);

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

export const handler = async (
  event: HandlerEvent,
  context?: HandlerContext
): Promise<HandlerResponse> => {
  // Normalize Netlify function path redirect if invoked via /.netlify/functions/api/*
  const normalizedEvent: HandlerEvent = {
    ...event,
    path: event.path.startsWith('/.netlify/functions/api')
      ? event.path.replace(/^\/\.netlify\/functions\/api/, '/api')
      : event.path,
  };

  const response = (await serverlessApp(
    normalizedEvent as unknown as Record<string, unknown>,
    context as unknown as Record<string, unknown>
  )) as HandlerResponse;

  return response;
};

export default handler;
