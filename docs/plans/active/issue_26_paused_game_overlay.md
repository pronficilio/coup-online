# Handoff para Orquestador — issue #26

- **Issue:** https://github.com/pronficilio/coup-online/issues/26
- **Plan exacto:** `docs/plans/paused-game-overlay/plan_paused_game_overlay.md`
- **Bitácora exacta:** `docs/plans/log/issue-26.jsonl`
- **Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `CLOSED`; F3 `BLOCKED`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Verifier requerido ahora:** F3 requiere Verifier independiente FINAL; todavía no se invocó.
- **Pregunta de falsificación:** ¿una pausa de timeout recibe `canResume: false`, el cliente muestra un CTA rechazable o quedan controles activos bajo el overlay?
- **F1:** `CLOSED`; el timeout normal se anuncia recuperable; reanuda solo el líder y solo si todos los asientos humanos siguen conectados. No hubo discrepancia del servidor.
- **F2:** `CLOSED`; overlay, CTA autorizado, estados de espera/error y claves bilingües implementados. Build aprobado; no se ejecutaron tests.
- **F3:** `BLOCKED`; requiere recorrido visual y Verifier FINAL independiente. No hay navegador local ni herramienta de navegador en este entorno.
- **Documentos fuente:** issue #26; plan exacto arriba; `docs/plans/codex-ai-players/f0_contract.md`; código integrado en `origin/master` `5de95ee`; issue #19 y PR #22 (integrada).

## F1 y F2 completadas

- **F1:** matriz de emisores, permisos y estado visible en `docs/plans/paused-game-overlay/report_issue_26_F1.md`; commit `2347fa0`.
- **F2:** overlay y copy bilingüe, pending anti duplicación, errores accesibles y build en `docs/plans/paused-game-overlay/report_issue_26_F2.md`; commit F2 registrado en la rama.

## Próxima acción: desbloquear F3

- Proveer un navegador accesible en este entorno o reasignar el worktree a un entorno con navegador.
- Recorrer timeout recuperable como líder y no líder, desconexión durante la pausa, rechazo de `g-resume`, confirmación `g-gameResumed`, foco/lector de pantalla y bloqueo del tablero en escritorio/móvil/teclado.
- Asignar Verifier independiente FINAL sobre el commit exacto después del recorrido; no declarar PASS hasta obtenerlo.

El recorrido manual no se completó porque no hay navegador ni herramienta de navegador expuesta. La issue #19 sigue abierta por su propio bloqueo de recorrido/Verifier, pero no registra corrección concurrente; su worktree estaba limpio en `ca16e42` cuando se revalidó antes de F2. No cambiar el contrato: el servidor autoriza solo al líder y solo con `canResume` verdadero y todos los asientos humanos conectados.

## Topología y reclamo obligatorio

- **Branch único:** `issue/26-paused-game-overlay`.
- **Worktree único:** `.worktrees/issue-26-paused-game-overlay`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperado:** una PR desde el branch de #26 a `master`, después de F1–F3.
- **Aislamiento confirmado:** issue OPEN y asignada a `pronficilio` tras relectura; sin PR, branch o worktree previos. `origin/master` actualizado a `5de95ee`; branch `issue/26-paused-game-overlay` y worktree `.worktrees/issue-26-paused-game-overlay` creados desde ese commit. El handoff está en `active/`; plan, handoff y bitácora se copiaron selectivamente. El checkout raíz no se modificó.
- **Reporte F1:** `docs/plans/paused-game-overlay/report_issue_26_F1.md`.
- **Reporte F2:** `docs/plans/paused-game-overlay/report_issue_26_F2.md`.
- **Siguiente dueño:** Orquestador; conseguir entorno navegable, completar F3 y asignar Verifier FINAL antes de cierre o integración.
- **Commit F2:** `feat(game-ui): issue 26 fullscreen pause overlay`.
- **Commit F3:** `docs(game-ui): issue 26 F3 READY_FOR_REVIEW`.
- **Validación pendiente:** recorrido manual escritorio/móvil/teclado y Verifier independiente FINAL; no agregar ni ejecutar tests automatizados.
- **Estado del tracker:** `WAITING_ORCHESTRATOR`; issue #26 sigue OPEN/asignada. Sin PR ni despliegue.
