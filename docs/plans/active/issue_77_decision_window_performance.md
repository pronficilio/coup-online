# Handoff — issue #77

**Issue:** [#77 — reducir esperas en votaciones cuando el resultado ya está determinado](https://github.com/pronficilio/coup-online/issues/77), `OPEN`.
**Plan:** `docs/plans/decision-window-performance/plan_decision_window_performance.md`.
**Estado:** unidad `ACTIVE`; F2 `RETURNED` para cobertura Codex; F3 `FAIL`.
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` independiente.
**Verifier:** requerido en F3 después del commit F2.
**Branch / worktree / merge target:** `issue/77-decision-window-performance` / `.worktrees/issue-77-decision-window-performance` / `master`.
**Bitácora:** `docs/plans/log/issue-77.jsonl`.
**Dueño actual:** Agente Alquimista (F2, cobertura Codex); después, Verifier independiente (F3).

## Estado de fase

F1 está `CLOSED`; reporte y matriz en `docs/plans/decision-window-performance/report_issue_77_F1.md`.

F2 implementó el cierre y registró sus validaciones en `docs/plans/decision-window-performance/report_issue_77_F2.md`; commit `7aea6e4`. El Verifier independiente emitió F3 `FAIL` en AC8: las pruebas no cubren una respuesta Codex pendiente que llega después del cierre anticipado. La guarda de producción parece descartar una respuesta con decisión/versión vieja, pero falta validar el caso. F2 `RETURNED` únicamente para añadir y ejecutar esa regresión; después repetir F3. No abrir integración.

## Contrato que no se negocia en F2

- La prioridad por asiento y el anchor vigentes determinan ganador; la llegada cronológica no.
- Esperar cualquier asiento anterior no respondido que aún pueda ganarle al voto elegido.
- Cerrar una vez; cancelar timer e invalidar respuestas tardías con el envelope vigente.
- Comparar la decisión anticipada contra el resultado de esperar todas las respuestas.

## Reclamo y validación

Issue reclamado en `pronficilio/coup-online`, asignado a `pronficilio`; branch/worktree verificados en `.worktrees/issue-77-decision-window-performance`; handoff movido de `inbox/` a `active/`. F2 debe añadir y ejecutar la cobertura Codex puntual descrita en el reporte F3; después detener para una nueva revisión independiente. No integrar antes de PASS.

**Pregunta de falsificación:** si el asiento anterior que falta contesta con un voto no `pass`, ¿puede cambiar al ganador que el criterio anticipado ya resolvió?
