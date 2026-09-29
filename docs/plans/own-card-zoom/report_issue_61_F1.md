# Reporte F1 — ampliar una influencia propia

- **Issue:** [#61](https://github.com/pronficilio/coup-online/issues/61)
- **Branch / worktree:** `issue/61-own-card-zoom` / `.worktrees/issue-61-own-card-zoom`
- **Veredicto F1:** `BLOCKED`
- **Fecha:** 2026-09-29

## Resultado de implementación

Las influencias propias activas se renderizan como botones accesibles. El modal usa `react-modal` en un portal a `document.body`, mide el rectángulo visible de origen y centra la carta con su proporción de asset de 840:1220. La apertura dura 220 ms, el regreso al origen 170 ms y los cierres por cambio de partida o pérdida del origen se desvanecen en 120 ms. `prefers-reduced-motion` quita traslación y escala.

El control de cierre, Escape y el fondo llaman al mismo cierre inverso; ReactModal mantiene el foco dentro. Al cerrar, el foco vuelve al botón de origen o al contenedor del tablero si el botón salió del DOM. Un `sessionId` y guardas de ciclo de vida descartan cierres obsoletos en secuencias rápidas. Durante una interrupción, el overlay deja pasar clics para que el rail de decisión quede disponible.

`Coup.js` deshabilita y cierra la ampliación ante pausa, espera de pausa, cualquier decisión o fin de partida. `PlayerBoard` valida que el botón de origen siga conectado y conserve la identidad propia activa; el modal también observa la eliminación del nodo durante la apertura. Solo el camino de influencias propias crea botones y datos de personaje. Las cartas rivales ocultas conservan la representación existente de reverso y no se pasan al componente modal. No se modificaron reglas, servidor ni protocolo.

Se añadieron etiquetas de ampliación, cierre y nombre de carta a los diccionarios español e inglés. El selector de idioma no existe en la implementación actual de i18n, que usa español como idioma predeterminado; esta fase no añadió un selector.

## Ajuste solicitado en revisión visual

El propietario reportó que el modal se veía demasiado grande, que su altura parecía crecer de golpe y que no siempre se alcanzaba a ver la carta completa. Solicitó limitar primero la altura visible y derivar el ancho conservando la proporción, con un tope adicional para pantallas estrechas.

- Los assets de personaje fueron inspeccionados: todos miden `840 × 1220`.
- El destino del modal limita la altura a `80dvh` como máximo y conserva un margen mínimo según el viewport; el ancho se calcula desde esa altura y la proporción `840:1220`, con topes de `390px` y del ancho disponible.
- La transformación FLIP de apertura y retorno usa las mismas dimensiones destino del modal. Se mantienen los tiempos rápidos de `220 ms` al abrir y `170 ms` al volver al tablero.
- `cd coup-client && npm run build`: **exit 0** después del ajuste. Solo aparecen las advertencias ya registradas de imports sin uso en `App.js`, parseo de `dvh` en `ReferencePanel.css` y `caniuse-lite` desactualizado.
- El preview está disponible en `http://localhost:4061`; se confirmó HTTP 200 en la página y el bundle de desarrollo. El nuevo visto bueno visual del propietario sigue pendiente.

En la revisión siguiente, el propietario confirmó que la imagen aún se recortaba. La inspección del contenido de `react-modal` mostró que sus estilos inline de posición, insets, padding y overflow podían dejar una caja más grande que la imagen. Se corrigió el sizing para que:

- `style.content` sobrescriba explícitamente esos valores, quite los insets y padding, y use `fit-content` para ancho y alto.
- La altura de `<img>` sea la dimensión objetivo calculada desde el viewport (`80dvh` como tope, con margen seguro); su ancho queda en `auto` y respeta el ratio intrínseco, limitado además por el ancho disponible y `390px`.
- La transformación FLIP de apertura y cierre use el mismo ancho derivado y la altura exacta aplicada a la imagen.

La compilación posterior a esta corrección también terminó con **exit 0** y las mismas advertencias preexistentes. El Orquestador reinició por completo el servidor CRA desde el worktree dedicado con `PORT=4061` y `REACT_APP_BACKEND_URL=http://localhost:18000`; CRA reportó `webpack compiled successfully`. Después del reinicio, `http://localhost:4061/` y `/static/js/bundle.js` respondieron HTTP 200, y `/exists/probe` del backend respondió HTTP 200. Se confirmó que el bundle servido incluye `width: auto` y el límite `80dvh`. Sigue pendiente el nuevo visto bueno visual del propietario.

## Validación alcanzable

- `cd coup-client && npm run build`: **exit 0**, compilación de producción lista.
- El build mantiene advertencias existentes: `App.js` importa `logo` y `Link` sin usarlos; `ReferencePanel.css` genera dos avisos de parseo de `dvh` en `postcss-calc`; `caniuse-lite` está desactualizado. No quedaron warnings nuevos en `PlayerBoard.js` tras corregir el fallback estable de `players`.
- `git diff --check`: **PASS**.
- `translations.json`: JSON válido; las tres claves nuevas existen en `es` y `en`.
- Revisión estática de privacidad, integración de pausa/decisión, rectángulos/tiempos, foco y movimiento reducido: **PASS por inspección de código**, sin afirmar comportamiento dinámico.
- No se agregaron ni ejecutaron pruebas automatizadas.

## Revisión visual pendiente

No fue posible hacer el recorrido visual manual requerido en escritorio y móvil durante la ejecución técnica: esa sesión no tenía navegador instalado o activo, Playwright/Puppeteer ni herramienta de navegador. El preview `http://localhost:4061` ahora queda arriba para que el propietario revise el ajuste de encuadre. Aún no se afirma un nuevo visto bueno visual ni se han validado allí el foco, los gestos de toque o el overlay junto a decisiones/pausa.

Casos aún necesarios para desbloquear F1: abrir las dos influencias activas en escritorio y móvil; cerrar con botón, Escape y fondo; navegar y comprobar contención/retorno de foco; activar movimiento reducido; y, durante una partida, provocar una decisión respondible, pausa y pérdida de la influencia de origen. Confirmar que el rail y la pausa aceptan interacción de inmediato.

## Respuesta a la falsificación

La inspección del código confirma que solo una influencia propia activa expone el control y que se solicita el cierre cuando llega una decisión, pausa o invalidación del origen. No se pudo falsificar visualmente que una secuencia rápida o un viewport estrecho mantengan la carta legible, el foco usable y la decisión disponible en un navegador real. El éxito de F1 queda pendiente de esa revisión.
