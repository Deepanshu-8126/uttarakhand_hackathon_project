@echo off
cd /d "%~dp0"
echo ====================================================================
echo   Devbhoomi AI Unified Chatbot ^& Live Voice Runtime (discover/ai)
echo ====================================================================
echo   [1] Start Voice-Demo Bridge (Port 8765 - Web ^& Mobile)
echo   [2] Start Interactive Terminal Mic Agent (Gemini Live ADK)
echo   [3] Start Interactive Terminal Mic Agent (Gemini Live Raw)
echo   [4] Start Unified LangGraph Chatbot ^& Voice Server (Port 8000)
echo ====================================================================
set /p opt="Select mode [default 1]: "
if "%opt%"=="" set opt=1
if "%opt%"=="1" goto web_bridge
if "%opt%"=="2" goto terminal_adk
if "%opt%"=="3" goto terminal_gemini
if "%opt%"=="4" goto unified_server

:web_bridge
echo Starting Voice Bridge on ws://localhost:8765 ...
uv run python web_bridge.py
goto end

:terminal_adk
echo Starting Terminal Mic Voice Agent (ADK)...
uv run python -m voice_demo.cli --backend adk
goto end

:terminal_gemini
echo Starting Terminal Mic Voice Agent (Gemini Live)...
uv run python -m voice_demo.cli --backend gemini
goto end

:unified_server
echo Starting Unified FastAPI Chatbot + Voice Server on http://localhost:8000 ...
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
goto end

:end
pause
