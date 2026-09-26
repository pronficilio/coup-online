# Issue #14 — evidencia de ejecución F1

**Estado:** F1 devuelta al Ejecutor tras revisión PHASE `FAIL`; no es `PASS` ni `CLOSED`.
**Branch / worktree:** `issue/14-codex-ai-players` / `.worktrees/issue-14-codex-ai-players`.
**Commit F1:** `608089d4c839f367b9b0b0e92009d3daf536ce5c` (local; sin push ni PR).
**Contrato:** `docs/plans/codex-ai-players/f0_contract.md`.

## Cambios comprobables

- `server/game/lobby.js` asocia nombre, disponibilidad y liderazgo a sockets conectados. El inicio requiere que lo pida el líder y que haya entre dos y seis asientos nombrados y listos. El servidor crea el roster; ignora el roster enviado por el cliente. `partyUpdate` no incluye IDs de socket. El `leaderSocketID` se pasa explícitamente al motor, separado del orden del roster.
- `server/game/coup.js` conserva las manos/mazo en el servidor. `g-updatePlayers` se emite por socket con el tablero público (nombre, monedas, color, estado, cantidad de influencias y cartas reveladas) y solo la mano del destinatario. Las decisiones privadas y las ventanas usan `g-decision` con opciones preparadas por el servidor y `{ decisionId, stateVersion, choiceId }` como respuesta.
- El servidor deriva el asiento del socket conectado. Rechaza campos extra como `source`/`amount`, socket no elegible, fase/versión/ID vencidos y opciones no emitidas. Una repetición exacta durante la misma decisión es idempotente; una opción distinta repetida se rechaza. Cada decisión cerrada invalida y limpia el prompt en los clientes.
- Las ventanas esperan todas las respuestas elegibles o el mismo timeout configurable (`DECISION_TIMEOUT_MS`, 60 000 ms por omisión). Challenge, bloqueo y challenge de bloqueo se desempatan con el orden horario de asientos de F0, sin depender del orden de llegada. Un timeout parcial o desconexión pausa la partida con causa visible; no aplica un `pass` por silencio y las respuestas posteriores quedan obsoletas.
- El motor calcula actor, acciones, costos, destinos, rol reclamado, pérdidas, intercambio, eliminación y avance. Una carta perdida queda revelada fuera del Court deck; una carta mostrada para probar una afirmación vuelve al Court, se baraja y se reemplaza en privado. El ganador anterior empieza la revancha; sin ganador previo el inicio es aleatorio. En dos jugadores quien empieza tiene una moneda y el otro dos.
- `Coup.js`, `PlayerBoard.js` y las pantallas de lobby usan las proyecciones y opciones `choiceId`; el cliente no manda actor, costo, fuente, carta o intercambio. Se retiraron los componentes de decisión no usados que aún emitían el protocolo antiguo.

## Pruebas y checks

Pruebas significativas agregadas con `node:test` en `server/test/coup.test.js` y `server/test/lobby.test.js`. Cubren el recorrido `income` y turno siguiente, proyección privada, roster/control de líder aunque el orden de conexión difiera del primer nombre, roster hostil, socket y versión inválidos, payload con actor/costo adicional, challenge/block simultáneos, idempotencia, timeout con respuesta parcial, setup de dos jugadores, revancha, pérdida fuera del mazo y prueba/reemplazo de influencia.

Checks que pasan:

- `npm test` en `server/`.
- `node --check` para `server/game/coup.js`, `server/game/lobby.js`, `server/game/utils.js` y `server/index.js`.
- `git diff --check`.
- Búsqueda estática confirma que el cliente ya no emite los eventos antiguos de acción/desafío/bloqueo/revelación/intercambio y que los eventos de salida no serializan `socketID`.

La compilación y el test de React no pudieron ejecutarse: en el worktree no existe `coup-client/node_modules/.bin/react-scripts`; `npm test -- --watchAll=false` y `npm run build` terminan con `react-scripts: not found`. No se descargaron dependencias. Tampoco se hizo una partida en vivo.

## Reanudación y límites

Tras un timeout, el líder actual puede emitir `g-resume` solo mientras todos los sockets del roster sigan conectados. El servidor reemite las mismas opciones con ID/versión nuevos y descarta respuestas parciales; las respuestas al ID anterior fallan. Si falta un socket o la pausa fue causada por desconexión, no hay reanudación ni reasignación de asiento: se recrea la partida. No hay recuperación de identidad persistente.

## Revisión PHASE independiente

El Verifier revisó `f9de90f` (incluye implementación `608089d`) y emitió `FAIL`; informe: `docs/plans/active/verifier_issue_14_F1.md`.

1. Si el objetivo desafía la afirmación Assassin y pierde, `loseInfluence` vuelve a `afterActionClaim` y abre otra ventana para bloquear. La regla de doble peligro de Asesinato exige aplicar la pérdida de la acción después de perder el desafío; el objetivo no debe obtener una segunda oportunidad de bloquear.
2. `openExchange` siempre ofrece conservar dos cartas y puede aumentar la mano de una influencia a dos. Exchange debe conservar el número de influencias que el jugador tenía y devolver las cartas restantes al Court.

El Verifier reprodujo ambos defectos. Se requieren pruebas de regresión para cada uno. No se inició Codex ni F2.
