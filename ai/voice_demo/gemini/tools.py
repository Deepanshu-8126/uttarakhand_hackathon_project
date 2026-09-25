"""Allowlisted application tool dispatch for the raw Gemini Live backend."""

from __future__ import annotations

from typing import Any

from ..weather import fetch_weather
from ..devbhoomi import (
    search_destination_info,
    get_altitude_safety_advice,
    get_homestays,
)


async def lookup_weather(city: str) -> dict:
    """Get the current weather for one city from the shared Open-Meteo client."""
    return await fetch_weather(city)


async def execute_tool(name: str | None, arguments: Any) -> dict:
    """Execute one known tool; malformed or unknown calls return safe errors."""
    if not isinstance(arguments, dict):
        arguments = {}

    if name == "lookup_weather":
        city = arguments.get("city") or "Dehradun"
        return await lookup_weather(str(city).strip())

    if name == "explore_uttarakhand_place":
        query = arguments.get("query") or arguments.get("place") or "Uttarakhand"
        return search_destination_info(str(query).strip())

    if name == "check_mountain_safety":
        dest = arguments.get("destination") or arguments.get("place") or "Kedarnath"
        return get_altitude_safety_advice(str(dest).strip())

    if name == "find_homestays":
        loc = arguments.get("location") or arguments.get("city") or "Rishikesh"
        return get_homestays(str(loc).strip())

    return {"error": f"unknown tool: {name or '<missing>'}"}

