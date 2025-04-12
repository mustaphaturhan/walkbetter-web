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
import { ChevronsUpDown, MapPinHouse } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  locations: z.array(z.any()).min(3, { message: "At least 3 locations" }),
});

export interface RouteFormProps {
  mapId: string;
}

export function RouteForm({ mapId }: RouteFormProps) {
  const previewPlace = useMapStore((s) => s.previewPlaces[mapId] ?? null);
  const setPreviewPlace = useMapStore((s) => s.setPreviewPlace);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      locations: [],
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data);
  };

  return (
    <div className="border p-4 rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="locations.0"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="sr-only">Starting point</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className="text-sky-600 w-full justify-between"
                        variant="outline"
                      >
                        <span className="inline-flex items-center gap-2">
                          <MapPinHouse />
                          {field.value
                            ? field.value.name
                            : "Search a starting point"}
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <SearchLocation
                      onSelect={(place) => {
                        form.setValue("locations.0", place);
                      }}
                      selectedValue={field.value}
                      mapId={mapId}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <Button type="submit">Submit</Button> */}
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
                        form.setValue("locations.0", previewPlace);
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
        </form>
      </Form>
    </div>
  );
}
