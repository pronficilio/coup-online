# Registro histórico — issue #8: referencias visuales para la partida

**Estado del tracker:** `CLOSED` tras fusionar [PR #12](https://github.com/pronficilio/coup-online/pull/12) en `master`.
**Merge commit:** `49e5fe4e37797f4711a03698d442e27dd27611b8`.
**Plan histórico:** `docs/plans/game-reference-materials/plan_game_reference_materials.md`.
**Bitácora append-only:** `docs/plans/log/issue-8.jsonl`.

## Resultado confirmado

PR #12 integró los cuatro WebP y `ReferencePanel.js/.css`, que ofrece dos modales separados para `Tarjeta` y `Tabla`. La revisión posterior de `master` confirmó que `Coup.js` no importa ni monta `ReferencePanel`, así que esas referencias todavía no tienen accesos visibles en la partida. La issue #8 se cerró antes de cumplir ese criterio; no registrar el montaje como realizado ni continuar en su branch/PR ya integrado.

El acceso pendiente se separó en la [issue #18](https://github.com/pronficilio/coup-online/issues/18), con branch, worktree y una única integración propios. Consulta `docs/plans/reference-access/plan_reference_access.md` y `docs/plans/inbox/issue_18_reference_access.md` para el handoff vigente.

Este archivo conserva la trazabilidad de #8; ya no es una instrucción ejecutable.
