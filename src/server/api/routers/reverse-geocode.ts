import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { LRUCache } from "lru-cache";
import { TRPCError } from "@trpc/server";
import { buildUrl } from "@/lib/url";
import { NominatimResponse } from "@/server/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5,
});

export const reverseGeocodeRouter = createTRPCRouter({
  byCoords: publicProcedure
    .input(
      z.object({
        lat: z.preprocess(
          (val) => (typeof val === "string" ? parseFloat(val) : val),
          z.number()
        ),
        lng: z.preprocess(
          (val) => (typeof val === "string" ? parseFloat(val) : val),
          z.number()
        ),
      })
    )
    .query(async ({ input }) => {
      const mapillaryToken = process.env.MAPILLARY_TOKEN;

      if (!mapillaryToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Missing Mapillary token",
        });
      }

      const { lat, lng } = input;
      const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;

      if (cache.has(key)) {
        return { source: "cache", result: cache.get(key) };
      }

      const reverseUrl = buildUrl(process.env.NOMINATIM, "/reverse", {
        lat,
        lon: lng,
        format: "jsonv2",
        addressdetails: 1,
        extratags: 1,
      });

      const reverseRes = await fetch(reverseUrl, {
        headers: {
          "User-Agent": process.env.USER_AGENT,
          Referer: "https://walkbetter.app",
        },
      });

      if (!reverseRes.ok) {
        const isDev = process.env.NODE_ENV === "development";
        const errorBody = await reverseRes.text();

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: isDev
            ? `Nominatim failed: ${reverseRes.status}: ${errorBody}`
            : "Nominatim failed",
        });
      }

      const reverseData: NominatimResponse = await reverseRes.json();

      if (reverseData.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: reverseData.error,
        });
      }

      const delta = 0.0005;
      let thumb_256_url: string | undefined = undefined;
      let thumb_1024_url: string | undefined = undefined;

      const mapillaryUrl = buildUrl("https://graph.mapillary.com", "/images", {
        fields: "id,thumb_256_url,thumb_1024_url",
        bbox: `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`,
        limit: 1,
        access_token: mapillaryToken,
      });

      const mapillaryRes = await fetch(mapillaryUrl);

      if (mapillaryRes.ok) {
        const data = await mapillaryRes.json();
        thumb_256_url = data?.data?.[0]?.thumb_256_url ?? undefined;
        thumb_1024_url = data?.data?.[0]?.thumb_1024_url ?? undefined;
      } else {
        const errorBody = await mapillaryRes.text();
        console.error("Mapillary fetch failed", errorBody);
      }

      const result = {
        ...reverseData,
        corrected_lat: reverseData.lat,
        corrected_lon: reverseData.lon,
        image: {
          thumb_256_url,
          thumb_1024_url,
        },
      };

      cache.set(key, result);

      return { source: "api", result };
    }),
});
