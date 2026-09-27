"""Gemini Live voice agent over the official SDK's raw WebSocket session.

This backend is parallel to ``voice_demo.openai``: it uses no agent framework.
The application directly drives ``client.aio.live.connect(...)``, streams PCM
microphone frames, consumes provider messages, plays audio, handles barge-in,
and dispatches tools. ``langsmith.integrations.gemini_live.wrap_gemini_live``
wraps the session at the event-stream boundary and owns all trace decisions.

The agent is frontend-agnostic. Its local console, mic, and speaker are injected
through ``AudioInput`` / ``AudioOutput`` / ``StatusUI`` protocols.
"""

from __future__ import annotations

import asyncio
import os
import sys
import uuid

from google import genai
from google.genai import types
from langsmith.integrations.gemini_live import wrap_gemini_live

from .. import tracing
from ..audio import AudioInput, AudioOutput, resample_pcm16
from ..console import NullUI, StatusUI, frame_level
from .events import LiveMessage, append_transcript
from .tools import execute_tool

SYSTEM_PROMPT = """You are Devbhoomi Companion, the expert AI voice travel guide, mountain safety expert, and local Pahadi friend for Uttarakhand, India, powered by Discover Uttarakhand.
You have authentic, street-smart knowledge of Garhwal & Kumaon tourism, Char Dham pilgrimages, hidden gems, high-altitude treks, weather, transport routes, and backpacker budgeting.

Key Spoken Spoken Voice Persona & Rules:
1. WARM, ENCOURAGING & STREET-SMART: Speak naturally in friendly Hindi, English, or conversational Hinglish matching the user. Always be supportive, enthusiastic, and practical.
2. LOW BUDGET & BACKPACKER PROBLEM SOLVING: NEVER say a trip or trek is impossible for low budgets (e.g. ₹3,000 - ₹5,000 for Kedarkantha, Chopta, or Nainital). Always provide the smart DIY backpacker roadmap:
   - Public state transport (Kathgodam-Dehradun train general/sleeper ~₹140-₹280, early morning 5:30 AM UTC ordinary bus from Dehradun Hill Bus Stand to Sankri ~₹380, or shared Maxx ~₹500).
   - Budget stays (Sankri/Mori village homestay dorm beds and tent rentals at ₹400-₹600/night, GMVN dorms, or dharamshalas).
   - Food (Local village dhabas for hot Dal-Chawal and Maggi at ₹80-₹100/meal).
   - Local gear rental (Microspikes & gaiters available at Sankri base for ₹150-₹200).
   Show how 4-5 days can comfortably fit inside ₹4,500-₹5,000!
3. CONCISE & HIGH IMPACT: Keep spoken responses concise (2 to 4 spoken sentences). No raw markdown, asterisks, hashtags, bullet points, or emojis in spoken speech.
4. Call tools (explore_uttarakhand_place, lookup_weather, check_mountain_safety, find_homestays) whenever specific lookups add value."""


DEFAULT_MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-3.1-flash-live-preview")
SEND_SAMPLE_RATE = 16_000
RECV_SAMPLE_RATE = 24_000

DEVBHOOMI_TOOLS = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="lookup_weather",
            description="Get the current weather for a single city or mountain destination.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City or destination name, such as Dehradun, Rishikesh, or Chopta.",
                    }
                },
                "required": ["city"],
                "additionalProperties": False,
            },
        ),
        types.FunctionDeclaration(
            name="explore_uttarakhand_place",
            description="Look up altitude, district, region, best season, trek length, and highlights for any Uttarakhand place.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Name of the place, trek, temple, or spot (e.g., Kedarnath, Tungnath, Valley of Flowers, Auli).",
                    }
                },
                "required": ["query"],
                "additionalProperties": False,
            },
        ),
        types.FunctionDeclaration(
            name="check_mountain_safety",
            description="Check acute mountain sickness (AMS) risk, altitude meters, and safety advice for high-altitude destinations.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "destination": {
                        "type": "string",
                        "description": "Destination name to evaluate for high altitude and AMS risks.",
                    }
                },
                "required": ["destination"],
                "additionalProperties": False,
            },
        ),
        types.FunctionDeclaration(
            name="find_homestays",
            description="Find authentic verified local homestays and mountain stays in Uttarakhand.",
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "Town or district in Uttarakhand.",
                    }
                },
                "required": ["location"],
                "additionalProperties": False,
            },
        ),
    ]
)


class _DirectGeminiLiveSession:
    """Zero-overhead transparent wrapper for direct Gemini Live WebSocket session."""

    def __init__(self, raw_session) -> None:
        self._raw = raw_session

    def __getattr__(self, name: str):
        return getattr(self._raw, name)

    async def receive(self):
        async for message in self._raw.receive():
            yield message

    async def send_tool_response(self, *, function_responses) -> None:
        await self._raw.send_tool_response(function_responses=function_responses)

    def record_user_audio(self, pcm: bytes) -> None:
        pass

    def record_agent_audio(self, pcm: bytes) -> None:
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> bool:
        return False


def _live_config() -> types.LiveConnectConfig:
    return types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        system_instruction=SYSTEM_PROMPT,
        tools=[DEVBHOOMI_TOOLS],
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
            )
        ),
        realtime_input_config=types.RealtimeInputConfig(
            automatic_activity_detection=types.AutomaticActivityDetection(
                start_of_speech_sensitivity=types.StartSensitivity.START_SENSITIVITY_HIGH,
                end_of_speech_sensitivity=types.EndSensitivity.END_SENSITIVITY_LOW,
                prefix_padding_ms=200,
                silence_duration_ms=800,
            )
        ),
    )


async def run(
    project_name: str,
    *,
    audio_in: AudioInput,
    audio_out: AudioOutput,
    ui: StatusUI | None = None,
) -> None:
    """Drive a raw Gemini Live conversation over the supplied audio frontend."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)

    ui = ui or NullUI()
    thread_id = str(uuid.uuid4())
    client = genai.Client(api_key=api_key)

    ui.log(f"[gemini] thread_id={thread_id}")
    ui.log(f"[gemini] connecting to Gemini Live with model={DEFAULT_MODEL}...")

    mic_task: asyncio.Task | None = None
    receive_task: asyncio.Task | None = None
    try:
        async with client.aio.live.connect(model=DEFAULT_MODEL, config=_live_config()) as raw:
            if tracing.is_tracing_enabled():
                session_cm = wrap_gemini_live(
                    raw,
                    model=DEFAULT_MODEL,
                    thread_id=thread_id,
                    sample_rate=RECV_SAMPLE_RATE,
                    project_name=project_name,
                    tags=["voice-demo", "gemini"],
                    metadata={"model": DEFAULT_MODEL},
                    is_agent_speaking=lambda: audio_out.buffered_bytes() > 0,
                )
            else:
                session_cm = _DirectGeminiLiveSession(raw)

            async with session_cm as session:
                # Capture what the listener actually heard. Audio removed by
                # ``clear()`` during barge-in never reaches this callback.
                audio_out.set_played_callback(session.record_agent_audio)
                audio_in.start()
                audio_out.start()
                ui.log("[gemini] connected. Talk into your mic — Ctrl-C to quit.")
                ui.set_state("listening")


            async def pump_mic() -> None:
                async for frame in audio_in.frames():
                    await session.send_realtime_input(
                        audio=types.Blob(
                            data=resample_pcm16(
                                frame, audio_in.sample_rate, SEND_SAMPLE_RATE
                            ),
                            mime_type=f"audio/pcm;rate={SEND_SAMPLE_RATE}",
                        )
                    )
                    session.record_user_audio(
                        resample_pcm16(frame, audio_in.sample_rate, RECV_SAMPLE_RATE)
                    )
                    ui.update_level(frame_level(frame))

            async def pump_responses() -> None:
                # Gemini's receive() generator ends at each turn_complete, so
                # open a new generator for every subsequent user turn.
                user_transcript = ""
                agent_transcript = ""
                while True:
                    async for raw_message in session.receive():
                        message = LiveMessage(raw_message)

                        if message.interrupted:
                            audio_out.clear()
                            ui.set_state("hearing you")

                        for chunk in message.audio_chunks:
                            audio_out.write(chunk)
                            ui.set_state("speaking")

                        if user_fragment := message.user_transcript:
                            user_transcript = append_transcript(
                                user_transcript, user_fragment
                            )
                            ui.set_state("hearing you")
                        if message.user_transcript_finished:
                            if user_transcript:
                                ui.log(f"user:  {user_transcript}")
                            user_transcript = ""

                        if agent_fragment := message.agent_transcript:
                            agent_transcript = append_transcript(
                                agent_transcript, agent_fragment
                            )
                        if message.agent_transcript_finished:
                            if agent_transcript:
                                ui.log(f"agent: {agent_transcript}")
                            agent_transcript = ""

                        # Gemini can omit a transcription-finished signal. ADK
                        # flushes its fragment accumulators at these same live
                        # boundaries so text never leaks into the next turn.
                        if message.interrupted or message.turn_complete:
                            if user_transcript:
                                ui.log(f"user:  {user_transcript}")
                                user_transcript = ""
                            if agent_transcript:
                                ui.log(f"agent: {agent_transcript}")
                                agent_transcript = ""

                        if message.function_calls:
                            ui.set_state("running tools")
                            responses: list[types.FunctionResponse] = []
                            for call in message.function_calls:
                                if not getattr(call, "id", None):
                                    ui.log(
                                        "[gemini] ignored malformed tool call without an id"
                                    )
                                    continue
                                result = await execute_tool(
                                    getattr(call, "name", None),
                                    getattr(call, "args", None),
                                )
                                responses.append(
                                    types.FunctionResponse(
                                        id=call.id,
                                        name=call.name,
                                        response=result,
                                    )
                                )
                            if responses:
                                ui.set_state("thinking")
                                await session.send_tool_response(
                                    function_responses=responses
                                )

                        if message.turn_complete:
                            ui.set_state("listening")

            mic_task = asyncio.create_task(pump_mic())
            receive_task = asyncio.create_task(pump_responses())
            await asyncio.gather(mic_task, receive_task)

    except asyncio.CancelledError:
        pass
    except Exception as exc:
        ui.log(f"[gemini] error: {exc}")
    finally:
        for task in (mic_task, receive_task):
            if task is not None:
                task.cancel()
        await asyncio.gather(
            *(task for task in (mic_task, receive_task) if task is not None),
            return_exceptions=True,
        )
        audio_out.set_played_callback(None)
        audio_in.stop()
        audio_out.stop()
        ui.finish()
