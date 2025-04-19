"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PlaceInfoCard from "@/components/ui/place-info-card";
import {
  SearchLocation,
  SearchLocationRef,
} from "@/components/ui/search-location";
import { buildSelectedIdSet, cn, toOsmKey } from "@/lib/utils";
import { api } from "@/trpc/react";
import { PhotonPlace, PreviewPlace } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  MapPin,
  MapPinHouse,
  MapPinPlus,
  MapPinX,
  RouteIcon,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Map } from "../map";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { MapRef } from "react-map-gl/maplibre";

const schema = z.object({
  places: z.array(z.any()).min(3, { message: "At least 3 locations" }),
});

export const Route = () => {
  const mapRef = useRef<MapRef>(null);
  const [previewPlace, setPreviewPlace] = useState<PreviewPlace | null>(null);
  const searchLocationRef = useRef<SearchLocationRef>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<PhotonPlace[] | null>(null);
  const [shouldHideRoutes, setShouldHideRoutes] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { places: [{}, {}, {}] },
  });

  const places = useFieldArray({ control: form.control, name: "places" });
  const placesValue = useWatch({ control: form.control, name: "places" });
  const filledPlacesValues = placesValue.filter((place) => place.name);
  const firstPlace = placesValue[0];

  const nearbySearch = api.photon.nearbySearch.useQuery(
    {
      lat: firstPlace?.lat,
      lon: firstPlace?.lon,
      limit: 20,
      radius: 50,
      osm_tag: "tourism",
    },
    {
      enabled: !!firstPlace?.lat && !!firstPlace?.lon,
      staleTime: 1000 * 60 * 30,
    }
  );

  useEffect(() => {
    if (nearbySearch.status === "error") {
      setNearbyPlaces(null);
      return;
    }

    if (nearbySearch.status !== "success" || !nearbySearch.data?.results)
      return;

    const selectedIds = buildSelectedIdSet(placesValue);

    const filteredResults = nearbySearch.data.results.filter(
      (p) => !selectedIds.has(toOsmKey(p))
    );

    setNearbyPlaces(filteredResults || null);
  }, [nearbySearch.data, nearbySearch.status, placesValue]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data);
  };

  const handleAddPlace = (place: PreviewPlace) => {
    setShouldHideRoutes(false);

    const emptyIndex = placesValue.findIndex((p) => !p?.name);
    if (emptyIndex !== -1) {
      places.update(emptyIndex, place);
    } else {
      places.append(place);
    }

    setPreviewPlace(null);
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      <div className="flex flex-col p-4 w-full h-full max-w-[420px] z-10 shadow-xl">
        <div className="flex flex-col gap-2 h-full">
          <div className="flex items-center gap-3 mb-2">
            {shouldHideRoutes && (
              <Button
                aria-label="Go back"
                variant="outline"
                size="sm"
                onClick={() => setShouldHideRoutes(false)}
              >
                <ArrowLeft />
              </Button>
            )}
            <h1 className="text-2xl font-bold">
              {shouldHideRoutes ? "Add new place" : "Plan your route"}
            </h1>
          </div>

          {!previewPlace || !previewPlace.ready ? (
            <SearchLocation
              onSelect={(place) => {
                mapRef.current?.flyTo({
                  center: [place.lon, place.lat],
                  zoom: 15,
                  duration: 1000,
                });

                setPreviewPlace(place);
              }}
              ref={searchLocationRef}
              onFocus={() => setShouldHideRoutes(true)}
              initialOptions={nearbyPlaces}
              isLoadingInitialOptions={nearbySearch.isLoading}
              shouldShowResults={shouldHideRoutes}
            />
          ) : (
            <div className="mt-1 rounded-md border p-3 items-center">
              <PlaceInfoCard
                place={previewPlace}
                onClose={() => setPreviewPlace(null)}
                onSelect={handleAddPlace}
              />
            </div>
          )}
          <div className={cn({ hidden: shouldHideRoutes })}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {places.fields.map((field, i) => {
                  const isFirstItem = i === 0;
                  const isLastItem = i === places.fields.length - 1;
                  const isStop = !isFirstItem && !isLastItem;
                  return (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`places.${i}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="sr-only">
                            {isFirstItem ? "Starting place" : "Stop"}
                          </FormLabel>
                          <FormControl>
                            <Button
                              className={cn(
                                "text-slate-800 dark:text-slate-200 w-full justify-between shadow-none",
                                isFirstItem &&
                                  "text-sky-800 dark:text-sky-200 border-b-0 rounded-b-none",
                                isLastItem &&
                                  "text-amber-800 dark:text-amber-200 border-t-0 rounded-t-none",
                                !isFirstItem && !isLastItem && "rounded-none"
                              )}
                              onClick={() => searchLocationRef.current?.focus()}
                              variant="outline"
                              size="lg"
                              disabled={
                                !isFirstItem &&
                                !form.getValues(`places.${i - 1}.name`)
                              }
                            >
                              <span className="inline-flex items-center gap-2">
                                {isFirstItem && <MapPinHouse />}
                                {isLastItem && <MapPinX />}
                                {isStop && <MapPin />}
                                {field.value?.name
                                  ? field.value.name
                                  : isFirstItem
                                  ? "Where do you want to start?"
                                  : "Search a place"}
                              </span>
                            </Button>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}

                <div className="flex flex-col gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => places.append({})}
                    disabled={!filledPlacesValues.length}
                  >
                    <span className="inline-flex items-center gap-2">
                      <MapPinPlus />
                      {!filledPlacesValues.length
                        ? "Add more after selecting places"
                        : "Add a stop"}
                    </span>
                  </Button>

                  <Button disabled={!filledPlacesValues.length} type="submit">
                    <RouteIcon />
                    Find the best route
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="w-full h-full">
        {/* TODO: add a loading state */}
        <Suspense fallback={null}>
          <Map
            onLoad={(map) => (mapRef.current = map)}
            previewPlace={previewPlace}
            handleSetPreviewPlace={setPreviewPlace}
            selectedPlaces={filledPlacesValues}
            onSelectPreviewPlace={handleAddPlace}
          />
        </Suspense>
      </div>
    </div>
  );
};
