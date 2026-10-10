// Solo navegador. Reduce fotos de celular (3-8 MB) antes de enviarlas: menos datos móviles y bajo el límite de las Server Actions.
export async function reducirImagen(archivo: File, lado = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(archivo);
  const k = Math.min(1, lado / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("toBlob"))), "image/jpeg", 0.85));
}
