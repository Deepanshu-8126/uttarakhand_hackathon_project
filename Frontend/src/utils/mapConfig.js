/**
 * Discovery Uttarakhand - Map Tile Configuration
 * Reliable, fast, high-contrast tile presets with zero rate-limit issues.
 */

const CARTO_DARK = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
};

const ESRI_TOPO = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; Uttarakhand Topographic &amp; Contours',
  subdomains: '',
  maxZoom: 19,
};

const CARTO_VOYAGER = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19,
};

const ESRI_SATELLITE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; High-Res Satellite Imagery',
  subdomains: '',
  maxZoom: 18,
};

/** Tile presets available in the layer switcher. */
export const TILE_PRESETS = {
  dark: { ...CARTO_DARK, label: 'Dark Terrain' },
  terrain: { ...ESRI_TOPO, label: 'Topographic' },
  map: { ...CARTO_VOYAGER, label: 'Voyager Light' },
  satellite: { ...ESRI_SATELLITE, label: 'Satellite' },
};

/** Active tile layer — default to Dark Terrain for Uttarakhand mountain contrast */
export const DEFAULT_TILE = TILE_PRESETS.dark;

/** Uttarakhand geographic defaults (Exact center coordinates) */
export const MAP_CENTER = [30.0668, 79.0193];  // Central Uttarakhand
export const MAP_ZOOM = 8;
export const MAP_MIN_ZOOM = 7;
export const MAP_MAX_ZOOM = 18;

/**
 * Validate a GeoJSON [lng, lat] or Leaflet [lat, lng] pair.
 * Uttarakhand bounding box: lat 28.0–32.0, lng 77.0–82.0
 */
export const isValidCoord = (coord) => {
  if (!Array.isArray(coord) || coord.length < 2) return false;
  const [lat, lng] = coord;
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= 28.0 && lat <= 32.5 &&
    lng >= 76.5 && lng <= 82.5
  );
};

