'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type MaterialSummary = { id: string; title: string; source: string; created_at: number };

export default function Home() {
  const [materials, setMaterials] = useState<MaterialSummary[]>([]);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function loadMaterials() {
    const res = await fetch('/api/materials');
    setMaterials(await res.json());
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  async function upload() {
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('title', title);
    if (file) form.append('file', file);
    if (youtubeUrl) form.append('youtubeUrl', youtubeUrl);
    if (rawText) form.append('rawText', rawText);
    const res = await fetch('/api/materials', { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return setError(data.error ?? 'Upload failed');
    setTitle('');
    setYoutubeUrl('');
    setRawText('');
    setFile(null);
    await loadMaterials();
  }

  async function remove(id: string) {
    await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    loadMaterials();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">TurboAI Local</Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#library" className="hover:text-slate-900 dark:hover:text-slate-200">Library</a>
            <a href="#upload" className="rounded-full bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-700">Get started</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">The fastest way to learn anything.</h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
          Turn your study materials into interactive notes, flashcards, and quizzes.
        </p>

        <div id="upload" className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex justify-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-800">PDF</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-800">DOCX</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-800">YouTube</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-800">Text</span>
          </div>

          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            placeholder="Title your material"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="mt-4 block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Drop files here</span>
            <p className="mt-1 text-xs text-slate-400">PDFs, documents, and recordings</p>
            <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {file && <p className="mt-2 text-xs text-slate-500">Selected: {file.name}</p>}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="YouTube URL (optional)"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <textarea
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 sm:col-span-2"
              placeholder="Or paste your notes/text here"
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>

          <button
            onClick={upload}
            disabled={uploading}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? 'Generating study materials…' : 'Generate study materials'}
          </button>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>
      </section>

      <section id="library" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-bold">Your library</h2>
        {materials.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No materials yet. Upload something above to get started.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <Link href={`/materials/${m.id}`} className="text-base font-bold hover:text-indigo-600 dark:hover:text-indigo-400">
                  {m.title}
                </Link>
                <button onClick={() => remove(m.id)} className="text-xs text-slate-400 hover:text-red-500">Delete</button>
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{m.source}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/materials/${m.id}/notes`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Notes</Link>
                <Link href={`/materials/${m.id}/flashcards`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Flashcards</Link>
                <Link href={`/materials/${m.id}/quiz`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Quiz</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
