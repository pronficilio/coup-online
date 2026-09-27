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
- [#6 — panel de acciones del turno](https://github.com/pronficilio/coup-online/issues/6): se cerrará al fusionar el PR #11. F1 y F2 tienen `PASS`; F3 queda `ACTIVE / PARTIAL` porque la eliminación del jugador local no se observó. Plan: `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`; handoff y reporte F3: `docs/plans/active/issue_6_turn_actions_panel.md` y `docs/plans/turn-actions-panel/report_issue_6_F3.md`; bitácora: `docs/plans/log/issue-6.jsonl`.
- [#8 — referencias visuales para la partida](https://github.com/pronficilio/coup-online/issues/8) sigue abierta y asignada a `pronficilio`; F1 está `CLOSED` y F2 está `ACTIVE — SUBTASK PARCIAL` con el componente aislado. El [PR draft #12](https://github.com/pronficilio/coup-online/pull/12) contiene F1; el montaje F2 puede continuar tras integrar #6 (PR #11), que modifica `Coup.js`/GameHeader. Plan: `docs/plans/game-reference-materials/plan_game_reference_materials.md`; handoff: `docs/plans/active/issue_8_game_reference_materials.md`; bitácora: `docs/plans/log/issue-8.jsonl`.
- [#9](https://github.com/pronficilio/coup-online/issues/9) registra el pulido visual del tablero circular; su worktree canónico es `.worktrees/issue-9-circular-board-visual-polish`.
- [#13 — despliegue en Hetzner](https://github.com/pronficilio/coup-online/issues/13) conserva el procedimiento de release regular. El usuario autorizó para la prueba de #14 un release POC independiente y reversible, sin cambios a DNS/Nginx.
- [#14 — jugadores Codex](https://github.com/pronficilio/coup-online/issues/14): implementación local en `issue/14-codex-ai-players`; F0/F1 `PASS`; runner App Server, lobby y palanca implementados y validados localmente. Falta login device-code, una decisión real de Luna y la prueba en Hetzner. No publicar cambios al fork. Plan: `docs/plans/codex-ai-players/plan_codex_ai_players.md`; F2: `docs/plans/codex-ai-players/f2_codex_runner.md`; runbook: `docs/plans/codex-ai-players/poc-runbook.md`; handoff: `docs/plans/active/issue_14_codex_ai_players.md`; bitácora: `docs/plans/log/issue-14.jsonl`.

Verifica GitHub antes de reanudar unidades históricas. El checkout raíz compartido puede tener modificaciones locales; cada unidad conserva su worktree.
