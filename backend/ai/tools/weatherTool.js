/**
 * Live mountain weather tool using Open-Meteo or fallback climate normals
 */
export async function weatherTool({ destination = "Kedarnath" }) {
  const GEO_COORDS = {
    kedarnath: { lat: 30.7352, lon: 79.0669, name: "Kedarnath Dham", alt: 3584 },
    badrinath: { lat: 30.7433, lon: 79.4938, name: "Badrinath Dham", alt: 3133 },
    rishikesh: { lat: 30.0869, lon: 78.2676, name: "Rishikesh", alt: 372 },
    chopta: { lat: 30.4854, lon: 79.1706, name: "Chopta / Tungnath", alt: 2680 },
    auli: { lat: 30.5283, lon: 79.5667, name: "Auli Ski Resort", alt: 2800 },
    munsyari: { lat: 30.0667, lon: 80.2333, name: "Munsyari", alt: 2200 },
    nainital: { lat: 29.3919, lon: 79.4542, name: "Nainital Lake", alt: 2084 }
  };

  const key = Object.keys(GEO_COORDS).find(k => destination.toLowerCase().includes(k)) || "kedarnath";
  const geo = GEO_COORDS[key];

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const cur = data.current || {};
      return {
        location: geo.name,
        altitudeMeters: geo.alt,
        temperatureC: cur.temperature_2m ?? 12,
        humidity: `${cur.relative_humidity_2m ?? 65}%`,
        windSpeed: `${cur.wind_speed_10m ?? 8} km/h`,
        condition: cur.temperature_2m < 5 ? "Cold / Potential Frost" : "Crisp mountain weather",
        source: "Open-Meteo Live API"
      };
    }
  } catch (err) {
    // Graceful fallback
  }

  return {
    location: geo.name,
    altitudeMeters: geo.alt,
    temperatureC: geo.alt > 3000 ? "4°C to 12°C" : "15°C to 24°C",
    condition: "Typical seasonal mountain climate. Evenings are cold, warm thermals recommended.",
    source: "Devbhoomi Climate Climatology"
  };
}
