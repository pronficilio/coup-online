# Handoff para Agente Alquimista — issue #5

**Issue:** https://github.com/pronficilio/coup-online/issues/5

**Plan exacto:** `docs/plans/circular-board/plan_circular_board.md`

**Bitácora exacta:** `docs/plans/log/issue-5.jsonl`

**Estado:** `WAITING_ORCHESTRATOR`

**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`

**Verifier requerido ahora:** no; invocarlo al final, antes de integrar.

**Fase cerrada:** F1, asientos estables y contrato visual. F2 y F3 siguen pendientes.

**Branch destino de toda la issue:** `issue/5-circular-board`

**Worktree destino de toda la issue:** `.worktrees/issue-5-circular-board`

**Merge target:** `master` de `origin` (`pronficilio/coup-online`).

**PR esperado:** uno desde `issue/5-circular-board` a `master`, asociado a #5.

## Reclamo y aislamiento

El reclamo está confirmado: issue abierta, asignada a `pronficilio`, rereleída sin reclamo incompatible y sin PR previo. Branch y worktree canónicos se crearon desde `origin/master` en `febec397`. El plan, la bitácora y este handoff se copiaron al worktree; este handoff ya está en `docs/plans/active/`. `claim` y `worktree_confirmed` están registrados en la bitácora. El control se confirmó antes de F1. No trabajes desde `master` ni abras ramas por fase.

Los tres documentos nuevos de #5 (plan, handoff y bitácora) están inicialmente sin seguimiento en el checkout raíz, no aparecen automáticamente en otro worktree. Tras confirmar el reclamo, cópialos desde `E:\dev\coup` al worktree de #5 antes de mover el handoff a `active/`; conserva intactos los originales hasta confirmar que el primer commit de control del branch contiene las copias. La issue remota reproduce el alcance si necesitas contrastar las copias.

El checkout raíz `master` tiene dos commits locales de reglas y WebP y está divergido de `origin/master`; también contiene PNGs y archivos de planes sin seguimiento. No hagas reset ni limpieza. Si la rama remota carece de imágenes de personajes, copia selectivamente los WebP pertinentes desde el checkout local y registra la procedencia; no arrastres completos los commits de reglas/planes por comodidad.

## Primera subtarea y fases

- **F1 CLOSED:** tabla y tratamiento de eliminados documentados en `docs/plans/circular-board/report_issue_5_F1.md`; el cierre está en `feat(board): issue 5 F1 CLOSED advance_f2`.
- **F2 PENDING:** conectar la mesa a `Coup`; mazo central convertido de `fotos/deck.png` a `coup-client/src/assets/deck.webp`; color/monedas/turno rojo neón; controles existentes accesibles. Solo WebP nuevo del mazo en Git. `COMMIT_REQUIRED`: `feat(board): issue 5 F2 CLOSED advance_f3`.
- **F3 PENDING:** revisar y ajustar 2..6 en escritorio/móvil, cambios de turno y eliminación; dejar matriz visual y capturas. `COMMIT_REQUIRED`: `feat(board): issue 5 F3 CLOSED ready_review`.

Cada cierre de fase incluye su `report_issue_5_F*.md`, código/evidencia y evento `phase_verdict` en la misma confirmación. El plan largo contiene entradas, cierres, pivotes y límites de cada fase. Si existe una política vigente de delegación de subtareas, aplícala dentro del worktree; no inventes agentes o permisos.

## Criterios de aceptación y evidencia

Cumplir los seis criterios del plan: posiciones exactas de 2, 3 y 4; cálculo estable de 5 y 6; cartas propias/ajenas correctas; asientos persistentes; resaltado del turno; centro y WebP; controles accesibles; estructura apta para futuras animaciones sin animarlas ahora. Deja capturas de escritorio/móvil, tabla 2..6, inspección del diff de assets y comprobación del flujo de decisiones. Usa comandos de validación solo cuando resuelvan un riesgo concreto; el build disponible es `npm run build` en `coup-client`.

**Pregunta de falsificación para Verifier:** ¿hay n entre 2 y 6 o una transición de turno/pérdida/eliminación que mueva un asiento, revele una carta ajena en la interfaz, tape controles o descentre el mazo? El Verifier revisa de forma independiente el head final y emite `PASS`, `FAIL` o `BLOCKED` sin implementar.

## Checkpoint después de F1

F1 está cerrada con reporte de evidencia y commit de fase. F2 permanece `PENDING` y no se inició en este checkpoint. El issue sigue abierto y no hay PR. Siguiente dueño: Orquestador, para revisar F1 y decidir el inicio de F2.

## Alcance y límites

Fuentes: `fotos/mini.png`, `fotos/ejemplo.png`, `fotos/deck.png`, `docs/coup_*.md`, `Coup.js`, `PlayerBoard.js`, `server/index.js`. `fotos/` es local e ignorado: no commitear PNGs. Los paneles de acción/turno de `ejemplo.png` quedan para otro issue. No alterar servidor, reglas ni protocolo; el servidor actualmente comunica influencias ajenas, por lo que esta entrega solo garantiza ocultarlas en la interfaz.

**Qué actualizar:** issue al reclamar y al entregar PR; este handoff a `active/`; plan/estado por fase; bitácora append-only; reportes F1-F3; PR con evidencia. Al terminar, dejar `WAITING_ORCHESTRATOR` para revisión e integración. No cerrar la issue.
