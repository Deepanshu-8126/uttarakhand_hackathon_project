export const calculateDistanceKm = (coord1, coord2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const lat1 = coord1[0];
  const lon1 = coord1[1];
  const lat2 = coord2[0];
  const lon2 = coord2[1];

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const estimateDriveTime = (distanceKm) => {
  const averageHillSpeed = 32; // km/h in Himalayas
  const totalHours = distanceKm / averageHillSpeed;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hrs`;
  return `${hours}h ${minutes}m`;
};

/**
 * Format duration in seconds to human readable string
 */
export const formatDuration = (seconds) => {
  const totalHours = seconds / 3600;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hrs`;
  return `${hours}h ${minutes}m`;
};

/**
 * Calculates total route distance using OSRM (Single Primary Route)
 */
export const fetchOSRMRoute = async (destinations) => {
  const multi = await fetchOSRMMultiRoutes(destinations);
  if (multi && multi.routes && multi.routes.length > 0) {
    return multi.routes[0];
  }
  return {
    isRoadRoute: false,
    totalDistanceKm: null,
    estimatedTime: null,
    stopsCount: destinations ? destinations.length : 0,
    geometry: null,
    legs: [],
    routeStatus: 'UNAVAILABLE',
    routeError: 'Road route could not be calculated for this mountain segment.'
  };
};

/**
 * Fetch Multiple Real Mountain Driving Routes from OSRM
 * Returns both Route 1 (Primary Highway) and Route 2 (Mountain Shortcut / Scenic Bypass)
 */
export const fetchOSRMMultiRoutes = async (destinations) => {
  if (!destinations || destinations.length < 2) {
    return {
      success: false,
      routes: []
    };
  }

  // OSRM requires coordinates in longitude, latitude format
  const coordsString = destinations
    .map(dest => {
      const c = dest.coordinates || dest.coords || dest;
      return `${c[1]},${c[0]}`;
    })
    .join(';');

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&alternatives=true`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const formattedRoutes = data.routes.map((route, idx) => {
          const distanceKm = Math.round(route.distance / 1000);
          const estimatedTime = formatDuration(route.duration);

          const legs = (route.legs || []).map(leg => ({
            distanceKm: Math.round(leg.distance / 1000),
            estimatedTime: formatDuration(leg.duration)
          }));

          const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

          const isShortcut = idx > 0;
          return {
            id: isShortcut ? 'shortcut' : 'highway',
            routeIndex: idx,
            name: isShortcut ? 'Mountain Shortcut / Scenic Bypass' : 'Primary All-Weather Highway (NH)',
            badge: isShortcut ? '⚡ Mountain Shortcut' : '🛣️ All-Weather Highway',
            subtitle: isShortcut ? 'Alternative Mountain Ridge / Bypass Route' : 'Main Char Dham National Highway Corridor',
            roadType: isShortcut ? 'State Highway / Mountain Ridge Road' : 'National Highway (NH-07 / Char Dham Pariyojana)',
            isRoadRoute: true,
            isShortcut,
            totalDistanceKm: distanceKm,
            estimatedTime,
            durationSeconds: route.duration,
            geometry: latLngs,
            legs,
            routeStatus: 'OK'
          };
        });

        // Sort so the fastest or primary is first, but label appropriately
        return {
          success: true,
          routes: formattedRoutes
        };
      }
    } catch (error) {
      if (attempt === 2) {
        console.error('OSRM Multi-Route Fetch Error:', error);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  return {
    success: false,
    routes: []
  };
};

export const calculateItineraryStats = (destinations) => {
  if (!destinations || destinations.length < 2) {
    return { totalDistanceKm: 0, estimatedTime: '0 hrs', stopsCount: destinations ? destinations.length : 0 };
  }

  let totalDistanceKm = 0;
  for (let i = 0; i < destinations.length - 1; i++) {
    const from = destinations[i].coordinates || destinations[i].coords;
    const to = destinations[i + 1].coordinates || destinations[i + 1].coords;
    const directKm = calculateDistanceKm(from, to);
    totalDistanceKm += Math.round(directKm * 1.45);
  }

  return {
    totalDistanceKm,
    estimatedTime: estimateDriveTime(totalDistanceKm),
    stopsCount: destinations.length
  };
};
