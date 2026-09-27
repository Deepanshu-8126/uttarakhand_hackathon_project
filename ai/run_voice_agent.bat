@echo off
cd /d "%~dp0"
set "PYTHONPATH=%~dp0;%PYTHONPATH%"

:: Auto-detect virtual environment python if present
set "PYTHON_BIN=python"
if exist ".venv\Scripts\python.exe" set "PYTHON_BIN=.venv\Scripts\python.exe"

echo ====================================================================
echo   Devbhoomi AI Unified Chatbot and Live Voice Runtime (discover/ai)
echo ====================================================================
echo   [1] Start Unified LangGraph Chatbot and Voice Server (Port 8000)
echo   [2] Start Voice Bridge (Port 8765 - Web and Mobile)
echo   [3] Start Interactive Terminal Voice Agent (gym_support.voice)
echo   [4] Start Gemini Live ADK (Experimental WebSocket)
echo ====================================================================
set /p opt="Select mode [default 1]: "
if "%opt%"=="" set opt=1
if "%opt%"=="1" goto unified_server
if "%opt%"=="2" goto web_bridge
if "%opt%"=="3" goto terminal_voice
if "%opt%"=="4" goto terminal_adk

:unified_server
echo Starting Unified LangGraph Chatbot and Voice Server on http://localhost:8000 ...
"%PYTHON_BIN%" -m gym_support.server
goto end

:web_bridge
echo Starting Voice Bridge on ws://localhost:8765 ...
"%PYTHON_BIN%" web_bridge.py
goto end

:terminal_voice
echo Starting Interactive Terminal Voice Agent (gym_support.voice)...
"%PYTHON_BIN%" -m gym_support.voice
goto end

:terminal_adk
echo Starting Terminal Mic Voice Agent (Gemini Live ADK)...
"%PYTHON_BIN%" -m voice_demo.cli --backend adk
goto end

:end
pause
