/** The only prices file. Sample data. A later feed replaces this module, not the page. */

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

export const product = {
  name: "ASUS XG32UQWMS 32-inch OLED Gaming Monitor",
  specs: "32\" 4K UHD OLED · 240Hz · 0.03ms · G-SYNC Compatible",
  ports: "USB-C · HDMI 2.1 · DisplayPort 1.4",
};

export const locations: Location[] = [
  { id: "ca", label: "California", zip: "94585", tax: 0.0875 },
  { id: "ny", label: "New York", zip: "10001", tax: 0.08875 },
  { id: "tx", label: "Texas", zip: "78701", tax: 0.0825 },
  { id: "wa", label: "Washington", zip: "98101", tax: 0.1035 },
  { id: "fl", label: "Florida", zip: "33101", tax: 0.07 },
  { id: "or", label: "Oregon", zip: "97201", tax: 0 },
];

export const offers: Offer[] = [
  { store: "Micro Center", site: "microcenter.com", shelf: 699, shipping: 24.99 },
  { store: "Newegg", site: "newegg.com", shelf: 719, shipping: 0 },
  { store: "Amazon", site: "amazon.com", shelf: 729, shipping: 0 },
  { store: "B&H", site: "bhphotovideo.com", shelf: 739, shipping: 0 },
  { store: "Best Buy", site: "bestbuy.com", shelf: 749, shipping: 0 },
  { store: "ASUS Store", site: "asus.com", shelf: 799, shipping: 0 },
];

/** Lowest recorded shelf price. Shipping on those lows was free. */
export const history: PricePoint[] = [
  { date: "2025-11-14", shelf: 899 },
  { date: "2025-11-28", shelf: 879 },
  { date: "2025-12-05", shelf: 799 },
  { date: "2025-12-12", shelf: 749 },
  { date: "2025-12-26", shelf: 729 },
  { date: "2026-01-16", shelf: 789 },
  { date: "2026-01-30", shelf: 799 },
  { date: "2026-02-13", shelf: 779 },
  { date: "2026-02-27", shelf: 769 },
  { date: "2026-03-13", shelf: 759 },
  { date: "2026-03-27", shelf: 749 },
  { date: "2026-04-17", shelf: 769 },
  { date: "2026-05-01", shelf: 759 },
  { date: "2026-05-22", shelf: 739 },
  { date: "2026-06-12", shelf: 749 },
  { date: "2026-07-03", shelf: 719 },
  { date: "2026-07-10", shelf: 689 },
  { date: "2026-07-24", shelf: 709 },
  { date: "2026-08-14", shelf: 739 },
  { date: "2026-08-28", shelf: 729 },
  { date: "2026-09-11", shelf: 719 },
  { date: "2026-09-25", shelf: 729 },
  { date: "2026-10-09", shelf: 719 },
  { date: "2026-10-23", shelf: 719 },
];

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
