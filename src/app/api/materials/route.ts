import { db, UPLOAD_DIR } from '@/lib/db';
import { extractFromFile, extractFromYoutube } from '@/lib/ingest';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = db
    .prepare('SELECT id, title, source, created_at FROM materials ORDER BY created_at DESC')
    .all();
  return Response.json(rows);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const title = String(form.get('title') ?? '').trim() || 'Untitled';
  const file = form.get('file');
  const youtubeUrl = String(form.get('youtubeUrl') ?? '').trim();
  const rawText = String(form.get('rawText') ?? '').trim();

  let text = '';
  let source = '';
  let filePath: string | null = null;

  try {
    if (file instanceof File && file.size > 0) {
      source = 'file';
      text = await extractFromFile(file);
      const id = crypto.randomUUID();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      filePath = path.join(UPLOAD_DIR, `${id}-${safeName}`);
      fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));
      db.prepare(
        'INSERT INTO materials (id, title, source, text, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id, title, source, text, filePath, Date.now());
      return Response.json({ id, title });
    } else if (youtubeUrl) {
      source = 'youtube';
      text = await extractFromYoutube(youtubeUrl);
    } else if (rawText) {
      source = 'text';
      text = rawText;
    } else {
      return Response.json({ error: 'Provide a file, YouTube URL, or text.' }, { status: 400 });
    }
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'Failed to extract text' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO materials (id, title, source, text, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, title, source, text, null, Date.now());
  return Response.json({ id, title });
}
