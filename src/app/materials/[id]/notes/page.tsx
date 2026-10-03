import GenerationPanel from '@/components/GenerationPanel';

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-extrabold tracking-tight">Notes</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Organized, readable notes generated from your material.</p>
      </div>
      <GenerationPanel materialId={id} type="notes" />
    </div>
  );
}
