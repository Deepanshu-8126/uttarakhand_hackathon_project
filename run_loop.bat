@echo off
echo ================================================================
echo 🏔️ DISCOVERY UTTARAKHAND — AUTONOMOUS TEST ^& HEALTH RUNNER
echo ================================================================
echo.

node scripts\verify_all_systems.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Automated Health Verification encountered issues.
    exit /b %errorlevel%
)

echo.
echo ✅ ALL SYSTEMS VERIFIED ^& HEALED SUCCESSFULLY!
echo ================================================================
