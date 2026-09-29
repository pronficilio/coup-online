# Reporte F1 — ampliar una influencia propia

- **Issue:** [#61](https://github.com/pronficilio/coup-online/issues/61)
- **Branch / worktree:** `issue/61-own-card-zoom` / `.worktrees/issue-61-own-card-zoom`
- **Veredicto F1:** `BLOCKED`
- **Fecha:** 2026-09-29

## Resultado de implementación

Las influencias propias activas se renderizan como botones accesibles. El modal usa `react-modal` en un portal a `document.body`, mide el rectángulo visible de origen y centra una carta 2:3 de hasta 390 px. La apertura dura 220 ms, el regreso al origen 170 ms y los cierres por cambio de partida o pérdida del origen se desvanecen en 120 ms. `prefers-reduced-motion` quita traslación y escala.

El control de cierre, Escape y el fondo llaman al mismo cierre inverso; ReactModal mantiene el foco dentro. Al cerrar, el foco vuelve al botón de origen o al contenedor del tablero si el botón salió del DOM. Un `sessionId` y guardas de ciclo de vida descartan cierres obsoletos en secuencias rápidas. Durante una interrupción, el overlay deja pasar clics para que el rail de decisión quede disponible.

`Coup.js` deshabilita y cierra la ampliación ante pausa, espera de pausa, cualquier decisión o fin de partida. `PlayerBoard` valida que el botón de origen siga conectado y conserve la identidad propia activa; el modal también observa la eliminación del nodo durante la apertura. Solo el camino de influencias propias crea botones y datos de personaje. Las cartas rivales ocultas conservan la representación existente de reverso y no se pasan al componente modal. No se modificaron reglas, servidor ni protocolo.

Se añadieron etiquetas de ampliación, cierre y nombre de carta a los diccionarios español e inglés. El selector de idioma no existe en la implementación actual de i18n, que usa español como idioma predeterminado; esta fase no añadió un selector.

## Validación alcanzable

- `cd coup-client && npm run build`: **exit 0**, compilación de producción lista.
- El build mantiene advertencias existentes: `App.js` importa `logo` y `Link` sin usarlos; `ReferencePanel.css` genera dos avisos de parseo de `dvh` en `postcss-calc`; `caniuse-lite` está desactualizado. No quedaron warnings nuevos en `PlayerBoard.js` tras corregir el fallback estable de `players`.
- `git diff --check`: **PASS**.
- `translations.json`: JSON válido; las tres claves nuevas existen en `es` y `en`.
- Revisión estática de privacidad, integración de pausa/decisión, rectángulos/tiempos, foco y movimiento reducido: **PASS por inspección de código**, sin afirmar comportamiento dinámico.
- No se agregaron ni ejecutaron pruebas automatizadas.

## Revisión visual pendiente

No fue posible hacer el recorrido visual manual requerido en escritorio y móvil: esta sesión no tiene navegador instalado o activo, no tiene Playwright/Puppeteer y no expone una herramienta de navegador. La captura `fotos/pantalla.png` muestra el tablero anterior y no valida el cambio. Por esa razón no se observó el encuadre real, la continuidad percibida, el foco en navegador, los gestos de toque ni el overlay junto a decisiones/pausa.

Casos aún necesarios para desbloquear F1: abrir las dos influencias activas en escritorio y móvil; cerrar con botón, Escape y fondo; navegar y comprobar contención/retorno de foco; activar movimiento reducido; y, durante una partida, provocar una decisión respondible, pausa y pérdida de la influencia de origen. Confirmar que el rail y la pausa aceptan interacción de inmediato.

## Respuesta a la falsificación

La inspección del código confirma que solo una influencia propia activa expone el control y que se solicita el cierre cuando llega una decisión, pausa o invalidación del origen. No se pudo falsificar visualmente que una secuencia rápida o un viewport estrecho mantengan la carta legible, el foco usable y la decisión disponible en un navegador real. El éxito de F1 queda pendiente de esa revisión.
