import { db } from '@/lib/db';
import { generate } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROMPTS: Record<string, string> = {
  notes: `Convert the study material into clear, structured notes using headings, bullet points, and concise explanations. Preserve key definitions, formulas, and examples.`,
  flashcards: `Create a JSON array of flashcards. Each item must be an object with "front" and "back" string properties. Return only the JSON array, no markdown fences.`,
  quiz: `Create a JSON array of quiz questions. Use a mix of "multiple_choice" (with "options": string[], "answer": string) and "short_answer" (with "answer": string). Each item must have "type", "question", "answer", and optionally "options". Return only the JSON array, no markdown fences.`,
};

export async function POST(request: Request) {
  const { materialId, type } = await request.json();
  if (!materialId || !type || !PROMPTS[type]) {
    return Response.json({ error: 'Invalid materialId or type' }, { status: 400 });
  }
  const material = db.prepare('SELECT text FROM materials WHERE id = ?').get(materialId) as
    | { text: string }
    | undefined;
  if (!material) return Response.json({ error: 'Material not found' }, { status: 404 });

  const text = material.text.slice(0, 12000);
  try {
    const content = await generate(PROMPTS[type], text);
    db.prepare('INSERT INTO generations (material_id, type, content, created_at) VALUES (?, ?, ?, ?)').run(
      materialId,
      type,
      content,
      Date.now()
    );
    return Response.json({ content });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'Generation failed' }, { status: 500 });
  }
}
