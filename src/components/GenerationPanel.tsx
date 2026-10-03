'use client';

import { useEffect, useState } from 'react';

type Generation = { id: number; type: string; content: string; created_at: number };

export default function GenerationPanel({ materialId, type }: { materialId: string; type: 'notes' | 'flashcards' | 'quiz' }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/materials/${materialId}`);
    const data = await res.json();
    const gen = (data.generations ?? []).find((g: Generation) => g.type === type);
    setContent(gen?.content ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [materialId, type]);

  async function generate() {
    setGenerating(true);
    setError('');
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId, type }),
    });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) return setError(data.error ?? 'Generation failed');
    setContent(data.content);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">{type}</h2>
        <button onClick={generate} disabled={generating} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {generating ? 'Generating…' : content ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {loading && <p className="text-slate-500">Loading…</p>}
      {!loading && !content && <p className="text-slate-500">No {type} yet. Click Generate.</p>}
      {content && <RenderContent type={type} content={content} />}
    </div>
  );
}

function RenderContent({ type, content }: { type: string; content: string }) {
  if (type === 'notes') {
    return <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{content}</pre>;
  }
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return (
        <div className="space-y-3">
          {parsed.map((item, i) => (
            <details key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <summary className="cursor-pointer font-medium">{item.front || item.question}</summary>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {item.back || (item.options ? item.options.join(', ') + ' — Answer: ' + item.answer : item.answer)}
              </div>
            </details>
          ))}
        </div>
      );
    }
  } catch {
    /* fall through */
  }
  return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
}
