# Issue #72 — F2: caja de flujo y anclaje a cartas propias

**Estado:** propietario aprobó en preview la estructura DOM final; build exit 0 y diff-check correctos; revalidación F3 independiente del diff actual pendiente.
**Branch:** `issue/72-reference-panel-layout`
**Base:** `origin/master@ce53c286155c054bc4c50defeb5ec19cc04fd5fb`

## Decisión de layout

La revisión del propietario confirmó que el tablero pintado estaba desplazado dentro de una caja cuadrada que seguía empezando en su coordenada de flujo original. Ahora `.PlayerBoardLayout` desplaza su `margin-top` por `--player-board-transform-y` y `--player-board-five-seat-y`; `.PlayerBoardContainer` ya no aplica ese transform. Así el borde superior y el final de la caja cuadrada siguen la misma posición que el tablero pintado, incluido el ajuste de cinco jugadores. El wrapper deja 12 px bajo el tablero y suma únicamente el desbordamiento positivo calculado del section observer cuando su fila de cartas sobresale de la caja. Hasta 720 px las dos variables valen cero y se conserva el margen superior original de 50 px.

La configuración que había en `f58a5b5` montaba el `div.reference-panel__triggers` después del section observer dentro de `.PlayerBoardSeatAnchor--observer`; el rail usaba `left: calc(100% + gap)` y `bottom: 0`. Esa ubicación fue reemplazada por el ajuste siguiente tras el nuevo feedback del propietario.

ReactModal continúa creando los diálogos en `document.body`; mover el rail a hermano del section no cambia el comportamiento de los modales. Los botones conservan sus acciones y `aria-label`. El tooltip visual está oculto hasta 520 px; de 521–600 px el primero se ancla al borde izquierdo del botón y se limita a `100vw - 12px`. El anillo de foco se dibuja dentro del botón hasta 600 px.

## Geometría de la versión anterior (supersedida por el ajuste siguiente)

- Entre 532–731 px, la fila desktop de tamaño mínimo mide 157 px. El rail empieza en `(W + 157)/2 + 6px`; con sus 172 px deja 9.5 px al borde del viewport a W=532. Por encima de ese rango crece lentamente con `clamp(76px, 10.4vw, 134px)`, mientras el margen viewport aumenta.
- Entre 521–531, la misma fila de 157 px precede a un rail de 160 px separado por 6 px; el margen derecho está entre 16 y 21 px.
- En 361–438, la fila mobile mide entre ≈121 y 141 px, el rail es de 90 px y el gap es 8 px. El margen horizontal restante va de ≈22 px a ≈51 px.
- De 439–520, la caja de 114 px cabe junto a la fila mobile con 6 px de gap; el margen derecho es ≈29 px a 439 y crece con el viewport.
- Hasta 360, la fila mobile mide 121 px y el dock adapta su ancho para conservar estáticamente 5 px al borde derecho desde 259 px. A 300 px sus triggers miden 38.25 px y la caja 78.5 px; a 321 px miden 43.5 px y la caja 89 px; en ambos extremos deja 5 px. Bajo 259 px la caja mínima de 58 px ya no conserva esos 5 px; ese ancho sigue sin aprobación.
- La alineación vertical es estructural: el `bottom:0` del rail comparte el límite inferior del section observer, cuyo último hijo de flujo es la fila de cartas. El rail se ubica a la derecha del row-width explícito; la revisión estática del propietario sitúa los asientos laterales bajos 5p/6p más arriba (centros ≈61%/68% de B, con ajustes mobile de −20/−32 px). No hay DOMRects dinámicos ni walkthrough local que certifique labels, sombras o colisiones en runtime.
- Para no dejar que el dock invada el siguiente bloque, el margen inferior añade `max(0px, sectionBottom−B)`. `PlayerBoardSeatInfluences` es una fila: su altura usa la entrada más alta, no suma las labels de sus dos columnas. La cota conserva hasta dos líneas para ese label a 19.36 px, porque `overflow-wrap:anywhere` puede envolver «Embajador»/«Ambassador» en slots de 58–76 px. El medio alto estimado desktop es `39.36px + clamp(55.88px, 7.647vw, 98.53px)` (header30, separación7, label hasta 2 líneas, gap3 y media carta con aspect ratio0.68); en mobile hasta520 es `31.36px + clamp(42.65px, 11.397vw, 60.3px)` (header18, separación3, el mismo máximo de label y gap3, media carta). Se resta el 14% restante de B, ya que el centro observer está en top86%. Da aproximadamente 37.2 px de clearance a 263, 32 px a 300, 29.2 px a 320, 23.5 px a 361, 17.8 px a 520, 22.3 px a 521 y 11.2 px a 600; se reduce a cero cerca de 681 px. Con ello el fin de flujo queda 12 px después del dock según esta cota estática. Los valores no incluyen DOMRects ni confirmación dinámica del scroll.

La revalidación F3 independiente de `f58a5b5` confirma estáticamente que `.PlayerBoardSeatAnchor--observer` es el containing block, el section queda en flujo normal y el div del rail es su hermano inmediato posterior. El ancla tiene z-index 30; el rail comparte el borde inferior del section y no se observó clipping estático. EventLog está en z-index 40. La revisión no encontró colisión vertical estática con asientos bajos 5p/6p, aunque no certifica posiciones dinámicas ni choques horizontales. Bajo 259 px ya no se conserva el margen lateral de 5 px y una etiqueta de más de dos líneas podría superar el clearance. No hubo navegador/DOMRects: no se afirma aprobación visual ni se da por verificado el criterio de ≤16 px de scroll.

## Ajuste DOM final aprobado por el propietario (2026-10-03)

- `div.reference-panel__triggers` es hijo directo de `.PlayerBoardContainer`, después de `.PlayerBoardSeatAnchor--observer` y justo antes de la última `section.PlayerBoardSeat`. No está dentro del ancla. El preview de esta estructura quedó aprobado por el propietario.
- `.PlayerBoardSeatAnchor--observer` se conserva para posicionar la tarjeta del observador; la sección de asiento activo recibe una ref para medirla, sin condicionar el orden del rail en el DOM.
- `ReferencePanel.css` ya no usa `left: calc(100% + ...)`. Un layout effect mide los rectángulos del tablero, el asiento actual, los otros asientos, sus headers/cartas y Court. Prueba posiciones dentro del tablero con 12 px de borde, evita intersecciones con 4 px de separación de asientos y 8 px de Court, y selecciona la opción despejada más cercana al lateral/borde inferior del asiento activo.
- El rail conserva el ancho `max-content` y las grillas responsive; ahora ese ancho no determina su coordenada x. El posicionador mantiene la caja del rail dentro del cuadrado del tablero para no generar scroll horizontal. Si no se encuentra ninguna caja libre, el fallback la mantiene dentro del tablero pero podría solaparse; la revisión estática independiente de esta nueva variante sigue pendiente.
- `PlayerBoardLayout` conserva 12 px más el exceso positivo estimado del section observer, porque sus cartas/labels aún pueden sobresalir del cuadrado aunque el rail no lo haga.
- El propietario aprobó el DOM/preview. No se guardaron mediciones de `scrollWidth` ni una matriz completa de jugadores/anchos; F3 independiente debe revisar el diff final antes de cerrar la unidad.

## Validación

- `npm run build` en `coup-client/`: exit 0, `Compiled with warnings`. Avisa Browserslist/caniuse-lite desactualizado, `logo` y `Link` sin uso en `src/App.js`, `fs.F_OK` deprecated y dos parse errors de `postcss-calc` para unidades `dvh` en las reglas de tamaño de modales preexistentes (`66.6667dvh`/`133.3333dvh` en `ReferencePanel.css:214/220`; estas declaraciones no se cambiaron).
- `git diff --check`: sin errores.
- No se añaden ni ejecutan tests automatizados.
- La versión DOM aprobada vuelve a compilar con exit 0 / `Compiled with warnings`; `git diff --check` pasó. El front de desarrollo responde en 4072 y el backend en 18000.
- No hubo browser/DOMRects en F3: siguen pendientes scrollHeight, walkthrough visual y confirmación del propietario sobre los viewports/jugadores críticos.
