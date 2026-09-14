-- CDMX Socials — esquema inicial
-- Pega esto en Supabase → SQL Editor → Run

create extension if not exists "pgcrypto";

-- Marcas/series de eventos: CDMX Socials, La Noche Latina, Locals & Nomads...
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  color text not null default '#2A2BE0', -- color de acento de la marca
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  venue text,
  starts_at timestamptz not null,
  hero_image_url text,
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,           -- 'General', 'VIP'...
  description text,
  price_cents integer not null, -- precio en centavos de MXN
  quantity_total integer not null,
  quantity_sold integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  buyer_name text not null,
  buyer_email text not null,
  payment_method text not null check (payment_method in ('card','mercadopago','paypal')),
  payment_provider_id text,          -- id de la orden/pago en el proveedor
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  total_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id),
  code text not null unique,          -- folio corto, ej. LNL-6K02-3F
  status text not null default 'valid' check (status in ('valid','used','void')),
  used_at timestamptz,
  used_by text,                        -- quién/dónde se validó (staff/puerta)
  created_at timestamptz not null default now()
);

create index if not exists idx_events_brand on events(brand_id);
create index if not exists idx_ticket_types_event on ticket_types(event_id);
create index if not exists idx_orders_event on orders(event_id);
create index if not exists idx_tickets_order on tickets(order_id);
create index if not exists idx_tickets_code on tickets(code);

-- Row Level Security: el catálogo público puede leer eventos/tipos de boleto publicados;
-- todo lo demás (crear boletos, validar accesos) pasa por el backend con la service role key.
alter table brands enable row level security;
alter table events enable row level security;
alter table ticket_types enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;

create policy "public read brands" on brands for select using (true);
create policy "public read published events" on events for select using (status = 'published');
create policy "public read ticket types of published events" on ticket_types for select using (
  exists (select 1 from events e where e.id = ticket_types.event_id and e.status = 'published')
);
-- orders y tickets no llevan policy de lectura pública: se acceden solo con la service role key
-- desde las rutas /api (checkout, webhooks, validación).

-- Datos de ejemplo para que veas algo al correr `npm run dev`
insert into brands (name, slug, color) values
  ('CDMX Socials', 'cdmx-socials', '#2A2BE0'),
  ('La Noche Latina', 'la-noche-latina', '#B8341F'),
  ('Locals & Nomads', 'locals-nomads', '#8A2A8F')
on conflict (slug) do nothing;

insert into events (brand_id, name, slug, description, venue, starts_at, status)
select b.id, 'La Noche Latina', 'la-noche-latina-31-oct',
  'Reggaetón, salsa y cumbia en vivo hasta el amanecer. DJ invitado + banda.',
  'Salón Los Ángeles, CDMX', '2026-10-31 22:00:00-06', 'published'
from brands b where b.slug = 'la-noche-latina'
on conflict (slug) do nothing;

insert into ticket_types (event_id, name, description, price_cents, quantity_total)
select e.id, 'General', 'Acceso a pista', 35000, 250 from events e where e.slug = 'la-noche-latina-31-oct'
union all
select e.id, 'VIP', 'Mesa + botella', 70000, 40 from events e where e.slug = 'la-noche-latina-31-oct'
on conflict do nothing;
