-- Reenfoque: verificar es el núcleo. Lo que una empresa registra y el turista puede verificar:
-- canales oficiales (WhatsApp, Yape, Plin, banco, redes, web), personal, destinos, vehículos con foto.
-- Altas hechas por la empresa entran "pendiente" y solo se muestran cuando el admin las aprueba.

-- ---------- canales oficiales ----------
create table public.canales (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  tipo text not null check (tipo in ('whatsapp', 'telefono', 'yape', 'plin', 'banco', 'instagram', 'facebook', 'tiktok', 'web')),
  -- clave de búsqueda normalizada (celular: 9 dígitos; red: usuario en minúsculas; web: dominio;
  -- banco: sha256 de los dígitos). NO se expone por la API.
  valor text not null check (char_length(valor) <= 100),
  visible text not null check (char_length(visible) <= 80), -- lo que se muestra: "987 654 321", "•••• 4821 · BCP", "@cuenta"
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  motivo text check (char_length(motivo) <= 500),
  revisor uuid references auth.users(id),
  revisado_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.canales (valor);
create index on public.canales (provider_id);
-- Un mismo número o cuenta no puede quedar aprobado para dos empresas.
create unique index canales_valor_aprobado on public.canales (tipo, valor) where estado = 'aprobado';

-- ---------- personal (guías, conductores, vendedores) ----------
create table public.personal (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 3 and 80),
  rol text not null check (rol in ('guia', 'conductor', 'vendedor', 'otro')),
  dni_ultimos3 char(3) not null check (dni_ultimos3 ~ '^[0-9]{3}$'), -- nunca el DNI completo
  foto_url text,
  carne_numero text check (char_length(carne_numero) <= 30), -- carné de guía oficial
  carne_vence date,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  motivo text check (char_length(motivo) <= 500),
  revisor uuid references auth.users(id),
  revisado_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.personal (provider_id);

-- ---------- destinos que atiende (catálogo fijo, config/textos.ts DESTINOS) ----------
create table public.empresa_destinos (
  provider_id uuid not null references public.providers(id) on delete cascade,
  destino text not null check (destino in ('mancora', 'los_organos', 'colan_paita', 'catacaos', 'chulucanas', 'piura')),
  primary key (provider_id, destino)
);
create index on public.empresa_destinos (destino);

-- ---------- fotos y aprobación de vehículos ----------
alter table public.providers add column foto_url text;
alter table public.vehicles
  add column foto_url text,
  add column autorizacion_mtc text check (char_length(autorizacion_mtc) <= 60),
  add column aprobacion text not null default 'aprobado' check (aprobacion in ('pendiente', 'aprobado', 'rechazado')),
  add column motivo text check (char_length(motivo) <= 500),
  add column revisor uuid references auth.users(id),
  add column revisado_at timestamptz;
alter policy "lectura publica" on public.vehicles using (aprobacion = 'aprobado');

-- ---------- reportes de turistas ----------
create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  que_paso text not null check (char_length(que_paso) between 5 and 1000),
  dato text check (char_length(dato) <= 120),
  provider_id uuid references public.providers(id) on delete set null,
  destino text,
  foto_path text,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'revisado')),
  created_at timestamptz not null default now()
);

-- ---------- consultas: nuevos tipos y destino (para "no encontrados" por destino) ----------
alter table public.lookups drop constraint lookups_tipo_entrada_check;
alter table public.lookups add constraint lookups_tipo_entrada_check
  check (tipo_entrada in ('nombre', 'ruc', 'placa', 'logo', 'red_social', 'celular', 'banco', 'qr'));
alter table public.lookups add column destino text;

-- ---------- acceso ----------
alter table public.canales enable row level security;
alter table public.personal enable row level security;
alter table public.empresa_destinos enable row level security;
alter table public.reportes enable row level security;
revoke all on public.canales, public.personal, public.empresa_destinos, public.reportes from anon, authenticated;

-- Público: solo lo aprobado y solo columnas mostrables (canales.valor nunca).
grant select (id, provider_id, tipo, visible, estado) on public.canales to anon, authenticated;
create policy "ver aprobados" on public.canales for select to anon, authenticated using (estado = 'aprobado');
grant select (id, provider_id, nombre, rol, dni_ultimos3, foto_url, carne_numero, carne_vence, estado) on public.personal to anon, authenticated;
create policy "ver aprobados" on public.personal for select to anon, authenticated using (estado = 'aprobado');
grant select on public.empresa_destinos to anon, authenticated;
create policy "lectura publica" on public.empresa_destinos for select to anon, authenticated using (true);
-- reportes: sin grants (los inserta el servidor; los lee el admin con service role).

-- ---------- fotos públicas (vehículos, personal, logos): las sube el servidor ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;
