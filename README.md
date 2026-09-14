# CDMX Socials — Boletos

Esqueleto técnico de la Fase 2, ya con base de datos real en Supabase
(proyecto `cdmx-socials`, plan gratuito): 3 eventos de ejemplo — CDMX
Socials Mixer, La Noche Latina, Locals & Nomads — con sus tipos de boleto
y precios reales.

## Probarlo ahora mismo (sin cuentas todavía)

```
npm install
npm run dev
```

Abre `http://localhost:3000`. El catálogo, el detalle del evento, el checkout,
la confirmación con QR y el escáner ya funcionan de extremo a extremo con
datos de ejemplo — el pago todavía no está conectado a ningún proveedor real
(eso es la Fase 4), pero el flujo completo se puede probar.

## Qué falta y en qué fase se resuelve

- **Fase 0** — cuentas de Mercado Pago, Stripe y/o PayPal, y un dominio.
- **Fase 2 (esta)** — ✅ esqueleto del sitio + ✅ base de datos real en
  Supabase. Solo falta que pegues tu `service_role` key (paso 2 abajo) para
  que el checkout guarde boletos de verdad en vez de simularlos.
- **Fase 4** — reemplazar `app/api/checkout/route.ts` (que hoy simula el pago)
  por las integraciones reales de cada proveedor, y verificar la firma de cada
  webhook en `app/api/webhooks/*`.
- **Fase 5** — enviar el boleto por correo con Resend (ahora mismo el QR solo
  se muestra en pantalla).
- **Fase 6** — proteger `/admin` con login y mostrar ventas reales.
- **Fase 7** — conectar una librería de cámara en `/escaner` (hoy el folio se
  escribe a mano para probar).

## 1. Subir el código a GitHub

1. Crea una cuenta gratis en [github.com](https://github.com) si no tienes.
2. Crea un repositorio nuevo, vacío, sin README (por ejemplo `cdmx-socials`).
3. Desde esta carpeta:
   ```
   git init
   git add .
   git commit -m "Esqueleto inicial de CDMX Socials"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/cdmx-socials.git
   git push -u origin main
   ```

## 2. Supabase — ✅ ya está hecho

Ya creé el proyecto real `cdmx-socials` en tu organización de Supabase y
corrí el schema: las 5 tablas (`brands`, `events`, `ticket_types`, `orders`,
`tickets`) con RLS activado, y los 3 eventos de ejemplo (CDMX Socials Mixer,
La Noche Latina, Locals & Nomads) con sus tipos de boleto y precios reales.

El archivo `.env.local` ya trae la URL del proyecto y la llave pública
(`anon`) — con eso el catálogo y el detalle de evento ya leen de la base de
datos real, no de `lib/sample-data.ts`. Lo puedes comprobar con
`npm run dev`.

Solo falta una llave que no te puedo copiar yo por seguridad — la
`service_role` key, que es secreta y da acceso total a la base de datos:

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) → abre
   el proyecto **cdmx-socials**.
2. **Project Settings → API** → copia la llave `service_role`.
3. Pégala en `.env.local`, en `SUPABASE_SERVICE_ROLE_KEY=`.

Esa llave es la que usan las rutas `/api/checkout` y `/api/validar` para
crear boletos y marcarlos como usados — sin ella, el checkout sigue
funcionando en modo demo (folio simulado) pero no guarda nada en la base de
datos real.

## 3. Desplegar en Vercel

1. Cuenta gratis en [vercel.com](https://vercel.com) — puedes entrar
   directo con tu cuenta de GitHub.
2. **Add New → Project** → elige el repo `cdmx-socials` que acabas de subir.
3. En **Environment Variables** pega las mismas variables de tu `.env.local`
   (las tres de Supabase; las de pagos se agregan en la Fase 4).
4. **Deploy**. En un par de minutos tienes una URL pública
   (`cdmx-socials.vercel.app`) — luego puedes conectarle tu propio dominio
   desde **Settings → Domains**.

## Estructura del proyecto

```
app/
  page.tsx                  catálogo de eventos
  eventos/[slug]/page.tsx   detalle + selección de boletos
  checkout/[slug]/page.tsx  datos del comprador + método de pago
  confirmacion/page.tsx     boleto con QR
  escaner/page.tsx          validación de acceso (staff)
  admin/page.tsx            panel de eventos
  api/checkout/             crea la orden (hoy simulada)
  api/validar/               valida/marca un boleto como usado
  api/webhooks/              uno por proveedor de pago (Fase 4)
lib/
  supabase.ts               clientes de Supabase (público y de servidor)
  sample-data.ts            datos de ejemplo, fallback si Supabase no responde
  types.ts                  tipos + formatMXN()
supabase/
  schema.sql                tablas + datos de ejemplo, listo para pegar en Supabase
```
