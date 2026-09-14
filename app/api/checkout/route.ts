import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function folioFor(eventSlug: string) {
  const prefix = eventSlug.split("-")[0]?.slice(0, 3).toUpperCase() || "TIX";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const rand2 = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `${prefix}-${rand}-${rand2}`;
}

// NOTA — Fase 4: esta ruta hoy simula un pago exitoso y crea el boleto directo,
// para que puedas probar el flujo completo (checkout → QR → escáner) sin tener
// todavía las cuentas de Mercado Pago / Stripe / PayPal conectadas.
//
// Cuando lleguemos a esa fase, aquí es donde:
//   1. Creamos la orden en Supabase con status "pending".
//   2. Según `metodo`, redirigimos a la preferencia de pago de Mercado Pago,
//      al Payment Element de Stripe, o al Checkout de PayPal.
//   3. El boleto se crea solo cuando llega el webhook del proveedor confirmando
//      el pago (ver /api/webhooks/*), no antes — así nunca se entrega un boleto
//      sin que el dinero haya llegado.
export async function POST(req: Request) {
  const body = await req.json();
  const { eventSlug, nombre, correo, metodo } = body as {
    eventSlug: string;
    nombre: string;
    correo: string;
    metodo: "card" | "mercadopago" | "paypal";
  };

  const folio = folioFor(eventSlug);

  try {
    const admin = supabaseAdmin();
    const { data: event } = await admin.from("events").select("id").eq("slug", eventSlug).single();
    if (event) {
      const { data: order } = await admin
        .from("orders")
        .insert({
          event_id: event.id,
          buyer_name: nombre,
          buyer_email: correo,
          payment_method: metodo === "card" ? "card" : metodo,
          status: "paid", // demo: en Fase 4 esto empieza en "pending"
          total_cents: 0,
        })
        .select()
        .single();

      const { data: ticketType } = await admin
        .from("ticket_types")
        .select("id")
        .eq("event_id", event.id)
        .limit(1)
        .single();

      if (order && ticketType) {
        await admin.from("tickets").insert({
          order_id: order.id,
          ticket_type_id: ticketType.id,
          code: folio,
          status: "valid",
        });
      }
    }
  } catch {
    // Supabase aún no conectado: seguimos con el folio de demo para no romper el flujo.
  }

  return NextResponse.json({ redirectUrl: `/confirmacion?folio=${folio}` });
}
