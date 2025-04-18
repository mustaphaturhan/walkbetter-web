"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-provider";
import { ArrowRight } from "lucide-react";
export function Header() {
  const pathname = usePathname();

  return (
    <header className="z-30 h-16 px-4 w-full shadow-xs border-b flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg text-amber-600">
          Walk/Better
        </Link>
        <nav className="hidden md:flex gap-2">
          <Button
            variant="ghost"
            color={pathname === "/explore" ? "navigation-active" : "navigation"}
            asChild
          >
            <Link href="/explore">Explore</Link>
          </Button>
          {pathname !== "/trip/generate" && (
            <Button
              className="text-sky-800 font-bold border-sky-800 dark:border-sky-200 dark:text-sky-200"
              variant="outline"
              asChild
            >
              <Link href="/trip/generate">
                Plan your trip
                <ArrowRight />
              </Link>
            </Button>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline">Login</Button>
      </div>
    </header>
  );
}
