@echo off
title Devbhoomi Gemini Live Aoede Voice Bridge - port 8765
echo.
echo ============================================================
echo   Starting Devbhoomi Gemini Live Voice Bridge
echo   Engine: gemini-2.5-flash-native-audio-latest (Voice: Aoede)
echo   Port: 8765 (WebSocket + HTTP API)
echo ============================================================
echo.

:: Free port 8765 if already in use
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8765 ^| findstr LISTENING') do (
    echo Freeing port 8765 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

cd /d "c:\Users\Deepanshu\Desktop\discover\voice_try\voice-demo"
".venv\Scripts\python.exe" "c:\Users\Deepanshu\Desktop\discover\ai\web_bridge.py"
pause
