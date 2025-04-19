import { z } from "zod";
import { consola } from "consola";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { buildUrl } from "@/lib/url";
import { PhotonResponse } from "@/server/types";
import { PhotonPlace } from "@/types/common";
import { getFromCache, setInCache } from "@/lib/redis";

// touristic places are not changing that often, so we can cache for a while
// 2 hours for now, but we can increase it if needed
const PHOTON_CACHE_TTL_SECONDS = 120 * 60; // 2 hours

const searchInputSchema = z.object({
  query: z.string().min(2),
  lang: z.string().optional().default("en"),
  limit: z.number().optional().default(8),
  layer: z.string().optional(),
  osm_tag: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  bbox: z.string().optional(),
});

const nearbySearchInputSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  lang: z.string().optional().default("en"),
  limit: z.number().optional().default(1),
  radius: z.number().optional().default(50),
  layer: z.string().optional(),
  osm_tag: z.string().optional(),
});

export type PhotonNearbySearchInput = z.infer<typeof nearbySearchInputSchema>;
export type PhotonSearchInput = z.infer<typeof searchInputSchema>;

const generateSearchCacheKey = (input: PhotonSearchInput): string => {
  const parts = [
    `q:${input.query.toLowerCase()}`,
    `lang:${input.lang ?? "en"}`,
    `limit:${input.limit ?? 8}`,
    input.layer ? `layer:${input.layer}` : "",
    input.osm_tag ? `osm_tag:${input.osm_tag}` : "",
    input.lat !== undefined ? `lat:${input.lat}` : "",
    input.lon !== undefined ? `lon:${input.lon}` : "",
    input.bbox ? `bbox:${input.bbox}` : "",
  ];
  return `search|${parts.filter(Boolean).sort().join("|")}`;
};

const generateNearbyCacheKey = (input: PhotonNearbySearchInput): string => {
  const parts = [
    `lat:${input.lat}`,
    `lon:${input.lon}`,
    `lang:${input.lang ?? "en"}`,
    `limit:${input.limit ?? 1}`,
    input.radius !== undefined ? `radius:${input.radius}` : "",
    input.layer ? `layer:${input.layer}` : "",
    input.osm_tag ? `osm_tag:${input.osm_tag}` : "",
  ];
  return `nearby|${parts.filter(Boolean).sort().join("|")}`;
};

export const photonRouter = createTRPCRouter({
  search: publicProcedure.input(searchInputSchema).query(async ({ input }) => {
    const key = generateSearchCacheKey(input);

    const cachedResults = await getFromCache<PhotonPlace[]>(key);

    if (cachedResults) {
      return { source: "cache", results: cachedResults };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      q: input.query,
      lang: input.lang,
      limit: input.limit,
      layer: input.layer,
      osm_tag: input.osm_tag || "tourism",
      lat: input.lat,
      lon: input.lon,
      bbox: input.bbox,
    };

    Object.keys(params).forEach((k) => params[k] == null && delete params[k]);

    const url = buildUrl(process.env.PHOTON, "/api", params);
    consola.info(`Photon search URL: ${url}`);

    const res = await fetch(url);

    if (!res.ok) {
      const errorBody = await res.text();
      consola.error(`Photon search failed: ${res.status}`, errorBody);

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Photon fetch failed",
      });
    }

    const data: PhotonResponse = await res.json();
    consola.success("Photon search successful");

    const rawResults: PhotonPlace[] = data.features.map((f) => ({
      name: f.properties.name,
      city: f.properties.city,
      country: f.properties.country,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      osm_id: f.properties.osm_id,
      osm_type: f.properties.osm_type,
      type: f.properties.type,
      state: f.properties.state,
      postcode: f.properties.postcode,
    }));

    const results = Array.from(
      new Map(
        rawResults.map((item) => [`${item.osm_type}-${item.osm_id}`, item])
      ).values()
    );

    await setInCache(key, results, PHOTON_CACHE_TTL_SECONDS);

    return { source: "api", results };
  }),
  nearbySearch: publicProcedure
    .input(nearbySearchInputSchema)
    .query(async ({ input }: { input: PhotonNearbySearchInput }) => {
      const key = generateNearbyCacheKey(input);

      const cachedResults = await getFromCache<PhotonPlace[]>(key);

      if (cachedResults) {
        return { source: "cache", results: cachedResults };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: Record<string, any> = {
        lat: input.lat,
        lon: input.lon,
        lang: input.lang,
        limit: input.limit,
        radius: input.radius,
        layer: input.layer,
        osm_tag: input.osm_tag,
      };

      Object.keys(params).forEach((k) => params[k] == null && delete params[k]);

      const url = buildUrl(process.env.PHOTON, "/reverse", params);
      consola.info(`Photon reverse URL: ${url}`);

      const res = await fetch(url);

      if (!res.ok) {
        const errorBody = await res.text();
        consola.error(`Photon reverse failed: ${res.status}`, errorBody);

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Photon reverse geocode failed with status ${res.status}`,
        });
      }

      const data: PhotonResponse = await res.json();
      consola.success("Photon reverse geocode successful");

      const results: PhotonPlace[] = data.features.map((f) => ({
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        ...f.properties,
      }));

      await setInCache(key, results, PHOTON_CACHE_TTL_SECONDS);

      return { source: "api", results };
    }),
});
