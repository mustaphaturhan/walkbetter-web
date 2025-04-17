import { Hero } from "@/components/hero";
import { ClientMapProvider } from "@/components/map/client-provider";
import { Route } from "@/components/route";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="container m-auto py-12 px-6 2xl:px-4">
        <div>
          <Hero />
        </div>

        <ClientMapProvider>
          <Route />
        </ClientMapProvider>
      </main>
    </HydrateClient>
  );
}
