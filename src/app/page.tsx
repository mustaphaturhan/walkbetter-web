import { Hero } from "@/components/hero";
import { Map } from "@/components/map";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="container m-auto py-24">
      <Hero />
      <Separator className="my-12" />
      <div className="w-full h-[600]">
        <Map />
      </div>
    </main>
  );
}
