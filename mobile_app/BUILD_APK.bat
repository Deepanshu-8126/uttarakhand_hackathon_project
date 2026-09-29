@echo off
cd /d "%~dp0"

set "FLUTTER_BIN=flutter"
if exist "%USERPROFILE%\flutter\bin\flutter.bat" set "FLUTTER_BIN=%USERPROFILE%\flutter\bin\flutter.bat"
if exist "C:\flutter\bin\flutter.bat" set "FLUTTER_BIN=C:\flutter\bin\flutter.bat"
if exist "C:\src\flutter\bin\flutter.bat" set "FLUTTER_BIN=C:\src\flutter\bin\flutter.bat"

echo ===================================================
echo   Discovery Uttarakhand - Android APK Build Script
echo ===================================================
echo.

echo [1/2] Fetching Flutter dependencies...
call "%FLUTTER_BIN%" pub get
if %errorlevel% neq 0 (
    echo [ERROR] Failed to get flutter packages.
    pause
    exit /b 1
)

echo [2/2] Building Release APK...
call "%FLUTTER_BIN%" build apk --release
if %errorlevel% neq 0 (
    echo [ERROR] Flutter APK build failed.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   APK BUILD SUCCESSFUL!
echo   Output: build\app\outputs\flutter-apk\app-release.apk
echo ===================================================
echo.
pause
