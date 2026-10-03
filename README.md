# TurboAI Local

A local, Turbo AI–inspired study tool. Upload PDFs, DOCX, text, YouTube links, or paste your notes, then generate **notes**, **flashcards**, and **quizzes** with a local LLM via Ollama. Chat with your material on the side.

## Requirements

- Node.js 18+ (LTS recommended)
- npm
- Ollama (local LLM server)

## Quick start

### Windows

```bat
start.bat
```

### macOS / Linux

```bash
./start.sh
```

The script will:

1. Check for Node.js and Ollama; install if missing.
2. Install npm dependencies if missing.
3. Pull the `llama3.1:8b` model if missing.
4. Start the Ollama server in the background.
5. Start the Next.js dev server.
6. Stop Ollama when the script exits.

Open [http://localhost:3000](http://localhost:3000).

## Manual setup

```bash
npm install
ollama pull llama3.1:8b
ollama serve &
npm run dev
```

## Features

- Upload PDF/DOCX/TXT/MD files
- YouTube transcript ingestion
- Generate structured notes
- Flashcards deck with answer reveal, prev/next, and card jump menu
- Quiz deck with answer reveal, prev/next, and card jump menu
- Chat with your uploaded material
- Local SQLite storage in `data/turboai.db`

## Configuration

- Model: set `OLLAMA_MODEL` env var (default: `llama3.1:8b`)
- Ollama host: set `OLLAMA_HOST` env var (default: `http://localhost:11434`)

## Project structure

- `src/app` — Next.js App Router pages
- `src/app/api` — API routes for materials, generation, chat
- `src/components` — UI components (ChatPanel, StudyDeck, GenerationPanel, MaterialShell)
- `src/lib` — DB, LLM, ingestion helpers
- `data/` — SQLite database and uploads (created at runtime)

## Notes

- Generated content can contain errors; always verify against your source material.
- The app is a UI/UX inspiration only, not affiliated with turbo.ai.

## License

MIT
