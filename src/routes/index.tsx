import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell,
  LineChart as LineChartIcon,
  MapPin,
  Search,
  Star,
  TrendingDown,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  delivered,
  history,
  locations,
  money,
  offers,
  product,
  ranges,
} from "@/data/product";

export const Route = createFileRoute("/")({ component: Home });

const TODAY = new Date("2026-10-29T12:00:00");

function Home() {
  const [locationId, setLocationId] = useState("ca");
  const [rangeId, setRangeId] = useState<(typeof ranges)[number]["id"]>("1y");
  const [alertOn, setAlertOn] = useState(true);
  const [target, setTarget] = useState("700");

  const location = locations.find((l) => l.id === locationId) ?? locations[0];

  const ranked = useMemo(() => {
    return offers
      .map((offer) => ({
        ...offer,
        total: delivered(offer.shelf, offer.shipping, location.tax),
        taxAmount: offer.shelf * location.tax,
      }))
      .sort((a, b) => a.total - b.total);
  }, [location]);

  const best = ranked[0];
  const top3 = ranked.slice(0, 3);

  const series = useMemo(() => {
    const range = ranges.find((r) => r.id === rangeId) ?? ranges[2];
    const cutoff = TODAY.getTime() - range.days * 86_400_000;
    return history
      .filter((point) => new Date(point.date).getTime() >= cutoff)
      .map((point) => ({
        label: new Date(point.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        total: Math.round(delivered(point.shelf, 0, location.tax)),
        shelf: point.shelf,
      }));
  }, [location, rangeId]);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-fg">
              <TrendingDown className="size-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">GameTrack</span>
          </div>
          <span className="hidden text-sm text-muted sm:inline">Hardware Price Tracker</span>
          <div className="ml-auto flex items-center gap-3 text-sm text-muted">
            <span className="hidden items-center gap-1 sm:flex">
              <Search className="size-4" /> Search
            </span>
            <span className="flex items-center gap-1">
              <Bell className="size-4" /> Alerts
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section>
          <p className="text-sm text-muted">Demo listing · sample retailer prices</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted">{product.specs}</p>
          <p className="text-sm text-muted">{product.ports}</p>
          <img
            src="/monitor.jpg"
            alt="32-inch OLED gaming monitor on a dark studio background"
            className="mt-6 w-full rounded-2xl border border-line bg-surface object-cover"
          />
        </section>

        <section className="flex flex-col gap-4">
          <article className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Estimated total ({location.label})</p>
                <p className="text-5xl font-semibold tracking-tight">{money(best.total)}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="size-4 text-accent" />
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-fg"
                  aria-label="Delivery location"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label} · {loc.zip}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-3 text-sm text-muted">
              Lowest of the tracked sites, including estimated sales tax (
              {(location.tax * 100).toFixed(2)}%) and shipping. Estimate only.
            </p>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-sm font-medium text-muted">Cheapest websites right now</h2>
            <ol className="mt-3 flex flex-col gap-3">
              {top3.map((offer, index) => (
                <li
                  key={offer.site}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-3"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bg text-sm font-semibold text-accent">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{offer.site}</p>
                    <p className="text-sm text-muted">
                      {money(offer.shelf)} + {money(offer.taxAmount)} tax + {money(offer.shipping)}{" "}
                      ship
                    </p>
                  </div>
                  <p className="text-lg font-semibold">{money(offer.total)}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-medium">
                <LineChartIcon className="size-4 text-accent" />
                Price history
              </h2>
              <div className="flex rounded-lg border border-line p-1">
                {ranges.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setRangeId(range.id)}
                    className={
                      rangeId === range.id
                        ? "rounded-md bg-accent px-3 py-1 text-sm font-medium text-accent-fg"
                        : "rounded-md px-3 py-1 text-sm text-muted"
                    }
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-line)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    width={56}
                    tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={["dataMin - 30", "dataMax + 30"]}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-line)",
                      borderRadius: 12,
                      color: "var(--color-fg)",
                    }}
                    formatter={(value) => [money(Number(value)), "Delivered"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-sm text-muted">
              Each point is the lowest shelf price recorded that day, shown as an estimated
              delivered total for {location.label}. Not a forecast.
            </p>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-medium">Sale outlook · moderate confidence</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Comparable OLED monitors have often been 15–25% below their price from 30 days
              earlier during Black Friday. On today’s shelf prices, that pattern would land near{" "}
              {money(best.total * 0.75)}–{money(best.total * 0.85)} delivered in {location.label}.
            </p>
            <p className="mt-2 text-sm text-dim">
              Based on past patterns for similar models. This exact model has one year of history.
              Not a guarantee.
            </p>
          </article>

          <article className="rounded-2xl border border-warn bg-warn-bg p-5">
            <h2 className="flex items-center gap-2 font-medium text-warn">
              <Star className="size-4" />
              Recommendation: Wait · moderate confidence
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg">
              Black Friday is about four weeks away. Similar monitors have often dropped in that
              window, and today’s {money(best.total)} total is not near the lows already on the
              chart.
            </p>
          </article>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-accent" />
            <label className="text-sm" htmlFor="target">
              Notify me if the delivered total drops below
            </label>
            <span className="text-sm text-muted">$</span>
            <input
              id="target"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))}
              className="w-24 rounded-lg border border-line bg-surface-2 px-3 py-2 text-fg"
            />
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={alertOn}
            onClick={() => setAlertOn((on) => !on)}
            className={
              alertOn
                ? "relative h-7 w-12 rounded-full bg-accent"
                : "relative h-7 w-12 rounded-full bg-line"
            }
          >
            <span
              className={
                alertOn
                  ? "absolute top-1 left-6 size-5 rounded-full bg-accent-fg"
                  : "absolute top-1 left-1 size-5 rounded-full bg-fg"
              }
            />
            <span className="sr-only">{alertOn ? "Alerts on" : "Alerts off"}</span>
          </button>
        </section>
      </main>
    </div>
  );
}
