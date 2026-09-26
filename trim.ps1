$f = 'Frontend\src\components\copilot\ChatGPTVoiceOverlay.jsx'
$lines = Get-Content $f
$lines[0..773] | Set-Content $f
Write-Host "Done. Lines: $($lines[0..773].Count)"
