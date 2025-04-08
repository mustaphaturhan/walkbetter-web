import { RouteOptimizerForm } from "@/components/forms/route-optimizer-form";
import { Map } from "@/components/ui/map";

export default function Home() {
  return (
    <main className="container m-auto grid grid-cols-2 gap-12 my-24 p-6 rounded-md">
      <aside className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold lg:text-4xl">
          Walk Smarter. Explore Better.
        </h1>
        <h2 className="text-slate-700">
          Build your perfect walking adventure through the city — hit every
          must-see spot without retracing your steps.
        </h2>
        <RouteOptimizerForm />
      </aside>
      <main>
        <div className="w-full">
          <div className="rounded-md overflow-hidden h-[600] shadow-sm">
            <Map />
          </div>
          {/* <Heading size="4xl">Test</Heading> */}
        </div>
      </main>
    </main>
  );
}
