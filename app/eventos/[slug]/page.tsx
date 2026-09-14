import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { sampleEvents, sampleTicketTypes, sampleBrands } from "@/lib/sample-data";
import type { EventRow, TicketType, Brand } from "@/lib/types";
import { logoForBrand } from "@/lib/brand-assets";
import TicketSelector from "@/components/TicketSelector";

async function getEvent(slug: string) {
  try {
    const { data: event, error } = await supabase.from("events").select("*").eq("slug", slug).single();
    if (error || !event) throw error ?? new Error("no encontrado");
    const { data: ticketTypes } = await supabase.from("ticket_types").select("*").eq("event_id", event.id);
    const { data: brand } = event.brand_id
      ? await supabase.from("brands").select("*").eq("id", event.brand_id).single()
      : { data: null };
    return { event: event as EventRow, ticketTypes: (ticketTypes ?? []) as TicketType[], brand: brand as Brand | null };
  } catch {
    const event = sampleEvents.find((e) => e.slug === slug);
    if (!event) return null;
    const ticketTypes = sampleTicketTypes[event.id] ?? [];
    const brand = event.brand_id ? Object.values(sampleBrands).find((b) => b.id === event.brand_id) ?? null : null;
    return { event, ticketTypes, brand };
  }
}

export default async function EventoPage({ params }: { params: { slug: string } }) {
  const data = await getEvent(params.slug);
  if (!data) return notFound();
  const { event, ticketTypes, brand } = data;
  const logo = logoForBrand(brand?.slug);

  const MX_TZ = "America/Mexico_City";
  const date = new Date(event.starts_at).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: MX_TZ,
  });
  const time = new Date(event.starts_at).toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: MX_TZ,
  });

  const rows = ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    price_cents: t.price_cents,
    left: t.quantity_total - t.quantity_sold,
  }));

  return (
    <main className="max-w-xl mx-auto px-5 py-10">
      <Link href="/" className="text-sm text-brand font-medium">
        ← Todos los eventos
      </Link>

      <div className="h-48 rounded-xl mt-4 mb-5 relative overflow-hidden">
        {logo ? (
          <Image src={logo} alt={brand?.name ?? event.name} fill className="object-cover" priority />
        ) : (
          <div
            className="w-full h-full flex items-end p-4"
            style={{ background: `linear-gradient(135deg, ${brand?.color ?? "#2A2BE0"}, #0C0C1A)` }}
          >
            <span className="h-display text-2xl text-white">{event.name}</span>
          </div>
        )}
      </div>

      <div className="text-xs font-mono uppercase tracking-wide text-ink-faint mb-1">{brand?.name ?? "CDMX Socials"}</div>
      <h1 className="h-display text-2xl mb-3">{event.name}</h1>

      <div className="text-sm text-ink-soft mb-1 capitalize">
        {date} · {time}
      </div>
      <div className="text-sm text-ink-soft mb-4">{event.venue}</div>
      <p className="text-ink-soft mb-6">{event.description}</p>

      <h2 className="h-display text-lg mb-3">Boletos</h2>
      <TicketSelector eventSlug={event.slug} ticketTypes={rows} />
    </main>
  );
}
