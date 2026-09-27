# Reporte issue #18 — F1: accesos a referencias

**Veredicto:** `BLOCKED`; el montaje y los accesos están implementados, pero falta la revisión manual visual requerida.
**Build:** `npm run build` desde `coup-client`, exit 0, compilado con warnings.
**Diff:** `git diff --check`, PASS.
**Tests automatizados:** no añadidos ni ejecutados.

## Implementación observada

- `ReferencePanel` se monta en `TurnTableShell` después del tablero y antes del panel de acciones.
- Los dos botones usan iconos inline, área de 52 × 52 px, etiqueta accesible, `title` y foco visible. En escritorio el dock queda fijo abajo a la derecha; con ancho máximo de 1199 px sigue en el flujo debajo del tablero y antes de las decisiones para no cubrirlas.
- Cada modal conserva su propia referencia en español. El `src` de la imagen queda vacío mientras el modal está cerrado y recibe la imagen correspondiente cuando se abre.
- `RulesModal`, `CheatSheetModal`, reglas y flujo del juego se conservan en el diff.

## Validaciones y límites

- El build terminó con exit 0. Emitió warnings de variables sin uso en `App.js`, la base `caniuse-lite` desactualizada y `postcss-calc` al analizar `dvh` en las reglas existentes de `ReferencePanel.css`.
- El diff-check pasó.
- No se encontró Chromium, Firefox ni un navegador automatizable en el entorno. No se pudo observar visualmente escritorio/móvil, abrir y cerrar los dos modales, probar foco ni inspeccionar solicitudes de red. Esos criterios quedan sin verificar y no se declaran `PASS`.

## Siguiente paso

Habilitar un navegador y completar un recorrido manual en escritorio y móvil. Confirmar posición/solapamiento, abrir/cerrar ambos modales por botón, `Escape` y fondo, restauración del foco, conservación de decisiones y carga únicamente de la imagen solicitada. Después actualizar el veredicto de F1 con evidencia observada.
