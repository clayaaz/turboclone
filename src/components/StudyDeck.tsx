'use client';

import { useEffect, useState } from 'react';

type CardItem = {
  front?: string;
  back?: string;
  question?: string;
  answer?: string;
  options?: string[];
  type?: string;
};

export default function StudyDeck({ materialId, type }: { materialId: string; type: 'flashcards' | 'quiz' }) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/materials/${materialId}`);
    const data = await res.json();
    const gen = (data.generations ?? []).find((g: any) => g.type === type);
    try {
      const parsed = gen ? JSON.parse(gen.content) : [];
      setCards(Array.isArray(parsed) ? parsed : []);
      setIndex(0);
      setShowAnswer(false);
    } catch {
      setCards([]);
    }
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
    try {
      const parsed = JSON.parse(data.content);
      setCards(Array.isArray(parsed) ? parsed : []);
      setIndex(0);
      setShowAnswer(false);
    } catch {
      setError('Could not parse generated cards');
    }
  }

  function next() {
    setIndex((i) => Math.min(i + 1, cards.length - 1));
    setShowAnswer(false);
  }
  function prev() {
    setIndex((i) => Math.max(i - 1, 0));
    setShowAnswer(false);
  }
  function goTo(i: number) {
    setIndex(i);
    setShowAnswer(false);
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold capitalize">{type}</h2>
          <button onClick={generate} disabled={generating} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
            {generating ? 'Generating…' : cards.length ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {cards.length === 0 ? (
          <p className="text-slate-500">No {type} yet. Click Generate.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <div className={"rounded-3xl border p-8 shadow-sm transition " + (showAnswer ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800')}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{showAnswer ? 'Answer' : 'Question'}</p>
                <h3 className="text-2xl font-bold">{cards[index]?.front || cards[index]?.question}</h3>
                {showAnswer && (
                  <div className="mt-6 text-lg text-slate-700 dark:text-slate-300">
                    {cards[index]?.back || cards[index]?.answer}
                    {cards[index]?.options && (
                      <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        {cards[index].options.map((o, i) => (
                          <li key={i}>• {o}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={prev} disabled={index === 0} className="rounded-full border border-slate-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-700">← Previous</button>
                <button onClick={() => setShowAnswer((s) => !s)} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                  {showAnswer ? 'Hide answer' : 'Show answer'}
                </button>
                <button onClick={next} disabled={index === cards.length - 1} className="rounded-full border border-slate-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-700">Next →</button>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h4 className="mb-3 text-sm font-semibold text-slate-500">Jump to card</h4>
              <div className="grid grid-cols-5 gap-2">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={"rounded-lg py-2 text-xs font-medium transition " + (i === index ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700')}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
