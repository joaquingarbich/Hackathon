# Sistema de diseño "Sello" v0.2

Fuente: mockups de Claude Design en `docs/disenos/` (abrir `docs/disenos/index.html`). El sistema completo está en `docs/disenos/00_Sistema_de_diseno/Sistema_de_diseno_v0.2.html`.

**Idea:** se usa tinta para la interfaz y color solo para el estado del dictamen. El único elemento con personalidad es **el sello**.

## Principios

1. **Informa, no acusa.** Nunca se dice "informal", "ilegal", "estafa" ni "fraude". Se dice lo que consta y qué hacer.
2. **Fuente y fecha, siempre.** Viven dentro del sello. "No encontrado" no es una conclusión negativa.
3. **Formalidad ≠ reputación.** Las opiniones van aparte, en neutro, y nunca cambian el estado.
4. **El catálogo da por hecho la formalidad.** Si un proveedor está publicado, ya pasó el control. En las tarjetas solo aparece una etiqueta cuando el estado no es "Verificado", por ejemplo "Registro en actualización".

## Dónde vive cada cosa

| Pieza | Archivo |
|---|---|
| Tokens de color, radios y fuentes, en claro y oscuro | `app/globals.css` (`@theme` + `@media (prefers-color-scheme: dark)`) |
| Fuentes (Bricolage Grotesque, Atkinson Hyperlegible, JetBrains Mono) | `app/layout.tsx` (`next/font`) |
| Componentes base | `components/ui.tsx` |
| Cabecera, barra de pestañas y pie | `components/navegacion.tsx` |
| Ilustraciones de los mockups (en lugar de fotos) | `components/ilustracion.tsx` |
| Textos visibles | `config/textos.ts` |
| Muestrario | `/estilos` (revisar en claro y oscuro tras tocar tokens) |

Los componentes usan **solo tokens semánticos** (`bg-superficie`, `text-verificado`…), nunca colores crudos. La única excepción son las ilustraciones, porque son contenido y no interfaz.

## Tokens

| Rol | Claro | Oscuro | Token |
|---|---|---|---|
| Fondo | `#F4F6F5` | `#0B141B` | `fondo` |
| Superficie | `#FFFFFF` | `#15212B` | `superficie` |
| Relleno (chips, bloque de opiniones) | `#ECEEF0` | `#26323C` | `relleno` |
| Texto | `#0E1B24` | `#E8ECEE` | `texto` |
| Texto secundario | `#46535E` | `#A9B3BA` | `texto-suave` |
| Borde de control (4,6:1) | `#6B7782` | `#7A8792` | `borde` |
| Separador (decorativo) | `#DCE1E4` | `#26323C` | `separador` |
| Tinta (botón primario) | `#0E1B24` | `#E8ECEE` | `primario` |
| Portada (hero) | `#0E1B24` | `#15212B` | `portada` |

En los estados, cada uno tiene texto, fondo y borde (el borde es también el color sólido del ícono del sello):

| Estado | Ícono | Texto claro | Fondo claro | Borde claro | Token |
|---|---|---|---|---|---|
| Verificado | ✓ | `#0D6634` | `#E2F3E7` | `#137A43` | `verificado` |
| Con observaciones | ▲ | `#82500A` | `#FDF0D5` | `#A86200` | `observaciones` |
| En proceso | ◷ | `#1C4C99` | `#E3ECFA` | `#2559B8` | `actualizacion` |
| No encontrado | ? | `#47515A` | `#ECEEF0` | `#5A646E` | `no-encontrado` |
| Alerta | ⬣ | `#A3221B` | `#FBE5E2` | `#B92D25` | `alerta` |

El estado siempre lleva ícono y palabra, porque el ámbar y el azul son difíciles de separar para algunas personas. La app no tiene interruptor de apariencia: sigue la del sistema.

## Tipografía

- Títulos: Bricolage Grotesque 800 (34 px en móvil) y 700 para secciones (22 px).
- Cuerpo: Atkinson Hyperlegible, 17 px en móvil y 16 en escritorio. Secundario 15. **Nota mínima 13, nunca menos.**
- Mono (JetBrains Mono) **solo** para RUC, placas, n.° y fechas: `<Mono>`.
- Todo en rem, para que crezca con el tamaño de texto del sistema.

## Componentes (`components/ui.tsx`)

- `Sello`: estado, resumen, fuentes y fecha de corte, con borde doble punteado. Va arriba en todo dictamen.
- `InsigniaEstado`: estado en línea (ícono + palabra). Acepta `texto` para la etiqueta del catálogo.
- `ChipProceso`: En revisión / Aprobado / Por corregir, con **contorno, nunca relleno**. No son estados públicos.
- `Boton` y `claseBoton(variante)`: 52 px de alto; variantes primario (tinta), secundario (contorno) y fantasma.
- `Campo` y `claseControl`: borde de 1,5 px `borde`; estados de error y ayuda.
- `Tarjeta`, `Plegable` (con `extra` a la derecha) y `BarraAccion` (acción principal fija abajo en móvil).
- `Pagina` (angosta: dictámenes y trámites) y `Contenedor` (ancho: catálogo).
- `NotaValoracion` ("★ 4,8 de 5"), `etiquetaValoracion` y `soles`.

## Glosario y voz

- **proveedor** reemplaza "prestador" y "operador" en toda la interfaz. Las rutas `/prestador` y `/operador` y los nombres en el código siguen igual.
- **dictamen**: el resultado de una consulta. **corte**: la fecha de los datos de cada fuente.
- **Documentos** une "Solicitudes" y "Requisitos" en un solo lugar.
- Sin "nosotros": se escribe "Sin coincidencias en los registros oficiales con corte al…", no "No pudimos verificar…". Tampoco posesivos de más: "Solicitudes", no "Mis solicitudes".

## Mapa mockup → ruta

| Mockup | Ruta / componente |
|---|---|
| W01 Inicio | `/` (`app/page.tsx`) |
| W02 Resultados | `/explorar` |
| W04 Experiencia | `/experiencia/[id]` + `components/consulta-proveedor.tsx` |
| W05 Verificar / C01 Consulta | `/verificar` + `components/consulta-foto.tsx` |
| C03 Dictamen | `/prestador/[id]` |
| C04 Placa con alerta | `/vehiculo/[placa]` |
| C05 No encontrado | `/consulta?q=` |
| P02/P04 Registro | `/ingresar` (solo correo y contraseña; RUC con SUNAT y código SMS: pendiente) |
| P05/P07 Inicio y documentos del proveedor | `/operador` |
| A02 Cola / A03 Revisión | `/admin`, `/admin/[id]`, `/admin/resena/[id]` |
| (nuevo) Guardados | `/guardados` + `components/guardados.tsx` (localStorage, sin cuenta) |

**No implementado de los mockups** (ver `PENDIENTE.md`): botón English, código por SMS, validación del RUC contra SUNAT en el registro, pestañas Unidades y Perfil del proveedor, licencia de funcionamiento, "Ver las 18 fotos", compartir dictamen, padrones en el panel admin y la pantalla C01b "Leyendo captura" con pasos.
