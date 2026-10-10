// Escenas planas de los mockups (docs/disenos/) mientras los proveedores no suban fotos.
// Son ilustraciones de contenido, no UI: por eso llevan colores propios en vez de tokens.
import type { ReactNode } from "react";

const ESCENAS: Record<string, ReactNode> = {
  ballenas: <><rect width="320" height="200" fill="#D7E7EC" /><rect y="110" width="320" height="90" fill="#2F6F86" /><circle cx="250" cy="60" r="22" fill="#F2C46B" /><path d="M130 140 C134 108 150 100 158 128 C166 100 186 108 186 140 C174 130 166 134 158 146 C150 134 142 130 130 140Z" fill="#173F4D" /></>,
  tortuga: <><rect width="320" height="200" fill="#3C8EA0" /><ellipse cx="160" cy="105" rx="56" ry="38" fill="#2E5A44" /><circle cx="226" cy="100" r="14" fill="#2E5A44" /><path d="M120 80 l-26 -18 M120 130 l-26 18 M200 80 l20 -18 M200 130 l20 18" stroke="#2E5A44" strokeWidth="12" strokeLinecap="round" /></>,
  huacas: <><rect width="320" height="200" fill="#F1E4C8" /><path d="M40 170 L110 110 L180 170Z" fill="#C99A5B" /><rect x="190" y="90" width="80" height="80" fill="#8A5A2B" /><rect y="168" width="320" height="32" fill="#B9894F" /></>,
  ceramica: <><rect width="320" height="200" fill="#EAD9C0" /><path d="M130 170 c-34 -12 -34 -80 0 -92 h36 c34 12 34 80 0 92z" fill="#9C5B34" /><path d="M118 112 h72 M118 132 h72" stroke="#EAD9C0" strokeWidth="5" /></>,
  mancora: <><rect width="320" height="200" fill="#F4E3C3" /><circle cx="160" cy="110" r="36" fill="#E07A3F" /><rect y="115" width="320" height="85" fill="#3E7C93" /></>,
  los_organos: <><rect width="320" height="200" fill="#E3EEF0" /><rect y="100" width="320" height="100" fill="#3C8EA0" /><rect y="92" width="200" height="10" fill="#6B4E2E" /><path d="M30 102 v40 M80 102 v40 M130 102 v40 M180 102 v40" stroke="#6B4E2E" strokeWidth="6" /></>,
  colan_paita: <><rect width="320" height="200" fill="#DDECF0" /><rect y="90" width="320" height="40" fill="#4E9AB0" /><rect y="130" width="320" height="70" fill="#EBD9AE" /><path d="M165 122 Q200 92 235 122Z" fill="#E07A3F" /></>,
  catacaos: <><rect width="320" height="200" fill="#F1E4C8" /><rect y="150" width="320" height="50" fill="#C99A5B" /><rect x="120" y="70" width="80" height="80" fill="#8A5A2B" /></>,
  chulucanas: <><rect width="320" height="200" fill="#EAD9C0" /><path d="M110 170 c-30 -10 -30 -70 0 -80 h30 c30 10 30 70 0 80z" fill="#9C5B34" /></>,
  piura: <><rect width="320" height="200" fill="#F3E6CF" /><rect y="150" width="320" height="50" fill="#D9B98A" /><rect x="60" y="80" width="60" height="70" fill="#B5764A" /><rect x="140" y="60" width="50" height="90" fill="#8A5A2B" /><rect x="210" y="95" width="56" height="55" fill="#C99A5B" /></>,
  hospedaje: <><rect width="320" height="200" fill="#E6EEF0" /><rect y="150" width="320" height="50" fill="#EBD9AE" /><rect x="90" y="70" width="140" height="80" fill="#3E7C93" /><path d="M80 74 L160 30 L240 74Z" fill="#E07A3F" /><rect x="145" y="110" width="30" height="40" fill="#F4E3C3" /></>,
  restaurante: <><rect width="320" height="200" fill="#F4E3C3" /><ellipse cx="160" cy="125" rx="90" ry="30" fill="#FFFFFF" /><ellipse cx="160" cy="118" rx="58" ry="18" fill="#E07A3F" /><circle cx="140" cy="112" r="8" fill="#F2C46B" /><circle cx="176" cy="116" r="7" fill="#2E5A44" /></>,
  transporte: <><rect width="320" height="200" fill="#E3EEF0" /><rect y="150" width="320" height="50" fill="#5A646E" /><rect x="70" y="90" width="180" height="60" rx="10" fill="#2F6F86" /><rect x="90" y="100" width="40" height="22" fill="#D7E7EC" /><rect x="140" y="100" width="40" height="22" fill="#D7E7EC" /><rect x="190" y="100" width="40" height="22" fill="#D7E7EC" /><circle cx="110" cy="152" r="12" fill="#0E1B24" /><circle cx="210" cy="152" r="12" fill="#0E1B24" /></>,
  surf: <><rect width="320" height="200" fill="#F4E3C3" /><rect y="110" width="320" height="90" fill="#3E7C93" /><path d="M0 120 Q40 100 80 120 T160 120 T240 120 T320 120 V130 H0Z" fill="#D7E7EC" /><path d="M150 60 L170 140 L160 142 Z" fill="#E07A3F" /></>,
};

const POR_CATEGORIA: Record<string, string> = { hospedaje: "hospedaje", restaurante: "restaurante", transporte: "transporte" };

export function claveIlustracion(ilustracion: string | null | undefined, categoria?: string, destino?: string | null) {
  if (ilustracion && ESCENAS[ilustracion]) return ilustracion;
  if (categoria && POR_CATEGORIA[categoria]) return POR_CATEGORIA[categoria];
  if (destino && ESCENAS[destino]) return destino;
  return "mancora";
}

export function Ilustracion({ clave, etiqueta, className = "" }: { clave: string; etiqueta: string; className?: string }) {
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Ilustración: ${etiqueta}`} className={`block size-full ${className}`}>
      {ESCENAS[clave] ?? ESCENAS.mancora}
    </svg>
  );
}
