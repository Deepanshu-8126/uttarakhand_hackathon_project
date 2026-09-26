@echo off
echo ===================================================
echo   Discovery Uttarakhand - Android APK Build Script
echo ===================================================
echo.

echo [1/2] Fetching Flutter dependencies...
call flutter pub get
if %errorlevel% neq 0 (
    echo [ERROR] Failed to get flutter packages.
    pause
    exit /b 1
)

echo [2/2] Building Release APK...
call flutter build apk --release
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
