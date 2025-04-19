"use client";

import MapGL, {
  GeolocateControl,
  NavigationControl,
  MapRef,
  MapLayerMouseEvent,
  Marker,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";
import { PreviewPlaceMarker } from "./preview-place-marker";
import { PreviewPlace } from "@/types/common";

const initialViewState = { zoom: 5, longitude: 13.388, latitude: 49.517 };

interface MapProps {
  previewPlace: PreviewPlace | null;
  selectedPlaces: PreviewPlace[];
  handleSetPreviewPlace: (place: PreviewPlace | null) => void;
  onLoad: (map: MapRef) => void;
  onSelectPreviewPlace: (place: PreviewPlace) => void;
}

export const Map = ({
  previewPlace,
  selectedPlaces,
  onLoad,
  handleSetPreviewPlace,
  onSelectPreviewPlace,
}: MapProps) => {
  const internalMapRef = useRef<MapRef>(null);
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState({
    zoom: Number(searchParams.get("zoom")) || initialViewState.zoom,
    longitude: Number(searchParams.get("lon")) || initialViewState.longitude,
    latitude: Number(searchParams.get("lat")) || initialViewState.latitude,
  });
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const input = useMemo(() => {
    if (!previewPlace) return undefined;
    return { lat: previewPlace.lat, lng: previewPlace.lon } as const;
  }, [previewPlace]);

  const reverseQuery = api.reverse.byCoords.useQuery(input!, {
    enabled: !!input,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (reverseQuery.data && !reverseQuery.isFetching) {
      const newPreviewPlace = {
        ...reverseQuery.data.result,
        lat: previewPlace?.lat,
        lon: previewPlace?.lon,
        ready: true,
      };

      if (JSON.stringify(newPreviewPlace) !== JSON.stringify(previewPlace)) {
        // @ts-expect-error - TODO: fix this after development process is done
        handleSetPreviewPlace(newPreviewPlace);
      }
    }
  }, [
    reverseQuery.data,
    reverseQuery.isFetching,
    handleSetPreviewPlace,
    previewPlace,
  ]);

  const handleMapClick = async (e: MapLayerMouseEvent) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      return;
    }

    // we need to wait a bit to see if the user is double clicking
    clickTimeout.current = setTimeout(() => {
      clickTimeout.current = null;
      const { lng, lat } = e.lngLat;

      handleSetPreviewPlace({ lat, lon: lng });
    }, 250);
  };

  return (
    <MapGL
      ref={internalMapRef}
      id="main"
      style={{ width: "100%", height: "100%" }}
      mapStyle="/assets/default.json"
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onMoveEnd={(e) => {
        const params = new URLSearchParams();
        params.set("lat", e.viewState.latitude.toFixed(6));
        params.set("lon", e.viewState.longitude.toFixed(6));
        params.set("zoom", e.viewState.zoom.toFixed(2));
        const url = `/trip/generate?${params.toString()}`;
        window.history.replaceState({}, "", url);
      }}
      minZoom={2.2}
      onClick={handleMapClick}
      onLoad={() => onLoad(internalMapRef.current!)}
    >
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        showAccuracyCircle={false}
      />
      <NavigationControl showCompass={false} />

      {previewPlace && (
        <PreviewPlaceMarker
          place={previewPlace}
          onClose={() => handleSetPreviewPlace(null)}
          onSelectPlace={onSelectPreviewPlace}
        />
      )}

      {selectedPlaces.map((place, i) => (
        <Marker
          key={`${place.lon}-${place.lat}`}
          longitude={place.lon}
          latitude={place.lat}
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center border-2 border-white shadow-md">
            {i + 1}
          </div>
        </Marker>
      ))}
    </MapGL>
  );
};
