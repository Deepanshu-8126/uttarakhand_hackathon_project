"""Open-Meteo weather lookup. Free, public, no API key.

A pure async fetch shared across backends. Each backend wraps it in whatever
tracing its stack uses: the OpenAI backend wraps it with LangSmith's
`@traceable` (see `openai/tools.py`); the pipecat-with-langgraph backend
exposes it as a LangGraph tool whose execution is traced through OTel.

The endpoints are fixed constants — the only caller-supplied value is the city
name, passed as a query parameter — so there's no user-controlled base URL.
"""

from __future__ import annotations

import httpx

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

_TIMEOUT = httpx.Timeout(10.0, connect=5.0)


WMO_DESCRIPTIONS: dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


async def fetch_weather(city: str) -> dict:
    """Geocode a city name and return current weather in Celsius and km/h.

    Returns one of:
      {"city": str, "country": str, "temperature_c": float, "description": str, "windspeed_kmh": float, "time": str, "weather": {...}} on success
      {"city": str, "error": "not_found" | "http_error"} on failure
    """
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        try:
            geo = await client.get(GEOCODE_URL, params={"name": city, "count": 1})
            geo.raise_for_status()
            results = geo.json().get("results") or []
            if not results:
                return {"city": city, "error": "not_found"}
            loc = results[0]

            wx = await client.get(
                FORECAST_URL,
                params={
                    "latitude": loc["latitude"],
                    "longitude": loc["longitude"],
                    "current_weather": True,
                    "temperature_unit": "celsius",
                    "wind_speed_unit": "kmh",
                },
            )
            wx.raise_for_status()
            current = wx.json().get("current_weather") or {}
            w = current
            weathercode = w.get("weathercode")
            desc = WMO_DESCRIPTIONS.get(weathercode, f"Weathercode {weathercode}")
            return {
                "city": loc.get("name") or city,
                "country": loc.get("country") or "",
                "temperature_c": w.get("temperature"),
                "description": desc,
                "windspeed_kmh": w.get("windspeed"),
                "time": w.get("time"),
                "weather": current,
            }
        except httpx.HTTPError:
            return {"city": city, "error": "http_error"}
