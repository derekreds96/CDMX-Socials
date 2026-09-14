"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const METODOS = [
  { id: "card", label: "Tarjeta", badge: "VISA · MC" },
  { id: "mercadopago", label: "Mercado Pago", badge: "MP" },
  { id: "paypal", label: "PayPal", badge: "PP" },
] as const;

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [metodo, setMetodo] = useState<(typeof METODOS)[number]["id"]>("card");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);

  async function pagar() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug: params.slug, nombre, correo, metodo }),
      });
      const data = await res.json();
      // Fase 4: aquí redirigimos al checkout real de Mercado Pago / Stripe / PayPal.
      // Por ahora, la ruta /api/checkout simula el pago y crea el boleto directo.
      router.push(data.redirectUrl ?? "/confirmacion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-5 py-10">
      <div className="h-display text-lg mb-6">CDMX Socials — Pago</div>

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

      <button
        onClick={pagar}
        disabled={loading || !nombre || !correo}
        className="w-full bg-accent text-accent-ink font-bold rounded-lg py-3 disabled:opacity-50"
      >
        {loading ? "Procesando…" : "Pagar"}
      </button>
      <p className="text-[11px] text-ink-faint text-center mt-2">
        Pago procesado de forma segura. No guardamos los datos de tu tarjeta.
      </p>
    </main>
  );
}
