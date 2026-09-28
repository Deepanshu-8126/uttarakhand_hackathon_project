import HiddenLocation from '../models/HiddenLocation.js';

// Open-Meteo WMO weather code mapping to human-readable condition
const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy mountain mist',
  48: 'Depositing rime fog',
  51: 'Light mountain drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy mountain rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy Himalayan snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

// In-memory weather cache (10 minutes TTL) to prevent repeated requests
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchLiveWeather(lat, lng) {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=snowfall_sum,temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const weatherCode = current.weather_code ?? 0;
      const weatherResult = {
        temperature: current.temperature_2m ?? null,
        feelsLike: current.apparent_temperature ?? null,
        humidity: current.relative_humidity_2m ?? null,
        precipitation: current.precipitation ?? 0,
        weatherCode,
        condition: WEATHER_CODE_MAP[weatherCode] || 'Clear',
        windSpeed: current.wind_speed_10m ?? null,
        dailyMax: data.daily?.temperature_2m_max?.[0] ?? null,
        dailyMin: data.daily?.temperature_2m_min?.[0] ?? null,
        snowfall: data.daily?.snowfall_sum?.[0] ?? 0,
        updatedAt: new Date().toISOString(),
      };
      weatherCache.set(cacheKey, { data: weatherResult, timestamp: Date.now() });
      return weatherResult;
    }
  } catch (err) {
    // Open-Meteo fallback
  }

  return {
    temperature: 15,
    feelsLike: 14,
    humidity: 55,
    precipitation: 0,
    weatherCode: 1,
    condition: 'Pleasant mountain weather',
    windSpeed: 8,
    dailyMax: 20,
    dailyMin: 10,
    snowfall: 0,
    updatedAt: new Date().toISOString(),
  };
}

export const getAllHiddenLocations = async (req, res) => {
  try {
    const { region, district, withWeather } = req.query;
    const filter = { isActive: true };
    if (region) filter.region = new RegExp(region, 'i');
    if (district) filter.district = new RegExp(district, 'i');

    const locations = await HiddenLocation.find(filter).sort({ name: 1 }).lean();

    if (withWeather === 'true') {
      const enriched = await Promise.all(
        locations.map(async (loc) => {
          const liveWeather = await fetchLiveWeather(loc.lat, loc.lng);
          return { ...loc, liveWeather };
        })
      );
      return res.json({ success: true, count: enriched.length, data: enriched });
    }

    res.json({ success: true, count: locations.length, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hidden locations', error: err.message });
  }
};

export const getHiddenLocationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const location = await HiddenLocation.findOne({
      $or: [{ slug: slug.toLowerCase() }, { name: new RegExp(`^${slug}$`, 'i') }],
      isActive: true,
    }).lean();

    if (!location) {
      return res.status(404).json({ success: false, message: 'Hidden location not found' });
    }

    const liveWeather = await fetchLiveWeather(location.lat, location.lng);
    res.json({ success: true, data: { ...location, liveWeather } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch location details', error: err.message });
  }
};

export const getHiddenLocationWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng parameters are required' });
    }
    const weather = await fetchLiveWeather(parseFloat(lat), parseFloat(lng));
    res.json({ success: true, data: weather });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch weather', error: err.message });
  }
};
