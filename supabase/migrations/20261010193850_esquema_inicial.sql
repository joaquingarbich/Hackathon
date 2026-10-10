-- CheckTur Piura — esquema inicial (Fase 0)
-- Clave de cruce entre fuentes: RUC. La placa enlaza vehículo → prestador.

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------------
-- Normalización de nombres: única fuente de verdad (la búsqueda usa la misma)
-- minúsculas, sin tildes ni signos, sin sufijos societarios ni palabras genéricas
-- ---------------------------------------------------------------------------
create or replace function public.normalizar_nombre(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select trim(regexp_replace(
    regexp_replace(
      regexp_replace(lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t, ''))), '[^a-z0-9]+', ' ', 'g'),
      '\m(s a c|s r l|e i r l|s a|sac|srl|eirl|sa|tours?|travel|viajes|turismo|agencia|operador|de|del|y|la|el|los|las)\M',
      ' ', 'g'),
    '\s+', ' ', 'g'))
$$;

-- Admin = app_metadata.rol (no editable por el usuario, a diferencia de user_metadata)
create or replace function public.es_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'rol', '') = 'admin'
$$;

-- ---------------------------------------------------------------------------
-- Fuentes y padrones
-- ---------------------------------------------------------------------------
create table public.sources (
  id text primary key,                 -- 'mincetur_directorio', 'sunat_padron', 'muestra', ...
  nombre text not null,
  url text,
  fecha_corte date not null,
  n_registros int
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('agencia', 'hospedaje', 'restaurante', 'guia', 'transporte_terrestre')),
  ruc char(11),                        -- null permitido (p. ej. guías persona natural sin RUC en el export)
  razon_social text,
  nombre_comercial text,
  nombre_normalizado text generated always as (public.normalizar_nombre(coalesce(nombre_comercial, '') || ' ' || coalesce(razon_social, ''))) stored,
  clases text[] not null default '{}', -- agencia: minorista | mayorista | operador
  modalidad text,                      -- presencial | presencial_digital | digital
  actividades text[] not null default '{}',
  direccion text,
  distrito text,
  provincia text,
  telefono text,
  correo text,
  web text,
  redes jsonb not null default '{}',   -- {"instagram": "@x", "facebook": "..."}
  estado_inscripcion text not null default 'vigente' check (estado_inscripcion in ('vigente', 'suspendida')),
  es_muestra boolean not null default false,
  source_id text not null references public.sources(id)
);
create index on public.providers (ruc);
-- ponytail: búsqueda difusa sin índice trigram; secuencial en pocos miles de filas es ms. Añadir GIN gin_trgm_ops si crece.

create table public.authorizations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  tipo text not null check (tipo in ('constancia_dircetur', 'certificado_clasificacion', 'autorizacion_transporte', 'carne_guia', 'certificado_aventura')),
  entidad_emisora text not null,
  numero text,
  fecha_emision date,
  fecha_vencimiento date,              -- null = vigencia indeterminada
  source_id text not null references public.sources(id)
);
create index on public.authorizations (provider_id);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  placa text not null unique check (placa ~ '^[A-Z][A-Z0-9]{2}[0-9]{3}$'),
  modalidad text not null,             -- 'turistico', 'trabajadores', ...
  ambito text check (ambito in ('nacional', 'regional', 'provincial')),
  estado text not null default 'habilitado' check (estado in ('habilitado', 'cancelado')),
  tuc_numero text,
  habilitacion_vencimiento date,
  citv_vencimiento date,
  soat_vencimiento date,
  es_muestra boolean not null default false,
  source_id text not null references public.sources(id)
);
create index on public.vehicles (provider_id);

-- Subconjunto del padrón reducido SUNAT (solo RUC presentes en providers/submissions)
create table public.ruc_status (
  ruc char(11) primary key,
  razon_social text not null,
  estado text not null,                -- 'ACTIVO', 'BAJA DE OFICIO', ...
  condicion text not null,             -- 'HABIDO', 'NO HABIDO', ...
  ubigeo text,
  source_id text not null references public.sources(id)
);

-- ---------------------------------------------------------------------------
-- Flujo operador → admin
-- ---------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ruc char(11) not null,
  tipo_documento text not null check (tipo_documento in ('constancia_agencia', 'tuc')),
  archivo_path text not null,          -- ruta en el bucket 'documentos': <user_id>/<archivo>
  hash text not null,
  campos_extraidos jsonb,
  resultado_capas jsonb,
  confianza text check (confianza in ('alta', 'media', 'baja')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  revisor uuid references auth.users(id),
  motivo text,
  created_at timestamptz not null default now(),
  revisado_at timestamptz,
  vence_el date
);
create index on public.submissions (ruc);
create index on public.submissions (user_id);

-- ---------------------------------------------------------------------------
-- Turista: consultas (sin datos personales) y reseñas
-- ---------------------------------------------------------------------------
create table public.lookups (
  id bigint generated always as identity primary key,
  tipo_entrada text not null check (tipo_entrada in ('nombre', 'ruc', 'placa', 'logo', 'red_social')),
  entrada_normalizada text,
  provider_id uuid references public.providers(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  estado_resultado text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  estrellas smallint not null check (estrellas between 1 and 5),
  comentario text check (char_length(comentario) <= 500),
  alias text check (char_length(alias) <= 40),
  device_hash text not null,
  estado text not null default 'visible' check (estado in ('visible', 'reportada', 'oculta')),
  respuesta_prestador text,
  created_at timestamptz not null default now(),
  unique (provider_id, device_hash)
);
create index on public.reviews (provider_id);

-- ---------------------------------------------------------------------------
-- Búsqueda difusa por nombre
-- ---------------------------------------------------------------------------
create or replace function public.buscar_prestadores(q text, umbral real default 0.5, limite int default 3)
returns table (id uuid, tipo text, ruc char(11), nombre_comercial text, razon_social text, similitud real)
language sql
stable
set search_path = ''
as $$
  select p.id, p.tipo, p.ruc, p.nombre_comercial, p.razon_social,
         extensions.word_similarity(public.normalizar_nombre(q), p.nombre_normalizado) as similitud
  from public.providers p
  where public.normalizar_nombre(q) <> ''
    and extensions.word_similarity(public.normalizar_nombre(q), p.nombre_normalizado) >= umbral
  order by similitud desc
  limit limite
$$;

-- ---------------------------------------------------------------------------
-- Acceso (Data API + RLS)
-- ---------------------------------------------------------------------------
alter table public.sources        enable row level security;
alter table public.providers      enable row level security;
alter table public.authorizations enable row level security;
alter table public.vehicles       enable row level security;
alter table public.ruc_status     enable row level security;
alter table public.submissions    enable row level security;
alter table public.lookups        enable row level security;
alter table public.reviews        enable row level security;

-- Padrones: lectura pública. Escritura solo vía service role (loaders).
grant select on public.sources, public.providers, public.authorizations, public.vehicles, public.ruc_status to anon, authenticated;
create policy "lectura publica" on public.sources        for select to anon, authenticated using (true);
create policy "lectura publica" on public.providers      for select to anon, authenticated using (true);
create policy "lectura publica" on public.authorizations for select to anon, authenticated using (true);
create policy "lectura publica" on public.vehicles       for select to anon, authenticated using (true);
create policy "lectura publica" on public.ruc_status     for select to anon, authenticated using (true);

-- Consultas: solo se registran, nadie las lee por la API salvo el admin.
grant insert on public.lookups to anon, authenticated;
grant select on public.lookups to authenticated;
create policy "registrar consulta" on public.lookups for insert to anon, authenticated with check (true);
create policy "admin lee consultas" on public.lookups for select to authenticated using ((select public.es_admin()));

-- Reseñas: cualquiera publica y ve las visibles; el admin ve y modera todas.
grant select, insert on public.reviews to anon, authenticated;
grant update on public.reviews to authenticated;
create policy "ver visibles" on public.reviews for select to anon, authenticated
  using (estado = 'visible' or (select public.es_admin()));
create policy "publicar resena" on public.reviews for insert to anon, authenticated
  with check (estado = 'visible' and respuesta_prestador is null);
create policy "admin modera" on public.reviews for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Solicitudes: el operador crea y ve las suyas; el admin ve y resuelve todas.
grant select, insert, update on public.submissions to authenticated;
create policy "operador ve las suyas" on public.submissions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.es_admin()));
create policy "operador crea" on public.submissions for insert to authenticated
  with check (user_id = (select auth.uid()) and estado = 'pendiente' and revisor is null);
create policy "admin resuelve" on public.submissions for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

grant execute on function public.buscar_prestadores(text, real, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: documentos privados en <user_id>/<archivo>
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('documentos', 'documentos', false)
on conflict (id) do nothing;

create policy "operador sube a su carpeta" on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "operador y admin leen" on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.es_admin())));
