-- Catálogo de servicios por proveedor (web cliente tipo catálogo). docs/CATALOGO.md
-- PENDIENTE DE APLICAR en el proyecto remoto (PENDIENTE.md, prioridad 1). Al aplicarlo con el MCP
-- (apply_migration), renombrar este archivo a la versión que reporte list_migrations.
-- Solo se publican servicios de proveedores que ya están en `providers` (estar publicado = formal).

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  categoria text not null check (categoria in ('experiencia', 'hospedaje', 'restaurante', 'transporte')),
  nombre text not null check (char_length(nombre) between 3 and 120),
  destino text not null,                 -- id de DESTINOS en config/textos.ts (mancora, los_organos, …)
  descripcion text check (char_length(descripcion) <= 1500),
  duracion text,                         -- "3 horas"
  salidas text,                          -- "7:00 y 10:00"
  temporada text,                        -- "Julio a octubre"
  idiomas text[] not null default '{}',
  grupo_max smallint check (grupo_max > 0),
  incluye text[] not null default '{}',
  no_incluye text[] not null default '{}',
  itinerario jsonb not null default '[]', -- [{"titulo": "Encuentro en el muelle", "detalle": "charla de seguridad (15 min)"}]
  punto_encuentro text,
  condiciones text,
  precio_ref numeric(8, 2) check (precio_ref >= 0),
  unidad_precio text not null default 'por persona',
  ilustracion text,                      -- clave de components/ilustracion.tsx mientras no haya fotos
  fotos text[] not null default '{}',    -- rutas públicas (futuro bucket propio)
  estado text not null default 'pendiente' check (estado in ('pendiente', 'publicado', 'rechazado')),
  es_muestra boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.services (provider_id);
create index on public.services (categoria, destino) where estado = 'publicado';

alter table public.services enable row level security;

-- Supabase concede ALL por defecto: se revoca y se concede solo lectura de lo publicado.
-- Altas y cambios: solo service role (admin hoy; formulario de la agencia con validación, a futuro).
revoke all on public.services from anon, authenticated;
grant select on public.services to anon, authenticated;
create policy "ver publicados" on public.services for select to anon, authenticated
  using (estado = 'publicado' or (select public.es_admin()));
