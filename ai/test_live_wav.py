import asyncio
import base64
import io
import os
import wave
from dotenv import load_dotenv

load_dotenv()
from google import genai
from google.genai import types

async def test():
    api_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    model = "gemini-2.5-flash-native-audio-latest"
    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
            )
        ),
        system_instruction=types.Content(
            parts=[types.Part.from_text(text="You are Devbhoomi Voice Companion. Reply warmly in 1 short sentence.")]
        ),
    )
    pcm_chunks = []
    text_chunks = []
    async with client.aio.live.connect(model=model, config=config) as session:
        await session.send(input="Namaste, what is the best trek in Uttarakhand?", end_of_turn=True)
        async for response in session.receive():
            sc = response.server_content
            if sc is not None and sc.model_turn is not None:
                for part in sc.model_turn.parts:
                    if part.inline_data:
                        pcm_chunks.append(part.inline_data.data)
                    if part.text:
                        text_chunks.append(part.text)
            if sc is not None and sc.turn_complete:
                break
    pcm_data = b"".join(pcm_chunks)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(24000)
        wav_file.writeframes(pcm_data)
    wav_bytes = buf.getvalue()
    b64 = base64.b64encode(wav_bytes).decode("utf-8")
    print(f"SUCCESS! Text: {''.join(text_chunks)}")
    print(f"PCM bytes: {len(pcm_data)} | WAV bytes: {len(wav_bytes)} | B64 prefix: {b64[:30]}...")

if __name__ == "__main__":
    asyncio.run(test())
