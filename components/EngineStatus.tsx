import React from 'react';

type EngineState = {
  engineId: string;
  status: 'ok' | 'error' | 'unavailable';
  elapsedMs: number | null;
  message?: string;
};

export function EngineStatus({ engineStates }: { engineStates: EngineState[] }) {
  return (
    <div className="section">
      <h3>Engine Status</h3>
      <div className="grid">
        {engineStates.map((e) => (
          <div key={e.engineId} className="section" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{label(e.engineId)}</strong>
              <span className="badge">{e.status.toUpperCase()}</span>
            </div>
            <div style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>
              Time: {e.elapsedMs != null ? `${e.elapsedMs} ms` : '?'}
            </div>
            {e.message && <div style={{ marginTop: 8, color: '#0f172a' }}>{e.message}</div>}
          </div>
        ))}
      </div>
    </div>
  );
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
