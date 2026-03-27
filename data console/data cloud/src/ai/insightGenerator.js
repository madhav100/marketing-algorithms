import { spawnSync } from 'child_process';
import { buildManagerPrompt } from './promptBuilder.js';
import { validateManagerInsights } from './schema.js';

function extractJson(rawText = '') {
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('No JSON object found in Ollama output.');
  }
  return rawText.slice(firstBrace, lastBrace + 1);
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

  const parsed = JSON.parse(extractJson(run.stdout || ''));
  const validation = validateManagerInsights(parsed);
  if (!validation.valid) {
    throw new Error(`Ollama JSON failed schema validation: ${validation.error}`);
  }

  return parsed;
}
