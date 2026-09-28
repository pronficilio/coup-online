# Cierre De Unidad — issue #46

**Issue/Ticket:** [#46 — Disolver la partida si se desconecta un jugador activo durante una pausa](https://github.com/pronficilio/coup-online/issues/46), `CLOSED`.
**Plan:** `docs/plans/paused-disconnect/plan_paused_disconnect.md`.
**Estado del plan:** `COMPLETED`; F1–F3 `CLOSED (PASS)`.
**Modo de ejecución:** `FULL`.
**Nivel de riesgo:** `HIGH` (transición concurrente de estado de partida y desconexión).
**Política de verificación:** `FINAL` independiente; Verifier requerido en F3.
**Verifier requerido ahora:** no; F3 FINAL `PASS` independiente en el commit indicado en `report_issue_46_F3.md`.
**Pregunta de falsificación:** ¿alguna intercalación disconnect/timeout/resume/respuesta tardía deja un overlay eterno, bloquea continuar tras desconexión de eliminado o reactiva una partida disuelta?
**PR integrada:** [#48](https://github.com/pronficilio/coup-online/pull/48), merge commit `2f45d787ded0da2218c6c784f4dd739abdaf4c1b` a `master`.
**Veredicto del Orquestador:** `PASS`; la integración cumple alcance y evidencia. Siguiente dueño: ninguno; unidad cerrada.

## Fuentes y alcance

- Plan canónico: `docs/plans/paused-disconnect/plan_paused_disconnect.md`.
- Código inicial: `server/game/coup.js`, `server/game/lobby.js`, `server/index.js`, `coup-client/src/components/game/Coup.js`, `coup-client/src/i18n/translations.json`.
- Criterio operativo: participante vivo desconectado en `running` o `paused` termina la partida de forma terminal y visible; jugador eliminado desconectado se ignora y no bloquea `resume()`; no crear reconexión/transferencia de identidad.
- La issue #26 permanece como decisión previa sobre ownership de pausa; no cambiar quién puede reanudar.

## Criterios de aceptación

Aplicar y evidenciar los criterios 1–8 del plan. La pantalla/estado terminal debe salir de pausa sin requerir recarga y comunicarse también a espectadores. El resultado normal de `gameover` conserva prioridad si ya fue declarado.

## F1 cerrada

La matriz de fases y asientos, rutas de eventos, ciclo de vida de namespace y contrato de terminación quedan documentados en `docs/plans/paused-disconnect/report_issue_46_F1.md` y en la sección F1 del plan canónico.

## F2 cerrada

La terminación visible y la continuidad de asientos eliminados están implementadas y revisadas estáticamente. Evidencia: `docs/plans/paused-disconnect/report_issue_46_F2.md`.

## F3 cerrada

Verifier FINAL independiente emitió `PASS` estático sobre `b67d7c242fefc66050840c3a45ed045f3f7afe23`. Reporte: `docs/plans/paused-disconnect/report_issue_46_F3.md`.

## Resultado

- La desconexión de un jugador vivo disuelve la partida y avisa a clientes conectados; la de un jugador eliminado no la pausa ni bloquea reanudar.
- Las fases F1–F3 cerraron con `PASS`; reportes disponibles en `docs/plans/paused-disconnect/`.
- PR única #48 integrada a `master`; issue #46 cerrada tras revisar la integración.
- No se ejecutaron pruebas automatizadas/build conforme al plan; no hay checks configurados en la PR.

## Riesgos, evidencia y validación

- No asumir que el broadcast de namespace sobrevive a `cleanup()`. Verificar orden evento/desconexión/limpieza.
- No usar `g-gameOver` si implica ganador o revancha autorizada; proponer estado terminal explícito con motivo de disolución.
- Evidencia mínima: referencias a guardias de estado, invalidación de trabajo pendiente, consumidor del evento terminal, ruta visual sin reload y tabla de matriz. Distinguir estático/dinámico.
- No añadir ni ejecutar pruebas automatizadas. No declarar walkthrough dinámico si no se realizó.
- Verifier F3 busca: race resume contra disconnect, disconnect repetido, Codex tardío, desconexión muerta con pausa recuperable, espectadores y gameover ya anunciado.

## Topología y operación

- **Branch destino del issue:** `issue/46-paused-disconnect`.
- **Worktree destino del issue:** `.worktrees/issue-46-paused-disconnect`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **Bitácora del issue:** `docs/plans/log/issue-46.jsonl`.
- **PR/MR:** [#48](https://github.com/pronficilio/coup-online/pull/48), `MERGED`, hacia `master`, asociada únicamente a #46.
- **Secuencia realizada:** issue reclamada en el fork, branch/worktree únicos confirmados, handoff movido a `active/` y a `completed/` al cerrar; fases cerradas con commits y bitácora.
- **Política de commits:** `COMMIT_REQUIRED` por fase; mensajes previstos en el plan.
- **Cierre:** issue cerrada después del merge; plan, bitácora y handoff final sincronizados. No se tocaron otros worktrees ni cambios locales del checkout principal.
- **Delegación:** implementación realizada por Agente Menor; revisión FINAL realizada por Verifier independiente.
