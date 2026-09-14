export type Brand = {
  id: string;
  name: string;
  slug: string;
  color: string;
  logo_url: string | null;
};

export type EventRow = {
  id: string;
  brand_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  venue: string | null;
  starts_at: string;
  hero_image_url: string | null;
  status: "draft" | "published" | "cancelled";
};

export type TicketType = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  quantity_total: number;
  quantity_sold: number;
};

export function formatMXN(cents: number) {
  return (cents / 100).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}
