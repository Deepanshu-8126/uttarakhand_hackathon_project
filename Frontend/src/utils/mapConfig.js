/**
 * Discovery Uttarakhand - Map Tile Configuration
 * Premium, ultra-crisp, high-definition tiles powered by Geoapify & CartoDB.
 */

const GEOAPIFY_API_KEY = import.meta.env?.VITE_GEOAPIFY_API_KEY || '2c3a7f1f2e184822a7631d30dfac330c';

const GEOAPIFY_BRIGHT = {
  url: `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
  attribution: '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  subdomains: '',
  maxZoom: 20,
};

const CARTO_VOYAGER = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
};

const ESRI_SATELLITE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; High-Resolution Satellite & Aerial Imagery',
  subdomains: '',
  maxZoom: 18,
};

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

/** Tile presets available in the layer switcher. */
export const TILE_PRESETS = {
  geoapify: { ...GEOAPIFY_BRIGHT, label: 'Geoapify HD' },
  voyager: { ...CARTO_VOYAGER, label: 'Highways & Towns' },
  satellite: { ...ESRI_SATELLITE, label: 'Satellite 3D' },
  dark: { ...CARTO_DARK, label: 'Night Cyber' },
  terrain: { ...ESRI_TOPO, label: 'Topographic' },
};

/** Active tile layer — default to Geoapify HD for crystal-clear Uttarakhand mountain road contrast */
export const DEFAULT_TILE = TILE_PRESETS.geoapify;

/** Uttarakhand geographic defaults (Exact center coordinates) */
export const MAP_CENTER = [30.0668, 79.0193];  // Central Uttarakhand
export const MAP_ZOOM = 8;
export const MAP_MIN_ZOOM = 7;
export const MAP_MAX_ZOOM = 19;

/**
 * Validate a GeoJSON [lng, lat] or Leaflet [lat, lng] pair.
 * Uttarakhand bounding box: lat 28.0–32.5, lng 76.5–82.5
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
