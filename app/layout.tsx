import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Deep Research Orchestrator',
  description: 'Multi-engine research synthesis: OpenAI, Perplexity, Kimi K2, Gemini',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Deep Research Orchestrator</h1>
            <p>Break questions into sub-questions, query four engines, and synthesize a master report.</p>
          </header>
          <main>{children}</main>
          <footer className="footer">? {new Date().getFullYear()} Deep Research Orchestrator</footer>
        </div>
      </body>
    </html>
  );
}
