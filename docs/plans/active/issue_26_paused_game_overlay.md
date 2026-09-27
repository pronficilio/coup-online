# Handoff para Orquestador — issue #26

- **Issue:** https://github.com/pronficilio/coup-online/issues/26
- **Plan exacto:** `docs/plans/paused-game-overlay/plan_paused_game_overlay.md`
- **Bitácora exacta:** `docs/plans/log/issue-26.jsonl`
- **Estado:** `READY_TO_MERGE`; F1, F2 y F3 cerradas. El usuario aprobó el recorrido manual solicitado y pidió explícitamente abrir PR y hacer merge a `master`.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
- **Verifier requerido:** PASS en [`report_issue_26_F3_copy.md`](../paused-game-overlay/report_issue_26_F3_copy.md), sobre la implementación del HEAD `b7328f7`; los commits posteriores son documentación. Los informes `report_issue_26_F3.md` (`6621255`), `report_issue_26_F3_recheck.md` (`46b0805`) y `report_issue_26_F3_followup.md` (`9276e0a`) son históricos.
- **Criterio de falsificación:** ¿algún líder, respondedor previo o tercero puede reanudar; algún responsable pendiente queda sin CTA; se reemite decisión a quien ya respondió; hay CTA si solo falta Codex; recibe overlay alguien que no sea responsable en un timeout humano?
- **F1 anterior:** obsoleta porque permitía al líder; ver [`report_issue_26_F1_recheck.md`](../paused-game-overlay/report_issue_26_F1_recheck.md). Pendientes se derivan como `allowed - responses`, resueltos a asientos humanos por el servidor.
- **F2 anterior:** el copy explicaba causas, respuesta pendiente y conectividad; el nuevo copy elimina esos detalles y conserva solo título/CTA autorizada, status breve y errores reales `role="alert"`.
- **F3 manual:** el usuario confirmó que completó y aprobó el recorrido solicitado en `localhost:3012`: timeout recuperable con tres jugadores, estados del responsable y los demás, reanudación conservando la respuesta previa, teclado y viewport estrecho. La pausa no recuperable se verificó estáticamente, no en un recorrido humano. El reporte acota explícitamente esa evidencia.
- **Documentos fuente:** issue #26 (incluida aclaración canónica y preferencia nueva de copy); plan exacto arriba; `f0_contract.md` (la regla inicial de líder queda superseded para #26); base sincronizada `origin/master` `be93e975072b364365a90206931f732fb44dc6f1` (PR #31/#29).

## Sincronización reciente

`origin/master` avanzó de `1ff478c` a `3313d426` con PR #30 de #21 y luego a `be93e975` con PR #31 de #29. Ambos rebases de #26 fueron limpios; se conservaron los botones ilustrados de #21 y las claves de créditos de portada de #29. El worktree sigue en la rama canónica.

## F1 y F2 completadas

- **F1 revalidada:** ownership por asiento en `docs/plans/paused-game-overlay/report_issue_26_F1_recheck.md`; el informe F1 previo se conserva con banner histórico.
- **F2 follow-up anterior:** preserva `responses` server-side y no reenvía decisiones a actores respondidos; el ID/versión cambia al reanudar. `report_issue_26_F3_followup.md` registra el Verifier sobre `9276e0a`.
- **F2 copy actual:** implementación `4e3043b4c5d85e63e6aba47b0b5da7f0869ace2f`, reporte [`report_issue_26_F2_copy_followup.md`](../paused-game-overlay/report_issue_26_F2_copy_followup.md). Overlay de responsable/no recuperable contiene solo el heading «Partida en pausa» y, si se puede reanudar, el botón «Reanudar partida». El status de los demás es «La partida está en pausa.» Sin explicación de causa, conectividad ni espera; un rechazo real del servidor se conserva como `role="alert"`.

## Fases completadas

- F1 confirmó el ownership por asiento pendiente; F2 implementó permisos server-side, overlay y copy mínimo; F3 independiente terminó en PASS.
- `npm run build` terminó con exit 0 y warnings preexistentes; `git diff --check` pasó; i18n quedó en 292/292. No se ejecutaron tests automatizados según la política de la unidad.
- El recorrido humano no incluyó una pausa no recuperable; el veredicto estático de ese estado y sus límites constan en el reporte F3. El usuario aprobó el resultado y autorizó expresamente PR + merge.

El recorrido humano solicitado fue aprobado. La regla de ownership por asiento y la conservación de respuestas siguen vigentes. Issue #21/PR #30 aportó botones de respuesta ilustrados, preservados por el rebase; esta fase cambia solo el copy de pausa.

## Topología y reclamo obligatorio

- **Branch único:** `issue/26-paused-game-overlay`.
- **Worktree único:** `.worktrees/issue-26-paused-game-overlay`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperado:** una sola PR desde el branch de #26 a `master`, ahora autorizada por el usuario.
- **Aislamiento confirmado:** issue OPEN y asignada a `pronficilio`; branch/worktree canónicos. Base actual `be93e975072b364365a90206931f732fb44dc6f1`; rebase limpio sobre PR #31/#29, claves de portada y cambios de #21 preservados. El checkout raíz no se modificó.
- **Reporte F1:** `docs/plans/paused-game-overlay/report_issue_26_F1.md`.
- **Reporte F2:** `docs/plans/paused-game-overlay/report_issue_26_F2.md`.
- **Siguiente dueño:** Orquestador para abrir y revisar la PR, integrarla a `master` y registrar el merge.
- **Commits históricos:** `6621255` (leader-only), `46b0805` (permiso por asiento, sin conservar respuestas) y `9276e0a` (conserva respuestas; copy anterior).
- **Validación:** `npm run build` exit 0 con warnings existentes; `git diff --check` exit 0; i18n 292/292 claves/placeholders; Orquestador confirmó HMR con strings esperadas y sin texto anterior; recorrido humano solicitado aprobado; Verifier FINAL PASS en `report_issue_26_F3_copy.md`. No agregar ni ejecutar tests automatizados.
- **Estado del tracker:** issue #26 sigue OPEN/asignada; el usuario autorizó PR y merge a `master`. La PR aún no se ha creado. Sin despliegue.
