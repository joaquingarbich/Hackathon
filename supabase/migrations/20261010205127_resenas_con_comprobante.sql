-- Fase 4: reseñas solo con comprobante de pago del prestador + revisión del admin.

-- La reseña de prueba que quedó de la Fase 0 no debe publicarse.
update public.reviews set estado = 'oculta' where device_hash like 'prueba-claude%';

-- Nuevos estados: nace "pendiente" (revisión del admin) y puede terminar "rechazada".
alter table public.reviews drop constraint reviews_estado_check;
alter table public.reviews add constraint reviews_estado_check
  check (estado in ('pendiente', 'visible', 'reportada', 'oculta', 'rechazada'));
alter table public.reviews alter column estado set default 'pendiente';

alter table public.reviews
  add column servicio text check (char_length(servicio) <= 60),
  add column fecha_servicio date,
  add column comprobante_path text,
  add column comprobante_ruc char(11),
  add column comprobante_serie text check (char_length(comprobante_serie) <= 40),
  add column comprobante_fecha date,
  add column verificacion jsonb,
  add column verificado boolean not null default false,
  add column motivo text check (char_length(motivo) <= 500),
  add column revisor uuid references auth.users(id),
  add column revisado_at timestamptz;

-- Un comprobante = una reseña.
create unique index reviews_comprobante_unico on public.reviews (comprobante_ruc, comprobante_serie)
  where comprobante_serie is not null;

-- Datos de contacto: privados. Sin grants ni políticas = nadie los lee por la API; solo el servidor (admin).
create table public.review_contactos (
  review_id uuid primary key references public.reviews(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 80),
  correo text not null check (char_length(correo) between 5 and 120),
  celular text not null check (celular ~ '^[0-9]{9}$'),
  consentimiento_at timestamptz not null default now()
);
alter table public.review_contactos enable row level security;
revoke all on public.review_contactos from anon, authenticated;

-- Reseñas: se crean y moderan solo desde el servidor; el público lee columnas públicas de las publicadas.
revoke all on public.reviews from anon, authenticated;
grant select (id, provider_id, estrellas, comentario, alias, servicio, fecha_servicio, verificado, respuesta_prestador, estado, created_at)
  on public.reviews to anon, authenticated;
-- "reportada" sigue visible hasta que el admin decida (si no, reportar bastaría para ocultar reseñas ajenas).
alter policy "ver visibles" on public.reviews using (estado in ('visible', 'reportada'));
