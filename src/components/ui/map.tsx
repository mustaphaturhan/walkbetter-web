"use client";

import MapGL from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
// import MaplibreGeocoder, {
//   MaplibreGeocoderApi,
// } from "@maplibre/maplibre-gl-geocoder";
import { useEffect, useState } from "react";
// import GeocoderControl from "./geocoder-control";

// const geocoderApi: MaplibreGeocoderApi = {
//   forwardGeocode: async (config) => {
//     const features = [];
//     try {
//       const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
//       const response = await fetch(request);
//       const geojson = await response.json();
//       for (const feature of geojson.features) {
//         const center = [
//           feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
//           feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
//         ];
//         const point = {
//           type: "Feature",
//           geometry: {
//             type: "Point",
//             coordinates: center,
//           },
//           place_name: feature.properties.display_name,
//           properties: feature.properties,
//           text: feature.properties.display_name,
//           place_type: ["place"],
//           center,
//         };
//         features.push(point);
//       }
//     } catch (e) {
//       console.error(`Failed to forwardGeocode with error: ${e}`);
//     }

//     return {
//       features,
//     };
//   },
// };

const initialViewState = {
  zoom: 5,
  longitude: 13.388,
  latitude: 49.517,
};

export const Map = () => {
  const [viewState, setViewState] = useState(initialViewState);

  useEffect(() => {
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
  }, []);

  return (
    <MapGL
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
    >
      {/* <GeocoderControl
        position="top-left"
        onLoading={() => {}}
        onResults={() => {}}
        onError={() => {}}
      /> */}
    </MapGL>
  );
};
