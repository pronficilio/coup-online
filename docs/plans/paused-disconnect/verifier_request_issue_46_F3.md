# Solicitud de Verifier FINAL — issue #46

- **Proyecto:** `pronficilio/coup-online` (`master` destino).
- **Issue:** [#46](https://github.com/pronficilio/coup-online/issues/46).
- **Modo / riesgo:** `FULL` / `HIGH`.
- **Política:** `FINAL` independiente; checkpoint F3.
- **Branch / worktree:** `issue/46-paused-disconnect` / `.worktrees/issue-46-paused-disconnect`.
- **Commit exacto:** `b67d7c242fefc66050840c3a45ed045f3f7afe23`.
- **Diff:** desde `f900c0947a0b27ac9c6e0372e3c1871a883be7e6` hasta el commit indicado.
- **Reporte de implementación:** `docs/plans/paused-disconnect/report_issue_46_F2.md`.
- **Reporte de arquitectura/contrato:** `docs/plans/paused-disconnect/report_issue_46_F1.md`.
- **Reporte FINAL solicitado:** `docs/plans/paused-disconnect/report_issue_46_F3.md`.

## Definición de éxito

Una desconexión de jugador vivo en `running` o `paused` termina la partida con aviso terminal a jugadores y espectadores, invalida decisiones/timer/Codex y no exige recargar. Una desconexión de jugador eliminado se ignora y no bloquea una reanudación autorizada. `gameover` mantiene ganador/revancha. No hay reconexión ni reasignación de identidad.

## Pregunta de falsificación

¿Existe una intercalación alcanzable entre disconnect, timeout, `g-resume`, respuesta Codex o respuesta humana que deje a los conectados en pausa eterna, bloquee reanudar tras desconectarse un eliminado, o reactive una partida ya disuelta?

## Revisión requerida

Inspeccionar el diff/commit exacto y tratar de refutar los criterios 1–8 del plan. Buscar en particular: orden fase/invalidación/broadcast; disconnect repetido o tardío; `resume()` con jugador muerto sin socket y con vivo sin socket; Codex late response/rejection; resultado normal `gameover`; proyección terminal para espectadores; copy ES/EN; estado terminal que no vuelva a mostrar pausas ni controles.

## Restricciones y evidencia

- Revisión independiente y de solo lectura; no modificar el branch ni corregir hallazgos.
- No añadir ni ejecutar pruebas automatizadas. Inspección estática únicamente; no afirmar cobertura dinámica.
- Veredictos válidos: `PASS`, `FAIL`, `BLOCKED`, con referencias de archivo/línea y contraejemplos concretos si no pasa.
- Merge target: `master` de `pronficilio/coup-online`.
- Áreas prohibidas: no tocar código ni docs del worktree.
