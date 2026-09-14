import { NextResponse } from "next/server";

// Fase 4 — PayPal llama aquí cuando la orden se completa
// (evento CHECKOUT.ORDER.APPROVED / PAYMENT.CAPTURE.COMPLETED).
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  console.log("[webhook] PayPal:", payload);
  return NextResponse.json({ received: true });
}
