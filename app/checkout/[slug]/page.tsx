"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatMXN } from "@/lib/types";

const METODOS = [
  { id: "card", label: "Tarjeta", badge: "VISA · MC" },
  { id: "mercadopago", label: "Mercado Pago", badge: "MP" },
  { id: "paypal", label: "PayPal", badge: "PP" },
] as const;

type Item = { ticketTypeId: string; qty: number };
type LineItem = Item & { name: string; price_cents: number };

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lines, setLines] = useState<LineItem[]>([]);
  const [loadingLines, setLoadingLines] = useState(true);
  const [metodo, setMetodo] = useState<(typeof METODOS)[number]["id"]>("card");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get("items");
    if (!raw) {
      setLoadingLines(false);
      return;
    }
    const items: Item[] = JSON.parse(decodeURIComponent(raw));
    (async () => {
      const { data } = await supabase
        .from("ticket_types")
        .select("id, name, price_cents")
        .in("id", items.map((i) => i.ticketTypeId));
      const byId = new Map((data ?? []).map((t) => [t.id, t]));
      setLines(
        items.map((i) => ({
          ...i,
          name: byId.get(i.ticketTypeId)?.name ?? "Boleto",
          price_cents: byId.get(i.ticketTypeId)?.price_cents ?? 0,
        }))
      );
      setLoadingLines(false);
    })();
  }, [searchParams]);

  const total = lines.reduce((sum, l) => sum + l.qty * l.price_cents, 0);

  async function pagar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: params.slug,
          nombre,
          correo,
          metodo,
          items: lines.map((l) => ({ ticketTypeId: l.ticketTypeId, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar tu compra. Intenta de nuevo.");
        return;
      }
      // Fase 4: aquí redirigimos al checkout real de Mercado Pago / Stripe / PayPal.
      router.push(data.redirectUrl);
    } finally {
      setLoading(false);
    }
  }

  if (!loadingLines && lines.length === 0) {
    return (
      <main className="max-w-md mx-auto px-5 py-10 text-center">
        <p className="text-ink-soft">No hay boletos seleccionados.</p>
        <a href={`/eventos/${params.slug}`} className="text-brand font-medium text-sm">
          ← Volver a elegir boletos
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-5 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Image src="/logos/cdmx-socials.jpg" alt="CDMX Socials" width={22} height={22} className="rounded" />
        <span className="h-display text-lg">Pago</span>
      </div>

      {!loadingLines && (
        <div className="bg-[#E7E9F2] rounded-lg p-3 mb-5 text-sm flex flex-col gap-1">
          {lines.map((l) => (
            <div key={l.ticketTypeId} className="flex justify-between">
              <span>
                {l.qty} × {l.name}
              </span>
              <span>{formatMXN(l.qty * l.price_cents)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-[15px] pt-1 mt-1 border-t border-dashed border-line">
            <span>Total</span>
            <span>{formatMXN(total)}</span>
          </div>
        </div>
      )}

      <label className="block text-xs font-mono uppercase tracking-wide text-ink-faint mb-1">Nombre</label>
      <input
        className="w-full border border-line rounded-lg px-3 py-2 mb-4"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Tu nombre"
      />

      <label className="block text-xs font-mono uppercase tracking-wide text-ink-faint mb-1">
        Correo — aquí llega tu boleto
      </label>
      <input
        className="w-full border border-line rounded-lg px-3 py-2 mb-5"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="tu@correo.com"
        type="email"
      />

      <div className="text-xs font-mono uppercase tracking-wide text-ink-faint mb-2">Método de pago</div>
      <div className="flex flex-col gap-2 mb-6">
        {METODOS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetodo(m.id)}
            className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 text-left ${
              metodo === m.id ? "border-brand bg-brand-soft" : "border-line"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border ${
                metodo === m.id ? "border-brand ring-2 ring-brand" : "border-ink-faint"
              }`}
            />
            <span className="font-semibold text-sm">{m.label}</span>
            <span className="ml-auto text-[10px] font-mono bg-[#E7E9F2] px-1.5 py-0.5 rounded">{m.badge}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      <button
        onClick={pagar}
        disabled={loading || !nombre || !correo || lines.length === 0}
        className="w-full bg-accent text-accent-ink font-bold rounded-lg py-3 disabled:opacity-50"
      >
        {loading ? "Procesando…" : `Pagar${total ? " " + formatMXN(total) : ""}`}
      </button>
      <p className="text-[11px] text-ink-faint text-center mt-2">
        Pago procesado de forma segura. No guardamos los datos de tu tarjeta.
      </p>
    </main>
  );
}
