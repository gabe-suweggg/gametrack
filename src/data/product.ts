import raw from "./prices.json";

export type Location = {
  id: string;
  label: string;
  zip: string;
  tax: number;
};

export type Offer = {
  store: string;
  site: string;
  shelf: number;
  shipping: number;
};

export type PricePoint = {
  date: string;
  shelf: number;
};

export type Product = {
  id: string;
  name: string;
  specs: string;
  ports: string;
  image: string;
  details: { label: string; value: string }[];
  size: { label: string; value: string }[];
  inbox: string[];
  specUrl: string;
  offers: Offer[];
  history: PricePoint[];
};

export const locations: Location[] = raw.locations;
export const products: Product[] = raw.products;

export function getProduct(id: string) {
  return products.find((item) => item.id === id);
}

export function alertStorageKey(id: string) {
  return `gametrack-alert:${id}`;
}

export function parseAlert(raw: string | null): { on: boolean; target: string } | null {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as { on?: boolean; target?: string };
    if (typeof saved.on !== "boolean" || typeof saved.target !== "string") return null;
    return { on: saved.on, target: saved.target };
  } catch {
    return null;
  }
}

export function locationFromSearch(search: Record<string, unknown>) {
  const id = typeof search.loc === "string" ? search.loc : "ca";
  return locations.some((location) => location.id === id) ? id : "ca";
}

export function rankOffers(offers: Offer[], tax: number) {
  return offers
    .map((offer) => ({
      ...offer,
      total: delivered(offer.shelf, offer.shipping, tax),
      taxAmount: offer.shelf * tax,
    }))
    .sort((a, b) => a.total - b.total);
}

export const ranges = [
  { id: "3m", label: "3 months", days: 92 },
  { id: "6m", label: "6 months", days: 183 },
  { id: "1y", label: "1 year", days: 370 },
] as const;

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function delivered(shelf: number, shipping: number, tax: number) {
  return shelf * (1 + tax) + shipping;
}

function calendarDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shortDate(iso: string) {
  return calendarDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function cheaperThanToday(item: Product, total: number, tax: number) {
  const days = item.history
    .filter((point) => delivered(point.shelf, 0, tax) + 0.5 < total)
    .map((point) => {
      const gap = total - delivered(point.shelf, 0, tax);
      return `${shortDate(point.date)} was ${money(gap)} lower`;
    });
  if (days.length === 0) return "This is the lowest recorded price.";
  if (days.length <= 3) return `${days.join(". ")}.`;
  return `${days.length} recorded days on this chart were cheaper.`;
}

export function sameAsToday(item: Product, total: number, tax: number) {
  const days = item.history
    .filter((point) => Math.abs(delivered(point.shelf, 0, tax) - total) < 0.5)
    .map((point) => shortDate(point.date));
  const recent = days.slice(-2);
  if (recent.length === 0) return null;
  if (days.length === 1) return `Seen once, on ${recent[0]}.`;
  if (days.length <= 4) {
    const last = days[days.length - 1];
    return `Seen on ${days.slice(0, -1).join(", ")}, and ${last}.`;
  }
  return `Seen ${days.length} times, latest ${recent[0]} and ${recent[1]}.`;
}

export const asOf = "2026-10-29";

export const nextSale = {
  name: "Black Friday",
  date: "2026-11-27",
};

export type Advice = {
  title: "Buy now" | "Wait" | "No strong signal" | "Insufficient data";
  confidence: "moderate" | "low";
  tone: "buy" | "wait" | "neutral";
  reason: string;
};

function weeksBetween(from: string, to: string) {
  const day = 86_400_000;
  return (new Date(to).getTime() - new Date(from).getTime()) / (7 * day);
}

export function advise(item: Product, tax: number): Advice {
  if (item.history.length < 8) {
    return {
      title: "Insufficient data",
      confidence: "low",
      tone: "neutral",
      reason: "There is not enough recorded history to suggest buying or waiting.",
    };
  }

  const current = rankOffers(item.offers, tax)[0].total;
  const low = Math.min(...item.history.map((point) => delivered(point.shelf, 0, tax)));
  const weeks = weeksBetween(asOf, nextSale.date);
  const nearLow = current <= low * 1.03;

  if (nearLow && weeks > 6) {
    return {
      title: "Buy now",
      confidence: "moderate",
      tone: "buy",
      reason: `Today's ${money(current)} total is near the lowest point on this chart (${money(low)}), and ${nextSale.name} is more than six weeks away. Past prices are not a guarantee.`,
    };
  }

  if (weeks >= 3 && weeks <= 6 && !nearLow) {
    return {
      title: "Wait",
      confidence: "moderate",
      tone: "wait",
      reason: `${nextSale.name} is about ${Math.round(weeks)} weeks away. Today's ${money(current)} total is above the lowest point on this chart (${money(low)}). This can be wrong.`,
    };
  }

  return {
    title: "No strong signal",
    confidence: "low",
    tone: "neutral",
    reason: `Today's ${money(current)} total is not a clear low, and no major sale is close enough to justify waiting on this chart alone.`,
  };
}

export function chartDrop(item: Product) {
  const start = item.history.find((point) => point.date === "2025-11-14");
  const end = item.history.find((point) => point.date === "2025-12-26");
  if (!start || !end || end.shelf >= start.shelf) return null;
  return {
    from: start,
    to: end,
    percent: Math.round((1 - end.shelf / start.shelf) * 100),
  };
}
