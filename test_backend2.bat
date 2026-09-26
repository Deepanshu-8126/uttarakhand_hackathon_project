@echo off
echo === Testing /api/chat/stream ===
curl -v -X POST "https://uttarakhand-hackathon-project.onrender.com/api/chat/stream" ^
  -H "Content-Type: application/json" ^
  -H "x-session-id: test123" ^
  -d "{\"message\":\"hello kedarnath\",\"sessionId\":\"test123\"}" ^
  --max-time 20 2>&1
echo.
echo === Testing /api/agent/chat ===
curl -s -X POST "https://uttarakhand-hackathon-project.onrender.com/api/agent/chat" ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"hello\"}" ^
  --max-time 20
echo.
