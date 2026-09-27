# Handoff para Agente Alquimista — issue #24

**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Plan exacto:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`
**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`.
**Fase activa:** F2 — implementar las filas de acción en el renderer genérico integrado.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`; Verifier independiente requerido en F3.
**Bitácora exacta:** `docs/plans/log/issue-24.jsonl`.
**Branch / worktree / merge target:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / `master` de `pronficilio/coup-online`.
**PR/MR:** ninguna; una sola PR cuando se completen las fases.

## Reclamo y aislamiento

Issue #24 sigue abierta y está asignada a `pronficilio`. El Alquimista registró el reclamo en https://github.com/pronficilio/coup-online/issues/24#issuecomment-5858619440, volvió a leer el título/cuerpo/estado y confirmó que no hay otro reclamo incompatible. El único branch/worktree canónico es el indicado; la rama está rebaseada por el Orquestador sobre `origin/master@5de95ee`. La comprobación observada confirmó el worktree exacto, branch correcto, HEAD `40cd6dd05a7d4897e9f88d7909d6b29e09122dce`, seguimiento alineado con `origin/issue/24-turn-action-row-clarity` y árbol limpio. Claim/worktree quedan registrados en la bitácora.

## Fase activa F2 — filas para opciones de acción

Las PR #23 de #14 y #22 de #19 ya están integradas. El renderer vigente está en `Coup.js`; `ActionDecision.js` no se monta. El servidor envía únicamente opciones legales y el diccionario ya contiene labels/descripciones/roles en `es`/`en`. No cambies reglas, formas de payload o el motor del servidor para lograr la apariencia.

**Implementa lo definido en:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`.

**Comportamiento clave:** agrupa `decision.options` por acción para dar una fila por acción, no una por destino. La fila disponible con destino abre un selector de los objetivos permitidos y Cancelar vuelve al menú sin enviar nada; al escoger objetivo envía una sola vez el objeto original y su `choiceId`. Las acciones sin destino envían su opción legal al seleccionarse. Presenta las acciones que el servidor omite por saldo/Coup obligatorio como disabled informativas sin fabricarles IDs u handlers. Otros tipos de decisión continúan con su renderer genérico.

**Criterio adversarial:** ¿puede una fila visualmente deshabilitada emitir `g-submitDecision`, abrir destinos o generar un ID que el servidor no ofreció? Comprueba saldos 2/3, 6/7 y 9/10, mouse/teclado/tacto, foco accesible, tooltip sin recorte, objetivos, cancelación, reduced motion y los otros tipos de decisión.

**Validación y cierre:** build de `coup-client`, recorrido manual documentado, `git diff --check`, sin agregar tests. Commit F2 requerido. Al cerrar F2, entrega F3 al Verifier independiente para revisión `FINAL`; no integres ni cierres la issue.
