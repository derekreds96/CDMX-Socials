// Datos de ejemplo — se usan solo si Supabase todavía no está conectado
// (para que `npm run dev` funcione desde el primer minuto).
import type { EventRow, TicketType, Brand } from "./types";

export const sampleBrands: Record<string, Brand> = {
  "cdmx-socials": { id: "b1", name: "CDMX Socials", slug: "cdmx-socials", color: "#2A2BE0", logo_url: null },
  "la-noche-latina": { id: "b2", name: "La Noche Latina", slug: "la-noche-latina", color: "#B8341F", logo_url: null },
  "locals-nomads": { id: "b3", name: "Locals & Nomads", slug: "locals-nomads", color: "#8A2A8F", logo_url: null },
};

export const sampleEvents: EventRow[] = [
  {
    id: "e1",
    brand_id: "b1",
    name: "CDMX Socials — Mixer de Otoño",
    slug: "mixer-de-otono",
    description: "Networking casual con música en vivo y barra de cortesía.",
    venue: "Roma Norte, CDMX",
    starts_at: "2026-10-15T20:00:00-06:00",
    hero_image_url: null,
    status: "published",
  },
  {
    id: "e2",
    brand_id: "b2",
    name: "La Noche Latina",
    slug: "la-noche-latina-31-oct",
    description: "Reggaetón, salsa y cumbia en vivo hasta el amanecer. DJ invitado + banda.",
    venue: "Salón Los Ángeles, CDMX",
    starts_at: "2026-10-31T22:00:00-06:00",
    hero_image_url: null,
    status: "published",
  },
  {
    id: "e3",
    brand_id: "b3",
    name: "Locals & Nomads",
    slug: "locals-and-nomads-6-nov",
    description: "La fiesta que junta a locales y nómadas digitales de la ciudad.",
    venue: "Roma Norte, CDMX",
    starts_at: "2026-11-06T21:00:00-06:00",
    hero_image_url: null,
    status: "published",
  },
];

export const sampleTicketTypes: Record<string, TicketType[]> = {
  e2: [
    { id: "t1", event_id: "e2", name: "General", description: "Acceso a pista", price_cents: 35000, quantity_total: 250, quantity_sold: 110 },
    { id: "t2", event_id: "e2", name: "VIP", description: "Mesa + botella", price_cents: 70000, quantity_total: 40, quantity_sold: 30 },
  ],
  e1: [
    { id: "t3", event_id: "e1", name: "General", description: "Acceso al evento", price_cents: 25000, quantity_total: 150, quantity_sold: 82 },
  ],
  e3: [
    { id: "t4", event_id: "e3", name: "General", description: "Acceso al evento", price_cents: 40000, quantity_total: 180, quantity_sold: 45 },
  ],
};
