// Canales oficiales de una empresa: forma normalizada para buscar (valor) y forma para mostrar (visible).
// Pura (sin crypto): la cuenta bancaria se hashea fuera, con la función que se pase.
export const TIPOS_CANAL = ["whatsapp", "telefono", "yape", "plin", "banco", "instagram", "facebook", "tiktok", "web"] as const;
export type TipoCanal = (typeof TIPOS_CANAL)[number];
export const CANALES_CELULAR: TipoCanal[] = ["whatsapp", "telefono", "yape", "plin"];

export const celularVisible = (d: string) => `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;

export function normalizarCanal(
  tipo: TipoCanal, texto: string, hash: (s: string) => string, etiqueta = "",
): { valor: string; visible: string } | { error: string } {
  const t = texto.trim();
  if (CANALES_CELULAR.includes(tipo)) {
    const d = t.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "");
    if (!/^9\d{8}$/.test(d)) return { error: "Escribe un celular peruano de 9 dígitos." };
    return { valor: d, visible: celularVisible(d) };
  }
  if (tipo === "banco") {
    const d = t.replace(/\D/g, "");
    if (!/^\d{13,20}$/.test(d)) return { error: "La cuenta o CCI debe tener entre 13 y 20 dígitos." };
    const banco = etiqueta.trim().slice(0, 30);
    return { valor: hash(d), visible: `•••• ${d.slice(-4)}${banco ? ` · ${banco}` : ""}` }; // nunca la cuenta completa
  }
  if (tipo === "web") {
    try {
      const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
      if (!/\.[a-z]{2,}$/i.test(u.hostname)) throw new Error();
      const host = u.hostname.toLowerCase().replace(/^www\./, "");
      return { valor: host, visible: host };
    } catch {
      return { error: "Escribe una web válida, p. ej. https://miagencia.pe" };
    }
  }
  const u = t.replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9._]{2,30}$/.test(u)) return { error: "Cuenta no válida: solo letras, números, punto y guion bajo." };
  return { valor: u, visible: `@${u}` };
}
