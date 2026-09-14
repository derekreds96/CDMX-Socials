"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMXN } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  left: number;
};

export default function TicketSelector({ eventSlug, ticketTypes }: { eventSlug: string; ticketTypes: Row[] }) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});

  function setFor(id: string, value: number, max: number) {
    const clamped = Math.max(0, Math.min(value, max));
    setQty((q) => ({ ...q, [id]: clamped }));
  }

  const total = useMemo(
    () => ticketTypes.reduce((sum, t) => sum + (qty[t.id] ?? 0) * t.price_cents, 0),
    [qty, ticketTypes]
  );
  const totalQty = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);

  function continuar() {
    const items = ticketTypes
      .filter((t) => (qty[t.id] ?? 0) > 0)
      .map((t) => ({ ticketTypeId: t.id, qty: qty[t.id] }));
    const encoded = encodeURIComponent(JSON.stringify(items));
    router.push(`/checkout/${eventSlug}?items=${encoded}`);
  }

  return (
    <div className="flex flex-col gap-3">
      {ticketTypes.map((t) => {
        const soldOut = t.left <= 0;
        const current = qty[t.id] ?? 0;
        return (
          <div
            key={t.id}
            className={`flex items-center justify-between border rounded-lg p-3 ${
              soldOut ? "border-line opacity-60" : current > 0 ? "border-brand bg-brand-soft" : "border-line"
            }`}
          >
            <div>
              <div className="font-semibold">{t.name}</div>
              {t.description && <div className="text-xs text-ink-faint">{t.description}</div>}
              <div className="text-xs text-ink-faint">
                {soldOut ? (
                  <span className="text-danger font-medium">Agotado</span>
                ) : (
                  `${t.left} disponibles`
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono font-semibold text-sm">{formatMXN(t.price_cents)}</div>
              {!soldOut && (
                <div className="flex items-center gap-2 font-mono text-sm">
                  <button
                    type="button"
                    onClick={() => setFor(t.id, current - 1, t.left)}
                    className="w-7 h-7 rounded border border-line flex items-center justify-center"
                    aria-label={`Quitar un boleto ${t.name}`}
                  >
                    –
                  </button>
                  <span className="w-4 text-center">{current}</span>
                  <button
                    type="button"
                    onClick={() => setFor(t.id, current + 1, t.left)}
                    className="w-7 h-7 rounded border border-line flex items-center justify-center"
                    aria-label={`Agregar un boleto ${t.name}`}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <button
        onClick={continuar}
        disabled={totalQty === 0}
        className="mt-3 block w-full text-center bg-accent text-accent-ink font-bold rounded-lg py-3 disabled:opacity-40"
      >
        {totalQty === 0 ? "Elige al menos un boleto" : `Continuar — ${formatMXN(total)}`}
      </button>
    </div>
  );
}
