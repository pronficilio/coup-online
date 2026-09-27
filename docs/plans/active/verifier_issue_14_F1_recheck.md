# Issue #14 — informe PHASE independiente F1 (revisión de correcciones)

**Veredicto:** PASS.
**Revisión:** commit `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`.
**Branch:** `issue/14-codex-ai-players`; worktree `.worktrees/issue-14-codex-ai-players`.
**Cambios del Verifier:** ninguno.

## Alcance y hallazgos previos

Esta segunda revisión comprueba las correcciones de los dos hallazgos del informe histórico `verifier_issue_14_F1.md`, además del contrato F1 completo. El fallo inicial de F1 permanece documentado sin cambios; este informe acredita que el checkpoint corregido cierra ambos puntos.

1. **Desafío perdido contra Assassin:** ahora, si el objetivo de Asesinato desafía la afirmación y pierde, el motor resuelve de inmediato la pérdida de influencia de Asesinato. No vuelve a abrir la oportunidad de bloquear con Contessa. La regresión comprueba que el objetivo conserva Contessa tras perder Duke, no recibe una opción de bloqueo y pierde la segunda influencia. Evidencia: `server/game/coup.js:471` y `server/test/coup.test.js:223`.
2. **Exchange con una influencia:** el motor genera elecciones del mismo tamaño que la mano anterior. Con una influencia, se elige una de las tres cartas disponibles, se conserva una y las otras vuelven al Court. Evidencia: `server/game/coup.js:657` y `server/test/coup.test.js:266`.

## Revisión del contrato F1

La implementación deriva roster/líder del servidor y socket, entrega solo la mano propia junto con datos públicos, limita respuestas a `{ decisionId, stateVersion, choiceId }` emitidos por el servidor y rechaza respuestas de otra fase/asiento o vencidas. Las ventanas se resuelven por orden fijo de asiento y no por latencia. Timeout pausa sin aplicar respuestas parciales; la reanudación exige al líder y a todos los sockets conectados, emite IDs/versiones nuevos y descarta lo anterior. La desconexión obliga a recrear la partida. El cliente ya usa las opciones del servidor y el sobre de respuesta acotado.

## Validación independiente

- `npm test` en `server/`, `node test/coup.test.js` (14 casos) y `node test/lobby.test.js` (1 caso): pasan.
- `node --check` para los módulos del servidor y `git diff --check`: pasan.
- El worktree está limpio y `HEAD` coincide con `origin/issue/14-codex-ai-players` en el commit revisado.
- No se pudo compilar/probar React porque falta `react-scripts`; no se hizo una partida en vivo.
- No se invocó Codex ni se comenzó F2 durante esta revisión.

**Conclusión:** PASS de F1 en el checkpoint corregido. Se puede cerrar F1 e iniciar F2.
