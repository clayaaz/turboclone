'use client';

import { useEffect, useRef, useState } from 'react';

type Chat = { id: number; role: string; content: string };

export default function ChatPanel({
  materialId,
  expanded,
  onToggle,
}: {
  materialId: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadChats() {
    const res = await fetch(`/api/materials/${materialId}`);
    const data = await res.json();
    setChats(data.chats ?? []);
  }

  useEffect(() => {
    loadChats();
  }, [materialId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chats]);

  async function send() {
    if (!input.trim()) return;
    setSending(true);
    setError('');
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId, message: input }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) return setError(data.error ?? 'Chat failed');
    setInput('');
    loadChats();
  }

  return (
    <aside className={"flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 " + (expanded ? 'h-[70vh] lg:h-[75vh]' : 'h-[320px] lg:h-[calc(100vh-10rem)]')}>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h3 className="font-semibold">Chat with this material</h3>
        <button onClick={onToggle} className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
          {expanded ? 'Minimize' : 'Expand chat'}
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
        {chats.length === 0 && <p className="text-sm text-slate-500">Ask a question about your notes.</p>}
        {chats.map((c) => (
          <div key={c.id} className={c.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={"max-w-[85%] rounded-2xl px-4 py-2 text-sm " + (c.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200')}>
              {c.content}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={sending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {sending ? '…' : 'Send'}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </aside>
  );
}
