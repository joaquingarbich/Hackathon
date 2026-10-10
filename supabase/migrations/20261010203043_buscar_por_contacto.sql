-- Fase 2: identificar al prestador por la cuenta de redes (@usuario) o el teléfono que aparecen en un anuncio.
-- usuario llega saneado desde el servidor ([a-z0-9._], sin @); telefono solo dígitos.
create or replace function public.buscar_por_contacto(usuario text default '', telefono text default '')
returns table (id uuid)
language sql
stable
set search_path = ''
as $$
  select p.id
  from public.providers p
  where (length(usuario) >= 3 and strpos(lower(p.redes::text), lower(usuario)) > 0)
     or (length(telefono) >= 6 and right(regexp_replace(coalesce(p.telefono, ''), '\D', '', 'g'), 9) = right(telefono, 9))
  limit 3
$$;

grant execute on function public.buscar_por_contacto(text, text) to anon, authenticated;
