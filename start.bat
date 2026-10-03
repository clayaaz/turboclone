@echo off
setlocal EnableDelayedExpansion

echo === TurboAI Local setup ===

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js not found. Installing via winget...
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
    if errorlevel 1 goto :fail
    echo Please close and reopen this terminal if node is not on PATH.
)

:: Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo npm not found. Please restart terminal after Node install.
    goto :fail
)

:: Check Ollama
where ollama >nul 2>nul
if errorlevel 1 (
    echo Ollama not found. Installing via winget...
    winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements
    if errorlevel 1 goto :fail
    echo Please close and reopen this terminal if ollama is not on PATH.
)

:: Install dependencies if missing
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
    if errorlevel 1 goto :fail
)

:: Pull model if missing
ollama list | findstr /C:"llama3.1:8b" >nul
if errorlevel 1 (
    echo Pulling llama3.1:8b model...
    ollama pull llama3.1:8b
    if errorlevel 1 goto :fail
)

:: Start Ollama server in background
echo Starting Ollama server...
start "Ollama Server" /b ollama serve
timeout /t 3 /nobreak >nul

:: Start web app
echo Starting Next.js dev server...
call npm run dev

:: Cleanup Ollama server when webapp exits
killing Ollama server...
taskkill /IM ollama.exe /F >nul 2>nul

endlocal
exit /b 0

:fail
echo Setup failed.
endlocal
exit /b 1
