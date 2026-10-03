'use client';

import { useState } from 'react';
import Link from 'next/link';
import ChatPanel from '@/components/ChatPanel';

export default function MaterialShell({ materialId, children }: { materialId: string; children: React.ReactNode }) {
  const [chatExpanded, setChatExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600">← Back to library</Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href={`/materials/${materialId}`} className="hover:text-indigo-600">Overview</Link>
            <Link href={`/materials/${materialId}/notes`} className="hover:text-indigo-600">Notes</Link>
            <Link href={`/materials/${materialId}/flashcards`} className="hover:text-indigo-600">Flashcards</Link>
            <Link href={`/materials/${materialId}/quiz`} className="hover:text-indigo-600">Quiz</Link>
          </nav>
        </div>
      </header>

      {chatExpanded ? (
        <main className="mx-auto max-w-4xl px-6 py-8">
          <ChatPanel materialId={materialId} expanded={true} onToggle={() => setChatExpanded(false)} />
        </main>
      ) : (
        <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
          <section>{children}</section>
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-10rem)]">
            <ChatPanel materialId={materialId} expanded={false} onToggle={() => setChatExpanded(true)} />
          </div>
        </main>
      )}
    </div>
  );
}
