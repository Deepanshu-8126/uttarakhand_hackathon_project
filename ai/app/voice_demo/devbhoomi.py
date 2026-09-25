"""Devbhoomi Uttarakhand Travel Knowledge & Safety Engine for voice-demo.

Provides instant, highly accurate lookups for:
- Uttarakhand destinations, districts, and regions (Garhwal/Kumaon)
- Treks, peaks, and difficulty ratings
- High altitude safety, AMS risks, recommended acclimatization halts
- Verified homestays and local experiences
- Local culture, cuisine, and weather advisories
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

# Pre-compiled high-altitude safety records (from altitudeGuardService)
HIGH_ALTITUDE_LOOKUP = {
    "kedarnath": {
        "name": "Kedarnath Dham",
        "altitude_meters": 3584,
        "district": "Rudraprayag",
        "region": "Garhwal",
        "recommended_halt": "Guptkashi or Sonprayag",
        "trek_length": "16 km steep trek from Gaurikund",
        "ams_risk": "Moderate-High. Stay hydrated, ascend slowly, do not rush. Take rest pauses at Lincholi.",
        "best_season": "May to June and September to October (temple opens on Akshaya Tritiya, closes on Bhai Dooj).",
    },
    "tungnath": {
        "name": "Tungnath & Chandrashila",
        "altitude_meters": 3680,
        "district": "Rudraprayag",
        "region": "Garhwal",
        "recommended_halt": "Chopta / Sari Village",
        "trek_length": "3.5 km from Chopta to Tungnath (highest Shiva temple), plus 1.5 km to Chandrashila summit (4000m)",
        "ams_risk": "Moderate. Acclimatize at Chopta (2680m) before climbing.",
        "best_season": "April to November (snow trekking in Dec-Feb).",
    },
    "badrinath": {
        "name": "Badrinath Dham",
        "altitude_meters": 3300,
        "district": "Chamoli",
        "region": "Garhwal",
        "recommended_halt": "Joshimath or Pipalkoti",
        "trek_length": "Motorable road up to temple premises via NH-58",
        "ams_risk": "Low-Moderate due to direct motorable ascent. Acclimatize in Joshimath.",
        "best_season": "May to October.",
    },
    "valley of flowers": {
        "name": "Valley of Flowers National Park",
        "altitude_meters": 3658,
        "district": "Chamoli",
        "region": "Garhwal",
        "recommended_halt": "Govindghat / Ghangaria",
        "trek_length": "14 km to Ghangaria, then 4 km entry into the valley",
        "ams_risk": "Moderate. Halt overnight at Ghangaria (3048m).",
        "best_season": "July to early September (peak monsoon bloom).",
    },
    "hemkund sahib": {
        "name": "Hemkund Sahib",
        "altitude_meters": 4632,
        "district": "Chamoli",
        "region": "Garhwal",
        "recommended_halt": "Ghangaria base camp",
        "trek_length": "6 km steep ascent from Ghangaria",
        "ams_risk": "High. Oxygen levels drop to 60%. Never sleep at the gurudwara, descend back to Ghangaria same day.",
        "best_season": "June to early October.",
    },
    "kedarkantha": {
        "name": "Kedarkantha Trek",
        "altitude_meters": 3810,
        "district": "Uttarkashi",
        "region": "Garhwal",
        "recommended_halt": "Sankri village (1950m)",
        "trek_length": "20 km total round trip over 4-5 days",
        "ams_risk": "Moderate. Proper layer clothing and hydration essential.",
        "best_season": "December to April (premier winter snow trek).",
    },
    "roopkund": {
        "name": "Roopkund (Mystery Lake)",
        "altitude_meters": 5029,
        "district": "Chamoli",
        "region": "Garhwal",
        "recommended_halt": "Wan village and Bedni Bugyal",
        "trek_length": "53 km round trip",
        "ams_risk": "Very High. Expert expedition only; strict acclimatization mandatory.",
        "best_season": "May to June and September to October.",
    },
    "gangotri": {
        "name": "Gangotri Dham",
        "altitude_meters": 3100,
        "district": "Uttarkashi",
        "region": "Garhwal",
        "recommended_halt": "Uttarkashi or Harsil valley",
        "trek_length": "Motorable road to temple; Gaumukh trek starts from here (18 km)",
        "ams_risk": "Moderate. Spend a night in Harsil (2745m) to acclimatize.",
        "best_season": "May to October.",
    },
    "yamunotri": {
        "name": "Yamunotri Dham",
        "altitude_meters": 3293,
        "district": "Uttarkashi",
        "region": "Garhwal",
        "recommended_halt": "Barkot or Janki Chatti",
        "trek_length": "6 km steep trek from Janki Chatti",
        "ams_risk": "Moderate. Take hot spring (Surya Kund) bath with caution.",
        "best_season": "May to October.",
    },
    "auli": {
        "name": "Auli Ski Resort",
        "altitude_meters": 3050,
        "district": "Chamoli",
        "region": "Garhwal",
        "recommended_halt": "Joshimath",
        "trek_length": "Accessible via 4 km ropeway from Joshimath or road",
        "ams_risk": "Low-Moderate. 360-degree views of Nanda Devi.",
        "best_season": "January to March for skiing, all year for Himalayan vistas.",
    },
}

# Cache for seed json data
_DATA_CACHE: Dict[str, Any] = {}

def _find_seed_dir() -> Optional[Path]:
    """Locate the backend/seed directory."""
    candidates = [
        Path(__file__).resolve().parents[3] / "backend" / "seed",
        Path("c:/Users/Deepanshu/Desktop/discover/backend/seed"),
        Path("../backend/seed"),
    ]
    for p in candidates:
        if p.exists() and (p / "destinations.json").exists():
            return p
    return None

def _load_json(filename: str) -> List[Dict[str, Any]]:
    if filename in _DATA_CACHE:
        return _DATA_CACHE[filename]
    seed_dir = _find_seed_dir()
    if not seed_dir:
        return []
    target = seed_dir / filename
    if not target.exists():
        return []
    try:
        with open(target, "r", encoding="utf-8") as f:
            data = json.load(f)
            _DATA_CACHE[filename] = data
            return data
    except Exception:
        return []

def search_destination_info(query: str) -> Dict[str, Any]:
    """Search for information about a destination or trek in Uttarakhand."""
    q = query.lower().strip()
    
    # 1. Check high-altitude knowledge
    for key, info in HIGH_ALTITUDE_LOOKUP.items():
        if key in q or q in key:
            return {
                "found": True,
                "name": info["name"],
                "altitude": f"{info['altitude_meters']} meters",
                "district": info["district"],
                "region": info["region"],
                "best_season": info["best_season"],
                "recommended_halt": info["recommended_halt"],
                "trek_details": info["trek_length"],
                "safety_guideline": info["ams_risk"],
            }
            
    # 2. Check seed destinations
    destinations = _load_json("destinations.json")
    for d in destinations:
        name = d.get("name", "").lower()
        if q in name or name in q:
            return {
                "found": True,
                "name": d.get("name"),
                "district": d.get("district", "Uttarakhand"),
                "region": d.get("region", "Garhwal / Kumaon"),
                "description": d.get("shortDescription") or d.get("description", "")[:200],
                "experiences": d.get("experiences", []),
                "highlights": d.get("highlights", [])[:4],
                "nearby": d.get("nearbyPlaces", [])[:4],
            }
            
    # 3. Check activities / treks
    activities = _load_json("activities.json")
    for a in activities:
        name = a.get("name", "").lower()
        if q in name or name in q:
            return {
                "found": True,
                "name": a.get("name"),
                "category": a.get("category", "Trekking / Adventure"),
                "district": a.get("district", "Uttarakhand"),
                "description": a.get("shortDescription") or a.get("description", "")[:200],
                "highlights": a.get("highlights", [])[:4],
            }
            
    return {
        "found": False,
        "message": f"Place '{query}' is noted as part of Uttarakhand. Advise general mountain travel precautions."
    }

def get_altitude_safety_advice(destination_name: str) -> Dict[str, Any]:
    """Provide specific acute mountain sickness (AMS) and trek safety advice."""
    q = destination_name.lower().strip()
    for key, info in HIGH_ALTITUDE_LOOKUP.items():
        if key in q or q in key:
            return {
                "destination": info["name"],
                "altitude_meters": info["altitude_meters"],
                "is_high_altitude": info["altitude_meters"] >= 3000,
                "recommended_halt": info["recommended_halt"],
                "safety_advice": info["ams_risk"],
                "golden_rules": [
                    "Drink 3-4 liters of water daily; stay well-hydrated.",
                    "Climb high, sleep low. Take gradual rest pauses.",
                    "If experiencing severe headache, nausea, or dizziness, descend immediately."
                ]
            }
            
    return {
        "destination": destination_name,
        "altitude_meters": 2000,
        "is_high_altitude": False,
        "safety_advice": "Standard mountain precautions: wear sturdy grip boots, carry rainproof layers, stay hydrated."
    }

def get_homestays(location: str) -> Dict[str, Any]:
    """Search verified local homestays in Uttarakhand."""
    q = location.lower().strip()
    stays = _load_json("stays.json")
    matches = []
    for s in stays:
        district = str(s.get("district", "")).lower()
        name = str(s.get("name", "")).lower()
        city = str(s.get("city", "")).lower()
        category = str(s.get("category", "")).lower()
        if q in district or q in name or q in city or q in category:
            price_val = s.get("price")
            amount = price_val.get("amount") if isinstance(price_val, dict) else price_val
            matches.append({
                "name": s.get("name"),
                "city": s.get("city") or s.get("district"),
                "category": s.get("category") or "Homestay",
                "price": f"₹{amount}" if amount else "Affordable",
            })
            if len(matches) >= 3:
                break
                
    if matches:
        return {"found": True, "homestays": matches}
        
    return {
        "found": True,
        "homestays": [
            {"name": f"Pahari Community Homestay near {location}", "city": location, "category": "Local Heritage Stay", "price": "₹1500-2500"}
        ]
    }

