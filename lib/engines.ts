import { EngineId, EngineResult } from './types';
import { nowMs, elapsedMs, toBullets } from './utils';

export async function queryAllEngines(prompt: string): Promise<EngineResult[]> {
  const engines: EngineId[] = ['openai', 'perplexity', 'kimi', 'gemini'];
  return await Promise.all(engines.map((e) => queryEngine(e, prompt)));
}

async function queryEngine(engineId: EngineId, prompt: string): Promise<EngineResult> {
  const start = nowMs();
  try {
    switch (engineId) {
      case 'openai':
        return await callOpenAI(prompt, start);
      case 'perplexity':
        return await callPerplexity(prompt, start);
      case 'kimi':
        return await callKimi(prompt, start);
      case 'gemini':
        return await callGemini(prompt, start);
      default:
        return { engineId, status: 'error', elapsedMs: elapsedMs(start), message: 'Unknown engine' };
    }
  } catch (err: any) {
    return { engineId, status: 'error', elapsedMs: elapsedMs(start), message: err?.message || 'Error' };
  }
}

async function callOpenAI(prompt: string, start: number): Promise<EngineResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { engineId: 'openai', status: 'unavailable', elapsedMs: null, message: 'OPENAI_API_KEY not set' };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a deep research engine. Provide concise, evidence-oriented bullets and note uncertainties.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const t = await safeText(res);
    return { engineId: 'openai', status: 'error', elapsedMs: elapsedMs(start), message: `HTTP ${res.status}: ${t}` };
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '';
  return { engineId: 'openai', status: 'ok', elapsedMs: elapsedMs(start), raw: content, bullets: toBullets(content) };
}

async function callPerplexity(prompt: string, start: number): Promise<EngineResult> {
  const key = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY;
  if (!key) return { engineId: 'perplexity', status: 'unavailable', elapsedMs: null, message: 'PPLX_API_KEY not set' };
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'sonar-reasoning-pro',
      messages: [
        { role: 'system', content: 'Act as a deep research engine. Provide sourced, bullet-point answers with uncertainties.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const t = await safeText(res);
    return { engineId: 'perplexity', status: 'error', elapsedMs: elapsedMs(start), message: `HTTP ${res.status}: ${t}` };
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '';
  return { engineId: 'perplexity', status: 'ok', elapsedMs: elapsedMs(start), raw: content, bullets: toBullets(content) };
}

async function callKimi(prompt: string, start: number): Promise<EngineResult> {
  const key = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!key) return { engineId: 'kimi', status: 'unavailable', elapsedMs: null, message: 'KIMI_API_KEY not set' };
  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: 'You are Kimi K2 style deep researcher. Provide structured, concise bullets and cite uncertainty.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const t = await safeText(res);
    return { engineId: 'kimi', status: 'error', elapsedMs: elapsedMs(start), message: `HTTP ${res.status}: ${t}` };
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '';
  return { engineId: 'kimi', status: 'ok', elapsedMs: elapsedMs(start), raw: content, bullets: toBullets(content) };
}

async function callGemini(prompt: string, start: number): Promise<EngineResult> {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) return { engineId: 'gemini', status: 'unavailable', elapsedMs: null, message: 'GOOGLE_API_KEY not set' };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Act as Gemini 2.5 Pro deep researcher. Provide bullet points, evidence focus.\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.2 }
    }),
  });
  if (!res.ok) {
    const t = await safeText(res);
    return { engineId: 'gemini', status: 'error', elapsedMs: elapsedMs(start), message: `HTTP ${res.status}: ${t}` };
  }
  const json = await res.json();
  const content = json.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || '';
  return { engineId: 'gemini', status: 'ok', elapsedMs: elapsedMs(start), raw: content, bullets: toBullets(content) };
}

async function safeText(res: Response) {
  try { return await res.text(); } catch { return ''; }
}
