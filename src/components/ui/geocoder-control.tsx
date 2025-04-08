/* global fetch */
import * as React from "react";
import { useState } from "react";
import { MarkerProps, ControlPosition } from "react-map-gl/maplibre";
import { MaplibreGeocoderOptions } from "@maplibre/maplibre-gl-geocoder";
import { Input } from "./input";
import { useDebounce } from "../../hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";

type GeocoderControlProps = Omit<
  MaplibreGeocoderOptions,
  "maplibregl" | "marker"
> & {
  marker?: boolean | Omit<MarkerProps, "longitude" | "latitude">;
  position: ControlPosition;
};

type SearchFeature = {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  place_name: string;
  properties: Record<string, unknown>;
  text: string;
  place_type: string[];
  center: number[];
};

const fetchGeocodeResults = async (query: string): Promise<SearchFeature[]> => {
  if (!query) return [];

  const request = `https://nominatim.openstreetmap.org/search?q=${query}&format=geojson&polygon_geojson=1&addressdetails=1`;
  const response = await fetch(request);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const geojson = await response.json();
  const results: SearchFeature[] = [];

  for (const feature of geojson.features) {
    const center = [
      feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
      feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
    ];

    const point: SearchFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: center,
      },
      place_name: feature.properties.display_name,
      properties: feature.properties,
      text: feature.properties.display_name,
      place_type: ["place"],
      center,
    };

    results.push(point);
  }

  return results;
};

export default function GeocoderControl(props: GeocoderControlProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: features = [], isLoading } = useQuery({
    queryKey: ["geocode", debouncedSearch],
    queryFn: () => fetchGeocodeResults(debouncedSearch),
    enabled: Boolean(debouncedSearch),
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.currentTarget.value);
    if (e.currentTarget.value === "") {
      // Clear results when input is cleared
      setSearchQuery("");
    }
  };

  return (
    <div className="relative z-10 w-[400px] h-full bg-white p-4">
      <Input
        onChange={handleInputChange}
        placeholder="Search for place"
        value={searchQuery}
      />
      {isLoading && debouncedSearch && (
        <div className="p-2 text-sm text-gray-500">Loading...</div>
      )}
      {features.length > 0 && (
        <div className="mt-2 max-h-[300px] overflow-auto">
          {features.map((feature, index) => (
            <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer">
              {feature.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
