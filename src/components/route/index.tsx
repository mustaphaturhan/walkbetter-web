"use client";
import { Map } from "../map";
import { RouteForm } from "./route-form";

export const Route = () => {
  const mapId = "main";

  return (
    <div className="flex">
      <div className="flex flex-col p-4 w-full max-w-[420px] z-10 shadow-xl">
        <RouteForm mapId={mapId} />
      </div>
      <div className="w-full h-[calc(100dvh-4rem)]">
        <Map id={mapId} />
      </div>
    </div>
  );
};
