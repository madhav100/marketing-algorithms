import { spawnSync } from 'child_process';
import { buildManagerPrompt } from './promptBuilder.js';
import { validateManagerInsights } from './schema.js';

function extractJson(rawText = '') {
  const withoutFences = String(rawText)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('No JSON object found in Ollama output.');
  }
  return withoutFences.slice(firstBrace, lastBrace + 1);
}

function sanitizeJsonText(jsonText = '') {
  return String(jsonText)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/[\u0000-\u0019]/g, '');
}

export function parseManagerInsightsJson(rawText = '') {
  const extracted = extractJson(rawText);

  try {
    return JSON.parse(extracted);
  } catch {
    const sanitized = sanitizeJsonText(extracted);
    return JSON.parse(sanitized);
  }
}

export async function generateManagerInsights(analysisResult = {}, options = {}) {
  const model = options.model || process.env.OLLAMA_MODEL || 'llama3.1';
  const prompt = buildManagerPrompt(analysisResult);

  const run = spawnSync('ollama', ['run', model, prompt], {
    encoding: 'utf8',
    timeout: 45000
  });

  if (run.error) {
    throw new Error(`Ollama execution failed: ${run.error.message}`);
  }

  if (run.status !== 0) {
    throw new Error(`Ollama returned non-zero status (${run.status}): ${run.stderr || run.stdout}`);
  }

  const parsed = parseManagerInsightsJson(run.stdout || '');
  const validation = validateManagerInsights(parsed);
  if (!validation.valid) {
    throw new Error(`Ollama JSON failed schema validation: ${validation.error}`);
  }

  return parsed;
}
