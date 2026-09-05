/**
 * Express Application Setup for LLMProj-ViralVideo Delivery Layer.
 * Implements GET /api/health, POST /api/deconstruct, and static asset serving.
 */

import express, { type Express, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deconstructScript } from './services/deconstructorOrchestrator.js';
import { validateScriptText, ValidationError } from './validators/scriptValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getClientDirectory(): string {
  const candidates = [
    path.resolve(process.cwd(), 'src', 'client'),
    path.resolve(__dirname, 'client'),
    path.resolve(__dirname, '..', 'src', 'client'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return path.resolve(process.cwd(), 'src', 'client');
}

export function createApp(): Express {
  const app: Express = express();
  const clientDir = getClientDirectory();

  // Middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(clientDir));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      name: 'LLMProj-ViralVideo',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Root endpoint serving web dashboard
  app.get('/', (_req: Request, res: Response) => {
    const indexPath = path.join(clientDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send('<!DOCTYPE html><html><head><title>Viral Hook Deconstructor</title></head><body><h1>Viral Hook Deconstructor</h1></body></html>');
    }
  });

  // Script deconstruction endpoint
  app.post('/api/deconstruct', async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as { text?: unknown } | null | undefined;
      if (!body || typeof body !== 'object' || !('text' in body)) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'ValidationError: Request body must contain a "text" field with script content',
        });
        return;
      }

      // Strict validation through ScriptTextSchema / validateScriptText
      let validatedText: string;
      try {
        validatedText = validateScriptText(body.text);
      } catch (validationErr) {
        if (validationErr instanceof ValidationError) {
          res.status(400).json({
            error: 'ValidationError',
            message: validationErr.message,
            issues: validationErr.issues,
          });
          return;
        }
        throw validationErr;
      }

      // Execute full multi-agent pipeline
      const report = await deconstructScript(validatedText);
      res.status(200).json(report);
    } catch (err) {
      console.error('[API Error in /api/deconstruct]:', err);
      res.status(500).json({
        error: 'InternalServerError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred during deconstruction',
      });
    }
  });

  return app;
}

export const app: Express = createApp();
