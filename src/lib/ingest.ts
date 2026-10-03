import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { YoutubeTranscript } from 'youtube-transcript';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve the pdfjs worker explicitly so Next.js doesn't fail to find it.
PDFParse.setWorker(
  pathToFileURL(
    path.resolve(process.cwd(), 'node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs')
  ).href
);

export async function extractFromFile(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    const parser = new PDFParse({ data: buf });
    const data = await parser.getText();
    return data.text;
  }
  if (name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value;
  }
  // txt, md, notes
  return buf.toString('utf8');
}

export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    return null;
  } catch {
    return null;
  }
}

export async function extractFromYoutube(url: string): Promise<string> {
  const id = youtubeVideoId(url);
  if (!id) throw new Error('Invalid YouTube URL');
  const segments = await YoutubeTranscript.fetchTranscript(id);
  return segments.map((s) => s.text).join(' ');
}
