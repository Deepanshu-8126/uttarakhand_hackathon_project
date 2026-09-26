$f = 'Frontend\src\chat\ChatState.js'
$lines = Get-Content $f
# Keep lines 1-173, then skip orphan block (175-295), then keep 296 onwards (clearChat etc)
$keep = $lines[0..172] + $lines[295..($lines.Count - 1)]
$keep | Set-Content $f
Write-Host "Done. Total lines: $($keep.Count)"
