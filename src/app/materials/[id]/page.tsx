import Link from 'next/link';
import { db } from '@/lib/db';

export default async function MaterialOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = db.prepare('SELECT title, source, text, created_at FROM materials WHERE id = ?').get(id) as
    | { title: string; source: string; text: string; created_at: number }
    | undefined;
  if (!material) return <p>Material not found.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">{material.title}</h1>
        <p className="text-sm text-slate-500">Source: {material.source}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/materials/${id}/notes`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Notes</Link>
          <Link href={`/materials/${id}/flashcards`} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium dark:bg-slate-800">Flashcards</Link>
          <Link href={`/materials/${id}/quiz`} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium dark:bg-slate-800">Quiz</Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">Extracted text preview</h2>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
          {material.text.slice(0, 3000)}{material.text.length > 3000 ? '…' : ''}
        </pre>
      </div>
    </div>
  );
}
