"use client";

import { useState } from "react";

// Fase 7: aquí se conecta una librería de lectura de QR con la cámara
// (por ejemplo html5-qrcode) que llama a /api/validar con el código leído.
export default function EscanerPage() {
  const [folio, setFolio] = useState("");
  const [resultado, setResultado] = useState<null | { ok: boolean; mensaje: string }>(null);

  async function validar() {
    const res = await fetch("/api/validar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folio }),
    });
    const data = await res.json();
    setResultado(data);
  }

  return (
    <main className="max-w-sm mx-auto px-5 py-10">
      <div className="h-display text-lg mb-6">Escanear acceso</div>
      <input
        className="w-full border border-line rounded-lg px-3 py-2 mb-3 font-mono"
        placeholder="Folio del boleto"
        value={folio}
        onChange={(e) => setFolio(e.target.value)}
      />
      <button onClick={validar} className="w-full bg-accent text-accent-ink font-bold rounded-lg py-3">
        Validar
      </button>

      {resultado && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            resultado.ok ? "bg-brand-soft text-brand" : "bg-danger-soft text-danger"
          }`}
        >
          <div className="font-bold">{resultado.ok ? "✓ Acceso válido" : "✕ " + resultado.mensaje}</div>
        </div>
      )}
    </main>
  );
}
