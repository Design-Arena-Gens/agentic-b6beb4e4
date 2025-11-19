# Deep Research Orchestrator

Multi-engine research synthesis app. Breaks a user question into sub-questions, queries four engines (OpenAI Deep Research, Perplexity Deep Research, Kimi K2, Gemini 2.5 Pro), cross-checks findings, and produces a structured master report.

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. (Optional) Configure API keys in `.env` (any subset is fine):

```bash
cp .env.example .env
# Fill in OPENAI_API_KEY, PPLX_API_KEY, KIMI_API_KEY, GOOGLE_API_KEY, etc.
```

3. Run locally:

```bash
npm run dev
```

Open http://localhost:3000

## How it works

- Splits the question into a set of targeted sub-questions
- Crafts a unified prompt and queries adapters for: OpenAI, Perplexity, Kimi, Gemini
- Normalizes responses into bullet points
- Identifies consensus (semantic overlap) and disagreements (topic overlap with opposing polarity)
- Synthesizes a master report with: Executive Summary, Key Findings by Theme, Tool Comparison, Risks/Uncertainties, Recommendations
- Marks uncertain or conflicting data explicitly

If some engines are missing API keys, the app still runs and labels them as unavailable; synthesis proceeds with available engines.

## Environment Variables

See `.env.example`:

- `OPENAI_API_KEY`
- `PPLX_API_KEY` or `PERPLEXITY_API_KEY`
- `KIMI_API_KEY` or `MOONSHOT_API_KEY`
- `GOOGLE_API_KEY` or `GEMINI_API_KEY`

## Deploy

This app works out-of-the-box on Vercel as a Next.js App Router project. Provide env variables in the Vercel project for live engine calls.
