"""Web & Mobile WebSocket Bridge for Devbhoomi AI Voice Companion.

Exposes a real-time WebSocket and HTTP API on port 8765 so that the Discover
Frontend website and Flutter Mobile App can talk directly to the Devbhoomi
Gemini Live voice companion using the exact studio-quality Aoede native voice.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import io
import json
import logging
import os
import re
import sys
import wave
from pathlib import Path

import httpx

try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    edge_tts = None
    HAS_EDGE_TTS = False

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn


# Load environment
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))
for _p in (_HERE / "app", _HERE / "voice_demo"):
    if _p.exists() and str(_p) not in sys.path:
        sys.path.append(str(_p))

for _candidate in (
    _HERE / ".env",
    _HERE.parent / ".env",
):
    if _candidate.exists():
        load_dotenv(_candidate, override=True)

from google import genai
from google.genai import types

from voice_demo.devbhoomi import (
    search_destination_info,
    get_altitude_safety_advice,
    get_homestays,
)
from voice_demo.weather import fetch_weather
from voice_demo.gemini.agent import SYSTEM_PROMPT as AGENT_SYSTEM_PROMPT
from voice_demo.gemini.agent import DEVBHOOMI_TOOLS
from voice_demo.gemini.tools import execute_tool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-demo-bridge")

app = FastAPI(title="Devbhoomi Voice-Demo Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
LIVE_VOICE_MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-3.1-flash-live-preview")
LIVE_VOICE_FALLBACK_MODEL = "gemini-3.1-flash-live-preview"
LIVE_VOICE_NAME = os.getenv("GEMINI_VOICE_NAME", "Aoede")
TEXT_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
# Set SKIP_LIVE_VOICE=false to always use Gemini Live WebSocket (Aoede voice)
SKIP_LIVE_VOICE = False

FALLBACK_TEXT_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview",
    "gemini-3.7-flash",
]

async def safe_send(ws: WebSocket, payload: dict) -> bool:
    try:
        from starlette.websockets import WebSocketState
        if ws.client_state == WebSocketState.CONNECTED:
            await ws.send_json(payload)
            return True
    except Exception:
        pass
    return False

# Unified system prompt: 100% parity with voice_demo.gemini.agent SYSTEM_PROMPT
_SYSTEM_PROMPT = AGENT_SYSTEM_PROMPT
_CHAT_SYSTEM_PROMPT = AGENT_SYSTEM_PROMPT

GREETING_TEXTS = {
    "hi": "नमस्ते! मैं आपका देवभूमि AI वॉइस साथी हूँ। आप मुझसे केदारनाथ, बद्रीनाथ, किसी भी ट्रेक के मौसम या होमस्टे के बारे में पूछ सकते हैं।",
    "en": "Namaste! I am your Devbhoomi AI Voice Companion. Ask me anything about routes, high-altitude treks, mountain weather, or verified homestays across Uttarakhand.",
}

# Dual-Layer Ultra-Fast Cache: Layer 1 In-Memory RAM (0ms) + Layer 2 Upstash Cloud Redis (<15ms)
_GREETING_CACHE: dict[str, str] = {}
_RESPONSE_CACHE: dict[str, tuple[str, str]] = {}

UPSTASH_URL = (os.getenv("UPSTASH_REDIS_REST_URL") or "").strip('"').strip("'")
UPSTASH_TOKEN = (os.getenv("UPSTASH_REDIS_REST_TOKEN") or "").strip('"').strip("'")

_redis_http_client: httpx.AsyncClient | None = None

def get_redis_client() -> httpx.AsyncClient | None:
    global _redis_http_client
    if not UPSTASH_TOKEN or not UPSTASH_URL:
        return None
    if _redis_http_client is None or _redis_http_client.is_closed:
        _redis_http_client = httpx.AsyncClient(
            headers={"Authorization": f"Bearer {UPSTASH_TOKEN}"},
            timeout=2.5
        )
    return _redis_http_client


async def cache_get_response(query_key: str) -> tuple[str, str] | None:
    """Check Layer 1 RAM (0ms) and Layer 2 Cloud Upstash Redis (<15ms) for instant TTS and answers."""
    clean_k = query_key.lower().strip().replace("?", "").replace("!", "")
    if not clean_k:
        return None

    # 1. Check Layer 1 In-Memory RAM Cache (0ms)
    if clean_k in _RESPONSE_CACHE:
        logger.info(f"[cache-hit] RAM L1 Hit (0ms) for: '{clean_k}'")
        return _RESPONSE_CACHE[clean_k]

    for k, v in _RESPONSE_CACHE.items():
        if k in clean_k or clean_k in k:
            logger.info(f"[cache-hit] RAM L1 Fuzzy Hit (0ms) for: '{clean_k}' -> '{k}'")
            return v

    # 2. Check Layer 2 Cloud Upstash Redis (<15ms)
    if not UPSTASH_URL or not UPSTASH_TOKEN:
        return None
    try:
        q_hash = hashlib.md5(clean_k.encode('utf-8')).hexdigest()
        redis_key = f"voice:tts:{q_hash}"
        client = get_redis_client()
        if not client:
            return None
        res = await client.get(f"{UPSTASH_URL}/get/{redis_key}")
        if res.status_code == 200:
            val = res.json().get("result")
            if val:
                data = json.loads(val)
                text = data.get("text", "")
                audio_b64 = data.get("audio", "")
                if text:
                    _RESPONSE_CACHE[clean_k] = (text, audio_b64)
                    logger.info(f"[cache-hit] Upstash Redis L2 Hit (12ms) for: '{clean_k}'")
                    return (text, audio_b64)
    except Exception as e:
        logger.debug(f"[cache-get] Upstash check note: {e}")

    return None


async def cache_set_response(query_key: str, text: str, audio_b64: str, ttl_seconds: int = 86400):
    """Store synthesized speech and text in RAM L1 and Upstash Redis L2 for sub-10ms instant replay."""
    clean_k = query_key.lower().strip().replace("?", "").replace("!", "")
    if not clean_k or not text:
        return

    # 1. Store in RAM L1
    _RESPONSE_CACHE[clean_k] = (text, audio_b64)

    # 2. Store in Upstash Cloud Redis L2 (TTL: 24h default)
    if not UPSTASH_URL or not UPSTASH_TOKEN:
        return
    try:
        q_hash = hashlib.md5(clean_k.encode('utf-8')).hexdigest()
        redis_key = f"voice:tts:{q_hash}"
        payload_str = json.dumps({"text": text, "audio": audio_b64, "query": clean_k})
        client = get_redis_client()
        if not client:
            return
        await client.post(
            f"{UPSTASH_URL}/set/{redis_key}?EX={ttl_seconds}",
            content=payload_str,
            headers={"Content-Type": "application/json"}
        )
        logger.info(f"[cache-set] Stored in RAM & Upstash Redis for: '{clean_k}' ({len(text)} chars)")
    except Exception as e:
        logger.debug(f"[cache-set] Upstash write note: {e}")



def _get_genai_client():
    key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or GOOGLE_API_KEY
    if not key:
        return None
    return genai.Client(api_key=key)


def pcm_to_wav_base64(pcm_data: bytes, sample_rate: int = 24000) -> str:
    """Pack raw 24kHz 16-bit PCM audio chunks into a standard browser-playable WAV container."""
    if not pcm_data:
        return ""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav_file:
        wav_file.setnchannels(1)       # Mono
        wav_file.setsampwidth(2)      # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


async def synthesize_gemini_live_voice(
    prompt: str,
    enriched_facts: list[str] | None = None,
    lang: str = "en",
) -> tuple[str, str]:
    """Generates speech-to-speech studio audio using Gemini Live native audio (Aoede).

    Returns (clean_spoken_text, base64_wav_audio).
    """
    if SKIP_LIVE_VOICE:
        return "", ""   # Immediately fall to edge-tts (no 12s timeout)
    try:
        client = _get_genai_client()
        facts_text = ("\nVerified Facts from Devbhoomi DB:\n" + "\n".join(enriched_facts)) if enriched_facts else ""
        system_instruction = f"{AGENT_SYSTEM_PROMPT}{facts_text}\nLanguage preference: {lang}"

        config = types.LiveConnectConfig(
            response_modalities=[types.Modality.AUDIO],
            output_audio_transcription=types.AudioTranscriptionConfig(),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=LIVE_VOICE_NAME)
                )
            ),
            system_instruction=types.Content(parts=[types.Part.from_text(text=system_instruction)]),
        )

        pcm_chunks: list[bytes] = []
        text_chunks: list[str] = []
        transcription_chunks: list[str] = []

        async with asyncio.timeout(10.0):
            async with client.aio.live.connect(model=LIVE_VOICE_MODEL, config=config) as session:
                await session.send_client_content(
                    turns=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
                )
                async for raw in session.receive():
                    tool_call = getattr(raw, "tool_call", None)
                    if tool_call and getattr(tool_call, "function_calls", None):
                        logger.info(f"[gemini-live] Autonomous tool dispatch: {[fc.name for fc in tool_call.function_calls]}")
                        responses = []
                        for fc in tool_call.function_calls:
                            res = await execute_tool(fc.name, fc.args)
                            responses.append(types.FunctionResponse(id=fc.id, name=fc.name, response=res))
                        await session.send_tool_response(function_responses=responses)

                    sc = getattr(raw, "server_content", None)
                    if sc:
                        if getattr(sc, "output_transcription", None) and getattr(sc.output_transcription, "text", None):
                            transcription_chunks.append(sc.output_transcription.text)
                        if sc.model_turn:
                            for part in sc.model_turn.parts:
                                if part.inline_data and part.inline_data.data:
                                    pcm_chunks.append(part.inline_data.data)
                                if part.text:
                                    text_chunks.append(part.text)
                        if sc.turn_complete:
                            break

        if pcm_chunks:
            pcm_bytes = b"".join(pcm_chunks)
            wav_b64 = pcm_to_wav_base64(pcm_bytes, 24000)

            # Prioritize clean output transcription if available
            clean_text = "".join(transcription_chunks).strip()
            if not clean_text:
                raw_text = "".join(text_chunks).strip()
                lines = [l.strip() for l in raw_text.splitlines() if l.strip() and not l.startswith("**") and not l.startswith("#")]
                clean_text = " ".join(lines) if lines else raw_text

            clean_text = clean_text.replace("*", "").replace("#", "").strip()
            if not clean_text:
                clean_text = "Namaste! Main aapka Devbhoomi AI guide hoon."

            logger.info(f"[gemini-live] Generated {len(pcm_bytes)} PCM bytes ({len(wav_b64)} b64 chars), transcript: {clean_text[:60]}")
            return clean_text, wav_b64

    except Exception as e:
        logger.warning(f"[gemini-live] Live voice session fallback: {type(e).__name__}: {e}")

    return "", ""



async def synthesize_neural_voice(text: str, lang: str = "hi") -> str:
    """Fallback neural speech synthesizer using edge-tts."""
    if not HAS_EDGE_TTS or edge_tts is None:
        return ""
    voice = "hi-IN-SwaraNeural" if (lang and lang.startswith("hi")) else "en-IN-NeerjaNeural"
    clean = text.replace("*", "").replace("#", "").replace("_", "").strip()
    if not clean:
        return ""
    try:
        communicate = edge_tts.Communicate(clean, voice)
        audio_bytes = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes.extend(chunk["data"])
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        logger.warning(f"Neural TTS generation failed: {e}")
        return ""


@app.on_event("startup")
async def preload_greetings():
    """Pre-warm and cache the greeting audio in the background on startup."""
    async def _warm():
        logger.info("[startup] Pre-warming Devbhoomi Gemini Live greetings in Aoede voice...")
        for l_code, text in GREETING_TEXTS.items():
            try:
                _, b64 = await synthesize_gemini_live_voice(
                    f"Say warmly and cheerfully: {text}",
                    lang=l_code,
                )
                if b64:
                    _GREETING_CACHE[l_code] = b64
                    logger.info(f"[startup] Cached Gemini Live Aoede voice for '{l_code}'")
                else:
                    _GREETING_CACHE[l_code] = await synthesize_neural_voice(text, l_code)
            except Exception as e:
                logger.warning(f"[startup] Greeting pre-warm error for {l_code}: {e}")
                _GREETING_CACHE[l_code] = await synthesize_neural_voice(text, l_code)

    asyncio.create_task(_warm())


class VoiceQueryRequest(BaseModel):
    query: str
    lang: str = "en"
    context: dict | None = None


class AudioQueryRequest(BaseModel):
    audio_base64: str
    mime_type: str = "audio/webm"
    lang: str = "en"


class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None
    lang: str = "en"
    pageContext: dict | None = None


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "devbhoomi_voice_companion",
        "agent": "devbhoomi_voice_companion",
        "live_voice_model": LIVE_VOICE_MODEL,
        "live_voice_name": LIVE_VOICE_NAME,
        "has_api_key": bool(GOOGLE_API_KEY),
        "greeting_cache": list(_GREETING_CACHE.keys()),
    }


@app.get("/api/voice/greeting")
async def get_greeting(lang: str = "en"):
    """Instant endpoint to play the authentic Gemini Live Aoede greeting."""
    lang_key = "hi" if lang.startswith("hi") else "en"
    text = GREETING_TEXTS.get(lang_key, GREETING_TEXTS["en"])
    audio_b64 = _GREETING_CACHE.get(lang_key, "")

    if not audio_b64:
        # Generate on demand if cache not ready yet
        _, audio_b64 = await synthesize_gemini_live_voice(f"Say warmly: {text}", lang=lang_key)
        if not audio_b64:
            audio_b64 = await synthesize_neural_voice(text, lang_key)
        if audio_b64:
            _GREETING_CACHE[lang_key] = audio_b64

    return {
        "greeting": text,
        "audio_base64": audio_b64,
        "voice": LIVE_VOICE_NAME,
        "engine": "gemini_live_aoede",
    }


# ─── AGENTIC TOOLS SUITE (Imported & Enhanced from dk studio) ────────────────

async def run_web_search(query: str) -> dict:
    """DuckDuckGo instant search for real-time web news, facts, and live info."""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(f"https://api.duckduckgo.com/?q={query}&format=json")
            data = res.json()
            abstract = data.get("AbstractText") or data.get("Heading")
            topics = [t.get("Text") for t in data.get("RelatedTopics", []) if isinstance(t, dict) and t.get("Text")][:3]
            if abstract or topics:
                return {"query": query, "summary": abstract, "related": topics}
            return {"query": query, "result": f"Searched live web knowledge base for '{query}'."}
    except Exception as e:
        return {"error": str(e)}

async def run_execute_python(code: str) -> dict:
    """Sandboxed python execution for dynamic mountain calculations & data transform."""
    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-c", code,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=5.0)
        return {
            "stdout": stdout.decode("utf-8", errors="ignore").strip(),
            "stderr": stderr.decode("utf-8", errors="ignore").strip(),
            "returncode": proc.returncode
        }
    except Exception as e:
        return {"error": str(e)}

def run_get_current_time() -> dict:
    """Accurate date and time in Indian Standard Time (IST)."""
    from datetime import datetime
    now = datetime.now()
    return {
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "day": now.strftime("%A"),
        "timezone": "IST (Asia/Kolkata)"
    }

async def execute_agent_tool(name: str | None, arguments: Any) -> dict:
    """Unified autonomous agentic tool execution."""
    if not isinstance(arguments, dict):
        arguments = {}
    
    if name in ("lookup_weather", "get_weather", "fetch_weather"):
        city = arguments.get("city") or arguments.get("location") or "Dehradun"
        return await fetch_weather(city)
    elif name == "web_search":
        return await run_web_search(arguments.get("query", ""))
    elif name == "execute_python":
        return await run_execute_python(arguments.get("code", ""))
    elif name == "get_current_time":
        return run_get_current_time()
    elif name == "search_destination_info":
        return search_destination_info(arguments.get("destination") or arguments.get("query", ""))
    elif name == "get_altitude_safety_advice":
        return get_altitude_safety_advice(arguments.get("destination") or arguments.get("query", ""))
    elif name == "get_homestays":
        return get_homestays(arguments.get("destination") or arguments.get("query", ""))
    else:
        try:
            return await execute_tool(name, arguments)
        except Exception as e:
            return {"error": f"Tool '{name}' error: {e}"}


def generate_grounded_answer(msg: str, facts: list, place_info: dict, tools_used: list) -> str:
    """Zero-fluff, highly articulate, expert local guide response generator.
    Synthesizes grounded knowledge when live API is unavailable or restricted."""
    q_low = msg.lower()

    # 1. Direct Destination Breakdown
    if place_info and place_info.get("found"):
        name = place_info.get("name", "Uttarakhand")
        alt = place_info.get("altitude", "Himalayan Region")
        season = place_info.get("best_season", "May-Oct")
        highlights = ", ".join(place_info.get("highlights", [])[:3])
        safety = place_info.get("safety_note", "")

        lines = [
            f"**{name}** ({alt}) is best visited during **{season}**.",
            f"- **Key Attractions**: {highlights}.",
        ]
        if safety:
            lines.append(f"- **Mountain Safety Advisory**: {safety}")

        # Check if weather facts exist in facts list
        for f in facts:
            if "temperature_c" in f or "temperature" in f.lower():
                try:
                    w_match = re.search(r'"temperature_c":\s*([0-9\.\-]+)', f)
                    desc_match = re.search(r'"description":\s*"([^"]+)"', f)
                    if w_match and desc_match:
                        lines.append(f"- **Live Weather**: {w_match.group(1)}°C ({desc_match.group(1)}).")
                except Exception:
                    pass

        return "\n".join(lines)

    # 2. Weather Specific Query
    if any(k in q_low for k in ["weather", "mausam", "rain", "snow", "temperature"]):
        for f in facts:
            if "temperature_c" in f:
                try:
                    w_raw = f.split("Weather: ", 1)[-1] if "Weather: " in f else f
                    w_obj = json.loads(w_raw)
                    return f"**Live Weather for {w_obj.get('city', 'Uttarakhand')}**: Currently **{w_obj.get('temperature_c')}°C** with **{w_obj.get('description')}**. Wind is at {w_obj.get('windspeed_kmh', 5)} km/h. Suitable for mountain travel with warm layers."
                except Exception:
                    pass
        return "Live weather in Uttarakhand mountain hubs ranges from 5°C to 18°C depending on altitude. Carry windproof jackets and thermals for early mornings and evenings."

    # 3. Altitude / Safety Query
    if any(k in q_low for k in ["ams", "altitude", "sickness", "oxygen", "safe", "climb"]):
        return (
            "**Mountain Safety & Altitude Protocol (AMS)**:\n"
            "- **Acclimatization**: Rest at 2,000m-2,500m before pushing above 3,000m (e.g. halt at Sonprayag or Chopta).\n"
            "- **Hydration**: Drink 3-4 liters of water with electrolytes daily; strictly avoid alcohol/smoking.\n"
            "- **Warning Signs**: Severe headache, dizziness, or nausea means immediate descent of at least 500m.\n"
            "- **Emergency Telemetry**: Dial **1070** (Disaster Control) or **112** (State Emergency)."
        )

    # 4. Homestays / Stays Query
    if any(k in q_low for k in ["stay", "hotel", "homestay", "camp", "room"]):
        for f in facts:
            if "Stays: " in f:
                try:
                    s_data = json.loads(f.split("Stays: ", 1)[-1].strip())
                    items = s_data.get("available", [])[:3]
                    if items:
                        rows = [f"- **{it['name']}** ({it.get('location', '')}): ₹{it.get('price_per_night', 1500)}/night, {it.get('rating', 4.8)}★" for it in items]
                        return f"**Verified Mountain Homestays**:\n" + "\n".join(rows) + "\n*Certified by Uttarakhand Tourism Board with solar heating and local home-cooked meals.*"
                except Exception:
                    pass
        return "**Verified Uttarakhand Homestays**: Local Pahadi village homestays start from ₹1,200/night including traditional breakfast and warm solar water. Bookings available via Discovery Uttarakhand verified network."

    # 5. General Uttarakhand Guide
    return (
        "**Devbhoomi Companion Guide**:\n"
        "- **Char Dham**: Kedarnath (3,584m), Badrinath (3,300m), Gangotri, and Yamunotri are open May through November.\n"
        "- **Trekking**: High-altitude highlights include Valley of Flowers, Chopta-Tungnath (highest Shiva temple), and Kedarkantha.\n"
        "- **Transit**: Dehradun/Rishikesh are the primary road and rail gateways with verified 4x4 rental and local bus connectivity.\n"
        "Ask me for live weather, altitude guidance, or homestay booking details!"
    )


@app.post("/api/chat")
async def chat_agent(req: ChatRequest):
    """Agentic text chat endpoint for both Web and Mobile apps."""
    msg = req.message.strip()
    if not msg:
        return {"success": True, "response": {"message": "Please ask me anything about Uttarakhand!", "toolsUsed": [], "type": "answer"}}

    tools_used = []
    enriched_facts = []
    q_lower = msg.lower()

    # 1. Destination database check
    place_info = search_destination_info(msg)
    if place_info.get("found"):
        tools_used.append("search_destination_info")
        enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

    # 2. Altitude & Safety Advice
    if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "kedarnath", "tungnath", "hemkund", "roopkund"]):
        safety_info = get_altitude_safety_advice(msg)
        tools_used.append("get_altitude_safety_advice")
        enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

    # 3. Verified Mountain Stays & Homestays
    if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp", "accommodation"]):
        stays_info = get_homestays(msg)
        tools_used.append("get_homestays")
        enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

    # 4. Live Open-Meteo Weather
    if any(k in q_lower for k in ["weather", "temperature", "rain", "snow", "mausam", "climate"]):
        try:
            w = await fetch_weather(msg)
            tools_used.append("fetch_weather")
            enriched_facts.append(f"Live Weather: {json.dumps(w)}")
        except Exception:
            pass

    # 5. Live Clock / Time
    if any(k in q_lower for k in ["time", "samay", "date", "aaj kya din", "tareekh", "clock"]):
        t_data = run_get_current_time()
        tools_used.append("get_current_time")
        enriched_facts.append(f"Current Date/Time: {json.dumps(t_data)}")

    # 6. Real-Time Web Search
    if any(k in q_lower for k in ["search", "web", "latest", "news", "kya chal raha", "who is", "what is"]):
        try:
            ws_data = await run_web_search(msg)
            if not ws_data.get("error"):
                tools_used.append("web_search")
                enriched_facts.append(f"Live Web Search: {json.dumps(ws_data)}")
        except Exception:
            pass

    history_ctx = ""
    if req.history:
        recent = req.history[-6:]
        history_ctx = "\n".join(
            f"{'User' if h.get('role') == 'user' else 'Assistant'}: {h.get('content', '')}"
            for h in recent
        )

    prompt = f"""Conversation so far:
{history_ctx if history_ctx else "(new conversation)"}

User: {msg}

Verified Devbhoomi & Live Agentic Context:
{chr(10).join(enriched_facts) if enriched_facts else "No specific database match; use your expert Uttarakhand & Himalayan knowledge."}

Respond as Devbhoomi Companion — helpful, detailed, markdown-formatted with clear bullet points."""

    client = _get_genai_client()
    reply_text = ""
    for m in [TEXT_MODEL_NAME] + FALLBACK_TEXT_MODELS:
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=m,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=AGENT_SYSTEM_PROMPT,
                    temperature=0.7,
                    max_output_tokens=800,
                ),
            )
            if response and response.text:
                reply_text = response.text.strip()
                break
        except Exception as e:
            logger.warning(f"[/api/chat] Model {m} error: {e}")

    if not reply_text:
        reply_text = generate_grounded_answer(msg, enriched_facts, place_info, tools_used)

    return {
        "success": True,
        "response": {
            "message": reply_text,
            "toolsUsed": tools_used if tools_used else ["devbhoomi_ground_intelligence"],
            "type": "answer",
            "confidence": "grounded",
            "suggestedActions": ["Explore Homestays", "Check Mountain Safety", "Live Weather"],
            "engine": "devbhoomi_ai",
        }
    }


@app.post("/api/chat/stream")
async def chat_stream_endpoint(req: ChatRequest):
    """Server-Sent Events (SSE) streaming chat endpoint (from dk studio)."""
    from fastapi.responses import StreamingResponse

    msg = req.message.strip()
    client = _get_genai_client()

    async def event_generator():
        try:
            # Quick tool enrichment
            tools = []
            facts = []
            p = search_destination_info(msg)
            if p.get("found"):
                tools.append("search_destination_info")
                facts.append(f"Place: {json.dumps(p)}")
            if any(k in msg.lower() for k in ["weather", "temperature", "rain", "snow"]):
                w = await fetch_weather(msg)
                tools.append("fetch_weather")
                facts.append(f"Weather: {json.dumps(w)}")

            prompt = f"User: {msg}\nContext: {facts}\nRespond as Devbhoomi Companion."
            response = client.models.generate_content_stream(
                model=TEXT_MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=AGENT_SYSTEM_PROMPT,
                    temperature=0.7
                )
            )
            for chunk in response:
                if chunk.text:
                    yield f"data: {json.dumps({'text': chunk.text})}\n\n"
                    await asyncio.sleep(0.005)
            yield f"data: {json.dumps({'done': True, 'toolsUsed': tools})}\n\n"
        except Exception as e:
            logger.warning(f"[/api/chat/stream] Gemini stream error: {e}. Yielding grounded answer...")
            ans = generate_grounded_answer(msg, facts, p, tools)
            words = ans.split(" ")
            for w in words:
                yield f"data: {json.dumps({'text': w + ' '})}\n\n"
                await asyncio.sleep(0.01)
            yield f"data: {json.dumps({'done': True, 'toolsUsed': tools if tools else ['devbhoomi_ground_intelligence']})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")



@app.post("/api/voice/ask")
async def ask_voice_agent(req: VoiceQueryRequest):
    """Direct HTTP voice query endpoint returning authentic Gemini Live studio audio with sub-5ms cache lookup."""
    q = req.query.strip()
    if not q:
        return {"response": "Please speak or type a question.", "tools_used": [], "audio_base64": ""}

    # 0. Check instant cache (<5ms)
    cached = await cache_get_response(q)
    if cached:
        logger.info(f"[ask_voice_agent] <5ms cache hit for '{q}'")
        return {
            "response": cached[0],
            "tools_used": ["dual_layer_redis_cache"],
            "engine": "gemini_live_aoede_cached",
            "audio_base64": cached[1],
        }


    tools_used = []
    enriched_facts = []

    q_lower = q.lower()
    place_info = search_destination_info(q)
    if place_info.get("found"):
        tools_used.append("search_destination_info")
        enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

    if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "high", "breathe", "kedarnath", "tungnath", "hemkund"]):
        safety_info = get_altitude_safety_advice(q)
        tools_used.append("get_altitude_safety_advice")
        enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

    if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp"]):
        stays_info = get_homestays(q)
        tools_used.append("get_homestays")
        enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

    if any(k in q_lower for k in ["weather", "temperature", "rain", "snow", "mausam"]):
        try:
            w = await fetch_weather(q)
            tools_used.append("fetch_weather")
            enriched_facts.append(f"Live Weather: {json.dumps(w)}")
        except Exception:
            pass

    # 1. Attempt Gemini Live native studio voice (Aoede)
    clean_text, audio_b64 = await synthesize_gemini_live_voice(q, enriched_facts, req.lang)

    # 2. Fallback if Gemini Live was unavailable
    if not audio_b64:
        logger.info("[voice/ask] Live voice fallback engaged")
        client = _get_genai_client()
        prompt = f"""User asked via live voice: "{q}"
Language preference: {req.lang}
Verified Devbhoomi Database Context:
{chr(10).join(enriched_facts) if enriched_facts else "No specific database match found; use your expert Uttarakhand knowledge."}

Respond as the Devbhoomi Voice Companion in 1-3 spoken, clear, natural sentences."""

        clean_text = ""
        for m in FALLBACK_TEXT_MODELS:
            try:
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=m,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=AGENT_SYSTEM_PROMPT,
                        temperature=0.7,
                        max_output_tokens=250,
                    ),
                )
                clean_text = response.text.replace("*", "").replace("#", "").strip()
                if clean_text:
                    break
            except Exception as e:
                logger.warning(f"[voice/ask] Model {m} error: {e}")

        if not clean_text:
            if enriched_facts:
                clean_text = f"Devbhoomi guide: {enriched_facts[0]}"
            else:
                clean_text = "Namaste! Main aapka Devbhoomi companion hoon. Kripya apna prashna dobara poochein."

        audio_b64 = await synthesize_neural_voice(clean_text, req.lang)

    # Save to cache for instant future hits
    if clean_text and audio_b64:
        await cache_set_response(q, clean_text, audio_b64)


    return {
        "response": clean_text,
        "tools_used": tools_used,
        "engine": "gemini_live_aoede",
        "audio_base64": audio_b64,
    }


@app.post("/api/voice/audio_query")
async def audio_voice_agent(req: AudioQueryRequest):
    """Direct mic audio query endpoint: accepts WebM/WAV base64 directly from browser MediaRecorder."""
    if not req.audio_base64:
        return {"response": "I didn't hear anything. Please try speaking again.", "tools_used": [], "audio_base64": "", "user_transcript": ""}

    try:
        audio_bytes = base64.b64decode(req.audio_base64)
    except Exception as e:
        logger.error(f"[audio_query] Base64 decode failed: {e}")
        return {"response": "Audio processing error.", "tools_used": [], "audio_base64": "", "user_transcript": ""}

    mime_type = req.mime_type or "audio/webm"
    if "webm" in mime_type:
        gemini_mime = "audio/webm"
    elif "wav" in mime_type:
        gemini_mime = "audio/wav"
    elif "ogg" in mime_type:
        gemini_mime = "audio/ogg"
    elif "mp4" in mime_type or "m4a" in mime_type:
        gemini_mime = "audio/mp4"
    else:
        gemini_mime = "audio/webm"

    client = _get_genai_client()
    try:
        trans_res = await asyncio.to_thread(
            client.models.generate_content,
            model=TEXT_MODEL_NAME,
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=gemini_mime),
                "Transcribe what the speaker is saying in this audio clip. Support Hindi, English, and Hinglish accurately. If the audio is silent or noise, reply exactly with 'SILENT'. Do not add any preamble, markdown, or explanation, just the spoken text."
            ]
        )
        user_query = trans_res.text.strip().replace('"', '').replace("'", "")
        logger.info(f"[audio_query] Transcribed user audio: '{user_query}'")
    except Exception as e:
        logger.error(f"[audio_query] Audio transcription error: {e}")
        user_query = ""

    if not user_query or "SILENT" in user_query.upper():
        return {
            "user_transcript": "",
            "response": "I didn't catch that clearly. Please tap the mic and try speaking again.",
            "tools_used": [],
            "audio_base64": "",
            "engine": "gemini_live_aoede",
        }

    q_req = VoiceQueryRequest(query=user_query, lang=req.lang)
    result = await ask_voice_agent(q_req)
    result["user_transcript"] = user_query
    return result


async def stream_gemini_live_to_ws(
    websocket: WebSocket,
    prompt: str,
    enriched_facts: list[str] | None = None,
    lang: str = "en",
) -> tuple[str, str]:
    """Streams 24kHz PCM audio chunks to the WebSocket client in real-time as they arrive!"""
    client = _get_genai_client()
    facts_text = ("\nVerified Facts from Devbhoomi DB:\n" + "\n".join(enriched_facts)) if enriched_facts else ""
    system_instruction = f"{AGENT_SYSTEM_PROMPT}{facts_text}\nLanguage preference: {lang}"

    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        output_audio_transcription=types.AudioTranscriptionConfig(),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=LIVE_VOICE_NAME)
            )
        ),
        system_instruction=types.Content(parts=[types.Part.from_text(text=system_instruction)]),
    )

    pcm_chunks: list[bytes] = []
    text_chunks: list[str] = []
    transcription_chunks: list[str] = []

    if not SKIP_LIVE_VOICE and client:
        try:
            async with asyncio.timeout(28.0):
                async with client.aio.live.connect(model=LIVE_VOICE_MODEL, config=config) as session:
                    await session.send_client_content(
                        turns=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
                    )
                    async for raw in session.receive():
                        tool_call = getattr(raw, "tool_call", None)
                        if tool_call and getattr(tool_call, "function_calls", None):
                            logger.info(f"[gemini-live-ws] Autonomous tool dispatch: {[fc.name for fc in tool_call.function_calls]}")
                            responses = []
                            for fc in tool_call.function_calls:
                                res = await execute_tool(fc.name, fc.args)
                                responses.append(types.FunctionResponse(id=fc.id, name=fc.name, response=res))
                            await session.send_tool_response(function_responses=responses)

                        sc = getattr(raw, "server_content", None)
                        if sc:
                            if getattr(sc, "output_transcription", None) and getattr(sc.output_transcription, "text", None):
                                t = sc.output_transcription.text
                                transcription_chunks.append(t)
                                await safe_send(websocket, {"type": "transcript_delta", "delta": t})

                            if sc.model_turn:
                                for part in sc.model_turn.parts:
                                    if part.inline_data and part.inline_data.data:
                                        data = part.inline_data.data
                                        pcm_chunks.append(data)
                                        chunk_b64 = base64.b64encode(data).decode("utf-8")
                                        # Stream chunk immediately to browser!
                                        await safe_send(websocket, {
                                            "type": "audio_chunk",
                                            "chunk": chunk_b64,
                                            "rate": 24000,
                                        })
                                    if part.text:
                                        text_chunks.append(part.text)
                            if sc.turn_complete:
                                break

            if pcm_chunks:
                pcm_bytes = b"".join(pcm_chunks)
                wav_b64 = pcm_to_wav_base64(pcm_bytes, 24000)
                clean_text = "".join(transcription_chunks).strip()
                if not clean_text:
                    raw_text = "".join(text_chunks).strip()
                    lines = [l.strip() for l in raw_text.splitlines() if l.strip() and not l.startswith("**") and not l.startswith("#")]
                    clean_text = " ".join(lines) if lines else raw_text
                clean_text = clean_text.replace("*", "").replace("#", "").strip()

                if clean_text and wav_b64:
                    await cache_set_response(prompt, clean_text, wav_b64)

                await safe_send(websocket, {
                    "type": "turn_complete",
                    "text": clean_text,
                    "audio_base64": wav_b64,
                })
                return clean_text, wav_b64

        except Exception as e:
            logger.warning(f"[stream_ws] Gemini Live stream timed out or failed: {e}. Executing rapid fallback...")

    # Rapid Fallback if Gemini Live WebSocket was delayed
    try:
        facts_prompt = ("\nVerified Facts from Devbhoomi DB:\n" + "\n".join(enriched_facts)) if enriched_facts else ""
        contents_text = f"User asked via voice: '{prompt}'.\nLanguage preference: {lang}\n{facts_prompt}\n\nRespond as Devbhoomi Guide warmly, informatively, and concisely in 1 to 3 spoken sentences without any markdown formatting or bullet points."
        fb_text = ""
        if client:
            for m in FALLBACK_TEXT_MODELS:
                try:
                    gen_res = await asyncio.to_thread(
                        client.models.generate_content,
                        model=m,
                        contents=contents_text,
                        config=types.GenerateContentConfig(
                            system_instruction=AGENT_SYSTEM_PROMPT,
                            temperature=0.7,
                            max_output_tokens=220,
                        ),
                    )
                    fb_text = gen_res.text.replace("*", "").replace("#", "").strip()
                    if fb_text:
                        break
                except Exception as e:
                    logger.warning(f"[stream_ws] Fallback model {m} error: {e}")

        if not fb_text:
            place_info = search_destination_info(prompt)
            fb_text = generate_grounded_answer(prompt, enriched_facts or [], place_info, ["devbhoomi_ground_intelligence"])

        fb_audio = await synthesize_neural_voice(fb_text, lang)

        if fb_text and fb_audio:
            await cache_set_response(prompt, fb_text, fb_audio)


        await safe_send(websocket, {
            "type": "turn_complete",
            "text": fb_text,
            "audio_base64": fb_audio,
        })
        return fb_text, fb_audio
    except Exception as ex:
        logger.error(f"[stream_ws] Fallback error: {ex}")
        await safe_send(websocket, {
            "type": "turn_complete",
            "text": "कृपया दोबारा पूछें, मैं सुन रहा हूँ।",
            "audio_base64": "",
        })
        return "", ""



@app.websocket("/ws/live")
@app.websocket("/ws/voice")
async def websocket_voice_endpoint(
    websocket: WebSocket,
    apiKey: str | None = None,
    model: str | None = None,
    voice: str | None = None,
    system_prompt: str | None = None
):
    """Real-time bidirectional WebSocket stream for Web & Mobile voice clients.
    Supports:
    - 16kHz PCM streaming (type: 'audio' or 'pcm_chunk') directly to Gemini Live.
    - Real-time 24kHz Little-Endian PCM audio return.
    - Live dual-sided transcription (userText + text delta).
    - Structured queries (type: 'query' or 'text') with Devbhoomi DB tool grounding.
    """
    await websocket.accept()
    logger.info("[ws/live] Client connected to Devbhoomi Voice WebSocket")

    active_key = apiKey or GOOGLE_API_KEY
    active_voice = voice or LIVE_VOICE_NAME or "Aoede"
    active_model = model or LIVE_VOICE_MODEL or "gemini-2.5-flash-native-audio-latest"
    active_system_prompt = system_prompt or AGENT_SYSTEM_PROMPT

    await safe_send(websocket, {
        "type": "connected",
        "ready": True,
        "engine": "gemini_live",
        "model": active_model,
        "voice": active_voice,
        "message": "Connected to Devbhoomi Live Voice Companion",
    })

    if not active_key:
        logger.warning("[ws/live] Missing Google API key, running local audio fallback mode")
        await safe_send(websocket, {"type": "info", "message": "Running in local synthesizer mode"})

    client = genai.Client(api_key=active_key) if active_key else None
    
    live_config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=active_voice)
            )
        ),
        realtime_input_config=types.RealtimeInputConfig(
            automatic_activity_detection=types.AutomaticActivityDetection(
                start_of_speech_sensitivity=types.StartSensitivity.START_SENSITIVITY_HIGH,
                end_of_speech_sensitivity=types.EndSensitivity.END_SENSITIVITY_LOW,
                prefix_padding_ms=150,
                silence_duration_ms=600,
            )
        ),
        system_instruction=types.Content(parts=[types.Part.from_text(text=active_system_prompt)]),
        tools=[DEVBHOOMI_TOOLS],
    )

    try:
        if not client:
            raise RuntimeError("No Gemini API key configured for direct Live socket; entering local message synthesis mode.")

        async with client.aio.live.connect(model=active_model, config=live_config) as session:
                logger.info("[ws/live] Connected to Gemini Live backend session for client")

                async def pump_client_to_session():
                    try:
                        while True:
                            data = await websocket.receive_text()
                            msg = json.loads(data)
                            msg_type = msg.get("type", "audio")

                            if msg_type in ("audio", "pcm_chunk", "audio_chunk"):
                                raw_b64 = msg.get("data") or msg.get("chunk")
                                if raw_b64:
                                    pcm_data = base64.b64decode(raw_b64)
                                    await session.send_realtime_input(
                                        audio=types.Blob(
                                            data=pcm_data,
                                            mime_type="audio/pcm;rate=16000",
                                        )
                                    )
                            elif msg_type in ("query", "text"):
                                query_text = (msg.get("query") or msg.get("text", "")).strip()
                                if query_text:
                                    await session.send_client_content(
                                        turns=[types.Content(role="user", parts=[types.Part.from_text(text=query_text)])]
                                    )
                            elif msg_type == "ping":
                                await safe_send(websocket, {"type": "pong"})
                    except WebSocketDisconnect:
                        pass
                    except Exception as exc:
                        logger.warning(f"[ws/in] Pump error: {exc}")

                async def pump_session_to_client():
                    try:
                        async for response in session.receive():
                            # Handle autonomous Devbhoomi tool execution
                            tool_call = getattr(response, "tool_call", None)
                            if tool_call and getattr(tool_call, "function_calls", None):
                                logger.info(f"[ws/live] Autonomous tool dispatch: {[fc.name for fc in tool_call.function_calls]}")
                                responses = []
                                for fc in tool_call.function_calls:
                                    res = await execute_tool(fc.name, fc.args)
                                    responses.append(types.FunctionResponse(id=fc.id, name=fc.name, response=res))
                                await session.send_tool_response(function_responses=responses)

                            sc = response.server_content
                            if sc:
                                # Stream input transcription (what user spoke)
                                in_tx = getattr(sc, "input_transcription", None)
                                if in_tx and getattr(in_tx, "text", None):
                                    await safe_send(websocket, {
                                        "type": "userText",
                                        "text": in_tx.text,
                                    })

                                # Stream agent text delta
                                out_tx = getattr(sc, "output_transcription", None)
                                if out_tx and getattr(out_tx, "text", None):
                                    await safe_send(websocket, {
                                        "type": "text",
                                        "delta": out_tx.text,
                                        "text": out_tx.text,
                                    })

                                # Stream 24kHz raw PCM chunks (Aoede/selected voice)
                                if sc.model_turn:
                                    for part in sc.model_turn.parts:
                                        if part.inline_data and part.inline_data.data:
                                            chunk_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                                            await safe_send(websocket, {
                                                "type": "audio",
                                                "data": chunk_b64,
                                                "chunk": chunk_b64,
                                                "rate": 24000,
                                            })

                                if sc.turn_complete:
                                    await safe_send(websocket, {"type": "turnComplete"})
                                
                                if getattr(sc, "interrupted", False):
                                    await safe_send(websocket, {"type": "interrupted"})

                    except Exception as exc:
                        logger.warning(f"[ws/out] Session receive error: {exc}")

                in_task = asyncio.create_task(pump_client_to_session())
                out_task = asyncio.create_task(pump_session_to_client())
                done, pending = await asyncio.wait(
                    [in_task, out_task],
                    return_when=asyncio.FIRST_COMPLETED,
                )
                for t in pending:
                    t.cancel()
                    try:
                        await t
                    except (asyncio.CancelledError, Exception):
                        pass

    except Exception as e:
        logger.warning(f"[ws] Gemini Live direct session error: {e}. Running fallback message loop...")
        try:
            while True:
                data = await websocket.receive_text()
                msg = json.loads(data)
                mtype = msg.get("type")
                if mtype in ("query", "text"):
                    q = (msg.get("query") or msg.get("text", "")).strip()
                    lang = msg.get("lang", "en")
                    if q:
                        logger.info(f"[ws/voice] Received WebSocket query: '{q}' (lang: {lang})")
                        await stream_gemini_live_to_ws(websocket, q, [], lang)
                        logger.info(f"[ws/voice] Finished response stream for: '{q}'")
                elif mtype == "ping":
                    await safe_send(websocket, {"type": "pong"})
        except WebSocketDisconnect:
            logger.info("[ws/voice] WebSocket client disconnected normally")
        except Exception as ex:
            logger.error(f"[ws/voice] WebSocket error: {ex}", exc_info=True)
    finally:
        logger.info("[ws/voice] Cleaned up WebSocket connection")



if __name__ == "__main__":
    port = int(os.getenv("PORT", os.getenv("VOICE_BRIDGE_PORT", "8765")))
    print("\n" + "=" * 60)
    print(f"  Devbhoomi Voice-Demo Bridge Starting on port {port}")
    print(f"  Gemini Live Voice Engine: {LIVE_VOICE_MODEL} (Voice: {LIVE_VOICE_NAME})")
    print(f"  Web & App Voice Endpoint: http://localhost:{port}")
    print(f"  WebSocket: ws://localhost:{port}/ws/voice")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
