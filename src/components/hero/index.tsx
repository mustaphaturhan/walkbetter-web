import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Item, List } from "../ui/hero-list";
import Link from "next/link";

export const Hero = () => {
  return (
    <section>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold lg:text-5xl">
          <span className="text-amber-600">Walk</span> Smarter, <br />{" "}
          <span className="text-sky-600">Explore</span> Better.
        </h1>
        <h4 className="max-w-[500px]">
          Build your perfect walking adventure through the city — hit every
          must-see spot without retracing your steps.
        </h4>
        <List>
          <Item
            icon="🗺️"
            title="Discover must-see spots in any city before your trip"
            description="Plan ahead with curated landmarks and attractions — no research overload."
          />
          <Item
            icon="🚶‍♀️"
            title="Get an optimized walking route that avoids backtracking"
            description="Save time by exploring every key place without walking the same street twice."
          />
        </List>
        <div className="flex mt-4 gap-2">
          <Button
            className="text-sky-800 font-bold"
            variant="outline"
            size="lg"
            asChild
          >
            <Link href="/trip/generate">
              Start with planning
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/explore">Explore routes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
