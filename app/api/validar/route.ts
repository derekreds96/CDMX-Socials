import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Fase 7 — validación de acceso en la puerta.
// Marca el boleto como usado la primera vez; la segunda vez lo rechaza.
export async function POST(req: Request) {
  const { folio } = (await req.json()) as { folio: string };

  try {
    const admin = supabaseAdmin();
    const { data: ticket } = await admin.from("tickets").select("*").eq("code", folio).single();

    if (!ticket) {
      return NextResponse.json({ ok: false, mensaje: "Folio no encontrado" });
    }
    if (ticket.status === "used") {
      return NextResponse.json({ ok: false, mensaje: "Este boleto ya fue usado" });
    }

    await admin.from("tickets").update({ status: "used", used_at: new Date().toISOString() }).eq("id", ticket.id);
    return NextResponse.json({ ok: true, mensaje: "Acceso válido" });
  } catch {
    // Demo sin Supabase conectado: cualquier folio que empiece con una letra "pasa".
    return NextResponse.json({ ok: /^[A-Z]/.test(folio), mensaje: "Modo demo — conecta Supabase para validar de verdad" });
  }
}
