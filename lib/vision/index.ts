// Costura de extracción: imagen/PDF → campos en JSON con certeza por campo.
// Fase 2 conecta Gemini aquí. Sin GEMINI_API_KEY devuelve null y la capa queda "no evaluada".

export type TipoDocumento = "constancia_agencia" | "tuc";
export type Certeza = "alta" | "media" | "baja";

export type CamposConstancia = {
  numero_constancia: string | null;
  nombre_comercial: string | null;
  razon_social: string | null;
  ruc: string | null;
  clase: string | null; // minorista | mayorista | operador de turismo
  modalidad: string | null;
  direccion: string | null;
  fecha_emision: string | null; // AAAA-MM-DD
  entidad_emisora: string | null;
  cita_decreto_005_2020: boolean;
};

export type CamposTuc = {
  numero_tuc: string | null;
  placa: string | null;
  ruc: string | null;
  razon_social: string | null;
  modalidad: string | null;
  numero_resolucion: string | null;
  entidad_emisora: string | null;
  habilitacion_vencimiento: string | null; // AAAA-MM-DD
};

export type Extraccion =
  | { tipo: "constancia_agencia"; campos: CamposConstancia; certeza: Partial<Record<keyof CamposConstancia, Certeza>> }
  | { tipo: "tuc"; campos: CamposTuc; certeza: Partial<Record<keyof CamposTuc, Certeza>> };

export async function extraerDocumento(_bytes: Uint8Array, _mime: string, _tipo: TipoDocumento): Promise<Extraccion | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  return null; // ponytail: implementación Gemini en la Fase 2
}
