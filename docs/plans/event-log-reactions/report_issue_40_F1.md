# Reporte F1 — Contrato público y autoridad de reacciones

**Issue:** #40 — rediseñar el registro de eventos y añadir reacciones efímeras
**Estado:** F1 `CLOSED`; entregada en `WAITING_ORCHESTRATOR`. F2 no iniciada.
**Branch/worktree:** `issue/40-event-log-reactions` / `.worktrees/issue-40-event-log-reactions`
**Alcance:** servidor y cobertura de servidor; sin cambios de cliente ni de reglas de Coup.

## Implementación

`g-addLog` ahora difunde eventos con ID único por partida, tipo estable, turno, datos públicos y clave/parámetros de traducción. Se migraron todos los emisores existentes. Los resultados de ingreso, ayuda, impuesto, robo e intercambio reflejan los montos reales; la ayuda bloqueada registra cero. El intercambio solo comunica que se resolvió y no incluye las cartas de la Corte ni las cartas conservadas.

El servidor determina el asiento a partir del socket, valida evento/catálogo/payload y mantiene como máximo una selección por asiento y evento. Elegir otra reacción reemplaza la selección; repetirla con otro `requestId` la quita. Un `requestId` repetido con el mismo contenido es idempotente; reutilizarlo con otro contenido se rechaza. Los conteos públicos no incluyen asientos; la selección propia se emite solo al socket correspondiente. La presencia pública transitoria incluye únicamente asiento y reacción, sin ID del evento. El snapshot ofrece conteos agregados y selección propia, y el rematch limpia el estado.

## Evidencia y verificaciones

- `node --test test/event-log-reactions.test.js`: PASS. La suite completa también muestra aprobados los escenarios nuevos de F1.
- `node --check server/game/coup.js`, `node --check server/test/coup.test.js` y `node --check server/test/event-log-reactions.test.js`: PASS.
- `git diff --check`: PASS.
- `npm test` y `npm test -- --test-concurrency=1`: ambos dan 43 aprobadas y 4 fallidas; terminan con código 1. Las pruebas nuevas de eventos/reacciones pasan en ambas ejecuciones.

Los cuatro fallos restantes están fuera de las superficies modificadas por F1 y exponen expectativas antiguas en `server/test/coup.test.js`:

1. `an incomplete shared window times out by pausing without defaulting unanswered seats` y `a seat disconnecting during a timeout pause makes that pause non-resumable` buscan `g-gamePaused` en el registro compartido del namespace. La ruta existente de pausa lo envía a cada socket mediante `socketEmit`.
2. `only the leader resumes a timed-out decision, with a fresh id and empty response set` espera que solo el líder pueda reanudar. La ruta existente permite reanudar a un asiento humano que quedó sin responder.
3. `emergency Codex shutdown aborts an AI challenge and pauses without applying its answer` también busca `g-gamePaused` en el registro del namespace, aunque la pausa se envía por socket.

Las rutas de pausa/reanudación y las líneas de esas pruebas no forman parte de los cambios de F1. No se alteraron para evitar ampliar el alcance. La suite general queda como limitación explícita para revisión del Orquestador; no se declara completamente verde.

## Revisión de falsificación F1

- Dos asientos reaccionando al mismo evento dejan conteos exactos; el agregado no revela asiento ni socket. Los mensajes de presencia no incluyen `eventId`.
- Solicitudes repetidas, reemplazo, retiro y reutilización conflictiva de `requestId` se cubren en pruebas.
- El asiento se deriva del socket: espectadores y asientos Codex no pueden reaccionar.
- El snapshot no expone la relación de reacciones de otros asientos ni las cartas privadas de Exchange.
- IDs, selecciones, conteos y presencia se reinician al comenzar el rematch.

**Resultado F1:** PASS para el contrato y las verificaciones específicas de la fase, con la limitación de la suite general descrita arriba. Esperar revisión del Orquestador antes de F2.
