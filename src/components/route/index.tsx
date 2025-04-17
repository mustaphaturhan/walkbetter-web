"use client";
import { Map } from "../map";
import { RouteForm } from "./form";

export const Route = () => {
  const mapId = "main";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-16">
      <div className="w-full h-[800px] order-1 col-span-2 lg:order-2 rounded-lg overflow-hidden">
        <Map id={mapId} />
      </div>
      <div className="flex flex-col gap-2 order-2 lg:order-1">
        <h2 className="text-2xl font-bold">
          Try it out
          <br />
          <span className="text-amber-600">
            — add places you want to explore
          </span>
        </h2>
        <div className="mt-2">
          <RouteForm mapId={mapId} />
        </div>
      </div>
    </div>
  );
};
