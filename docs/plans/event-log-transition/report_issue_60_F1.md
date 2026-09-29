# Reporte F1 — transición del registro de eventos

**Issue:** #60 — Animar la expansión y el colapso del registro de eventos
**Resultado:** `CLOSED (PASS)`; revisión del Orquestador `PASS`; PR [#64](https://github.com/pronficilio/coup-online/pull/64) abierta hacia `master`.
**Branch/worktree:** `issue/60-event-log-transition` / `.worktrees/issue-60-event-log-transition`

## Cambios

- `EventLog` mide la altura visible del encabezado y el cuerpo, conserva el límite CSS vigente y transiciona altura en 220 ms al abrir y 180 ms al cerrar. El cuerpo usa opacidad y traslación vertical de 4 px.
- Los cambios de dirección cancelan el temporizador anterior y comienzan desde la altura interpolada actual. El panel limpia la altura temporal al finalizar; el cuerpo pasa a `display:none` solo después del cierre completo, por lo que el estado colapsado recupera su altura natural de encabezado.
- Cerrar conserva el scroll para la reapertura; mientras está colapsado, el cuerpo es `inert`, `aria-hidden` y no recibe interacción.
- `prefers-reduced-motion` completa el cambio sin transición.
- En móvil, un `ResizeObserver` mantiene el panel de decisiones debajo del registro con 15 px de separación. Un FLIP de 140 ms suaviza el cambio de la posición relativa del rail al ancla normal, y se omite con movimiento reducido. El tope móvil combina el borde medido con `max(150px, safe-area-inset-top)` para evitar una coordenada negativa al recalcular un registro fuera del viewport.
- El observer, el temporizador de transición y la animación del rail se limpian al desmontar.

## Verificaciones

- `cd coup-client && npm run build`: pasó. CRA informó advertencias preexistentes: `logo` y `Link` no usados en `src/App.js`; `caniuse-lite` desactualizado; y el minimizador PostCSS no pudo interpretar `dvh` en `ReferencePanel.css:100,106`.
- `git diff --check`: pasó.
- No se añadieron ni ejecutaron pruebas automatizadas.
- Revisión manual con Playwright y Chromium desde un build local estático. Escritorio a 1365×768: alto expandido 369 px y colapsado 49 px, borde superior estable en y=15; frames intermedios muestran el cuerpo y el borde inferior en movimiento.
- Móvil a 390×844: expandido 320 px; con decisión activa queda limitado a 219 px. A 390×600 la decisión activa mide 156 px y el rail comienza en y=171 con el registro terminando en y=156.
- Durante el cierre móvil, el rail sigue el borde del panel sin solaparlo. Al terminar, el FLIP lo mueve desde y=150 a su ancla y=110; a mitad del FLIP midió y=120 con `transform` activo. El panel colapsado termina en y=63; no hubo solapamiento.
- Con `window.scrollY=500`, el panel queda con `bottom=-344`. Al recalcular la variable del rail a `-329px`, el CSS mantiene el rail en el piso seguro y=150, sin solapamiento.
- En escritorio, un `scrollTop=76` se conservó exactamente tras cerrar y reabrir. Cuatro alternancias rápidas separadas por 45 ms terminaron expandidas a 369 px, sin fase de transición ni altura temporal; tres alternancias terminaron colapsadas a 49 px. Movimiento reducido cerró directamente a 63 px, sin fase ni transform.
- Capturas temporales: `/tmp/coup-eventlog-visual/desktop-expanded.png`, `desktop-closing-mid.png`, `desktop-collapsed-final.png`, `desktop-rapid-final-open.png`, `desktop-rapid-final-closed.png`, `mobile-expanded.png`, `mobile-decision-close-rail-flip-mid.png`, `mobile-scrolled-rail-safe.png` y `mobile-reduced-collapsed.png`.

## Limitación

El preview se abrió con `file://`; las rutas absolutas del build no localizaron los iconos (`ERR_FILE_NOT_FOUND`). El panel, el texto, la geometría y la transición sí se renderizaron y revisaron, pero las capturas no sirven para evaluar el arte de los iconos. Las capturas quedan en `/tmp` y no se agregan al repositorio.

## Criterio de falsificación

La alternancia rápida terminó en el estado solicitado, el scroll se restauró y el rail móvil permaneció separado del panel durante el cierre, al volver al ancla y al recalcular fuera del viewport. No se reprodujo altura intermedia persistente, control cubierto ni solapamiento.

F1 queda `CLOSED (PASS)` y el Orquestador aprobó la revisión del commit `3036bb9` tras inspeccionar el diff, el reporte y capturas representativas. La PR canónica #64 está `OPEN` y `MERGEABLE`, con `master` como base y sin checks de GitHub reportados. La issue #60 permanece abierta hasta integrar; no se fusionó ni cerró.
