# Planes de trabajo

Este directorio es el plano de control del proyecto, siguiendo `docs/agentes/ORQUESTADOR.md`.

- `PROJECT_ORCHESTRATION.yaml` guarda el perfil operativo detectado.
- `log/` contiene bitácoras JSONL append-only, una por unidad.
- `inbox/` contiene handoffs listos para el Ejecutor.
- `active/` contiene planes de unidades en curso.
- `blocked/` contiene handoffs en espera de una dependencia o resolución explícita.

GitHub Issues es la fuente de estado de las unidades: la [issue #1](https://github.com/pronficilio/coup-online/issues/1) cerró el trabajo inicial del checkout; la [issue #3](https://github.com/pronficilio/coup-online/issues/3) registra el chequeo de seguridad. Cada unidad tiene su propio plan y bitácora en este plano de control.

## Unidades

- [#5 — tablero circular](https://github.com/pronficilio/coup-online/issues/5): `CLOSED`, integrado a `master` en `64593af5cff7ff80863c3fc175067eb49fc4b5ad`; rama/worktree canónicos `issue/5-circular-board` / `.worktrees/issue-5-circular-board`. Plan: `docs/plans/circular-board/plan_circular_board.md`.
- [#6 — panel de acciones del turno](https://github.com/pronficilio/coup-online/issues/6): `CLOSED` al integrar el [PR #11](https://github.com/pronficilio/coup-online/pull/11). F2/F3 pasaron en escritorio y móvil; queda registrada la observación parcial de que no se alcanzó a verificar la eliminación del jugador local. Plan: `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`; reporte F3: `docs/plans/turn-actions-panel/report_issue_6_F3.md`; bitácora: `docs/plans/log/issue-6.jsonl`.
- [#8 — referencias visuales para la partida](https://github.com/pronficilio/coup-online/issues/8): `CLOSED` al integrar el [PR #12](https://github.com/pronficilio/coup-online/pull/12), que agregó los cuatro WebP y el componente `ReferencePanel` aislado. La auditoría confirmó que el panel no se montó en `Coup.js`; ese acceso pendiente sigue ahora en [#18](https://github.com/pronficilio/coup-online/issues/18), con una sola integración propia. Plan histórico: `docs/plans/game-reference-materials/plan_game_reference_materials.md`; handoff histórico: `docs/plans/active/issue_8_game_reference_materials.md`; bitácora: `docs/plans/log/issue-8.jsonl`.
- [#18 — acceso a las referencias en la partida](https://github.com/pronficilio/coup-online/issues/18): `OPEN`, `WAITING_ORCHESTRATOR`, F1 `BLOCKED` hasta la revisión visual manual. El [PR draft #20](https://github.com/pronficilio/coup-online/pull/20) monta `Tarjeta` y `Tabla` en el dock inferior derecho. Modo/riesgo/verificación: `LIGHT` / `LOW` / `NONE`. Plan: `docs/plans/reference-access/plan_reference_access.md`; handoff activo: `docs/plans/active/issue_18_reference_access.md`; reporte: `docs/plans/reference-access/report_issue_18_F1.md`; bitácora: `docs/plans/log/issue-18.jsonl`.
- [#9](https://github.com/pronficilio/coup-online/issues/9) registra el pulido visual del tablero circular; su worktree canónico es `.worktrees/issue-9-circular-board-visual-polish`.
