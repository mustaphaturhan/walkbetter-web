import { ClientMapProvider } from "@/components/map/client-provider";
import { Route } from "@/components/route";
import { HydrateClient } from "@/trpc/server";

export default function TripGeneratePage() {
  return (
    <HydrateClient>
      <ClientMapProvider>
        <main className="">
          <Route />
        </main>
      </ClientMapProvider>
    </HydrateClient>
  );
}
