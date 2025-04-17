import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { buildUrl } from "@/lib/url";
import { NominatimResponse } from "@/server/types";
import { getFromCache, setInCache } from "@/lib/redis";
import { consola } from "consola";

const NOMINATIM_CACHE_TTL_SECONDS = 120 * 60; // 2 hours

const generateReverseGeocodeCacheKey = (lat: number, lng: number): string => {
  return `reverse-geocode|lat:${lat.toFixed(5)}|lon:${lng.toFixed(5)}`;
};

type CachedReverseGeocodeResult = NominatimResponse & {
  corrected_lat?: string;
  corrected_lon?: string;
  image?: {
      thumb_256_url?: string;
      thumb_1024_url?: string;
  };
};

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
      const { lat, lng } = input;
      const key = generateReverseGeocodeCacheKey(lat, lng);
      const cachedResult = await getFromCache<CachedReverseGeocodeResult>(key);

      if (cachedResult) {
        return { source: "cache", result: cachedResult };
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
        const errorBody = await reverseRes.text();
        consola.error(
          `Nominatim fetch failed: ${reverseRes.status}`,
          errorBody
        );

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nominatim reverse geocode failed",
        });
      }

      const reverseData: NominatimResponse = await reverseRes.json();

      if (reverseData.error) {
        consola.error(`Nominatim API error: ${reverseData.error}`);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: reverseData.error,
        });
      }

      let thumb_256_url: string | undefined = undefined;
      let thumb_1024_url: string | undefined = undefined;
      const mapillaryToken = process.env.MAPILLARY_TOKEN;

      if (mapillaryToken) {
        const delta = 0.0005;
        const mapillaryUrl = buildUrl(
          "https://graph.mapillary.com",
          "/images",
          {
            fields: "id,thumb_256_url,thumb_1024_url",
            bbox: `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`,
            limit: 1,
            access_token: mapillaryToken,
          }
        );

        try {
          const mapillaryRes = await fetch(mapillaryUrl);
          if (mapillaryRes.ok) {
            const data = await mapillaryRes.json();
            thumb_256_url = data?.data?.[0]?.thumb_256_url ?? undefined;
            thumb_1024_url = data?.data?.[0]?.thumb_1024_url ?? undefined;
            consola.success("Mapillary fetch successful");
          } else {
            const errorBody = await mapillaryRes.text();
            consola.warn(
              "Mapillary fetch failed",
              mapillaryRes.status,
              errorBody
            );
            // Don't throw error, proceed without image
          }
        } catch (error) {
          consola.error("Mapillary fetch exception:", error);
        }
      } else {
        consola.warn("Missing MAPILLARY_TOKEN, skipping image fetch.");
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

      await setInCache(key, result, NOMINATIM_CACHE_TTL_SECONDS);

      return { source: "api", result };
    }),
});
