import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type Item = { ticketTypeId: string; qty: number };

function folioFor(eventSlug: string) {
  const prefix = eventSlug.split("-")[0]?.slice(0, 3).toUpperCase() || "TIX";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const rand2 = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `${prefix}-${rand}-${rand2}`;
}

// NOTA — Fase 4: esta ruta hoy simula un pago exitoso y crea los boletos
// directo (una vez validada la disponibilidad real), para que puedas probar
// el flujo completo sin tener todavía las cuentas de pago conectadas.
//
// Cuando lleguemos a esa fase, el orden cambia: la orden se crea en estado
// "pending", se redirige al proveedor de pago, y los boletos solo se crean
// cuando llega el webhook confirmando que el dinero llegó — nunca antes.
export async function POST(req: Request) {
  const body = await req.json();
  const { eventSlug, nombre, correo, metodo, items } = body as {
    eventSlug: string;
    nombre: string;
    correo: string;
    metodo: "card" | "mercadopago" | "paypal";
    items: Item[];
  };

  if (!nombre || !correo || !items || items.length === 0) {
    return NextResponse.json({ error: "Faltan datos del comprador o boletos." }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: event, error: eventError } = await admin.from("events").select("id").eq("slug", eventSlug).single();
  if (eventError || !event) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  const { data: ticketTypes, error: ttError } = await admin
    .from("ticket_types")
    .select("id, name, price_cents")
    .in("id", items.map((i) => i.ticketTypeId));
  if (ttError || !ticketTypes || ticketTypes.length !== items.length) {
    return NextResponse.json({ error: "Uno de los tipos de boleto ya no existe." }, { status: 400 });
  }
  const priceById = new Map(ticketTypes.map((t) => [t.id, t.price_cents]));
  const totalCents = items.reduce((sum, i) => sum + (priceById.get(i.ticketTypeId) ?? 0) * i.qty, 0);

  // Reserva atómica: si algún tipo de boleto ya no tiene suficiente
  // disponibilidad, esto falla y no se cobra ni se crea nada.
  const reserved: Item[] = [];
  for (const item of items) {
    const { error: reserveError } = await admin.rpc("reserve_ticket_type", {
      p_ticket_type_id: item.ticketTypeId,
      p_qty: item.qty,
    });
    if (reserveError) {
      // Revertir lo ya reservado en este intento
      for (const r of reserved) {
        await admin.rpc("reserve_ticket_type", { p_ticket_type_id: r.ticketTypeId, p_qty: -r.qty });
      }
      return NextResponse.json({ error: "Ya no hay suficientes boletos disponibles." }, { status: 409 });
    }
    reserved.push(item);
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      event_id: event.id,
      buyer_name: nombre,
      buyer_email: correo,
      payment_method: metodo === "card" ? "card" : metodo,
      status: "paid", // demo: en Fase 4 esto empieza en "pending"
      total_cents: totalCents,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "No se pudo crear la orden." }, { status: 500 });
  }

  const folios: string[] = [];
  const ticketRows = items.flatMap((item) =>
    Array.from({ length: item.qty }).map(() => {
      const folio = folioFor(eventSlug);
      folios.push(folio);
      return { order_id: order.id, ticket_type_id: item.ticketTypeId, code: folio, status: "valid" as const };
    })
  );
  await admin.from("tickets").insert(ticketRows);

  return NextResponse.json({
    redirectUrl: `/confirmacion?folios=${folios.join(",")}&event=${encodeURIComponent(eventSlug)}`,
  });
}
