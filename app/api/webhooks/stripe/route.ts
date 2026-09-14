import { NextResponse } from "next/server";

// Fase 4 — Stripe llama aquí (evento checkout.session.completed) cuando el
// pago con tarjeta se confirma. Falta verificar la firma con STRIPE_WEBHOOK_SECRET
// antes de confiar en el payload.
export async function POST(req: Request) {
  const payload = await req.text();
  console.log("[webhook] Stripe (sin verificar todavía):", payload.slice(0, 200));
  return NextResponse.json({ received: true });
}
