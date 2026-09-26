@echo off
echo === Health check ===
curl -s http://localhost:8765/health
echo.
echo === Voice Ask test (Hindi) ===
curl -s -X POST http://localhost:8765/api/voice/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"query\": \"kedarnath ka mausam kaisa hai\", \"lang\": \"hi\"}" ^
  --max-time 20
echo.
