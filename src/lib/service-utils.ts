import salonData from "@/data/salon-data.json";

export type PublicService = {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description?: string | null;
  image?: string | null;
  active?: boolean;
};

export const categoryLabels: Record<string, string> = {
  extensions_hands: "Nail Extensions (Hands)",
  extensions_feet: "Nail Extensions (Feet)",
  gel_polish: "Gel Polish",
  mani_pedi: "Mani & Pedi",
  extras: "Extras",
  waxing: "Waxing",
  uncategorized: "Other Services",
};

export const categoryOrder = [
  "extensions_hands",
  "extensions_feet",
  "gel_polish",
  "mani_pedi",
  "extras",
  "waxing",
  "uncategorized",
];

export function formatPrice(value: number | string) {
  const num = typeof value === "string" ? Number(String(value).replace(/[^0-9.]/g, "")) : Number(value || 0);
  return `£${num.toFixed(2)}`;
}

export function formatDuration(minutes: number | string) {
  if (typeof minutes === "string" && minutes.includes("m")) return minutes;
  const total = Number(minutes || 0);
  if (total >= 60) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m ? `${h}h ${m}m` : `${h}h 0m`;
  }
  return `${total}m`;
}

export function normalizeServices(items: any[]): PublicService[] {
  const seen = new Set<string>();
  const services: PublicService[] = [];

  for (const item of items || []) {
    const name = String(item.name || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    services.push({
      id: String(item.id || name),
      name,
      category: String(item.category || "uncategorized"),
      price: typeof item.price === "number" ? item.price : Number(String(item.price || "0").replace(/[^0-9.]/g, "")),
      duration: typeof item.duration === "number" ? item.duration : Number(String(item.duration || "0").replace(/[^0-9]/g, "")) || 30,
      description: item.description || null,
      image: item.image || null,
      active: item.active !== false,
    });
  }

  return services;
}

export function fallbackServices(): PublicService[] {
  const staticServices = Object.entries(salonData.categories).flatMap(([category, services]) =>
    (services as any[]).map((service, index) => ({
      id: `${category}-${index}`,
      category,
      ...service,
      image: service.image || `/images/gallery-${(index % 10) + 1}.jpg`,
    }))
  );
  return normalizeServices(staticServices);
}

export function groupServices(services: PublicService[]) {
  return services.reduce<Record<string, PublicService[]>>((acc, service) => {
    const category = service.category || "uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});
}

export function orderedCategories(grouped: Record<string, PublicService[]>) {
  const known = categoryOrder.filter((key) => grouped[key]?.length);
  const unknown = Object.keys(grouped).filter((key) => !categoryOrder.includes(key)).sort();
  return [...known, ...unknown];
}
