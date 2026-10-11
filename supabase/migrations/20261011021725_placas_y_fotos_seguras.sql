-- 1) Acaparamiento: la placa era única en toda la tabla, así que una alta "pendiente" de otra cuenta
--    bloqueaba al dueño real. Ahora solo es única entre las APROBADAS (el admin decide entre reclamos).
alter table public.vehicles drop constraint vehicles_placa_key;
create unique index vehicles_placa_aprobada on public.vehicles (placa) where aprobacion = 'aprobado';
create index on public.vehicles (placa);

-- 2) XSS almacenado: el bucket público de fotos aceptaba SVG (puede llevar script). Solo imágenes rasterizadas.
update storage.buckets set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'] where id = 'fotos';
