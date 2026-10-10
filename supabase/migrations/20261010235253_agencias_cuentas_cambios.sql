-- Registro de agencias: cuenta ↔ proveedor, cambios de perfil y servicios con revisión del admin.
-- Todo lo escribe el servidor (service role) tras verificar sesión y propiedad: sin grants a anon/authenticated.

-- Una cuenta administra un proveedor cuando el admin le aprueba un documento de ese RUC.
create table public.proveedor_cuentas (
  provider_id uuid primary key references public.providers(id) on delete cascade, -- un dueño por proveedor
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index on public.proveedor_cuentas (user_id);
alter table public.proveedor_cuentas enable row level security;
revoke all on public.proveedor_cuentas from anon, authenticated;

-- Cambios de perfil propuestos por la agencia: no se aplican hasta que el admin los aprueba
-- (el teléfono es el que usa el botón de WhatsApp del catálogo).
create table public.proveedor_cambios (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  datos jsonb not null check (jsonb_typeof(datos) = 'object' and pg_column_size(datos) < 4000),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  motivo text check (char_length(motivo) <= 500),
  revisor uuid references auth.users(id),
  revisado_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.proveedor_cambios (provider_id);
alter table public.proveedor_cambios enable row level security;
revoke all on public.proveedor_cambios from anon, authenticated;

-- Descripción pública de la agencia (perfil).
alter table public.providers add column descripcion text check (char_length(descripcion) <= 1000);

-- Moderación de servicios (auditoría como en submissions/reviews).
alter table public.services
  add column motivo text check (char_length(motivo) <= 500),
  add column revisor uuid references auth.users(id),
  add column revisado_at timestamptz;
