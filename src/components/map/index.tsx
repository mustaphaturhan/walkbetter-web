"use client";

import MapGL, {
  GeolocateControl,
  Marker,
  NavigationControl,
  Source,
  Layer,
  MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { fetchOptimizedRoute } from "./utils";

const initialViewState = {
  zoom: 5,
  longitude: 13.388,
  latitude: 49.517,
};

const brusselsLocations: [number, number][] = [
  [4.35247, 50.84673], // Grand Place
  [4.34994, 50.84499], // Manneken Pis
  [4.35614, 50.84299], // Mont des Arts
  [4.34152, 50.89497], // Atomium
  [4.36331, 50.84293], // Royal Palace
  [4.39351, 50.84194], // Cinquantenaire
  [4.37652, 50.83707], // Parliament
  [4.35489, 50.84857], // Galeries Royales
];

interface MapProps {
  initialLocation?: boolean;
}

export const Map = ({ initialLocation = true }: MapProps) => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(initialViewState);

  useEffect(() => {
    if (!initialLocation) {
      if (!("geolocation" in navigator)) return;

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          setViewState((currentViewState) => {
            const isAtInitialPosition =
              currentViewState.latitude === initialViewState.latitude &&
              currentViewState.longitude === initialViewState.longitude &&
              currentViewState.zoom === initialViewState.zoom;

            if (isAtInitialPosition) {
              return {
                ...currentViewState,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                zoom: 7,
              };
            }

            return currentViewState;
          });
        });
      }
    }
  }, []);

  return (
    <MapGL
      ref={mapRef}
      id="main"
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
    >
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        showAccuracyCircle={false}
      />
      <NavigationControl showCompass={false} />
    </MapGL>
  );
};
