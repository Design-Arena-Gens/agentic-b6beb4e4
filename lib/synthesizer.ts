import { EngineResult, ResearchReport } from './types';
import { dedupeKeepOrder, jaccardSimilarity } from './utils';

export function synthesize(question: string, results: EngineResult[]): ResearchReport {
  const ok = results.filter((r) => r.status === 'ok');
  const unavailable = results.filter((r) => r.status !== 'ok');

  const bullets = ok.flatMap((r) => r.bullets || []).map((b) => b.trim()).filter(Boolean);
  const uniqueBullets = dedupeKeepOrder(bullets, 0.7).slice(0, 40);

  const consensus = findConsensus(results);
  const conflicts = findConflicts(results);

  const executiveSummary = buildExecutiveSummary(question, consensus, conflicts, ok.length, unavailable.length);

  const keyFindingsByTheme = uniqueBullets.map((b) => `? ${b}`);

  const toolComparison = results.map((r) => {
    if (r.status === 'ok') return `${label(r.engineId)}: responded in ${r.elapsedMs}ms with ${r.bullets?.length || 0} bullets.`;
    if (r.status === 'unavailable') return `${label(r.engineId)}: unavailable (missing API key).`;
    return `${label(r.engineId)}: error (${r.message || 'unknown'}).`;
  });

  const risks = [
    ...conflicts.map((c) => `Conflicting statements: ${c.a.engineId} vs ${c.b.engineId} ? ?${c.aText}? vs ?${c.bText}?.`),
    ...(unavailable.length > 0 ? [
      `${unavailable.length} engines unavailable; synthesis confidence reduced. Supply API keys to improve coverage.`
    ] : []),
  ].slice(0, 10);

  const recommendations = buildRecommendations(consensus, conflicts, results);

  const raw: Record<string, any> = {};
  for (const r of results) raw[r.engineId] = { status: r.status, message: r.message, elapsedMs: r.elapsedMs, bullets: r.bullets, raw: r.raw };

  return { executiveSummary, keyFindingsByTheme, toolComparison, risks, recommendations, raw };
}

function label(id: string) {
  switch (id) {
    case 'openai': return 'OpenAI Deep Research';
    case 'perplexity': return 'Perplexity Deep Research';
    case 'kimi': return 'Kimi K2';
    case 'gemini': return 'Gemini 2.5 Pro';
    default: return id;
  }
}

function buildExecutiveSummary(question: string, consensus: string[], conflicts: Conflict[], okCount: number, missCount: number) {
  const parts: string[] = [];
  parts.push(`Question: ${question}`);
  if (consensus.length) parts.push(`Consensus themes: ${consensus.slice(0, 5).join('; ')}.`);
  if (conflicts.length) parts.push(`Notable disagreements: ${conflicts.slice(0, 3).map((c) => shortConflict(c)).join(' | ')}.`);
  parts.push(`Coverage: ${okCount} engines responded${missCount ? `; ${missCount} unavailable` : ''}.`);
  return parts.join(' ');
}

function shortConflict(c: Conflict) {
  return `${c.a.engineId} vs ${c.b.engineId}`;
}

type Conflict = { a: EngineResult; b: EngineResult; aText: string; bText: string };

function findConsensus(results: EngineResult[]): string[] {
  const ok = results.filter((r) => r.status === 'ok');
  const all = ok.flatMap((r) => (r.bullets || []).map((t) => ({ engineId: r.engineId, text: t })));
  const consensus: string[] = [];
  for (let i = 0; i < all.length; i++) {
    const base = all[i];
    let votes = 1;
    for (let j = 0; j < all.length; j++) {
      if (i === j) continue;
      const cmp = all[j];
      if (jaccardSimilarity(base.text, cmp.text) >= 0.65) votes++;
    }
    if (votes >= 2) consensus.push(base.text);
  }
  return dedupeKeepOrder(consensus, 0.7).slice(0, 12);
}

function findConflicts(results: EngineResult[]): Conflict[] {
  const ok = results.filter((r) => r.status === 'ok');
  const out: Conflict[] = [];
  for (let i = 0; i < ok.length; i++) {
    for (let j = i + 1; j < ok.length; j++) {
      const a = ok[i], b = ok[j];
      const aBul = a.bullets || [];
      const bBul = b.bullets || [];
      for (const at of aBul) {
        for (const bt of bBul) {
          const sim = jaccardSimilarity(at, bt);
          if (sim < 0.2 && (negated(at) !== negated(bt)) && overlapTopic(at, bt)) {
            out.push({ a, b, aText: at, bText: bt });
          }
        }
      }
    }
  }
  return out.slice(0, 8);
}

function negated(s: string) {
  return /\bno\b|\bnot\b|\bnever\b|\bunlikely\b|\bdoesn\'t\b|\bwon\'t\b/i.test(s);
}

function overlapTopic(a: string, b: string) {
  const ak = a.toLowerCase().match(/[a-z]{4,}/g) || [];
  const bk = b.toLowerCase().match(/[a-z]{4,}/g) || [];
  const set = new Set(ak);
  const inter = bk.filter((x) => set.has(x));
  return inter.length >= 2;
}

function buildRecommendations(consensus: string[], conflicts: Conflict[], results: EngineResult[]): string[] {
  const recs: string[] = [];
  if (consensus.length) recs.push('Prioritize actions aligned to consensus themes; validate with primary sources.');
  if (conflicts.length) recs.push('Investigate conflicts: trace claims to sources; run follow-up targeted queries.');
  if (results.some((r) => r.status !== 'ok')) recs.push('Provide missing API keys to increase coverage and confidence.');
  recs.push('Document uncertainties explicitly; avoid overcommitting where evidence diverges.');
  return recs;
}
