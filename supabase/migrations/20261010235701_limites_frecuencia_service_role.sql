-- Al revocar a PUBLIC también se le quitó al service_role (quien la usa desde el servidor).
grant execute on function public.consumir_cupo(text, int) to service_role;
