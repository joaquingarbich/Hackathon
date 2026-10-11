// Normalización de entradas del turista. La de nombres vive en SQL (public.normalizar_nombre).

const PESOS_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function rucValido(ruc: string): boolean {
  if (!/^(10|15|17|20)\d{9}$/.test(ruc)) return false;
  const suma = PESOS_RUC.reduce((acc, p, i) => acc + p * Number(ruc[i]), 0);
  const dv = (11 - (suma % 11)) % 10;
  return dv === Number(ruc[10]);
}

/** "abc-123", "A1B 234" → "ABC123" | null si no tiene forma de placa peruana. */
export function normalizarPlaca(texto: string): string | null {
  const p = texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Formato vigente (desde 2010): letra + 2 alfanuméricos + 3 dígitos. Placas antiguas (AB-1234) no entran.
  return /^[A-Z][A-Z0-9]{2}\d{3}$/.test(p) ? p : null;
}

export type Entrada =
  | { tipo: "ruc"; valor: string }
  | { tipo: "celular"; valor: string } // WhatsApp, teléfono, Yape o Plin
  | { tipo: "banco"; valor: string } // cuenta bancaria o CCI (solo dígitos)
  | { tipo: "placa"; valor: string }
  | { tipo: "nombre"; valor: string };

/** Decide qué escribió el turista en el buscador único (sin que elija categoría). */
export function clasificarEntrada(texto: string): Entrada {
  const limpio = texto.trim();
  const digitos = limpio.replace(/[\s.\-+()]/g, "");
  if (/^\d+$/.test(digitos)) {
    if (/^(10|15|17|20)\d{9}$/.test(digitos)) return { tipo: "ruc", valor: digitos };
    const cel = digitos.replace(/^51(?=9\d{8}$)/, ""); // +51 987 654 321
    if (/^9\d{8}$/.test(cel)) return { tipo: "celular", valor: cel };
    if (/^\d{13,20}$/.test(digitos)) return { tipo: "banco", valor: digitos };
    if (/^\d{11}$/.test(digitos)) return { tipo: "ruc", valor: digitos }; // RUC mal escrito: igual se consulta
  }
  const placa = /^\w{3}[\s-]?\w{3}$/.test(limpio) ? normalizarPlaca(limpio) : null;
  if (placa) return { tipo: "placa", valor: placa };
  return { tipo: "nombre", valor: limpio };
}
