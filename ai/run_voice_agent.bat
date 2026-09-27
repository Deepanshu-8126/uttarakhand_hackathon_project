@echo off
cd /d "%~dp0"
set "PYTHONPATH=c:\Users\Deepanshu\Desktop\discover;c:\Users\Deepanshu\Desktop\discover\ai;%PYTHONPATH%"
echo ====================================================================
echo   Devbhoomi AI Unified Chatbot and Live Voice Runtime (discover/ai)
echo ====================================================================
echo   [1] Start Unified LangGraph Chatbot and Voice Server (Port 8000)
echo   [2] Start Interactive Terminal Voice Agent (gym_support.voice)
echo   [3] Start Voice Bridge (Port 8765 - Web and Mobile)
echo ====================================================================
set /p opt="Select mode [default 1]: "
if "%opt%"=="" set opt=1
if "%opt%"=="1" goto unified_server
if "%opt%"=="2" goto terminal_voice
if "%opt%"=="3" goto web_bridge

:unified_server
echo Starting Unified LangGraph Chatbot and Voice Server on http://localhost:8000 ...
python -m gym_support.server
goto end

:terminal_voice
echo Starting Interactive Terminal Voice Agent (gym_support.voice)...
python -m gym_support.voice
goto end

:web_bridge
echo Starting Voice Bridge on ws://localhost:8765 ...
python web_bridge.py
goto end

:end
pause
