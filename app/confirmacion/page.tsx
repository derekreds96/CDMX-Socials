import QRCode from "qrcode";

export default async function ConfirmacionPage({ searchParams }: { searchParams: { folio?: string } }) {
  const folio = searchParams.folio ?? "LNL-DEMO-0001";
  const qrDataUrl = await QRCode.toDataURL(`https://cdmxsocials.mx/validar/${folio}`, { margin: 1, width: 240 });

  return (
    <main className="max-w-sm mx-auto px-5 py-14 text-center">
      <div className="w-10 h-10 rounded-full bg-brand text-brand-ink flex items-center justify-center mx-auto mb-4 font-bold">
        ✓
      </div>
      <h1 className="h-display text-xl mb-4">¡Listo, tu boleto está confirmado!</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt={`Código QR del boleto ${folio}`} className="mx-auto rounded-lg border border-line" />
      <div className="font-mono text-sm text-ink-soft mt-3">
        Folio <b className="text-ink">{folio}</b>
      </div>
      <p className="text-sm text-ink-soft mt-3">
        Te enviamos una copia por correo. Este QR es tu acceso — no lo compartas.
      </p>
    </main>
  );
}
