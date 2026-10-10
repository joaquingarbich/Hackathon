-- Límite de frecuencia para acciones que consumen cuota de Gemini (foto, opiniones, documentos).
-- clave = acción + hash de IP o usuario (nunca la IP en claro). Solo el servidor (service role) la usa.
create table public.limites (
  clave text not null check (char_length(clave) <= 100),
  ventana timestamptz not null,
  n int not null default 1,
  primary key (clave, ventana)
);
alter table public.limites enable row level security;
revoke all on public.limites from anon, authenticated;

-- Suma 1 al contador de la ventana actual y devuelve el total (atómico con on conflict).
create or replace function public.consumir_cupo(p_clave text, p_ventana_seg int)
returns int
language sql
volatile
set search_path = ''
as $$
  insert into public.limites (clave, ventana, n)
  values (p_clave, to_timestamp(floor(extract(epoch from now()) / p_ventana_seg) * p_ventana_seg), 1)
  on conflict (clave, ventana) do update set n = public.limites.n + 1
  returning n
$$;
-- Las funciones nuevas son ejecutables por PUBLIC por defecto: solo el servidor.
revoke execute on function public.consumir_cupo(text, int) from public, anon, authenticated;
