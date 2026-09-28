@echo off
cd /d "%~dp0"

set "FLUTTER_BIN=flutter"
if exist "%USERPROFILE%\flutter\bin\flutter.bat" set "FLUTTER_BIN=%USERPROFILE%\flutter\bin\flutter.bat"
if exist "C:\flutter\bin\flutter.bat" set "FLUTTER_BIN=C:\flutter\bin\flutter.bat"
if exist "C:\src\flutter\bin\flutter.bat" set "FLUTTER_BIN=C:\src\flutter\bin\flutter.bat"

echo ====================================================================
echo   Discovery Uttarakhand - Flutter Mobile App (Microsoft Edge Launcher)
echo ====================================================================
echo.

echo [1/2] Fetching Flutter dependencies...
call "%FLUTTER_BIN%" pub get

echo [2/2] Launching Flutter App on Microsoft Edge...
call "%FLUTTER_BIN%" run -d edge

pause
