import { Link, useRouterState } from "@tanstack/react-router";
import { TrendingDown } from "lucide-react";
import { locationFromSearch } from "@/data/product";

export function SiteHeader() {
  const loc = useRouterState({
    select: (state) => locationFromSearch(state.location.search as Record<string, unknown>),
  });

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <Link to="/" search={{ loc }} className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-fg">
            <TrendingDown className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">GameTrack</span>
        </Link>
        <span className="hidden text-sm text-muted sm:inline">Hardware Price Tracker</span>
      </div>
    </header>
  );
}