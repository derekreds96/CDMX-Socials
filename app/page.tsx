import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { sampleEvents, sampleBrands } from "@/lib/sample-data";
import type { EventRow, Brand } from "@/lib/types";

async function getEvents(): Promise<{ events: EventRow[]; brands: Record<string, Brand> }> {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("starts_at", { ascending: true });
    if (error || !events || events.length === 0) throw error ?? new Error("sin datos");

    const { data: brandRows } = await supabase.from("brands").select("*");
    const brands: Record<string, Brand> = {};
    (brandRows ?? []).forEach((b: Brand) => (brands[b.id] = b));
    return { events, brands };
  } catch {
    // Supabase todavía no está conectado — mostramos datos de ejemplo.
    const brands: Record<string, Brand> = {};
    Object.values(sampleBrands).forEach((b) => (brands[b.id] = b));
    return { events: sampleEvents, brands };
  }
}

export default async function CatalogoPage() {
  const { events, brands } = await getEvents();

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <header className="flex items-center gap-2 mb-8">
        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
        <span className="h-display text-lg">CDMX Socials</span>
      </header>

      <h1 className="h-display text-3xl mb-1">Próximos eventos</h1>
      <p className="text-ink-soft mb-8">Todas las noches de CDMX Socials, La Noche Latina y Locals &amp; Nomads en un solo lugar.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((e) => {
          const brand = e.brand_id ? brands[e.brand_id] : undefined;
          const date = new Date(e.starts_at).toLocaleDateString("es-MX", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          return (
            <Link
              key={e.id}
              href={`/eventos/${e.slug}`}
              className="block rounded-xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="h-20"
                style={{ background: `linear-gradient(135deg, ${brand?.color ?? "#2A2BE0"}, #0C0C1A)` }}
              />
              <div className="p-4">
                <div className="text-xs font-mono uppercase tracking-wide text-ink-faint mb-1">
                  {brand?.name ?? "CDMX Socials"}
                </div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-sm text-ink-faint">
                  {date} · {e.venue}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
