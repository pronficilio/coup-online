# Planes de trabajo

Este directorio es el plano de control del proyecto, siguiendo `docs/agentes/ORQUESTADOR.md`.

- `PROJECT_ORCHESTRATION.yaml` guarda el perfil operativo detectado.
- `log/` contiene bitácoras JSONL append-only, una por unidad.
- `inbox/` contiene handoffs listos para el Ejecutor.
- `active/` contiene planes de unidades en curso.
- `blocked/` contiene handoffs en espera de una dependencia o resolución explícita.

La unidad inicial fue la issue [#1](https://github.com/pronficilio/coup-online/issues/1), ya integrada y cerrada. GitHub es el tracker canónico; consulta el estado remoto antes de reclamar o reanudar cualquiera de las unidades.

## Unidades abiertas

- [#5 — tablero circular](https://github.com/pronficilio/coup-online/issues/5): issue `CLOSED`, integrado a `master` en `64593af5cff7ff80863c3fc175067eb49fc4b5ad`; rama/worktree canónicos `issue/5-circular-board` / `.worktrees/issue-5-circular-board`. Plan: `docs/plans/circular-board/plan_circular_board.md`.
- [#6 — panel de acciones del turno](https://github.com/pronficilio/coup-online/issues/6): issue `OPEN`, `WAITING_ORCHESTRATOR`; F1 `CLOSED`, F2 `BLOCKED` hasta completar el recorrido funcional manual, F3 `PENDING`. Plan: `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`; handoff activo en `docs/plans/active/issue_6_turn_actions_panel.md`; reportes F1/F2 en `docs/plans/turn-actions-panel/`; bitácora `docs/plans/log/issue-6.jsonl`.
