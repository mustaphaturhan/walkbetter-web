"use client";
import { Map } from "../map";
import { RouteForm } from "./form";

export const Route = () => {
  const mapId = "main";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4">
      <div className="w-full h-[calc(100dvh-4rem)] order-1 col-span-3 lg:order-2">
        <Map id={mapId} />
      </div>
      <div className="flex flex-col mt-2 items-center order-2 lg:order-1 px-4">
        <RouteForm mapId={mapId} />
      </div>
    </div>
  );
};
