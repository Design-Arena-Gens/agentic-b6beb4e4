import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateSubquestions } from '@/lib/subquestion';
import { queryAllEngines } from '@/lib/engines';
import { synthesize } from '@/lib/synthesizer';

const Body = z.object({ question: z.string().min(4).max(4000) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question } = Body.parse(body);

    const subqs = generateSubquestions(question);
    const masterPrompt = buildPrompt(question, subqs);

    const results = await queryAllEngines(masterPrompt);

    const report = synthesize(question, results);

    return new Response(JSON.stringify({ engineStates: results.map(({ engineId, status, elapsedMs, message }) => ({ engineId, status, elapsedMs, message })), report }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(err?.message || 'Bad Request', { status: 400 });
  }
}

function buildPrompt(question: string, subs: string[]) {
  return [
    `Primary question: ${question}`,
    '',
    'Breakdown into sub-questions:',
    ...subs.map((s, i) => `${i + 1}. ${s}`),
    '',
    'Instructions:',
    '- Provide concise bullet points grouped by themes',
    '- Prefer facts, data, and concrete examples; mark uncertainties explicitly',
    '- Note any conflicting evidence or viewpoints',
    '- End with 3-5 actionable recommendations',
  ].join('\n');
}
