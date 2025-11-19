import React from 'react';

type Section = {
  title: string;
  items?: string[];
  text?: string;
};

export function Report({ report }: { report: any }) {
  const sections: Section[] = [
    { title: 'Executive Summary', text: report.executiveSummary },
    { title: 'Key Findings by Theme', items: report.keyFindingsByTheme },
    { title: 'Tool Comparison', items: report.toolComparison },
    { title: 'Risks & Uncertainties', items: report.risks },
    { title: 'Recommendations', items: report.recommendations },
  ];

  return (
    <div className="section">
      {sections.map((s) => (
        <div key={s.title} style={{ marginBottom: 16 }}>
          <h3>{s.title}</h3>
          {s.text && <p>{s.text}</p>}
          {s.items && (
            <ul className="list">
              {s.items.map((it: string, idx: number) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <details>
        <summary>Raw Engine Excerpts</summary>
        <pre className="code" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(report.raw, null, 2)}</pre>
      </details>
    </div>
  );
}
