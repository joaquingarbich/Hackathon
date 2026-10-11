# Sistema de diseño «Claro» v1

Reemplaza a «Sello» v0.2. Los mockups de esa versión siguen en `docs/disenos/` como referencia histórica.

**Idea:** blancos fríos y mucho aire. El azul de marca `#056CF2` se usa para las acciones (botones, enlaces, foco), y los estados del dictamen tienen su propia paleta. El elemento con personalidad sigue siendo **el sello**: el resultado grande, con su ícono, y la fuente y fecha de corte dentro de un borde punteado.

## Principios

1. **Verificar es lo principal.** El buscador y el resultado mandan; el directorio va después.
2. **Informa, no acusa.** Nunca se dice «informal», «ilegal», «estafa» ni «fraude». Se dice lo que consta y qué hacer.
3. **Fuente y fecha, siempre.** Viven dentro del sello. «No encontrado» no es una conclusión negativa.
4. **El estado nunca depende solo del color.** Siempre va con ícono y palabra (✓ ▲ ◷ ? ⬣).
5. **Marca ≠ estado.** El azul de marca es para acciones; por eso «En proceso de actualización» es **violeta** y no azul.

## Dónde vive cada cosa

| Pieza | Archivo |
|---|---|
| Tokens de color, radios, sombras y curvas (solo modo claro) | `app/globals.css` (`:root` + `@theme inline`) |
| Tipografía (Geist y Geist Mono) | `app/layout.tsx` (`next/font`) |
| Primitivas shadcn/ui (Button, Input, Card, Badge, Alert, Accordion, NativeSelect, RadioGroup, Checkbox, Skeleton…) | `components/ui/*.tsx`, adaptadas: ver abajo |
| Componentes de CheckTur (Sello, InsigniaEstado, ChipProceso, Campo, Tarjeta, Plegable, Encabezado, Aviso, BarraAccion…) | `components/ui/index.tsx`. Las páginas importan todo de `@/components/ui` |
| Piezas de la ficha (Foto, Placa, Canales, AccionesFicha) | `components/verificacion.tsx` |
| Vista del dictamen (VistaDictamen, Datos, CabeceraDictamen, Cargando) | `components/dictamen.tsx` |
| Cabecera, barra de pestañas y pie | `components/navegacion.tsx` |
| Textos visibles | `config/textos.ts` |
| Vitrina | `/estilos` (revisar tras tocar tokens) |

Configuración de shadcn: `components.json` (estilo `radix-nova`, base Radix, íconos Lucide). Para agregar un componente: `npx shadcn@latest add <nombre>`. Después hay que adaptarlo igual que los demás: 44 px de alto, 16 px de texto, foco sólido, sin `transition-all` e importar `cn` de `@/lib/utils`.

Los componentes usan **solo tokens semánticos** (`bg-card`, `text-muted-foreground`, `text-verificado`…). Las únicas excepciones son la placa (`Placa`), que imita una placa real blanca, y el visor de la cámara del escáner, que va sobre el video.

## Tokens y contraste (WCAG 2.2 AA)

| Rol | Claro | Oscuro | Contraste |
|---|---|---|---|
| `background` (fondo) | `#F7F9FC` | `#0A0F1A` | — |
| `card` (superficie) | `#FFFFFF` | `#111827` | — |
| `muted` (relleno) | `#F1F4F9` | `#1A2233` | — |
| `secondary` (tinte de marca) | `#EBF3FF` / texto `#0550B8` | `#13264A` / `#A9CBFF` | 6,6 / 9,0 |
| `foreground` (texto) | `#0B1324` | `#E9EEF6` | 18,5 / 15,2 |
| `muted-foreground` | `#556070` | `#A3ADBD` | 6,4 / 7,8 |
| `primary` (marca) | `#056CF2`, blanco encima | `#056CF2`, blanco encima | 4,74 |
| `primary-hover` | `#0458C7` | `#0458C7` | 6,5 |
| `enlace` (texto de enlace y antetítulos) | `#0560DA` | `#6EA8FF` | 5,4–5,7 / 7,4–7,9 |
| `input` (borde de control) | `#7D889B` | `#64718A` | 3,4–3,6 / 3,6–3,9 |
| `border` (separador, decorativo) | `#E3E8F0` | `#222C3F` | — |
| `ring` (foco) | `#056CF2` | `#6EA8FF` | ≥ 4 |

**Ojo:** `#056CF2` como **texto pequeño** sobre `background` da 4,49:1 y no llega a AA. Para texto azul se usa `text-enlace`; `text-primary` queda solo para íconos y texto grande.

Estados (texto / fondo / borde; el borde es también el color sólido del ícono):

| Estado | Ícono | Claro | Oscuro |
|---|---|---|---|
| Verificado | ✓ | `#067647` / `#ECFDF3` / `#079455` | `#75E0A7` / `#0B2A1C` / `#2BB673` |
| Con observaciones | ▲ | `#93370D` / `#FFFAEB` / `#DC6803` | `#FEC84B` / `#2E2109` / `#F79009` |
| En proceso de actualización | ◷ | `#5925DC` / `#F4F3FF` / `#6938EF` | `#BDB4FE` / `#1F1A3D` / `#8F7BFA` |
| No encontrado | ? | `#475467` / `#F2F4F7` / `#667085` | `#CDD5DF` / `#1D2433` / `#98A2B3` |
| Alerta | ⬣ | `#B42318` / `#FEF3F2` / `#D92D20` | `#FDA29B` / `#3A1210` / `#F04438` |

Todos los pares de texto dan entre 5,4 y 11,9:1. Los bordes e íconos sobre su fondo dan 3,3:1 o más. La app no tiene interruptor de apariencia: sigue la del sistema y se diseña primero en claro, porque se usa al sol.

## Tipografía

- **Geist** para todo. Títulos en 700 con tracking negativo (`-0.025em` a `-0.035em`), secciones en 600, cuerpo en 400.
- **Escala:** 36 título (30 en móvil) · 19 sección · 17 destacado · 16 cuerpo · 14 secundario · **13 mínimo** (antetítulos en mayúsculas).
- **Geist Mono** (`<Mono>`, con cifras tabulares) **solo** para RUC, placas, n.° y fechas.
- Los inputs miden siempre 16 px o más, para que iOS no haga zoom.

## Forma, sombra y espacio

- **Radios:** 14 px base (`--radius`). Controles 12–14, tarjetas 20, sello 24, chips y píldoras `full`.
- **Sombras frías y suaves:** `shadow-suave` (tarjetas), `shadow-media` (sello y buscador) y `shadow-marca` (botón primario).
- **Espaciado:** base 4. Páginas angostas con `Pagina` (max 42 rem) y anchas con `Contenedor` (max 72 rem).
- **Objetivos táctiles de 44 px como mínimo:** botones `h-11` (44), `lg` 52 y `xl` 60; inputs de 48 px.

## Movimiento (criterios de Emil Kowalski)

| Qué | Cómo | Por qué |
|---|---|---|
| Presionar cualquier pulsable | `.pulsable`: `scale(0.97)`, 160 ms, `--ease-out` | Respuesta inmediata; no se usa `transition: all` |
| Hover | Solo con `@media (hover: hover)` (el `hover:` de Tailwind v4 y `.elevable`) | En táctil el hover queda pegado |
| Resultado (sello, «¿Qué empresa te dijeron?») | `.entrada`: `@starting-style` con opacidad 0 → 1, `translateY(8px) scale(0.98)`, 320 ms | Es lo importante y se ve pocas veces; nada aparece de la nada |
| Listas que llegan juntas | `.escalonado`: 40 ms entre ítems, máximo 200 ms | Escalonado corto que nunca bloquea |
| Chip del tipo detectado | `.chip-entrada`: desde `scale(0.95)`, 180 ms | Cambia poco mientras se escribe |
| Plegables | Un solo chevron que rota, 200 ms ease-out | Sin intercambio de íconos |
| Foco | Anillo sólido y sin transición | El foco no se anima |

Con `prefers-reduced-motion` se quitan los desplazamientos y escalas y quedan solo los fundidos de opacidad (menos movimiento, no cero).

## Glosario y voz

- **proveedor** o **empresa** en el texto visible, nunca «prestador» ni «operador». Las rutas `/prestador` y `/operador` y los nombres en el código siguen igual.
- **dictamen:** el resultado de una consulta. **corte:** la fecha de los datos de cada fuente.
- Sin «nosotros»: «Se leen los datos y se contrastan…», no «Leemos…».

## Verificación del rediseño

Medido en local (build de producción con datos de muestra), a 360×740, en claro y oscuro:

- **axe-core 4.10 (WCAG 2.2 AA):** 15 rutas sin violaciones (la única excepción era `/escanear`, que se retiró).
- **Lighthouse:** 100 en accesibilidad y 100 en buenas prácticas en `/`, `/destinos`, `/prestador/…` y `/vehiculo/…`.
- **Antes, en producción (Sello v0.2):** accesibilidad entre 96 y 100 (`/explorar` daba 96 por `target-size`).
