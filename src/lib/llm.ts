const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1:8b';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export async function ollamaChat(messages: Message[]): Promise<string> {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.3 },
    }),
  });
  if (!res.ok) {
    throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data?.message?.content ?? '';
}

export async function generate(system: string, user: string): Promise<string> {
  return ollamaChat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);
}
