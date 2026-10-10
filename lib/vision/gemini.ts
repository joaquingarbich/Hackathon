// Única implementación del proveedor de visión. Cambiar de proveedor = reescribir este archivo.
const MODELO = process.env.GEMINI_MODEL || "gemini-flash-latest"; // alias del último Flash estable

/** Imagen/PDF + instrucción → JSON que cumple `esquema`. Lanza si la API falla. */
export async function generarJson(instruccion: string, bytes: Uint8Array, mime: string, esquema: object): Promise<unknown> {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mime, data: Buffer.from(bytes).toString("base64") } }, { text: instruccion }] }],
      generationConfig: { responseMimeType: "application/json", responseJsonSchema: esquema, temperature: 0 },
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  const texto = d?.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text)?.text;
  if (!texto) throw new Error(`Gemini sin respuesta (${d?.candidates?.[0]?.finishReason ?? "?"})`);
  return JSON.parse(texto);
}
