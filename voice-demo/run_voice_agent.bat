@echo off
cd /d "%~dp0"
echo ====================================================================
echo   Devbhoomi AI Live Voice Agent (langchain-ai/voice-demo)
echo ====================================================================
echo   [1] Start Web ^& App Live Voice Bridge (Port 8765)
echo   [2] Start Interactive Terminal Mic Agent (Gemini Live ADK)
echo   [3] Start Interactive Terminal Mic Agent (Gemini Live Raw)
echo ====================================================================
set /p opt="Select mode [default 1]: "
if "%opt%"=="" set opt=1
if "%opt%"=="1" goto web_bridge
if "%opt%"=="2" goto terminal_adk
if "%opt%"=="3" goto terminal_gemini

:web_bridge
echo Starting Web ^& Mobile Voice Bridge on ws://localhost:8765 ...
uv run python web_bridge.py
goto end

:terminal_adk
echo Starting Terminal Mic Voice Agent (ADK)...
uv run voice-demo --backend adk
goto end

:terminal_gemini
echo Starting Terminal Mic Voice Agent (Gemini Live)...
uv run voice-demo --backend gemini
goto end

:end
pause
