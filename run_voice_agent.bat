@echo off
cd /d "%~dp0ai"
set "PYTHONPATH=%~dp0ai;%PYTHONPATH%"

:: Auto-detect virtual environment python if present
set "PYTHON_BIN=python"
if exist ".venv\Scripts\python.exe" set "PYTHON_BIN=.venv\Scripts\python.exe"

echo ====================================================================
echo   Devbhoomi AI Voice Demo & Live Voice Runtime
echo ====================================================================
echo   [1] Start Voice Bridge & Server (Port 8765 - Web and Mobile)
echo   [2] Start Interactive Voice Demo Agent (voice_demo)
echo   [3] Start Voice Bridge (Port 8765)
echo   [4] Start Gemini Live Voice Agent (voice_demo)
echo ====================================================================
set /p opt="Select mode [default 1]: "
if "%opt%"=="" set opt=1
if "%opt%"=="1" goto web_bridge
if "%opt%"=="2" goto terminal_voice
if "%opt%"=="3" goto web_bridge
if "%opt%"=="4" goto terminal_voice

:terminal_voice
echo Starting Interactive Voice Demo Agent (voice_demo)...
"%PYTHON_BIN%" -m voice_demo.cli --backend gemini
goto end

:web_bridge
echo Starting Voice Bridge on ws://localhost:8765 ...
"%PYTHON_BIN%" web_bridge.py
goto end

:end
pause
