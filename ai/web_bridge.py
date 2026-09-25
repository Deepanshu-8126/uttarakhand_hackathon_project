"""Web & Mobile WebSocket Bridge for Devbhoomi AI Voice Companion.

Exposes a real-time WebSocket and HTTP API on port 8765 so that the Discover
Frontend website and Flutter Mobile App can talk directly to the Devbhoomi
Gemini Live voice companion using the exact studio-quality Aoede native voice.
"""

from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import os
import sys
import wave
from pathlib import Path

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
for _candidate in (_HERE / ".env", _HERE.parent / ".env"):
    if _candidate.exists():
        load_dotenv(_candidate, override=False)
        break

from google import genai
from google.genai import types

from voice_demo.devbhoomi import (
    search_destination_info,
    get_altitude_safety_advice,
    get_homestays,
)
from voice_demo.weather import fetch_weather

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

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
LIVE_VOICE_MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-3.1-flash-live-preview")
LIVE_VOICE_FALLBACK_MODEL = "gemini-2.5-flash-native-audio-latest"
LIVE_VOICE_NAME = os.getenv("GEMINI_VOICE_NAME", "Aoede")
TEXT_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
FALLBACK_TEXT_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
]

_SYSTEM_PROMPT = """You are Devbhoomi Companion, an expert AI voice travel guide and mountain safety companion for Uttarakhand, India (Devbhoomi), powered by Discover. You have comprehensive, accurate knowledge of Uttarakhand: Char Dham shrines, Garhwal and Kumaon valleys, high-altitude treks, altitude sickness (AMS) protocols, weather conditions, and local Pahari culture. Speak naturally in Hindi, English, or friendly Hinglish based on how the user speaks to you. Use authentic ground facts for destinations, mountain safety for altitude, and live weather for mountain towns. Keep answers conversational, warm, concise, and direct (1 to 3 spoken sentences). Do not recite raw markdown, bullet points, asterisks, or emojis in spoken output."""

_CHAT_SYSTEM_PROMPT = """You are Devbhoomi Companion, a premium AI travel & mountain guide for Uttarakhand, India, powered by Discover Uttarakhand.

You have deep, verified knowledge of:
- Char Dham (Kedarnath, Badrinath, Gangotri, Yamunotri), Hemkund Sahib
- High-altitude treks: Valley of Flowers, Kedarkantha, Roopkund, Har Ki Dun, Tungnath, Kuari Pass
- Altitude Sickness (AMS) protocols, acclimatization, and safety
- Live weather, road conditions, and seasonal advisories
- Verified local homestays, camps, and eco-resorts
- Local transport, permits, and budgeting

Instructions:
- Be warm, precise, and genuinely helpful.
- Use markdown formatting (bold, bullets, headers) for structured responses.
- Support Hindi, English, and Hinglish naturally.
- Always prioritize traveler safety for high-altitude destinations.
- When relevant, suggest bookings, weather checks, or route planning.
"""

GREETING_TEXTS = {
    "hi": "नमस्ते! मैं आपका देवभूमि AI वॉइस साथी हूँ। आप मुझसे केदारनाथ, बद्रीनाथ, किसी भी ट्रेक के मौसम या होमस्टे के बारे में पूछ सकते हैं।",
    "en": "Namaste! I am your Devbhoomi AI Voice Companion. Ask me anything about routes, high-altitude treks, mountain weather, or verified homestays across Uttarakhand.",
}

# In-memory greeting audio cache (Base64 WAV)
_GREETING_CACHE: dict[str, str] = {}


def _get_genai_client():
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable is not set")
    return genai.Client(api_key=GOOGLE_API_KEY)


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
    try:
        client = _get_genai_client()
        facts_text = ("\nVerified Facts from Devbhoomi DB:\n" + "\n".join(enriched_facts)) if enriched_facts else ""
        system_instruction = f"{_SYSTEM_PROMPT}{facts_text}\nLanguage preference: {lang}"

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

        async with asyncio.timeout(6.0):
            async with client.aio.live.connect(model=LIVE_VOICE_MODEL, config=config) as session:
                await session.send(input=prompt, end_of_turn=True)
                async for response in session.receive():
                    sc = response.server_content
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
            logger.info(f"[gemini-live] Generated {len(pcm_bytes)} PCM bytes ({len(wav_b64)} b64 chars)")
            return clean_text, wav_b64

    except Exception as e:
        logger.warning(f"[gemini-live] Live voice session timed out or failed: {e}")

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


@app.post("/api/chat")
async def chat_agent(req: ChatRequest):
    """Text chat endpoint for the main AI Copilot Drawer (web & mobile)."""
    msg = req.message.strip()
    if not msg:
        return {"success": True, "response": {"message": "Please ask me anything about Uttarakhand!", "toolsUsed": [], "type": "answer"}}

    tools_used = []
    enriched_facts = []
    q_lower = msg.lower()

    place_info = search_destination_info(msg)
    if place_info.get("found"):
        tools_used.append("search_destination_info")
        enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

    if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "kedarnath", "tungnath", "hemkund", "roopkund"]):
        safety_info = get_altitude_safety_advice(msg)
        tools_used.append("get_altitude_safety_advice")
        enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

    if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp", "accommodation"]):
        stays_info = get_homestays(msg)
        tools_used.append("get_homestays")
        enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

    if any(k in q_lower for k in ["weather", "temperature", "rain", "snow", "mausam", "climate"]):
        try:
            w = await fetch_weather(msg)
            tools_used.append("fetch_weather")
            enriched_facts.append(f"Live Weather: {json.dumps(w)}")
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

Verified Devbhoomi Database Context:
{chr(10).join(enriched_facts) if enriched_facts else "No specific database match; use your expert Uttarakhand knowledge."}

Respond as Devbhoomi Companion — helpful, detailed, markdown-formatted."""

    client = _get_genai_client()
    response = await asyncio.to_thread(
        client.models.generate_content,
        model=TEXT_MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=_CHAT_SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=800,
        ),
    )

    return {
        "success": True,
        "response": {
            "message": response.text.strip(),
            "toolsUsed": tools_used,
            "type": "answer",
            "confidence": "grounded",
            "suggestedActions": ["Explore Homestays", "Check Mountain Safety", "Live Weather"],
            "engine": "devbhoomi_ai",
        }
    }


@app.post("/api/voice/ask")
async def ask_voice_agent(req: VoiceQueryRequest):
    """Direct HTTP voice query endpoint returning authentic Gemini Live studio audio."""
    q = req.query.strip()
    if not q:
        return {"response": "Please speak or type a question.", "tools_used": [], "audio_base64": ""}

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
                        system_instruction=_SYSTEM_PROMPT,
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
    system_instruction = f"{_SYSTEM_PROMPT}{facts_text}\nLanguage preference: {lang}"

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

    try:
        async with asyncio.timeout(5.5):
            async with client.aio.live.connect(model=LIVE_VOICE_MODEL, config=config) as session:
                await session.send(input=prompt, end_of_turn=True)
                async for response in session.receive():
                    sc = response.server_content
                    if sc:
                        if getattr(sc, "output_transcription", None) and getattr(sc.output_transcription, "text", None):
                            t = sc.output_transcription.text
                            transcription_chunks.append(t)
                            await websocket.send_json({"type": "transcript_delta", "delta": t})

                        if sc.model_turn:
                            for part in sc.model_turn.parts:
                                if part.inline_data and part.inline_data.data:
                                    data = part.inline_data.data
                                    pcm_chunks.append(data)
                                    chunk_b64 = base64.b64encode(data).decode("utf-8")
                                    # Stream chunk immediately to browser!
                                    await websocket.send_json({
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

            await websocket.send_json({
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
        for m in FALLBACK_TEXT_MODELS:
            try:
                gen_res = await asyncio.to_thread(
                    client.models.generate_content,
                    model=m,
                    contents=contents_text,
                    config=types.GenerateContentConfig(
                        system_instruction=_SYSTEM_PROMPT,
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
            fb_text = "Namaste! Main aapka Devbhoomi voice companion hoon. Kripya apna prashna dobara poochein."

        fb_audio = await synthesize_neural_voice(fb_text, lang)

        await websocket.send_json({
            "type": "turn_complete",
            "text": fb_text,
            "audio_base64": fb_audio,
        })
        return fb_text, fb_audio
    except Exception as ex:
        logger.error(f"[stream_ws] Fallback error: {ex}")
        await websocket.send_json({
            "type": "turn_complete",
            "text": "कृपया दोबारा पूछें, मैं सुन रहा हूँ।",
            "audio_base64": "",
        })
        return "", ""



@app.websocket("/ws/voice")
async def websocket_voice_endpoint(websocket: WebSocket):
    """Real-time bidirectional WebSocket stream for Web & Mobile voice clients."""
    await websocket.accept()
    logger.info("[ws] Client connected to Devbhoomi Voice-Demo WebSocket")

    # Send pre-cached Gemini Live greeting
    greeting_text = GREETING_TEXTS["en"]
    greeting_audio = _GREETING_CACHE.get("en", "")
    if not greeting_audio:
        _, greeting_audio = await synthesize_gemini_live_voice(f"Say warmly: {greeting_text}", lang="en")

    await websocket.send_json({
        "type": "ready",
        "engine": "gemini_live_aoede",
        "greeting": greeting_text,
        "audio_base64": greeting_audio,
    })

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type", "query")

            if msg_type in ("query", "text"):
                query_text = (msg.get("query") or msg.get("text", "")).strip()
                lang = msg.get("lang", "en")

                await websocket.send_json({"type": "status", "status": "processing"})

                # Ground with Devbhoomi database tools
                enriched_facts = []
                q_lower = query_text.lower()
                place_info = search_destination_info(query_text)
                if place_info.get("found"):
                    enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

                if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "high", "breathe", "kedarnath", "tungnath", "hemkund"]):
                    safety_info = get_altitude_safety_advice(query_text)
                    enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

                if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp"]):
                    stays_info = get_homestays(query_text)
                    enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

                if any(k in q_lower for k in ["weather", "temperature", "rain", "snow", "mausam"]):
                    try:
                        w = await fetch_weather(query_text)
                        enriched_facts.append(f"Live Weather: {json.dumps(w)}")
                    except Exception:
                        pass

                # Stream audio chunks directly!
                await stream_gemini_live_to_ws(websocket, query_text, enriched_facts, lang)
                await websocket.send_json({"type": "status", "status": "idle"})

            elif msg_type == "audio":
                audio_b64 = msg.get("audio_base64", "")
                mime_type = msg.get("mime_type", "audio/webm")
                lang = msg.get("lang", "en")

                if audio_b64:
                    await websocket.send_json({"type": "status", "status": "processing"})
                    audio_bytes = base64.b64decode(audio_b64)
                    gemini_mime = "audio/webm" if "webm" in mime_type else "audio/wav"

                    client = _get_genai_client()
                    try:
                        trans_res = await asyncio.to_thread(
                            client.models.generate_content,
                            model=TEXT_MODEL_NAME,
                            contents=[
                                types.Part.from_bytes(data=audio_bytes, mime_type=gemini_mime),
                                "Transcribe what the speaker is saying in this audio clip. Support Hindi, English, and Hinglish. If silent or unintelligible noise, reply exactly with 'SILENT'. Return only spoken text."
                            ]
                        )
                        user_query = trans_res.text.strip().replace('"', '').replace("'", "")
                    except Exception as e:
                        logger.error(f"[ws/audio] Transcribe error: {e}")
                        user_query = ""

                    if user_query and "SILENT" not in user_query.upper():
                        # Immediately send user transcript so UI shows it in 300ms!
                        await websocket.send_json({"type": "user_transcript", "text": user_query})

                        # Ground with Devbhoomi DB
                        enriched_facts = []
                        q_lower = user_query.lower()
                        place_info = search_destination_info(user_query)
                        if place_info.get("found"):
                            enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

                        if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "high", "breathe", "kedarnath", "tungnath", "hemkund"]):
                            safety_info = get_altitude_safety_advice(user_query)
                            enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

                        if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp"]):
                            stays_info = get_homestays(user_query)
                            enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

                        if any(k in q_lower for k in ["weather", "temperature", "rain", "snow", "mausam"]):
                            try:
                                w = await fetch_weather(user_query)
                                enriched_facts.append(f"Live Weather: {json.dumps(w)}")
                            except Exception:
                                pass

                        # Stream real-time Gemini Live audio chunks to WebSocket!
                        await stream_gemini_live_to_ws(websocket, user_query, enriched_facts, lang)
                    else:
                        await websocket.send_json({
                            "type": "turn_complete",
                            "text": "I didn't catch that clearly. Please tap the orb and speak again.",
                            "audio_base64": "",
                        })

                    await websocket.send_json({"type": "status", "status": "idle"})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("[ws] Client disconnected")
    except Exception as e:
        logger.error(f"[ws] Error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.getenv("VOICE_BRIDGE_PORT", "8765"))
    print("\n" + "=" * 60)
    print(f"  Devbhoomi Voice-Demo Bridge Starting on port {port}")
    print(f"  Gemini Live Voice Engine: {LIVE_VOICE_MODEL} (Voice: {LIVE_VOICE_NAME})")
    print(f"  Web & App Voice Endpoint: http://localhost:{port}")
    print(f"  WebSocket: ws://localhost:{port}/ws/voice")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
