# Issue #14 — evidencia de ejecución F1

**Estado:** `CLOSED` tras correcciones y PHASE independiente `PASS` en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`.
**Branch / worktree:** `issue/14-codex-ai-players` / `.worktrees/issue-14-codex-ai-players`.
**Commit F1 inicial:** `608089d4c839f367b9b0b0e92009d3daf536ce5c`; checkpoint corregido revisado y publicado en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee` (sin PR).
**Contrato:** `docs/plans/codex-ai-players/f0_contract.md`.

## Cambios comprobables

- `server/game/lobby.js` asocia nombre, disponibilidad y liderazgo a sockets conectados. El inicio requiere que lo pida el líder y que haya entre dos y seis asientos nombrados y listos. El servidor crea el roster; ignora el roster enviado por el cliente. `partyUpdate` no incluye IDs de socket. El `leaderSocketID` se pasa explícitamente al motor, separado del orden del roster.
- `server/game/coup.js` conserva las manos/mazo en el servidor. `g-updatePlayers` se emite por socket con el tablero público (nombre, monedas, color, estado, cantidad de influencias y cartas reveladas) y solo la mano del destinatario. Las decisiones privadas y las ventanas usan `g-decision` con opciones preparadas por el servidor y `{ decisionId, stateVersion, choiceId }` como respuesta.
- El servidor deriva el asiento del socket conectado. Rechaza campos extra como `source`/`amount`, socket no elegible, fase/versión/ID vencidos y opciones no emitidas. Una repetición exacta durante la misma decisión es idempotente; una opción distinta repetida se rechaza. Cada decisión cerrada invalida y limpia el prompt en los clientes.
- Las ventanas esperan todas las respuestas elegibles o el mismo timeout configurable (`DECISION_TIMEOUT_MS`, 60 000 ms por omisión). Challenge, bloqueo y challenge de bloqueo se desempatan con el orden horario de asientos de F0, sin depender del orden de llegada. Un timeout parcial o desconexión pausa la partida con causa visible; no aplica un `pass` por silencio y las respuestas posteriores quedan obsoletas.
- El motor calcula actor, acciones, costos, destinos, rol reclamado, pérdidas, intercambio, eliminación y avance. Una carta perdida queda revelada fuera del Court deck; una carta mostrada para probar una afirmación vuelve al Court, se baraja y se reemplaza en privado. El ganador anterior empieza la revancha; sin ganador previo el inicio es aleatorio. En dos jugadores quien empieza tiene una moneda y el otro dos.
- `Coup.js`, `PlayerBoard.js` y las pantallas de lobby usan las proyecciones y opciones `choiceId`; el cliente no manda actor, costo, fuente, carta o intercambio. Se retiraron los componentes de decisión no usados que aún emitían el protocolo antiguo.

## Pruebas y checks

Pruebas significativas agregadas con `node:test` en `server/test/coup.test.js` y `server/test/lobby.test.js`. Cubren el recorrido `income` y turno siguiente, proyección privada, roster/control de líder aunque el orden de conexión difiera del primer nombre, roster hostil, socket y versión inválidos, payload con actor/costo adicional, challenge/block simultáneos, idempotencia, timeout con respuesta parcial, setup de dos jugadores, revancha, pérdida fuera del mazo y prueba/reemplazo de influencia. Las regresiones nuevas comprueban que un objetivo que desafía Assassin y pierde Duke recibe enseguida la pérdida de Asesinato sin opción de bloquear con Contessa, y que Exchange con una influencia conserva solo una carta.

Checks que pasan:

- `npm test` en `server/` (2 archivos de prueba pasan; `coup.test.js` tiene 14 casos y `lobby.test.js` uno).
- `node test/coup.test.js` y `node test/lobby.test.js` en `server/`.
- `node --check` para `server/game/coup.js`, `server/game/lobby.js`, `server/game/utils.js` y `server/index.js`.
- `git diff --check`.
- Búsqueda estática confirma que el cliente ya no emite los eventos antiguos de acción/desafío/bloqueo/revelación/intercambio y que los eventos de salida no serializan `socketID`.

La compilación y el test de React no pudieron ejecutarse: en el worktree no existe `coup-client/node_modules/.bin/react-scripts`; `npm test -- --watchAll=false` y `npm run build` terminan con `react-scripts: not found`. No se descargaron dependencias. Tampoco se hizo una partida en vivo.

## Reanudación y límites

Tras un timeout, el líder actual puede emitir `g-resume` solo mientras todos los sockets del roster sigan conectados. El servidor reemite las mismas opciones con ID/versión nuevos y descarta respuestas parciales; las respuestas al ID anterior fallan. Si falta un socket o la pausa fue causada por desconexión, no hay reanudación ni reasignación de asiento: se recrea la partida. No hay recuperación de identidad persistente.

## Revisión PHASE independiente y correcciones

El Verifier revisó `f9de90f` (incluye implementación `608089d`) y emitió `FAIL`; informe histórico: `docs/plans/active/verifier_issue_14_F1.md`. Las dos refutaciones quedaron corregidas en este checkpoint:

1. Si el objetivo desafía Assassin y pierde, la continuación ahora resuelve directamente la acción después de la primera pérdida; no vuelve a abrir `afterActionClaim` ni una ventana Contessa. El coste de Asesinato sigue cobrándose y otras acciones reclamadas conservan el flujo anterior. La regresión verifica que el objetivo pierde Duke primero, mantiene Contessa en la mano y luego recibe solo una segunda opción `lose_influence` para Contessa.
2. `openExchange` ahora genera elecciones del mismo tamaño que la mano previa (una o dos cartas). La regresión de una influencia verifica tres opciones singulares, conserva una carta elegida y devuelve las otras dos al Court.

Las correcciones pasan la suite del servidor, ambas pruebas directas, `node --check` y `git diff --check`. La segunda revisión PHASE independiente dio `PASS`; informe: `docs/plans/active/verifier_issue_14_F1_recheck.md`. El informe histórico `verifier_issue_14_F1.md` conserva el primer `FAIL`. F1 queda cerrada; el cierre de fase no invocó Codex.
