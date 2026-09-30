# Issue #75 — reporte F3: Verifier independiente

## Procedencia y veredicto

El agente Verifier independiente `/root/verifier_issue_75_f3` revisó el commit `17864e899597f768fffd08dfc7acdde3f3fe8075` en `.worktrees/issue-75-disconnect-elimination`. El Orquestador registra aquí el informe recibido; el Verifier no modificó archivos.

**Veredicto: `PASS` estático.** No se encontró otro contraejemplo material en las intercalaciones solicitadas ni en las rutas de decisión inspeccionadas.

## Rutas adversariales revisadas

- **Blocker y actor offline durante `block_challenge`:** `resume()` prioriza el actor, luego el blocker y el objetivo; sigue buscando sockets faltantes aunque la fase pase a `running`. Si elimina primero al actor, cancela su acción y avanza. Si elimina al blocker con el actor vivo, descarta `block_challenge` y resuelve sin bloqueo. Referencias: `server/game/coup.js`, `resume()`; `eliminateDisconnectedPlayer()` y `continueWithoutDeadBlock()`.
- **Blocker y challenger offline, incluida una respuesta ya guardada:** la decisión compartida se descarta cuando muere el blocker; una respuesta guardada no resuelve el bloqueo invalidado. El barrido vuelve a buscar y elimina al challenger offline antes de retornar.
- **Efectos:** foreign aid sin bloqueo se resuelve normalmente; `resolveAction()` evita robar o quitar influencia a un objetivo muerto. Si el actor ya está marcado muerto, la acción se cancela y se avanza.
- **Claimant muerto:** `openProofDecision()` registra la concesión y ejecuta el callback sin abrir una decisión vacía.
- **Retorno, rechazo y terminalidad:** `resume()` solo activa una decisión si el juego sigue en `paused` y conserva `pausedDecision`. Si el drenaje lleva la partida a `running` o `gameover`, retorna sin llamar `activateDecision()`; un `resume()` iniciado en estado terminal se rechaza al principio. No se encontró una ruta que reactive `gameover`.

## Límites de evidencia

La revisión fue estática. No se modificaron archivos ni se ejecutaron pruebas, build o runtime. La entrega real de eventos y el orden de callbacks de Socket.IO no quedan verificados dinámicamente.
