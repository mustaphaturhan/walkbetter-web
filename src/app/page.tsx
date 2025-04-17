import { Hero } from "@/components/hero";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="container m-auto py-24 px-6 2xl:px-4">
        <Hero />
      </main>
    </HydrateClient>
  );
}
