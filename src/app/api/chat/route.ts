import { db } from '@/lib/db';
import { ollamaChat } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { materialId, message } = await request.json();
  if (!materialId || !message) return Response.json({ error: 'Missing materialId or message' }, { status: 400 });
  const material = db.prepare('SELECT text FROM materials WHERE id = ?').get(materialId) as
    | { text: string }
    | undefined;
  if (!material) return Response.json({ error: 'Material not found' }, { status: 404 });

  const history = db
    .prepare('SELECT role, content FROM chats WHERE material_id = ? ORDER BY created_at ASC LIMIT 20')
    .all(materialId) as { role: 'user' | 'assistant'; content: string }[];

  const system = `You are a helpful study tutor. Answer questions based only on the provided study material. If the answer is not in the material, say so.\n\nMaterial:\n${material.text.slice(0, 8000)}`;

  try {
    const reply = await ollamaChat([
      { role: 'system', content: system },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]);
    const now = Date.now();
    db.prepare('INSERT INTO chats (material_id, role, content, created_at) VALUES (?, ?, ?, ?)').run(
      materialId,
      'user',
      message,
      now
    );
    db.prepare('INSERT INTO chats (material_id, role, content, created_at) VALUES (?, ?, ?, ?)').run(
      materialId,
      'assistant',
      reply,
      now + 1
    );
    return Response.json({ reply });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'Chat failed' }, { status: 500 });
  }
}
