# Handoff para Agente Alquimista — issue #53

- **Issue:** https://github.com/pronficilio/coup-online/issues/53 (abierta y asignada a `pronficilio`).
- **Plan exacto:** este handoff compacto (`docs/plans/active/issue_53_rules_triggers_reference_panel.md`); unidad `LIGHT`.
- **Bitácora exacta:** `docs/plans/log/issue-53.jsonl`.
- **Estado:** `ACTIVE`; F1 `ACTIVE`.
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no.
- **Pregunta de falsificación:** ¿pueden quedar accesos duplicados o dos instancias de un modal, o desaparecer/duplicarse el nombre y saldo visibles, tras mover los controles y retirar `.PlayerInfo`?
- **Fase sugerida:** F1, trasladar los accesos al panel y retirar el bloque redundante de identidad/monedas.
- **Documentos fuente:** issue #53; `docs/agentes/ORQUESTADOR.md`, `docs/agentes/ALQUIMISTA.md`, `docs/plans/PROJECT_ORCHESTRATION.yaml`; `Coup.js`, `ReferencePanel.js`, `ReferencePanel.css`, `RulesModal.js`, `CheatSheetModal.js`, `translations.json`.

## Subtareas listas para delegación

1. Issue #53 está abierto y asignado a `pronficilio`; #40 cerró mediante PR #54. Branch/worktree de #53 confirmados en `/mnt/e/dev/coup/.worktrees/issue-53-rules-triggers-reference-panel`, creado desde `origin/master@0fa8e7a33319013d0aed8435403a5e8dad35e44a`. No trabajar en `master`.
2. Reubicar los disparadores de Reglas y Resumen dentro de `reference-panel__triggers`, en el mismo grupo que Carta y Tabla. Conserva el contenido y el ciclo de vida de los modales existentes; puedes ajustar `RulesModal`/`CheatSheetModal` para que el disparador se renderice junto al grupo sin duplicarlo en `GameHeader` o en el portal del rail.
3. Reutilizar `reference-panel__trigger` y su estilo para que los cuatro controles compartan dimensiones, fondo, borde, hover y foco visible. Cada control debe ser un `<button type="button">` con etiqueta accesible localizada y estado/semántica de diálogo apropiados.
4. Revisar usos alternos de `RulesModal` en Home y mantenerlos funcionando. El resumen en el rail de decisión debe conservar su acceso y no crear instancias/disparadores duplicados cuando se muestra en el grupo.
5. Eliminar de `GameHeader` la caja `.PlayerInfo` que presenta “Tú eres {jugador}” y “Monedas: {cantidad}”, redundante con el nuevo UX; conservar visibles el nombre y el saldo en su ubicación nueva.
6. Validar con `cd coup-client && npm run build` y `git diff --check`; registrar los resultados y la respuesta a la pregunta de falsificación.

## Criterios de aceptación

1. El grupo `reference-panel__triggers` contiene Carta, Tabla, Reglas y Resumen de reglas como cuatro botones homogéneos.
2. Los cuatro controles conservan traducciones y son utilizables por teclado; Reglas y Resumen abren sus modales actuales y siguen cerrando según el comportamiento vigente.
3. No quedan disparadores duplicados en `GameHeader` ni en el rail; Home conserva su botón Reglas.
4. El grupo mantiene su distribución responsive existente en escritorio y móvil.
5. Build y `git diff --check` pasan.
6. La caja redundante `.PlayerInfo` desaparece y la presentación equivalente del nuevo UX sigue visible.

- **Alcance:** disparadores y su integración visual/accesible en el cliente; retirar el bloque redundante de identidad/monedas del encabezado. No cambiar contenido de reglas, lógica de juego, disposición del rail ni diseño de otros controles.
- **Riesgos/Bloqueos:** `ReferencePanel` está en el pie de `Coup`; el resumen también aparece en el portal de decisión. Los disparadores y `.PlayerInfo` comparten `Coup.js`; la #40 ya está integrada en la base. Inspeccionar montajes condicionales para evitar duplicados, pérdida del acceso contextual o desaparición accidental de los datos del nuevo UX.
- **Bloqueo resuelto:** #40 cerró el 2026-09-29 y su PR #54 se integró en `master` (`d1eddb834f35d058159343475789b8df20a173a1`). El Orquestador verificó `origin/master@0fa8e7a33319013d0aed8435403a5e8dad35e44a` y confirmó que conserva el código base relevante. No hay branch/worktree de #53; crear ambos desde esta base fresca.
- **Política de commits:** `COMMIT_REQUIRED` al cierre de F1, dentro de la unidad de #53.
- **Commit de cierre:** `feat(game-ui): issue 53 move rules triggers into reference panel`.
- **Branch destino:** `issue/53-rules-triggers-reference-panel`.
- **Worktree destino:** `/mnt/e/dev/coup/.worktrees/issue-53-rules-triggers-reference-panel`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperada:** una PR desde ese branch a `master`; no existe todavía.
- **Secuencia obligatoria:** releer issue #53 y el cierre/merge de #40; confirmar/reclamar la unidad en tracker; crear branch/worktree desde `origin/master` actual; copiar selectivamente este handoff y la bitácora al aislamiento y registrar claim/worktree; mover el handoff `inbox→active`; implementar, validar y cerrar F1 con commit. El checkout raíz contiene modificaciones y documentos ajenos: no copiarlos al worktree; al actualizar `README_plans.md`, transportar solo la fila de #53 y preservar la versión más reciente de master.
- **Contrato de evidencia:** archivos cambiados, commit de cierre, resultado del build/diff-check y observación de Reglas/Resumen abiertos desde el grupo y desde los contextos que deban conservar acceso.
- **Condición para invocar Verifier:** ninguna; `NONE`.
- **Qué debe actualizar el Alquimista:** issue, ubicación/estado del handoff, bitácora append-only y evidencia del commit/validaciones; detenerse y avisar al Orquestador si encuentra otra unidad activa que edita `Coup.js` o `ReferencePanel`.

## Resolución del bloqueo anterior

El reclamo inicial ocurrió mientras #40 seguía activa, por lo que no se creó aislamiento ni se editaron archivos de producto. El propietario amplió el alcance para retirar `.PlayerInfo`, que también requiere editar `Coup.js`. #40 ya cerró mediante PR #54; se desbloquea F1 desde la base actualizada `origin/master@0fa8e7a`.
