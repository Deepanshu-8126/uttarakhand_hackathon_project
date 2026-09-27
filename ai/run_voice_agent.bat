@echo off
cd /d "%~dp0"
echo ====================================================================
echo   Devbhoomi AI Unified Chatbot & Live Voice Runtime (discover/ai)
echo ====================================================================
echo   [1] Start Unified LangGraph Chatbot & Voice Server (Port 8000 - Recommended)
echo   [2] Start Voice Bridge (Port 8765 - Web & Mobile)
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
echo Starting Unified LangGraph Chatbot & Voice Server on http://localhost:8000 ...
python -m gym_support.server
goto end

:web_bridge
echo Starting Voice Bridge on ws://localhost:8765 ...
python web_bridge.py
goto end

:terminal_voice
echo Starting Interactive Terminal Voice Agent (gym_support.voice)...
python -m gym_support.voice
goto end

:terminal_adk
echo Starting Terminal Mic Voice Agent (Gemini Live ADK)...
python -m voice_demo.cli --backend adk
goto end

:end
pause
