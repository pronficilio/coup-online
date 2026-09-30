# Handoff — issue #77

**Issue:** [#77 — reducir esperas en votaciones cuando el resultado ya está determinado](https://github.com/pronficilio/coup-online/issues/77), `OPEN`.
**Plan:** `docs/plans/decision-window-performance/plan_decision_window_performance.md`.
**Estado:** unidad `ACTIVE`; F2 `CLOSED` tras recheck AC8; F3 `READY` para repetición independiente.
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` independiente.
**Verifier:** requerido en F3 después del commit F2.
**Branch / worktree / merge target:** `issue/77-decision-window-performance` / `.worktrees/issue-77-decision-window-performance` / `master`.
**Bitácora:** `docs/plans/log/issue-77.jsonl`.
**Dueño actual:** Verifier independiente (repetición F3).

## Estado de fase

F1 está `CLOSED`; reporte y matriz en `docs/plans/decision-window-performance/report_issue_77_F1.md`.

F2 implementó el cierre en `7aea6e4`; F3 devolvió AC8 por falta de una regresión Codex. F2 agregó y ejecutó el caso pendiente → cierre humano anticipado → respuesta Codex con envelope viejo. La prueba pasa; evidencia en `docs/plans/decision-window-performance/report_issue_77_F2_recheck.md`. Ahora repetir F3 independientemente sobre el commit de recheck. No integrar antes de PASS.

## Contrato que no se negocia en F2

- La prioridad por asiento y el anchor vigentes determinan ganador; la llegada cronológica no.
- Esperar cualquier asiento anterior no respondido que aún pueda ganarle al voto elegido.
- Cerrar una vez; cancelar timer e invalidar respuestas tardías con el envelope vigente.
- Comparar la decisión anticipada contra el resultado de esperar todas las respuestas.

## Reclamo y validación

Issue reclamado en `pronficilio/coup-online`, asignado a `pronficilio`; branch/worktree verificados en `.worktrees/issue-77-decision-window-performance`; handoff movido de `inbox/` a `active/`. F2 recheck está cerrado; ejecutar F3 independiente. No integrar antes de PASS.

**Pregunta de falsificación:** si el asiento anterior que falta contesta con un voto no `pass`, ¿puede cambiar al ganador que el criterio anticipado ya resolvió?
