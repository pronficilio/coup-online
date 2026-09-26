# Handoff para Agente Alquimista — issue #8

- **Tracker:** https://github.com/pronficilio/coup-online/issues/8
- **Plan exacto:** `docs/plans/game-reference-materials/plan_game_reference_materials.md`
- **Bitácora exacta:** `docs/plans/log/issue-8.jsonl`
- **Estado:** `ACTIVE`; #8 está abierta, asignada a `pronficilio`, y F1 es `READY`.
- **Branch/worktree únicos:** `issue/8-game-reference-assets` / `.worktrees/issue-8-game-reference-assets`.
- **Base:** `origin/master`, actualizado antes del aislamiento a `febec397d3dcd9c2472a61910c8441800c939326`.
- **Integración:** un PR desde la rama de issue a `master`, asociado a #8. Aún no existe PR.
- **Modo/riesgo/verificación independiente:** `LIGHT` / `LOW` / `NONE`.

## Claim y primer paso

El Orquestador asignó #8 a `pronficilio` después de verificar que la issue estaba abierta, sin asignados ni comentarios previos. El claim remoto quedó confirmado el 2026-09-25. Relee este handoff, el plan y la bitácora; registra `claim` y `worktree_confirmed` en la bitácora y confirma el conjunto administrativo del worktree antes de cambios de producto. Usa el branch/worktree existente; no crees una segunda topología ni trabajes desde `master`.

## Fase que debe tomar primero

Completa F1 del plan: genera `card-en.webp`, `card-es.webp`, `table-en.webp` y `table-es.webp` en `coup-client/src/assets/references/`, todos de 1024 px de ancho, proporción preservada y WebP calidad 85. Usa las fuentes locales de la raíz `E:\dev\coup\fotos\`; no copies ni agregues los PNG a Git. Registra encoder, versión, método, dimensiones y peso de cada resultado. El reporte F1 debe comprobar lectura de texto y consistencia con las reglas. Si una fuente no está disponible desde el entorno del Ejecutor, informa el recurso faltante al Orquestador sin sustituirlo por otra imagen.

**Cierre F1:** reporte `docs/plans/game-reference-materials/report_issue_8_F1.md`, cuatro WebP y evento `phase_verdict` en la bitácora, juntos en el commit `feat(reference-assets): issue 8 F1 CLOSED advance_f2`.

## Dependencias de montaje

F2 no comienza hasta integrar #5 a `master`. Antes de editar `Coup.js`/GameHeader, verifica el estado de #6 y registra coordinación con su trabajo sobre el shell. Si #6 está modificando esa superficie, espera su integración o una reorquestación explícita. No cambies reglas, servidor, Socket.IO ni paneles de decisiones en esta issue.

Completa después F2 y F3 según el plan. Cada fase requiere su reporte, el evento `phase_verdict` y un commit de cierre. No abras branches, worktrees o PRs por fase; deja la unidad completa en una sola integración y en estado `WAITING_ORCHESTRATOR` al terminar.

## Éxito de la unidad

Las cuatro referencias cumplen ancho/formato/proporción; Git contiene solo WebP para estos activos; solo se carga la imagen seleccionada; el panel funciona con teclado y tacto, no interfiere con decisiones, y su movimiento respeta `prefers-reduced-motion`. El build y los recorridos manuales de escritorio/móvil quedan documentados. El Orquestador revisa evidencia y coordina el único PR a `master`.
