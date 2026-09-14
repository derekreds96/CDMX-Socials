// Logos reales de cada marca, servidos como estáticos desde /public/logos.
// Cuando tengas los logos en alta resolución con fondo transparente, solo
// reemplaza estos archivos (mismo nombre) y no hay que tocar código.
const LOGOS: Record<string, string> = {
  "cdmx-socials": "/logos/cdmx-socials.jpg",
  "la-noche-latina": "/logos/la-noche-latina.jpg",
  "locals-nomads": "/logos/locals-nomads.jpg",
};

export function logoForBrand(slug: string | undefined | null): string | null {
  if (!slug) return null;
  return LOGOS[slug] ?? null;
}
