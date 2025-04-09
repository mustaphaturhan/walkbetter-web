import { OptimizedRouteResponse } from "@/types/valhalla";

export const getBoundingBox = (coords: [number, number][]) => {
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ] as [[number, number], [number, number]];
};

function decodeValhallaShape(shape: string): [number, number][] {
  let index = 0,
    lat = 0,
    lon = 0;
  const coordinates: [number, number][] = [];

  while (index < shape.length) {
    let result = 1,
      shift = 0,
      b;
    do {
      b = shape.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = shape.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lon += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push([lon * 1e-6, lat * 1e-6]);
  }

  return coordinates;
}

// todo: move this to tanstack/query
export async function fetchOptimizedRoute(locations: [number, number][]) {
  const body = {
    locations: locations.map(([lon, lat]) => ({ lat, lon })),
    costing: "pedestrian",
    directions_options: {
      units: "kilometers",
    },
  };

  const response = await fetch(
    "https://valhalla1.openstreetmap.de/optimized_route",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Valhalla request failed");
  }

  const data: OptimizedRouteResponse = await response.json();

  const features = data.trip.legs.map((leg) => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: decodeValhallaShape(leg.shape),
    },
    properties: {},
  }));

  const orderedCoords: [number, number][] = data.trip.locations.map((loc) => [
    loc.lon,
    loc.lat,
  ]);

  const allCoords = features.flatMap((f) => f.geometry.coordinates);

  return {
    geojson: {
      type: "FeatureCollection",
      features,
    },
    bbox: getBoundingBox(allCoords),
    orderedCoords,
  };
}
