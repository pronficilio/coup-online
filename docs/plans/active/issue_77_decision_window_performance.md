# Handoff — issue #77

**Issue:** [#77 — reducir esperas en votaciones cuando el resultado ya está determinado](https://github.com/pronficilio/coup-online/issues/77), `OPEN`.
**Plan:** `docs/plans/decision-window-performance/plan_decision_window_performance.md`.
**Estado:** unidad `WAITING_ORCHESTRATOR`; F2 `CLOSED`; F3 post-sync `PASS` AC1–AC8 sobre `15c239c`; [PR #84](https://github.com/pronficilio/coup-online/pull/84) abierta para revisión de integración.
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` independiente.
**Verifier:** F3 independiente post-sync completado; reportes inicial, recheck y post-sync preservados en `docs/plans/decision-window-performance/`.
**Branch / worktree / merge target:** `issue/77-decision-window-performance` / `.worktrees/issue-77-decision-window-performance` / `master`.
**PR:** [#84](https://github.com/pronficilio/coup-online/pull/84), única PR de la unidad.
**Bitácora:** `docs/plans/log/issue-77.jsonl`.
**Dueño actual:** Orquestación (revisión de integración tras F3 `PASS`).

## Estado de fase

F1 está `CLOSED`; reporte y matriz en `docs/plans/decision-window-performance/report_issue_77_F1.md`.

F2 implementó el cierre en `7aea6e4`; F3 inicial devolvió AC8 por falta de una regresión Codex (`9006853`). F2 agregó y ejecutó el caso pendiente → cierre humano anticipado → respuesta Codex con envelope viejo. El recheck independiente sobre `4d8be42` emitió `PASS` AC1–AC8. Después se integró `origin/master@615b3a4` con merge `15c239c`; la revisión F3 independiente se repitió sobre ese hash exacto y vuelve a emitir `PASS` AC1–AC8. La prueba focalizada `node test/coup.test.js` reporta 19 aprobadas y tres fallas ajenas ya documentadas. La suite completa del servidor reporta 49 aprobadas y las mismas tres fallas. [PR #84](https://github.com/pronficilio/coup-online/pull/84) abierta; unidad en `WAITING_ORCHESTRATOR`.

## Contrato que no se negocia en F2

- La prioridad por asiento y el anchor vigentes determinan ganador; la llegada cronológica no.
- Esperar cualquier asiento anterior no respondido que aún pueda ganarle al voto elegido.
- Cerrar una vez; cancelar timer e invalidar respuestas tardías con el envelope vigente.
- Comparar la decisión anticipada contra el resultado de esperar todas las respuestas.

## Reclamo y validación

Issue reclamado en `pronficilio/coup-online`, asignado a `pronficilio`; branch/worktree verificados en `.worktrees/issue-77-decision-window-performance`; handoff movido de `inbox/` a `active/`. F3 post-sync `PASS`; PR #84 abierta y handoff en `WAITING_ORCHESTRATOR`. El `FAIL` F3 inicial permanece documentado como historial.

**Pregunta de falsificación:** si el asiento anterior que falta contesta con un voto no `pass`, ¿puede cambiar al ganador que el criterio anticipado ya resolvió?
