# Handoff para Agente Alquimista — issue #8

- **Tracker:** https://github.com/pronficilio/coup-online/issues/8
- **Plan exacto:** `docs/plans/game-reference-materials/plan_game_reference_materials.md`
- **Bitácora exacta:** `docs/plans/log/issue-8.jsonl`
- **Estado:** `ACTIVE`; #8 sigue abierta y asignada a `pronficilio`. El usuario autorizó completar la issue y abrir el PR con capturas.
- **Branch/worktree únicos:** `issue/8-game-reference-assets` / `.worktrees/issue-8-game-reference-assets`.
- **Base:** `origin/master`, actualizado antes del aislamiento a `febec397d3dcd9c2472a61910c8441800c939326`.
- **Integración:** PR draft #12 — https://github.com/pronficilio/coup-online/pull/12 — desde esta rama a `master`, asociado a #8. F1 está en el PR; F2/F3 y capturas del panel en partida se agregarán después de coordinar con #6.
- **Modo/riesgo/verificación independiente:** `LIGHT` / `LOW` / `NONE`.

## Claim y primer paso

El Orquestador asignó #8 a `pronficilio` después de verificar que la issue estaba abierta, sin asignados ni comentarios previos. El claim remoto quedó confirmado el 2026-09-25 y `claim`/`worktree_confirmed` ya constan en la bitácora. Al reanudar, relee este handoff y el plan; usa el branch/worktree existente, sin crear una segunda topología ni trabajar desde `master`.

## Fase F1 — cerrada

F1 ya generó y verificó `card-en.webp`, `card-es.webp`, `table-en.webp` y `table-es.webp` en `coup-client/src/assets/references/`. Los resultados y la revisión de lectura/reglas constan en `docs/plans/game-reference-materials/report_issue_8_F1.md`; no regeneres los activos ni copies o agregues los PNG fuente a Git.

**Cierre F1:** reporte `docs/plans/game-reference-materials/report_issue_8_F1.md`, cuatro WebP y evento `phase_verdict` en la bitácora, juntos en el commit `feat(reference-assets): issue 8 F1 CLOSED advance_f2`.

El reporte confirma 1024 px, proporciones conservadas, WebP calidad 85 y legibilidad visual. El subtask aislado de F2 está activo; no montes ni edites `Coup.js`/GameHeader hasta que el Orquestador registre la coordinación o la liberación del punto de montaje de PR #11 de #6.

## F2 — subtask autocontenido; montaje pendiente

#5 ya está integrada a `master`. Issue #6 sigue abierta; su PR draft #11 toca `Coup.js`/GameHeader y el shell. F2 puede avanzar únicamente con el componente aislado en archivos nuevos; no montes ni edites esas superficies hasta coordinación explícita/liberación del PR #11. Registra el subtask y su evidencia, pero no cierres F2 sin montaje coordinado, recorrido real, verificación de carga y capturas.

No cambies reglas, servidor, Socket.IO ni paneles de decisiones en esta issue.

Completa después F2 y F3 según el plan. Cada fase requiere su reporte, el evento `phase_verdict` y un commit de cierre. No abras branches, worktrees o PRs por fase; deja la unidad completa en una sola integración y en estado `WAITING_ORCHESTRATOR` al terminar.

## Éxito de la unidad

Las cuatro referencias cumplen ancho/formato/proporción; Git contiene solo WebP para estos activos; solo se carga la imagen seleccionada; el panel funciona con teclado y tacto, no interfiere con decisiones, y su movimiento respeta `prefers-reduced-motion`. El build y los recorridos manuales de escritorio/móvil quedan documentados. El Orquestador revisa evidencia y coordina el único PR a `master`.
