import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { LRUCache } from "lru-cache";
import { buildUrl } from "@/lib/url";
import { PhotonResponse } from "@/server/types";
import { PhotonPlace } from "@/types/common";

const cache = new LRUCache<string, PhotonPlace[]>({
  max: 500,
  ttl: 1000 * 60 * 5,
});

export const photonRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
        lang: z.string().optional(),
        layer: z.string().optional(),
        osm_tag: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const key = [
        input.query.toLowerCase(),
        input.lang ?? "en",
        input.layer ?? "",
        input.osm_tag ?? "",
      ].join("|");

      if (cache.has(key)) {
        return { source: "cache", results: cache.get(key) };
      }

      const url = buildUrl(process.env.PHOTON, "/api", {
        q: input.query,
        lang: input.lang ?? "en",
        limit: 8,
        layer: input.layer ?? [],
        ...(input.osm_tag ? { osm_tag: input.osm_tag } : {}),
      });

      const res = await fetch(url);

      if (!res.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Photon fetch failed",
        });
      }

      const data: PhotonResponse = await res.json();

      const rawResults: PhotonPlace[] = data.features.map((f) => ({
        name: f.properties.name,
        city: f.properties.city,
        country: f.properties.country,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        osm_id: f.properties.osm_id,
        osm_type: f.properties.osm_type,
        type: f.properties.type,
      }));

      // Deduplicate by osm_type + osm_id
      const results = Array.from(
        new Map(
          rawResults.map((item) => [`${item.osm_type}-${item.osm_id}`, item])
        ).values()
      );

      cache.set(key, results);

      return { source: "api", results };
    }),
});
