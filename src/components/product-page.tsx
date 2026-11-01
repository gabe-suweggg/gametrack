import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  LineChart as LineChartIcon,
  MapPin,
  Star,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { advise, alertStorageKey, chartDrop, delivered, locations, money, nextSale, parseAlert, ranges, rankOffers, type Product } from "@/data/product";
import { ChangeMark, ReviewNote } from "@/components/change-mark";
import { SiteHeader } from "@/components/site-header";

const TODAY = new Date(2026, 9, 29, 12);

function chartDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function ProductPage({ item, locationId }: { item: Product; locationId: string }) {
  const navigate = useNavigate();
  const [rangeId, setRangeId] = useState<(typeof ranges)[number]["id"]>("1y");
  const [alertOn, setAlertOn] = useState(true);
  const [target, setTarget] = useState("700");
  const [alertReady, setAlertReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(alertStorageKey(item.id));
    const saved = parseAlert(raw);
    if (saved) {
      setAlertOn(saved.on);
      setTarget(saved.target);
    }
    setAlertReady(true);
  }, [item.id]);

  useEffect(() => {
    if (!alertReady) return;
    localStorage.setItem(alertStorageKey(item.id), JSON.stringify({ on: alertOn, target }));
  }, [alertOn, alertReady, item.id, target]);

  const location = locations.find((l) => l.id === locationId) ?? locations[0];

  const ranked = useMemo(
    () => rankOffers(item.offers, location.tax),
    [item, location],
  );

  const lowPoint = item.history.reduce((lowest, point) =>
    delivered(point.shelf, 0, location.tax) < delivered(lowest.shelf, 0, location.tax)
      ? point
      : lowest,
  );
  const lowTotal = Math.round(delivered(lowPoint.shelf, 0, location.tax));
  const lowLabel = `Low ${money(delivered(lowPoint.shelf, 0, location.tax))} · ${chartDate(
    lowPoint.date,
  ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  const best = ranked[0];
  const top3 = ranked.slice(0, 3);

  const series = useMemo(() => {
    const range = ranges.find((r) => r.id === rangeId) ?? ranges[2];
    const cutoff = TODAY.getTime() - range.days * 86_400_000;
    return item.history
      .filter((point) => chartDate(point.date).getTime() >= cutoff)
      .map((point) => ({
        label: chartDate(point.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        total: Math.round(delivered(point.shelf, 0, location.tax)),
        shelf: point.shelf,
      }));
  }, [item, location, rangeId]);

  const lowInView = series.some((point) => point.total === lowTotal);

  const advice = advise(item, location.tax);
  const drop = chartDrop(item);
  const adviceClass =
    advice.tone === "wait"
      ? "rounded-2xl border border-warn bg-warn-bg p-5"
      : advice.tone === "buy"
        ? "rounded-2xl border border-accent bg-surface p-5"
        : "rounded-2xl border border-line bg-surface p-5";

  const targetNumber = Number(target);
  const targetKnown = alertOn && Number.isFinite(targetNumber) && targetNumber > 0;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section>
          <p className="text-sm text-muted">Demo listing · sample retailer prices</p>
          <ReviewNote />
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {item.name}
          </h1>
          <p className="mt-2 text-sm text-muted">{item.specs}</p>
          <p className="text-sm text-muted">{item.ports}</p>
          <img
            src={item.image}
            alt="32-inch OLED gaming monitor on a dark studio background"
            className="mt-6 w-full rounded-2xl border border-line bg-surface object-cover"
          />
          <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-sm font-medium text-muted">
              Specifications
              <ChangeMark kind="new" />
            </h2>
            <dl className="mt-3 grid gap-2">
              {item.details.map((row) => (
                <div key={row.label} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 text-sm">
                  <dt className="text-muted">{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-dim">Manufacturer specifications. Not measured by GameTrack.</p>
          </div>
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
                  onChange={(e) =>
                    navigate({
                      to: "/p/$productId",
                      params: { productId: item.id },
                      search: { loc: e.target.value },
                      replace: true,
                    })
                  }
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
            {ranked[1] ? (
              <p className="mt-2 text-sm text-fg">
                {best.shelf > ranked[1].shelf
                  ? `${best.site} lists a higher shelf price than ${ranked[1].site}, but the delivered total is ${money(ranked[1].total - best.total)} lower.`
                  : `${best.site} is ${money(ranked[1].total - best.total)} less than ${ranked[1].site} after tax and shipping.`}
                <ChangeMark kind="new" />
              </p>
            ) : null}
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
                <ChangeMark kind="updated" />
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
                    domain={[
                      (dataMin: number) =>
                        Math.floor(Math.min(dataMin, targetKnown ? targetNumber : dataMin) - 30),
                      (dataMax: number) =>
                        Math.ceil(Math.max(dataMax, targetKnown ? targetNumber : dataMax) + 30),
                    ]}
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
                  {lowInView ? (
                    <ReferenceLine
                      y={lowTotal}
                      stroke="var(--color-warn)"
                      strokeDasharray="4 4"
                      label={{
                        value: lowLabel,
                        fill: "var(--color-warn)",
                        fontSize: 12,
                        position: "insideTopRight",
                      }}
                    />
                  ) : null}
                  {targetKnown ? (
                    <ReferenceLine
                      y={targetNumber}
                      stroke="var(--color-muted)"
                      strokeDasharray="2 4"
                      label={{
                        value: `Alert $${target}`,
                        fill: "var(--color-muted)",
                        fontSize: 12,
                        position: "insideBottomLeft",
                      }}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-sm text-muted">
              Each point is the lowest shelf price recorded that day, shown as an estimated
              delivered total for {location.label}. The amber line is the lowest point on the
              full chart
              {lowInView ? "" : ", and it is outside the selected range"}.
              {targetKnown ? ` The gray line is your $${target} alert.` : ""} Not a forecast.
              {targetKnown ? <ChangeMark kind="new" /> : null}
            </p>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-medium">
              What this chart already did
              <ChangeMark kind="updated" />
            </h2>
            {drop ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The recorded shelf price on this chart went from {money(drop.from.shelf)} on Nov 14,
                2025 to {money(drop.to.shelf)} on Dec 26, 2025, about {drop.percent}% lower. That is
                this model’s history, not a prediction for {nextSale.name}.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                This chart does not include a full holiday season, so there is no past sale to point
                at.
              </p>
            )}
            <p className="mt-2 text-sm text-dim">Not a guarantee.</p>
          </article>

          <article className={adviceClass}>
            <h2
              className={
                advice.tone === "wait"
                  ? "flex items-center gap-2 font-medium text-warn"
                  : "flex items-center gap-2 font-medium"
              }
            >
              <Star className="size-4" />
              Recommendation: {advice.title} · {advice.confidence} confidence
              <ChangeMark kind="updated" />
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg">{advice.reason}</p>
          </article>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <label className="flex items-center gap-2 text-sm" htmlFor="target">
                <Bell className="size-5 shrink-0 text-accent" />
                Notify me if the delivered total drops below
                <ChangeMark kind="updated" />
              </label>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted">$</span>
                <input
                  id="target"
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))}
                  className="w-24 rounded-lg border border-line bg-surface-2 px-3 py-2 text-fg"
                />
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={alertOn}
              onClick={() => setAlertOn((on) => !on)}
              className={
                alertOn
                  ? "relative mt-1 h-7 w-12 shrink-0 rounded-full bg-accent"
                  : "relative mt-1 h-7 w-12 shrink-0 rounded-full bg-line"
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
          </div>
          <p className="text-sm text-muted">
            Saved on this browser only. No email is sent.
            <ChangeMark kind="new" />
            {targetKnown
              ? ` Today's ${money(best.total)} is ${best.total <= targetNumber ? "already at or below" : "above"} $${target}.`
              : ""}
            {targetKnown ? (
              <>
                {" "}
                Your ${target} target is{" "}
                {targetNumber < delivered(lowPoint.shelf, 0, location.tax)
                  ? "below"
                  : "at or above"}{" "}
                the {chartDate(lowPoint.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                low of {money(delivered(lowPoint.shelf, 0, location.tax))}.
                {targetNumber < delivered(lowPoint.shelf, 0, location.tax)
                  ? " This chart has not been that low."
                  : ""}
                <ChangeMark kind="new" />
              </>
            ) : null}
          </p>
        </section>
      </main>
    </div>
  );
}
