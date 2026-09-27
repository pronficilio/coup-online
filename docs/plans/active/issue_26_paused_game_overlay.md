# Handoff para Orquestador — issue #26

- **Issue:** https://github.com/pronficilio/coup-online/issues/26
- **Plan exacto:** `docs/plans/paused-game-overlay/plan_paused_game_overlay.md`
- **Bitácora exacta:** `docs/plans/log/issue-26.jsonl`
- **Estado:** `WAITING_ORCHESTRATOR`; F2 conserva respuestas aceptadas; build/diff/i18n pasan; requiere nuevo Verifier FINAL.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
- **Verifier requerido:** asignar al mismo Verifier independiente FINAL sobre el nuevo HEAD después del commit. No reutilizar `report_issue_26_F3.md` (hash `6621255`, permiso líder) ni `report_issue_26_F3_recheck.md` (hash `46b08058096a97539bb2ffbaa52d032beed08ebf`, reiniciaba responses); ambos se conservan como históricos.
- **Criterio de falsificación:** ¿algún líder, respondedor previo o tercero puede reanudar; algún responsable pendiente queda sin CTA; se reemite decisión a quien ya respondió; hay CTA si solo falta Codex; recibe overlay alguien que no sea responsable en un timeout humano?
- **F1 anterior:** obsoleta porque permitía al líder; ver [`report_issue_26_F1_recheck.md`](../paused-game-overlay/report_issue_26_F1_recheck.md). Pendientes se derivan como `allowed - responses`, resueltos a asientos humanos por el servidor.
- **F2 anterior:** obsoleta porque mostraba overlay/CTA según `isLeader`; ver [`report_issue_26_F2_recheck.md`](../paused-game-overlay/report_issue_26_F2_recheck.md). El nuevo comportamiento da overlay/CTA solo a dueños y un aviso no modal a los demás.
- **F3 manual:** bloqueada por falta de navegador local/herramienta. `report_issue_26_F3.md` aplica a `6621255`; `report_issue_26_F3_recheck.md` aplica a `46b08058096a97539bb2ffbaa52d032beed08ebf`. Ambos quedan históricos; solicitar Verifier FINAL nuevo.
- **Documentos fuente:** issue #26 (incluida aclaración canónica y sincronización de base); plan exacto arriba; `f0_contract.md` (la regla inicial de líder queda superseded para #26); base actual `origin/master` `1ff478c308478af3be61131daa1bd88652bdc77f` (cierre documental de PR #27/#25).

## Sincronización reciente

`origin/master` avanzó con PR #27 de #25 a `c601410952184c85f552ee5cbb73ef6fe52519ff` y luego a `1ff478c308478af3be61131daa1bd88652bdc77f` para cerrar documentalmente #25. El segundo avance solo toca cuatro documentos de #25. Ambos se incorporaron mediante rebase sin conflictos; el diff de #26 se reaplicó intacto y no contiene cambios de #25.

## F1 y F2 completadas

- **F1 revalidada:** ownership por asiento en `docs/plans/paused-game-overlay/report_issue_26_F1_recheck.md`; el informe F1 previo se conserva con banner histórico.
- **F2 follow-up:** preserva `responses` server-side y no reenvía decisiones a actores respondidos; el ID/versión cambia al reanudar. Reporte `docs/plans/paused-game-overlay/report_issue_26_F2_recheck.md` actualizado; build exit 0 con warnings existentes, diff-check exit 0 e i18n 313/313.

## Próxima acción: desbloquear F3

- Después del commit nuevo, asignar el mismo Verifier independiente FINAL usando `docs/plans/paused-game-overlay/verifier_request_issue_26_F3_recheck.md` actualizado.
- Proveer navegador accesible para validar responsable pendiente, líder no responsable, respondedor previo, varios responsables, Codex-only, desconexión, solicitud manipulada, reanudación, foco/teclado y espera no modal. No declarar PASS visual si no se hace este recorrido.

El recorrido manual no se completó porque no hay navegador ni herramienta de navegador expuesta. La aclaración funcional del usuario supersede el permiso anterior del líder para #26. El F3 recheck de `46b0805` observó que no se conservaban respuestas; el follow-up actual lo corrige. Issue #19/PR #22 no registra corrección concurrente en las superficies.

## Topología y reclamo obligatorio

- **Branch único:** `issue/26-paused-game-overlay`.
- **Worktree único:** `.worktrees/issue-26-paused-game-overlay`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperado:** una PR desde el branch de #26 a `master`, después de F1–F3.
- **Aislamiento confirmado:** issue OPEN y asignada a `pronficilio`; branch/worktree canónicos. Base actual `1ff478c308478af3be61131daa1bd88652bdc77f`; rebase limpio y diffs ajenos de #25 preservados. El checkout raíz no se modificó.
- **Reporte F1:** `docs/plans/paused-game-overlay/report_issue_26_F1.md`.
- **Reporte F2:** `docs/plans/paused-game-overlay/report_issue_26_F2.md`.
- **Siguiente dueño:** Orquestador; conseguir entorno navegable, completar F3 y asignar Verifier FINAL antes de cierre o integración.
- **Commit previo obsoleto:** F2 `662125554a76c6724a159a8c572627544a3c19fc` (leader-only).
- **Validación pendiente:** recorrido manual escritorio/móvil/teclado y Verifier FINAL en el HEAD nuevo. Build, diff-check e i18n de este follow-up ya pasan. No agregar ni ejecutar tests automatizados.
- **Estado del tracker:** `WAITING_ORCHESTRATOR`; issue #26 sigue OPEN/asignada. Sin PR ni despliegue.
