# Handoff para Orquestador — issue #26

- **Issue:** https://github.com/pronficilio/coup-online/issues/26
- **Plan exacto:** `docs/plans/paused-game-overlay/plan_paused_game_overlay.md`
- **Bitácora exacta:** `docs/plans/log/issue-26.jsonl`
- **Estado:** `WAITING_ORCHESTRATOR`; copy simplificado implementado; build, diff-check e i18n pasan; HMR/bundle confirmados por el Orquestador; falta revisión visual humana y Verifier FINAL sobre el HEAD nuevo.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
- **Verifier requerido:** asignar al mismo Verifier independiente FINAL sobre el HEAD nuevo después del commit. `report_issue_26_F3.md` (`6621255`), `report_issue_26_F3_recheck.md` (`46b0805`) y `report_issue_26_F3_followup.md` (`9276e0a`) son históricos de sus hashes.
- **Criterio de falsificación:** ¿algún líder, respondedor previo o tercero puede reanudar; algún responsable pendiente queda sin CTA; se reemite decisión a quien ya respondió; hay CTA si solo falta Codex; recibe overlay alguien que no sea responsable en un timeout humano?
- **F1 anterior:** obsoleta porque permitía al líder; ver [`report_issue_26_F1_recheck.md`](../paused-game-overlay/report_issue_26_F1_recheck.md). Pendientes se derivan como `allowed - responses`, resueltos a asientos humanos por el servidor.
- **F2 anterior:** el copy explicaba causas, respuesta pendiente y conectividad; el nuevo copy elimina esos detalles y conserva solo título/CTA autorizada, status breve y errores reales `role="alert"`.
- **F3 manual:** revisión visual humana pendiente en `localhost:3012`; el Orquestador confirmó que CRA compiló y el bundle contiene el copy nuevo. No declarar PASS visual. Los tres reportes previos aplican solo a sus hashes; solicitar Verifier FINAL nuevo.
- **Documentos fuente:** issue #26 (incluida aclaración canónica y preferencia nueva de copy); plan exacto arriba; `f0_contract.md` (la regla inicial de líder queda superseded para #26); base sincronizada `origin/master` `be93e975072b364365a90206931f732fb44dc6f1` (PR #31/#29).

## Sincronización reciente

`origin/master` avanzó de `1ff478c` a `3313d426` con PR #30 de #21 y luego a `be93e975` con PR #31 de #29. Ambos rebases de #26 fueron limpios; se conservaron los botones ilustrados de #21 y las claves de créditos de portada de #29. El worktree sigue en la rama canónica.

## F1 y F2 completadas

- **F1 revalidada:** ownership por asiento en `docs/plans/paused-game-overlay/report_issue_26_F1_recheck.md`; el informe F1 previo se conserva con banner histórico.
- **F2 follow-up anterior:** preserva `responses` server-side y no reenvía decisiones a actores respondidos; el ID/versión cambia al reanudar. `report_issue_26_F3_followup.md` registra el Verifier sobre `9276e0a`.
- **F2 copy actual:** implementación `4e3043b4c5d85e63e6aba47b0b5da7f0869ace2f`, reporte [`report_issue_26_F2_copy_followup.md`](../paused-game-overlay/report_issue_26_F2_copy_followup.md). Overlay de responsable/no recuperable contiene solo el heading «Partida en pausa» y, si se puede reanudar, el botón «Reanudar partida». El status de los demás es «La partida está en pausa.» Sin explicación de causa, conectividad ni espera; un rechazo real del servidor se conserva como `role="alert"`.

## Próxima acción: desbloquear F3

- Usuario debe revisar el copy HMR en `localhost:3012`; confirmar el comportamiento del overlay responsable, pausa no recuperable y status no modal. El Orquestador reinició CRA y confirmó compilación y bundle actualizado.
- Después del commit de copy, asignar el mismo Verifier independiente FINAL usando `docs/plans/paused-game-overlay/verifier_request_issue_26_F3_recheck.md` actualizado.
- Verificar responsable, líder no responsable, respondedor previo, varios responsables, Codex-only, desconexión, solicitud manipulada, reanudación, foco/teclado y status no modal; confirmar copy mínimo exacto. No declarar PASS visual sin recorrido real.

El recorrido visual humano completo sigue pendiente. La regla de ownership por asiento y la conservación de respuestas siguen vigentes. Issue #21/PR #30 aportó botones de respuesta ilustrados, preservados por el rebase; esta fase cambia solo el copy de pausa.

## Topología y reclamo obligatorio

- **Branch único:** `issue/26-paused-game-overlay`.
- **Worktree único:** `.worktrees/issue-26-paused-game-overlay`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperado:** una PR desde el branch de #26 a `master`, después de F1–F3.
- **Aislamiento confirmado:** issue OPEN y asignada a `pronficilio`; branch/worktree canónicos. Base actual `be93e975072b364365a90206931f732fb44dc6f1`; rebase limpio sobre PR #31/#29, claves de portada y cambios de #21 preservados. El checkout raíz no se modificó.
- **Reporte F1:** `docs/plans/paused-game-overlay/report_issue_26_F1.md`.
- **Reporte F2:** `docs/plans/paused-game-overlay/report_issue_26_F2.md`.
- **Siguiente dueño:** usuario/Orquestador para la prueba humana en 3012; luego Verifier FINAL independiente sobre HEAD nuevo.
- **Commits históricos:** `6621255` (leader-only), `46b0805` (permiso por asiento, sin conservar respuestas) y `9276e0a` (conserva respuestas; copy anterior).
- **Validación:** `npm run build` exit 0 con warnings existentes; `git diff --check` exit 0; i18n 292/292 claves/placeholders; Orquestador confirmó HMR con strings esperadas y sin texto anterior. Pendientes: prueba humana escritorio/móvil/teclado y Verifier FINAL sobre este cambio de copy. No agregar ni ejecutar tests automatizados.
- **Estado del tracker:** `WAITING_ORCHESTRATOR`; issue #26 sigue OPEN/asignada. Sin PR ni despliegue.
