# Handoff Para Agente Ejecutor

**Issue/Ticket:** [#75 — continuar la partida si se desconecta un jugador con 3 o más participantes](https://github.com/pronficilio/coup-online/issues/75), `OPEN`.
**Plan:** `docs/plans/disconnect-elimination/plan_disconnect_elimination.md`.
**Estado del plan:** `WAITING_ORCHESTRATOR`; F1, F2 y F3 `CLOSED (PASS)`. F3 fue `PASS` estático independiente sobre `17864e8`; PR [#81](https://github.com/pronficilio/coup-online/pull/81) está abierta a `master`.
**Modo de ejecución:** `FULL`.
**Nivel de riesgo:** `HIGH`.
**Política de verificación:** `FINAL` independiente.
**Verifier requerido ahora:** no; F3 independiente cerrada `PASS` estático.
**Pregunta de falsificación:** ¿puede una intercalación entre desconexión, timeout, resume, respuesta humana/Codex y avance de turno dejar a los conectados sin una decisión válida, resolver una acción dos veces o reactivar una partida terminal?
**Fases completadas:** F1, F2 y F3. Siguiente dueño: Orquestador para terminar de revisar los checks e integrar la PR #81.
**Resultado F1:** matriz y decisión estática en `docs/plans/disconnect-elimination/report_issue_75_F1.md`. #46 implementó disolución terminal para el jugador vivo que se desconecta; #75 conserva esa regla para dos asientos.

**Resultado F2:** implementación y matriz estática en `docs/plans/disconnect-elimination/report_issue_75_F2.md`. No se ejecutaron pruebas automatizadas, build ni recorrido runtime. F2 invalida inmediatamente un `block_challenge` cuyo blocker se desconecta; conserva la pérdida ya determinada de otro asiento si muere el actor; y `resume()` prioriza actor, blocker y objetivo, luego procesa los demás humanos sin socket aunque la primera baja haya pasado el juego a `running`. La pausa previa no reanudable con `pausedDecision === null` sigue intacta. Las dos devoluciones de F3 y sus fixes están registradas en `report_issue_75_F3_checkpoint.md`.

**Resultado F3:** el Verifier independiente dio `PASS` estático sobre `17864e899597f768fffd08dfc7acdde3f3fe8075`; el informe y sus límites están en `docs/plans/disconnect-elimination/report_issue_75_F3_verifier.md`. No hubo pruebas, build ni runtime.

## Documentos fuente

- Plan canónico: `docs/plans/disconnect-elimination/plan_disconnect_elimination.md`.
- Issue #75: https://github.com/pronficilio/coup-online/issues/75.
- Contrato previo: `docs/plans/paused-disconnect/plan_paused_disconnect.md` y `docs/plans/completed/issue_46_paused_disconnect.md`.
- Código relevante: `server/game/coup.js`, `coup-client/src/components/game/Coup.js`.

## Subtareas listas para ejecución

1. **F1:** construir y documentar la matriz de desconexión por fase y rol de asiento; cerrar recuperación/cancelación de la decisión sin cambiar las reglas de reanudación de #26.
2. **F2 — completada:** eliminar el asiento vivo desconectado para partidas con `players.length >= 3` y continuar la partida conforme a F1; preservar disolución para dos asientos.
3. **F3 — completada:** Verifier independiente intentó refutar criterios 1–7 y emitió `PASS` estático sobre el commit correctivo.

**Criterios de aceptación:** los numerados 1–8 en el plan canónico. El umbral cuenta asientos de jugador (incluidos los ya eliminados), no espectadores. La desconexión de un asiento muerto no altera la partida.
**Evidencia requerida:** matriz y reporte F1; reporte F2 con revisión estática del estado, decisión y eventos; reporte F3 independiente con veredicto y límites de evidencia explícitos.
**Riesgos/Bloqueos:** actor, respondedor u objetivo puede desconectarse durante `running` o `paused`; evitar decisiones/timers/respuestas tardías colgados o duplicados. Si hace falta cambiar una regla fuera de alcance, detener y escalar al Orquestador.
**Política de commits:** `COMMIT_REQUIRED` al cerrar F1, F2 y F3; commits de todas las fases dentro del mismo branch/worktree.
**Commit de cierre por fase:**

- F1: `docs(plans): issue 75 F1 CLOSED advance_f2`
- F2: `fix(disconnect-elimination): issue 75 F2 CLOSED advance_f3`
- F3: `fix(disconnect-elimination): issue 75 F3 CLOSED advance_review`

**Branch destino del issue:** `issue/75-disconnect-elimination`.
**Worktree destino del issue:** `.worktrees/issue-75-disconnect-elimination`.
**Merge target:** `master`.
**Reclamo confirmado:** issue asignado a `pronficilio`; ejecutor Agente Alquimista; estado `ACTIVE`.
**Límite de pausa:** la recuperación aplica a `pausedDecision` presente. Si `pausedDecision === null` por una pausa no reanudable preexistente de #26, se elimina y proyecta al jugador, pero no se reinicia ni reasigna la decisión ni se cambia la regla de reanudación; el issue registra esta decisión en [un comentario](https://github.com/pronficilio/coup-online/issues/75#issuecomment-5905691402).
**Bitácora del issue:** `docs/plans/log/issue-75.jsonl`.
**PR/MR canónica:** [#81](https://github.com/pronficilio/coup-online/pull/81), una PR hacia `master` asociada únicamente a #75.

## Secuencia obligatoria de reclamo/aislamiento

1. Reclamar #75 en el tracker del fork `pronficilio/coup-online`; volver a leer el issue y confirmar que no hay un reclamo incompatible.
2. Confirmar que branch, worktree o PR canónicos no hayan aparecido desde la preparación de este handoff.
3. Crear/confirmar el branch desde la base correcta y el worktree único del issue.
4. Los artefactos de preparación (#75 en `README_plans.md`, plan, handoff y bitácora) están sin commit en el checkout raíz. Transfiérelos/reaplícalos al worktree del issue; no hagas trabajo de código en el checkout raíz.
5. Dentro de ese worktree, mover el handoff de `inbox/` a `active/`, registrar `claim` y `worktree_confirmed` en la bitácora append-only, y hacer commit de control si esos documentos cambiaron.
6. Ejecutar F1 y F2 en el mismo branch/worktree. Detenerse tras F2 para solicitar al Orquestador el Verifier independiente de F3; el implementador no puede emitir ese veredicto.

**Validaciones esperadas:** inspección estática de cada ruta de estado y revisión del diff. No agregar ni ejecutar pruebas automatizadas para esta unidad; declarar explícitamente que no hay evidencia dinámica.
**Contrato de evidencia/manifiesto:** documentar para cada fase commit, criterios cubiertos, veredicto y validaciones efectivamente realizadas. No inventar ejecución de pruebas.
**Condición para invocar Verifier:** F2 cerrada y commit identificable; Verifier independiente intenta refutar la pregunta anterior y criterios 1–7.
**Qué debe actualizar el Ejecutor:** plan, reporte de cada fase, estado del handoff, eventos append-only de #75 y enlaces de evidencia en la PR. Mantener issue y PR dirigidos explícitamente a `pronficilio/coup-online`; no tocar upstream.
