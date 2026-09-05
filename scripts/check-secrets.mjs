#!/usr/bin/env node

/**
 * Cross-platform Secret & Credential Checker
 * Enforces zero-leakage policy prior to commits.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const SECRET_PATTERNS = [
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9_-]{20,}/g },
  { name: 'Anthropic API Key', regex: /sk-ant-[a-zA-Z0-9_-]{20,}/g },
  { name: 'Google Gemini API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'GitHub Personal Access Token', regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g },
  { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
  { name: 'Generic Private Key', regex: /-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----/g },
  { name: 'Hardcoded Bearer Token', regex: /bearer\s+[a-zA-Z0-9_\-\.]{30,}/gi },
];

const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf',
  '.lock', '.lockb'
]);

const IGNORED_FILES = new Set([
  '.env.example',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
]);

function getStagedFiles() {
  try {
    const stdout = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return stdout
      .split(/\r?\n/)
      .map(f => f.trim())
      .filter(f => f.length > 0);
  } catch {
    // If not in a git repo or no staged files, return empty
    return [];
  }
}

function maskSecret(secret) {
  if (secret.length <= 8) return '****';
  return secret.slice(0, 4) + '...' + secret.slice(-4);
}

function checkFile(filePath) {
  if (!existsSync(filePath)) return [];

  const baseName = filePath.split(/[/\\]/).pop() || '';
  if (IGNORED_FILES.has(baseName)) return [];

  const ext = filePath.includes('.') ? '.' + filePath.split('.').pop()?.toLowerCase() : '';
  if (IGNORED_EXTENSIONS.has(ext)) return [];

  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    // Skip binary files or unreadable files
    return [];
  }

  const findings = [];
  const lines = content.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    for (const { name, regex } of SECRET_PATTERNS) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        // Skip obvious dummy placeholders
        const matchedStr = match[0];
        if (
          matchedStr.includes('your_') ||
          matchedStr.includes('dummy') ||
          matchedStr.includes('placeholder') ||
          matchedStr.includes('sample')
        ) {
          continue;
        }

        findings.push({
          file: filePath,
          line: lineIndex + 1,
          type: name,
          masked: maskSecret(matchedStr),
        });
      }
    }
  }

  return findings;
}

function main() {
  const staged = getStagedFiles();
  const filesToCheck = staged.length > 0 ? staged : [];

  if (filesToCheck.length === 0) {
    console.log('[check-secrets] No staged files detected. Running baseline scan...');
    // Scan all tracked files if nothing is staged
    try {
      const tracked = execSync('git ls-files', { encoding: 'utf-8' })
        .split(/\r?\n/)
        .map(f => f.trim())
        .filter(f => f.length > 0);
      filesToCheck.push(...tracked);
    } catch {
      // Ignored
    }
  }

  const allFindings = [];
  for (const relPath of filesToCheck) {
    const absPath = resolve(process.cwd(), relPath);
    const findings = checkFile(absPath);
    allFindings.push(...findings);
  }

  if (allFindings.length > 0) {
    console.error('\n❌ [SECURITY VIOLATION] Detected potential secrets/credentials:');
    for (const item of allFindings) {
      console.error(`  - ${item.file}:${item.line} [${item.type}] -> ${item.masked}`);
    }
    console.error('\nAction required: Remove the secret from code before committing. Use environment variables.\n');
    process.exit(1);
  }

  console.log('✅ [check-secrets] Zero secrets detected. Clean to proceed.');
  process.exit(0);
}

main();
