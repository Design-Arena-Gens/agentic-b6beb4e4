export function nowMs() { return Date.now(); }
export function elapsedMs(start: number) { return Date.now() - start; }

export function toBullets(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*?]\s*/, '').trim())
    .filter(Boolean);
  if (lines.length >= 3) return lines;
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function jaccardSimilarity(a: string, b: string): number {
  const as = new Set(tokens(a));
  const bs = new Set(tokens(b));
  const inter = new Set([...as].filter((x) => bs.has(x)));
  const union = new Set([...as, ...bs]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2);
}

export function dedupeKeepOrder(items: string[], threshold = 0.75): string[] {
  const out: string[] = [];
  for (const it of items) {
    if (out.every((o) => jaccardSimilarity(o, it) < threshold)) out.push(it);
  }
  return out;
}
