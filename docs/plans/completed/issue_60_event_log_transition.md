# Cierre de unidad — issue #60

- **Estado:** `COMPLETED`; GitHub cerró la issue al integrar la PR #64.
- **Issue:** [#60](https://github.com/pronficilio/coup-online/issues/60) — `CLOSED`.
- **Integración:** [PR #64](https://github.com/pronficilio/coup-online/pull/64), merge commit `a75216ffece8b518713145b4671be5bcf91b8fc5` en `master`, 2026-09-29.
- **Resultado:** el registro de eventos anima su expansión y colapso con altura medida, mantiene la posición de lectura y coordina el rail móvil.
- **Fase:** F1 `CLOSED (PASS)`; revisión del Orquestador `PASS`.
- **Verificación:** build cliente y revisión manual de escritorio/móvil, reversiones rápidas, scroll, decisión activa, viewport desplazado y movimiento reducido. Sin pruebas automatizadas, según el alcance.
- **Limitación:** el preview `file://` no cargó iconos (`ERR_FILE_NOT_FOUND`); se revisaron geometría, texto y transición. Capturas temporales: `/tmp/coup-eventlog-visual/`.
- **Plan y reporte:** `docs/plans/event-log-transition/plan_event_log_transition.md`, `docs/plans/event-log-transition/report_issue_60_F1.md`.
- **Bitácora:** `docs/plans/log/issue-60.jsonl`.
- **Branch/worktree:** `issue/60-event-log-transition` / `.worktrees/issue-60-event-log-transition`.
