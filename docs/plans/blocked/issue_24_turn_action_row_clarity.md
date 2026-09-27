# Handoff bloqueado — issue #24

**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Plan exacto:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`
**Estado:** `WAITING_ORCHESTRATOR`; no reclamar para cambios de producto hasta que el Orquestador cierre F1 y mueva este handoff a `inbox/`.
**Fase sugerida al desbloquear:** F1 — resolver renderer y liberación de superficies.
**Modo / riesgo / verificación:** `LIGHT` / `MEDIUM` / `FINAL`; Verifier independiente requerido al final.
**Bitácora exacta:** `docs/plans/log/issue-24.jsonl`.
**Branch / worktree / merge target:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / `master` de `pronficilio/coup-online`.
**PR/MR:** ninguna; una sola PR cuando se completen las fases.

## Bloqueo y trabajo permitido

#14/PR #23 modifica el renderer de decisiones y #19/PR #22 mantiene pendientes decisiones y traducciones. El Orquestador aún debe confirmar el renderer final y liberar los archivos/textos. El Ejecutor no debe editar producto, resolver conflictos con merges de otras ramas ni copiar cambios desde sus worktrees.

El Orquestador puede releer los issues/PR y comprobar la base. Cuando ambas superficies estén acordadas/libres, registrar veredicto F1, actualizar issue/plan/log y mover este archivo a `docs/plans/inbox/` antes de pedir al Ejecutor que lo reclame.

## Fuentes y evidencia

- Plan canónico: `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`.
- Referencias visuales preservadas: `docs/plans/turn-action-row-clarity/references/a_normal.png`, `a_hover.png`, `a_dis.png`.
- Contratos a releer: issue #14/PR #23, issue #19/PR #22 e issue #21.
- Pregunta de falsificación final: ¿algún área de una acción prohibida puede iniciar selección/cobro/emisión o perder su explicación accesible?

## Reclamo futuro

Cuando F1 esté cerrada, el Alquimista debe reclamar #24 explícitamente en `pronficilio/coup-online`, releer su cuerpo y confirmar la asignación, branch, worktree y ausencia de una PR incompatible. Continuará en la topología indicada, registrará el reclamo en `docs/plans/log/issue-24.jsonl` y solo entonces iniciará F2.
