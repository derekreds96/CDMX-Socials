import { NextResponse } from "next/server";

// Fase 4 — Mercado Pago llama aquí cuando el pago se confirma.
// Pasos cuando lo conectemos:
//   1. Verificar la notificación con el access token de Mercado Pago.
//   2. Buscar la orden por payment_provider_id.
//   3. Si el pago está aprobado: marcar la orden "paid", crear el/los boletos,
//      generar el QR y enviar el correo con Resend.
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  console.log("[webhook] Mercado Pago:", payload);
  return NextResponse.json({ received: true });
}
