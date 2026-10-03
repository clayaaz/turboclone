import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const material = db
    .prepare('SELECT id, title, source, text, created_at FROM materials WHERE id = ?')
    .get(id);
  if (!material) return Response.json({ error: 'Not found' }, { status: 404 });
  const generations = db
    .prepare('SELECT id, type, content, created_at FROM generations WHERE material_id = ? ORDER BY created_at DESC')
    .all(id);
  const chats = db
    .prepare('SELECT id, role, content, created_at FROM chats WHERE material_id = ? ORDER BY created_at ASC')
    .all(id);
  return Response.json({ ...(material as object), generations, chats });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  db.prepare('DELETE FROM generations WHERE material_id = ?').run(id);
  db.prepare('DELETE FROM chats WHERE material_id = ?').run(id);
  db.prepare('DELETE FROM materials WHERE id = ?').run(id);
  return Response.json({ ok: true });
}
