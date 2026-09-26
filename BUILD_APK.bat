@echo off
echo ===================================================
echo   Discovery Uttarakhand - Android APK Build Script
echo ===================================================
echo.

cd mobile_app

echo [1/3] Checking Flutter environment...
where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Flutter SDK is not found in your PATH.
    echo Please install Flutter or add Flutter bin to your environment PATH.
    echo Example: set PATH=C:\flutter\bin;%%PATH%%
    pause
    exit /b 1
)

echo [2/3] Fetching Flutter dependencies...
call flutter pub get
if %errorlevel% neq 0 (
    echo [ERROR] Failed to get flutter packages.
    pause
    exit /b 1
)

echo [3/3] Building Release APK (Universal / Fat APK)...
call flutter build apk --release
if %errorlevel% neq 0 (
    echo [ERROR] Flutter APK build failed.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   APK BUILD SUCCESSFUL!
echo   Output: mobile_app\build\app\outputs\flutter-apk\app-release.apk
echo ===================================================
echo.
pause
