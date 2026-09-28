$ErrorActionPreference = "Stop"

$sdkDir = "C:\Android\sdk"
$targetLatest = "$sdkDir\cmdline-tools\latest"
$sdkManager = "$targetLatest\bin\sdkmanager.bat"

$env:ANDROID_HOME = $sdkDir
$env:ANDROID_SDK_ROOT = $sdkDir
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkDir, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkDir, "User")

Write-Host "=== Auto-Accepting all Android SDK Licenses ===" -ForegroundColor Cyan
$licensesDir = "$sdkDir\licenses"
if (-not (Test-Path $licensesDir)) {
    New-Item -ItemType Directory -Force -Path $licensesDir | Out-Null
}

# Standard known Android SDK license hashes:
$androidSdkLicense = "24333f8a63b1d79430437b558c37d93e7b57979e`n8933bad161af6e78b674214029b520f32831626e`nd56f5187479451eabf01fb78af6dfcb131a6481e"
$androidSdkPreview = "84831b9409646a53ee4421aae6ddde84668224b5"
$androidSdkArm = "d975f751698a77b662f1254ddbeed3901e976f5a"
$googleGdkLicense = "33b6a2b6492d305622ce847a57160eb23a149c87"

Set-Content -Path "$licensesDir\android-sdk-license" -Value $androidSdkLicense
Set-Content -Path "$licensesDir\android-sdk-preview-license" -Value $androidSdkPreview
Set-Content -Path "$licensesDir\android-sdk-arm-dbt-license" -Value $androidSdkArm
Set-Content -Path "$licensesDir\google-gdk-license" -Value $googleGdkLicense

Write-Host "Licenses files written directly."

Write-Host "=== Installing platform-tools, build-tools 35.0.0 & platforms;android-35 ===" -ForegroundColor Cyan
& cmd.exe /c "`"$sdkManager`" --sdk_root=`"$sdkDir`" `"platform-tools`" `"build-tools;35.0.0`" `"platforms;android-35`""

Write-Host "=== Configuring Flutter Android SDK ===" -ForegroundColor Cyan
& flutter config --android-sdk $sdkDir

Write-Host "=== Verifying with flutter doctor ===" -ForegroundColor Cyan
& flutter doctor -v

Write-Host "=== Android SDK Setup Complete! ===" -ForegroundColor Green
