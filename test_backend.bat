@echo off
echo === /api/destinations ===
curl -s "https://uttarakhand-hackathon-project.onrender.com/api/destinations?limit=1" -m 15
echo.
echo === /api/chat (POST) ===
curl -s -X POST "https://uttarakhand-hackathon-project.onrender.com/api/chat" -H "Content-Type: application/json" -d "{\"message\":\"hello\"}" -m 20
echo.
echo === /api/chat/query ===
curl -s -X POST "https://uttarakhand-hackathon-project.onrender.com/api/chat/query" -H "Content-Type: application/json" -d "{\"message\":\"hello\"}" -m 20
echo.
