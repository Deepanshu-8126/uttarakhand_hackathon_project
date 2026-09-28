# Discovery Uttarakhand — Canonical Map & GIS System Contract
**Unified Specification for Web (React + Leaflet) and Mobile (Flutter + flutter_map)**

---

## 1. Architectural Philosophy
Discovery Uttarakhand enforces **single-source-of-truth geospatial architecture**:
- **One Data Source**: MongoDB Atlas (`destinations`, `hidden_locations`, `stays`, `rentals`, `activities`).
- **One Coordinate Space**: WGS84 GeoJSON standard (`[longitude, latitude]`).
- **One Base Tile Provider**: Geoapify Maps API (`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png`).
- **One Routing Engine**: OSRM (Open Source Routing Machine via backend `/api/route`).
- **Two Native Client Renderers**:
  1. **Web**: React 18 + Leaflet + React-Leaflet + Geoapify TileLayer
  2. **Mobile**: Flutter + `flutter_map` (Leaflet port) + Geoapify TileLayer

---

## 2. Coordinate System & Normalization Rules

### 🌐 The GeoJSON Rule (Never Invert)
1. **In Database / GeoJSON Storage**:
   ```json
   {
     "type": "Point",
     "coordinates": [longitude, latitude]
   }
   ```
   *Example: Badrinath is `[79.4930, 30.7433]` (`lng = 79.4930`, `lat = 30.7433`).*

2. **In Leaflet (Web)**:
   Leaflet coordinates require `[latitude, longitude]`.
   ```javascript
   const leafletPos = [dest.location.coordinates[1], dest.location.coordinates[0]];
   ```

3. **In Flutter (`latlong2`)**:
   `LatLng` requires `(latitude, longitude)`.
   ```dart
   final latLng = LatLng(dest.latitude, dest.longitude);
   ```

### 🛡️ Uttarakhand Geographic Boundaries (Validation Filter)
Any point outside these bounding coordinates is discarded as corrupt or inaccurate:
- **Latitude**: `28.7° N` to `31.5° N`
- **Longitude**: `77.4° E` to `81.2° E`
- **Default Center**: `[30.0668, 79.0193]` (Central Garhwal-Kumaon Divide)
- **Default Zoom**: `8` (Full State View)

---

## 3. Tile Provider Configuration

### 🗺️ Geoapify Vector & Raster Tiles
Both clients use the same Geoapify API key and tile schemes:
- **API Key**: `2c3a7f1f2e184822a7631d30dfac330c`
- **Default Crisp Tile**:
  ```
  https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={GEOAPIFY_KEY}
  ```
- **Satellite / High-Altitude Layer**:
  ```
  https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
  ```
- **Dark Night Cyber Mode**:
  ```
  https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
  ```

### 🚫 Tile Failure Protocol
If tile servers return 401, 403, 429, or network drop:
- **NEVER** substitute with a fake static image or screenshot.
- Display a non-blocking toast/banner: `"Map tiles are currently loading or unavailable."`
- Keep marker layers and GPS beacons active.

---

## 4. Entity Markers & Schema

Every marker on both Web and Mobile is backed by a verified MongoDB entity:

```typescript
interface MapMarkerEntity {
  id: string;                    // MongoDB _id or canonical slug
  name: string;                  // e.g. "Badrinath"
  type: 'destination' | 'stay' | 'rental' | 'activity' | 'corridor_hub';
  category: string;              // "Spiritual", "Trek", "High Altitude"
  latitude: number;              // 30.7433
  longitude: number;             // 79.4930
  altitude?: number;             // 3300 (meters)
  rating?: number;               // 4.9
  price?: number;                // For stays/rentals
  verified: boolean;             // Web3 or KYC verification status
  coverImage?: string;           // Direct real image URL
}
```

---

## 5. Road Routing Protocol (OSRM vs Straight-Lines)

1. **Deterministic OSRM Engine**:
   - Client requests route between Origin `[lat1, lng1]` and Destination `[lat2, lng2]`.
   - Backend queries OSRM router (`http://router.project-osrm.org/route/v1/driving/...`).
   - Response provides GeoJSON `LineString` with real mountain turn-by-turn geometry.
2. **Strict No-Straight-Line Rule**:
   - If OSRM fails or road does not exist, display: `"Direct road route unavailable. Mountain trail or foot trek required."`
   - **NEVER** draw a straight line between two mountain peaks across glaciers.

---

## 6. Himalayan Safe Corridors (Civil Defense & Tourism Belts)
Both Web and Mobile render the 4 vital Himalayan transit corridors with real waypoints:
1. **Char Dham Sacred Corridor**: Haridwar → Rishikesh → Devprayag → Rudraprayag → Guptkashi → Joshimath → Badrinath
2. **Kumaon Lakes & Wildlife Belt**: Kathgodam → Nainital → Bhimtal → Almora → Binsar → Kausani
3. **Adi Kailash & Om Parvat High Pass**: Pithoragarh → Dharchula → Gunji → Lipulekh Pass
4. **Valley of Flowers & Hemkund Trek**: Govindghat → Poolna → Ghangaria → Hemkund Sahib

---

## 7. AI Copilot Integration
When the AI Copilot triggers `OPEN_MAP` or `VIEW_ROUTE`:
- **Action Payload**: `{ action: 'OPEN_MAP', destinationId: string, coordinates: [number, number] }`
- **Client Handling**:
  - Web: Updates `useMapStore.selectedEntity` and centers Leaflet camera.
  - Mobile: Updates `MapScreen` controller, animates camera to target `LatLng`, and displays detail sheet.
