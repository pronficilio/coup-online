# Reporte issue #18 — F1: accesos a referencias

**Veredicto:** `CLOSED`; el panel está montado y la revisión manual de escritorio, móvil e interacción pasó.
**Build:** `npm run build` desde `coup-client`, exit 0, compilado con warnings.
**Diff:** `git diff --check`, PASS.
**Tests automatizados:** no añadidos ni ejecutados.

## Implementación

- `ReferencePanel` se monta en `TurnTableShell` entre el tablero y el panel de acciones. Sus accesos cuadrados de 52 × 52 px tienen iconos, nombres accesibles, `title` y foco visible.
- En escritorio el dock queda fijo abajo a la derecha. En móvil (viewport de 390 × 844 px) fluye debajo del tablero y antes del panel de decisiones.
- Los dos modales conservan el contenido español. Solo se asigna `src` a la imagen que se abre. El cierre funciona con botón, `Escape` y fondo; el foco vuelve al disparador.
- Rules y Cheat Sheet permanecieron visibles. El turno y el panel de decisión conservaron su texto al abrir y cerrar referencias. La animación respeta movimiento reducido.

## Recorrido manual

Ejecutado en Chromium headless sobre una partida local real de dos jugadores, con viewport de escritorio 1280 × 900 px y móvil 390 × 844 px.

- Antes de abrir referencias: ninguna solicitud de `card-es` o `table-es`.
- Al abrir Tarjeta: se solicitó y decodificó `card-es.webp`; no se solicitó `table-es.webp`.
- Al abrir Tabla: se solicitó y decodificó `table-es.webp`.
- Cierres comprobados: Tarjeta por `Escape`, Tabla por fondo y Tarjeta por botón. En las rutas Escape y fondo el foco regresó al botón que abrió el modal.
- Interacción táctil emulada en móvil: abrir Tarjeta y cerrarla por botón, PASS.
- A 390 px, el dock midió 114 × 52 px dentro del viewport; su borde inferior quedó antes del inicio del panel de acciones (y=698 px). No hubo solapamiento horizontal ni vertical.
- Con `prefers-reduced-motion: reduce`, `transitionDuration` del modal fue `0s`. No hubo errores de página.
- Capturas locales de evidencia: `/tmp/issue18-desktop.png` y `/tmp/issue18-mobile.png`.

## Límites observados

- El build terminó con exit 0. Emitió warnings preexistentes de variables sin uso en `App.js`, `caniuse-lite` desactualizado y `postcss-calc` al analizar declaraciones `dvh` en `ReferencePanel.css`.
- La comprobación fue en Chromium headless y simulación táctil, no en un dispositivo físico.
- El cambio no añade ni ejecuta tests automatizados.

## Siguiente paso

F1 quedó integrada mediante PR #20 en `master` (`64a507dcefa3ffea2ecf60653755342930c49f09`). La issue #18 se cerró después de verificar la integración.
