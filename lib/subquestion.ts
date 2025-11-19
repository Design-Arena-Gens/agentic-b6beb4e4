export function generateSubquestions(question: string): string[] {
  const q = question.trim();
  const base = [
    'Background and definitions',
    'Current landscape and trends',
    'Opportunities and benefits',
    'Risks and limitations',
    'Key metrics and benchmarks',
    'Case studies and evidence',
    'Counterarguments and alternatives',
    'Forecast (3-5 years)',
    'Implementation considerations',
    'Sources to monitor'
  ];
  if (q.length < 12) return base;
  const topic = q.replace(/\?+$/, '');
  return base.map((s) => `${s} for: ${topic}`);
}
