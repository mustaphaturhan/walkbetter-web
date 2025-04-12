import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { reverseGeocodeRouter } from "./routers/reverse-geocode";
import { photonRouter } from "./routers/photon";

export const appRouter = createTRPCRouter({
  reverse: reverseGeocodeRouter,
  photon: photonRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
