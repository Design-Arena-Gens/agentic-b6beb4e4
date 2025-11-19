"use client";

import { useState } from 'react';
import { Report } from '@/components/Report';
import { EngineStatus } from '@/components/EngineStatus';

export default function Page() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="form">
        <input
          className="input"
          placeholder="Enter your research question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Researching..." : "Run Deep Research"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results">
          <EngineStatus engineStates={result.engineStates} />
          <Report report={result.report} />
        </div>
      )}

      {!result && !loading && (
        <div className="hint">
          Example: "What are the long-term risks and opportunities of LLM agents in enterprise software over the next 3-5 years?"
        </div>
      )}
    </div>
  );
}
