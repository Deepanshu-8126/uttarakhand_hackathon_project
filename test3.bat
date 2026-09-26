@echo off
echo === /api/agent/chat test ===
curl -s -X POST "https://uttarakhand-hackathon-project.onrender.com/api/agent/chat" ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"kedarnath trek 3 din ka plan\"}" ^
  --max-time 20
echo.
