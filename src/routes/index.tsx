import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { ChangeMark, ReviewNote } from "@/components/change-mark";
import { SiteHeader } from "@/components/site-header";
import {
  advise,
  alertStorageKey,
  cheaperThanToday,
  delivered,
  locationFromSearch,
  locations,
  money,
  parseAlert,
  products,
  rankOffers,
  sameAsToday,
} from "@/data/product";

function historyLine(values: number[], target: number | null, today: number) {
  const prices = target == null ? [...values, today] : [...values, target, today];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const low = Math.min(...values);
  const width = 320;
  const height = 56;
  const y = (value: number) => height - 6 - ((value - min) / (max - min || 1)) * (height - 12);
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: y(value),
    low: value === low,
  }));
  return {
    points,
    line: points.map((point) => `${point.x},${point.y}`).join(" "),
    targetY: target == null ? null : y(target),
    todayY: y(today),
  };
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({ loc: locationFromSearch(search) }),
  component: Home,
});

function Home() {
  const { loc } = Route.useSearch();
  const navigate = useNavigate();
  const location = locations.find((item) => item.id === loc) ?? locations[0];
  const [alerts, setAlerts] = useState<Record<string, { on: boolean; target: string }>>({});

  useEffect(() => {
    const next: Record<string, { on: boolean; target: string }> = {};
    for (const item of products) {
      const saved = parseAlert(localStorage.getItem(alertStorageKey(item.id)));
      if (saved) next[item.id] = saved;
    }
    setAlerts(next);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Sample catalog · not live prices</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tracked hardware</h1>
            <ReviewNote />
            {import.meta.env.DEV ? (
              <p className="mt-2 text-sm">
                <Link to="/first" className="text-accent">
                  Open the first version
                </Link>
              </p>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="size-4 text-accent" />
            <select
              value={location.id}
              onChange={(e) =>
                navigate({ to: "/", search: { loc: e.target.value }, replace: true })
              }
              className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-fg"
              aria-label="Delivery location"
            >
              {locations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.zip}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="mt-6 grid gap-4">
          {products.map((item) => {
            const ranked = rankOffers(item.offers, location.tax);
            const best = ranked[0];
            const advice = advise(item, location.tax);
            const saved = alerts[item.id] ?? { on: true, target: "700" };
            const targetNumber = saved ? Number(saved.target) : NaN;
            const showAlert = saved?.on === true && Number.isFinite(targetNumber) && targetNumber > 0;
            return (
              <li key={item.id}>
                <Link
                  to="/p/$productId"
                  params={{ productId: item.id }}
                  search={{ loc: location.id }}
                  className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
                >
                  <span className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span className="relative sm:shrink-0">
                    <img
                      src={item.image}
                      alt=""
                      className="h-24 w-full rounded-xl border border-line object-cover sm:h-20 sm:w-32"
                    />
                    <span className="absolute top-2 left-2">
                      <ChangeMark kind="new" className="" />
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold">{item.name}</span>
                    <span className="mt-1 block text-sm text-muted">{item.specs}</span>
                    <span className="mt-1 block text-sm text-muted">
                      Desk space: {item.size[0].value.split(",")[0]} ·{" "}
                      {item.size[0].value.split("·")[1]?.trim()} with stand
                      <ChangeMark kind="new" />
                    </span>
                    {showAlert ? (
                      <span className="mt-2 block text-sm text-accent">
                        Alert under ${saved.target} · today's {money(best.total)} is{" "}
                        {best.total <= targetNumber ? "already at or below it" : "above it"}
                        <ChangeMark kind="new" />
                      </span>
                    ) : null}
                    <span className="mt-1 block text-sm text-muted">
                      Recommendation: {advice.title}
                      <ChangeMark kind="new" />
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {advice.reason}
                      <ChangeMark kind="new" />
                    </span>
                  </span>
                  <span className="sm:shrink-0 sm:text-right">
                    <span className="block text-2xl font-semibold">{money(best.total)}</span>
                    <span className="mt-1 block text-sm text-muted">
                      Delivered in {location.label} · {best.site}
                      <ChangeMark kind="updated" />
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {cheaperThanToday(item, best.total, location.tax)}
                      <ChangeMark kind="updated" />
                    </span>
                    {sameAsToday(item, best.total, location.tax) ? (
                      <span className="mt-1 block text-sm text-muted">
                        {sameAsToday(item, best.total, location.tax)}
                        <ChangeMark kind="updated" />
                      </span>
                    ) : null}
                  </span>
                  </span>
                  <span>
                    <span className="text-sm text-muted">
                      Price history
                      <ChangeMark kind="updated" />
                    </span>
                    {(() => {
                      const lowPoint = item.history.reduce((lowest, point) =>
                        delivered(point.shelf, 0, location.tax) <
                        delivered(lowest.shelf, 0, location.tax)
                          ? point
                          : lowest,
                      );
                      const [year, month, day] = lowPoint.date.split("-").map(Number);
                      const lowWhen = new Date(year, month - 1, day).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      const history = historyLine(
                        item.history.map((point) => delivered(point.shelf, 0, location.tax)),
                        showAlert ? targetNumber : null,
                        best.total,
                      );
                      const low = history.points.find((point) => point.low);
                      return (
                        <>
                          <svg
                            viewBox="0 0 320 56"
                            className="mt-2 h-14 w-full text-accent"
                            role="img"
                            aria-label="Sample delivered price history"
                          >
                            <line
                              x1="0"
                              x2="320"
                              y1={history.todayY}
                              y2={history.todayY}
                              stroke="var(--color-fg)"
                              strokeWidth="1"
                            />
                            <polyline
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              points={history.line}
                            />
                            {history.targetY != null ? (
                              <line
                                x1="0"
                                x2="320"
                                y1={history.targetY}
                                y2={history.targetY}
                                stroke="var(--color-warn)"
                                strokeDasharray="4 4"
                              />
                            ) : null}
                            {low ? <circle cx={low.x} cy={low.y} r="4" fill="currentColor" /> : null}
                          </svg>
                          <span className="mt-1 block text-sm text-muted">
                            Dot is the {lowWhen} low,{" "}
                            {money(delivered(lowPoint.shelf, 0, location.tax))} delivered in{" "}
                            {location.label}.
                          </span>
                          <span className="mt-1 block text-sm text-muted">
                            White line is today's price.
                            <ChangeMark kind="new" />
                          </span>
                          {showAlert ? (
                            <span className="mt-1 block text-sm text-muted">
                              Dashed line is your ${saved.target} alert.
                              <ChangeMark kind="new" />
                            </span>
                          ) : null}
                        </>
                      );
                    })()}
                  </span>
                  <span>
                    <span className="text-sm text-muted">
                      Cheapest right now
                      <ChangeMark kind="updated" />
                    </span>
                    <ol className="mt-2 flex flex-col gap-2">
                      {ranked.slice(0, 3).map((offer, index) => (
                        <li key={offer.site} className="flex items-start justify-between gap-3 text-sm">
                          <span>
                            <span className="block">
                              {index + 1}. {offer.site}
                            </span>
                            <span className="block text-muted">
                              {money(offer.shelf)} + {money(offer.taxAmount)} tax + {money(offer.shipping)}{" "}
                              ship
                            </span>
                          </span>
                          <span className="font-medium">{money(offer.total)}</span>
                        </li>
                      ))}
                    </ol>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
