export type EngineId = 'openai' | 'perplexity' | 'kimi' | 'gemini';

export type EngineResult = {
  engineId: EngineId;
  status: 'ok' | 'error' | 'unavailable';
  elapsedMs: number | null;
  message?: string;
  raw?: string;
  bullets?: string[];
};

export type ResearchRequest = {
  question: string;
};

export type ResearchReport = {
  executiveSummary: string;
  keyFindingsByTheme: string[];
  toolComparison: string[];
  risks: string[];
  recommendations: string[];
  raw: Record<string, any>;
};
