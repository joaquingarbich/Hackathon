-- La cuenta de redes debe coincidir EXACTAMENTE con un valor registrado (sin @, sin mayúsculas).
-- Antes era subcadena sobre el JSON completo: "@aventura" casaba con "colan.aventura.muestra"
-- y "instagram" con cualquier prestador que tuviera esa clave.
create or replace function public.buscar_por_contacto(usuario text default '', telefono text default '')
returns table (id uuid)
language sql
stable
set search_path = ''
as $$
  select p.id
  from public.providers p
  where (length(buscar_por_contacto.usuario) >= 3
         and exists (
           select 1 from jsonb_each_text(case when jsonb_typeof(p.redes) = 'object' then p.redes else '{}'::jsonb end) r
           where lower(regexp_replace(trim(r.value), '^@', '')) = lower(buscar_por_contacto.usuario)))
     or (length(buscar_por_contacto.telefono) >= 7
         and right(regexp_replace(coalesce(p.telefono, ''), '\D', '', 'g'), 9) = right(buscar_por_contacto.telefono, 9))
  limit 3
$$;
