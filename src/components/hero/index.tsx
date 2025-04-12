import Image from "next/image";
import HeroImage from "../../assets/hero.webp";
import { Item, List } from "../ui/hero-list";

export const Hero = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <section className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="text-3xl font-extrabold lg:text-5xl leading-tight">
            <span className="text-amber-600">Walk</span> Smarter, <br />{" "}
            <span className="text-sky-600">Explore</span> Better.
          </h1>
          <h4 className="text-slate-700 text-xl">
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
        </div>
      </section>
      <section className="hidden lg:block">
        <div className="w-full flex flex-col items-end gap-4">
          <div className="rounded-md overflow-hidden shadow-sm">
            <Image src={HeroImage} alt="Hero image" placeholder="blur" />
          </div>
        </div>
      </section>
    </section>
  );
};
