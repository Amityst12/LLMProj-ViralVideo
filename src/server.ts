/**
 * HTTP Server Entrypoint for LLMProj-ViralVideo.
 * Starts listening on PORT when run directly.
 */

import { fileURLToPath } from 'node:url';
import { app, createApp } from './app.js';

export { app, createApp };

const PORT = Number(process.env['PORT'] || 3000);

function isMainModule(): boolean {
  if (!process.argv[1]) return false;
  try {
    return fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
}

if (isMainModule()) {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 LLMProj-ViralVideo API Server running at http://localhost:${PORT}`);
    console.log(`📊 Web Dashboard available at http://localhost:${PORT}/`);
    console.log(`🏥 Health Check available at http://localhost:${PORT}/api/health`);
    console.log(`⚡ Mode: ${process.env['OPENROUTER_API_KEY'] ? 'Live Mode (OpenRouter)' : 'Simulation Mode (Deterministic Mock)'}\n`);
  });

  const shutdown = () => {
    console.log('\nGracefully shutting down HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
