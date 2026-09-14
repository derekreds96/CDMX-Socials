import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabase";

type TicketInfo = { folio: string; ticketTypeName: string; qrDataUrl: string };

async function getTickets(folios: string[], eventSlug?: string) {
  if (folios.length === 0) return { tickets: [] as TicketInfo[], eventName: null as string | null };

  try {
    const admin = supabaseAdmin();
    const { data: tickets } = await admin
      .from("tickets")
      .select("code, ticket_type_id, ticket_types(name)")
      .in("code", folios);

    const eventName = eventSlug
      ? (await admin.from("events").select("name").eq("slug", eventSlug).single()).data?.name ?? null
      : null;

    const list: TicketInfo[] = await Promise.all(
      folios.map(async (folio) => {
        const row = (tickets ?? []).find((t) => t.code === folio) as
          | { code: string; ticket_types: { name: string } | { name: string }[] | null }
          | undefined;
        const ticketTypeName = Array.isArray(row?.ticket_types)
          ? row?.ticket_types[0]?.name
          : row?.ticket_types?.name;
        const qrDataUrl = await QRCode.toDataURL(`https://cdmx-socials.vercel.app/validar/${folio}`, {
          margin: 1,
          width: 220,
        });
        return { folio, ticketTypeName: ticketTypeName ?? "Boleto", qrDataUrl };
      })
    );
    return { tickets: list, eventName };
  } catch {
    const list = await Promise.all(
      folios.map(async (folio) => ({
        folio,
        ticketTypeName: "Boleto",
        qrDataUrl: await QRCode.toDataURL(`https://cdmx-socials.vercel.app/validar/${folio}`, { margin: 1, width: 220 }),
      }))
    );
    return { tickets: list, eventName: null };
  }
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { folio?: string; folios?: string; event?: string };
}) {
  const folios = (searchParams.folios ?? searchParams.folio ?? "LNL-DEMO-0001")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  const { tickets, eventName } = await getTickets(folios, searchParams.event);

  return (
    <main className="max-w-sm mx-auto px-5 py-14 text-center">
      <div className="w-10 h-10 rounded-full bg-brand text-brand-ink flex items-center justify-center mx-auto mb-4 font-bold">
        ✓
      </div>
      <h1 className="h-display text-xl mb-1">¡Listo, tu compra está confirmada!</h1>
      {eventName && <p className="text-ink-soft mb-6">{eventName}</p>}

      <div className="flex flex-col gap-6 mt-6">
        {tickets.map((t) => (
          <div key={t.folio} className="border border-line rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">{t.ticketTypeName}</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.qrDataUrl} alt={`Código QR del boleto ${t.folio}`} className="mx-auto rounded-lg border border-line" />
            <div className="font-mono text-sm text-ink-soft mt-3">
              Folio <b className="text-ink">{t.folio}</b>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-ink-soft mt-6">
        Te enviamos una copia por correo. Cada QR es tu acceso — no los compartas.
      </p>
    </main>
  );
}
