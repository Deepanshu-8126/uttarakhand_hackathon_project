@echo off
cd /d c:\Users\Deepanshu\Desktop\discover\ai
python -c "import edge_tts; print('edge_tts: OK')" 2>&1
python -c "import fastapi; print('fastapi: OK')" 2>&1
python -c "import uvicorn; print('uvicorn: OK')" 2>&1
python -c "from google import genai; print('google-genai: OK')" 2>&1
python -c "from voice_demo.devbhoomi import search_destination_info; print('voice_demo: OK')" 2>&1
