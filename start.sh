#!/usr/bin/env bash
set -e

echo "=== TurboAI Local setup ==="

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing..."
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    echo "Homebrew not found. Install Node.js from https://nodejs.org/ then re-run."
    exit 1
  fi
fi

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Please restart terminal after Node install."
  exit 1
fi

# Check Ollama
if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama not found. Installing..."
  if command -v brew >/dev/null 2>&1; then
    brew install ollama
  else
    curl -fsSL https://ollama.com/install.sh | sh
  fi
fi

# Install dependencies if missing
if [ ! -d node_modules ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Pull model if missing
if ! ollama list | grep -q "llama3.1:8b"; then
  echo "Pulling llama3.1:8b model..."
  ollama pull llama3.1:8b
fi

# Start Ollama server in background
echo "Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

cleanup() {
  echo "Stopping Ollama server..."
  kill $OLLAMA_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 3

# Start web app
echo "Starting Next.js dev server..."
npm run dev
