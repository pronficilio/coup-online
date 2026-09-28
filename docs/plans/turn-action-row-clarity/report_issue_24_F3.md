# Reporte F3 — verificación final de issue #24

**Veredicto:** `FAIL`
**Checkpoint:** F3, FINAL
**Commit revisado:** `6d63199910c5a0e3b24ed60c847eef1bb231f6f7`
**Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`
**Base:** `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`

## Hallazgo que bloquea PASS

`renderActionDecision()` se monta dos veces para una decisión `action`:

- El rail portado a `document.body` lo renderiza en `Coup.js:793-797`.
- `DecisionsSection` lo vuelve a renderizar en `Coup.js:838-846` (`:845`).

No hay una regla CSS que oculte la segunda instancia. Por tanto, el DOM contiene dos paneles y dos juegos de filas para la misma decisión. Ambos reutilizan los mismos IDs de accesibilidad y refs de filas/destinos; al abrir o cancelar una selección de objetivo, el foco puede acabar en la copia dentro de `DecisionsSection` en vez de permanecer en el rail. Esto incumple AC1/AC7 y la ubicación única solicitada para el rail. El hallazgo basta para devolver F3 a corrección; no modifiqué producto.

**Reproducción para el siguiente checkpoint:** al recibir `decision.type === 'action'`, inspeccionar el DOM y contar `.DecisionActionPanel`: se montan una instancia bajo `.ActionDecisionRail` y otra bajo `.DecisionsSection`. Revisar además el foco después de abrir un destino y cancelar.

## Validaciones ejecutadas

- `git status --short --branch` al inicio de la revisión: worktree limpio en `issue/24-turn-action-row-clarity`, siguiendo `origin/issue/24-turn-action-row-clarity`. Al entregar, el único cambio es este reporte F3 autorizado.
- `git rev-parse HEAD`: `6d63199910c5a0e3b24ed60c847eef1bb231f6f7`.
- `git rev-parse origin/master`: `45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`.
- `git diff --check origin/master...HEAD`: **exit 0**.
- `npm run build` en `coup-client`: **exit 0**, `Compiled with warnings`. Warnings de `App.js` (imports `logo`/`Link` sin uso), `ReferencePanel.css` (`postcss-calc` con `dvh`) y `caniuse-lite` desactualizado. El build produjo JS gzip de 109.82 kB y CSS gzip de 8.17 kB.
- No se agregaron ni ejecutaron tests automatizados.

## Límites de evidencia

La aprobación visual humana previa y el waiver explícito de AC9 para la desaparición sin animación se toman del handoff F2; no se reinterpretan como verificación del comportamiento duplicado ni como evidencia de interacciones tras el rebase. No hice recorrido de navegador en F3. La revisión estática confirma el montaje duplicado; scroll, foco y flujo de objetivos deben repetirse en navegador una vez corregido.

El handoff referencia `docs/agentes/VERIFICADOR_CI.md`, pero ese archivo no está presente en este worktree ni en `/mnt/e/dev/coup`; seguí los límites y criterios explícitos de `docs/plans/active/verifier_issue_24_F3.md` y del plan enlazado.
