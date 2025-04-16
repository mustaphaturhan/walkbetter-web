"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PlaceInfoCard from "@/components/ui/place-info-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchLocation } from "@/components/ui/search-location";
import { useMapStore } from "@/stores/map.store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronsUpDown,
  MapPin,
  MapPinHouse,
  MapPinPlus,
  MapPinX,
  Route,
} from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useRouteStore } from "@/stores/route.store";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PhotonPlace } from "@/types/common";
import { api } from "@/trpc/react";

const schema = z.object({
  places: z.array(z.any()).min(3, { message: "At least 3 locations" }),
});

export interface RouteFormProps {
  mapId: string;
}

export function RouteForm({ mapId }: RouteFormProps) {
  const previewPlace = useMapStore((s) => s.previewPlaces[mapId] ?? null);
  const setPreviewPlace = useMapStore((s) => s.setPreviewPlace);
  const setLocations = useRouteStore((s) => s.setLocations);
  const [nearbyPlaces, setNearbyPlaces] = useState<PhotonPlace[] | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      places: [{}, {}, {}],
    },
  });
  const places = useFieldArray({ control: form.control, name: "places" });
  const watchedPlaces = useWatch({ control: form.control, name: "places" });

  const nearbySearchQuery = api.photon.nearbySearch.useQuery(
    {
      lat: watchedPlaces[0].lat,
      lon: watchedPlaces[0].lon,
      limit: 20,
      radius: 50,
      osm_tag: "tourism",
    },
    {
      enabled: !!watchedPlaces[0].lat && !!watchedPlaces[0].lon,
      staleTime: 1000 * 60 * 5,
    }
  );

  useEffect(() => {
    if (
      nearbySearchQuery.status === "success" &&
      nearbySearchQuery.data?.results
    ) {
      const selectedIds = new Set(
        watchedPlaces
          ?.filter((p) => p?.osm_id)
          .map((p) => `${p.osm_type}-${p.osm_id}`) ?? []
      );

      const filteredResults = nearbySearchQuery.data.results.filter(
        (p) => !selectedIds.has(`${p.osm_type}-${p.osm_id}`)
      );

      setNearbyPlaces(filteredResults || null);
      return;
    }

    if (nearbySearchQuery.status === "error") {
      setNearbyPlaces(null);
    }
  }, [nearbySearchQuery.data, nearbySearchQuery.status, watchedPlaces]);

  // 🚨 sync form.locations -> zustand
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.places) {
        const filteredPlaces = value.places.filter((place) => place.name);
        setLocations(filteredPlaces);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setLocations]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data);
  };

  return (
    <div className="border p-4 rounded-md">
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "text-slate-800 w-full justify-between shadow-none",
                              isFirstItem &&
                                "text-sky-800 border-b-0 rounded-b-none",
                              isLastItem &&
                                "text-amber-800 border-t-0 rounded-t-none",
                              !isFirstItem && !isLastItem && "rounded-none"
                            )}
                            variant="outline"
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
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <SearchLocation
                          onSelect={(place) => places.update(i, place)}
                          selectedValue={field.value}
                          mapId={mapId}
                          initialOptions={isFirstItem ? null : nearbyPlaces}
                          isLoadingInitialOptions={nearbySearchQuery.isLoading}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

          {previewPlace && previewPlace.ready && (
            <div className="mt-4">
              <PlaceInfoCard
                smallImgUrl={previewPlace?.image?.thumb_256_url}
                bigImgUrl={previewPlace?.image?.thumb_1024_url}
                place={previewPlace}
                footer={
                  <>
                    <Button
                      onClick={() => {
                        form.setValue("places.0", previewPlace);
                        setPreviewPlace(mapId, null);
                      }}
                      size="sm"
                    >
                      <MapPinHouse />
                      Select as a starting point
                    </Button>
                    <Button
                      onClick={() => {
                        setPreviewPlace(mapId, null);
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  </>
                }
              />
            </div>
          )}

          <div className="flex gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => places.append({})}
              disabled={!watchedPlaces.every((place) => place.name)}
            >
              <span className="inline-flex items-center gap-2">
                <MapPinPlus />
                {!watchedPlaces.every((place) => place.name)
                  ? "Add more after selecting places"
                  : "Add a stop"}
              </span>
            </Button>

            <Button type="submit">
              <Route />
              Find the best route
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
