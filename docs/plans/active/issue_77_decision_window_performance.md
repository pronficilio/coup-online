# Handoff — issue #77

**Issue:** [#77 — reducir esperas en votaciones cuando el resultado ya está determinado](https://github.com/pronficilio/coup-online/issues/77), `OPEN`.
**Plan:** `docs/plans/decision-window-performance/plan_decision_window_performance.md`.
**Estado:** unidad `ACTIVE`; F1 `READY`.
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` independiente.
**Verifier:** requerido en F3 después del commit F2.
**Branch / worktree / merge target:** `issue/77-decision-window-performance` / `.worktrees/issue-77-decision-window-performance` / `master`.
**Bitácora:** `docs/plans/log/issue-77.jsonl`.
**Dueño actual:** Agente Alquimista.

## Estado de fase

Formalizar el prefijo suficiente de respuestas en orden de prioridad y contrastarlo con cada llamada vigente a `openWindow()`. Incluir desafío, bloqueo de Ayuda Extranjera, bloqueo del objetivo y desafío al bloqueo; respuesta tardía, timeout/reanudación y todos pasan. Entregar matriz y regla exacta en `docs/plans/decision-window-performance/report_issue_77_F1.md`. F1 es análisis/documentación; no implementar aún.

F1 está `CLOSED`; reporte y matriz en `docs/plans/decision-window-performance/report_issue_77_F1.md`. F2 está `READY`: implementar el cierre anticipado con el prefijo probado, añadir cobertura de regresión y comparar el ganador anticipado con el resolver completo. La revisión estática encontró una divergencia previa entre la prueba de timeout/reanudación y la política de preservación/owner del código; verificarla en F2 antes de declarar esa cobertura.

## Contrato que no se negocia en F2

- La prioridad por asiento y el anchor vigentes determinan ganador; la llegada cronológica no.
- Esperar cualquier asiento anterior no respondido que aún pueda ganarle al voto elegido.
- Cerrar una vez; cancelar timer e invalidar respuestas tardías con el envelope vigente.
- Comparar la decisión anticipada contra el resultado de esperar todas las respuestas.

## Reclamo y validación

Issue reclamado en `pronficilio/coup-online`, asignado a `pronficilio`; branch/worktree verificados en `.worktrees/issue-77-decision-window-performance`; handoff movido de `inbox/` a `active/`. F2 debe añadir cobertura de regresión para equivalencia de los tres tipos de ventana, timeout/reanudación y cierre único. Detener tras F2 para el Verifier independiente F3.

**Pregunta de falsificación:** si el asiento anterior que falta contesta con un voto no `pass`, ¿puede cambiar al ganador que el criterio anticipado ya resolvió?
