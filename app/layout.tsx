import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CDMX Socials — Boletos",
  description: "Compra boletos para las noches de CDMX Socials, La Noche Latina y Locals & Nomads.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
