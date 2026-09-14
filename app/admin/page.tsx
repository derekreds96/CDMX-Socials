import { supabase } from "@/lib/supabase";
import { sampleEvents } from "@/lib/sample-data";
import { formatMXN } from "@/lib/types";

// Fase 6: esta página se protege con login (Supabase Auth) antes de producción.
export default async function AdminPage() {
  let events = sampleEvents;
  try {
    const { data, error } = await supabase.from("events").select("*").order("starts_at");
    if (!error && data && data.length) events = data;
  } catch {
    // usa datos de ejemplo
  }

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <div className="h-display text-lg mb-6">Panel — Eventos</div>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono uppercase text-ink-faint border-b border-line">
              <th className="p-3">Evento</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Lugar</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="p-3 font-medium">{e.name}</td>
                <td className="p-3">{new Date(e.starts_at).toLocaleDateString("es-MX")}</td>
                <td className="p-3 text-ink-faint">{e.venue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-faint mt-3">
        Placeholder — en la Fase 6 esto se conecta a ventas reales (vendidos, ingresos, exportar asistentes).
      </p>
    </main>
  );
}
