# Issue #75 — reporte F2: eliminar al desconectado y continuar

## Veredicto de implementación

**`CLOSED (PASS)` por inspección estática del diff.** F1 queda implementada en el servidor; los casos enumerados abajo tienen transición explícita. F3 sigue pendiente de Verifier independiente. No se añadieron ni ejecutaron pruebas automatizadas, build ni recorrido runtime; este reporte no afirma evidencia dinámica.

## Implementación revisada

- `onDisconnect()` conserva `dissolve()` para partidas con menos de tres asientos y llama al flujo de eliminación para una partida con tres o más asientos. El conteo es `players.length`; espectadores no cuentan. Jugadores ya muertos son no-op.
- `eliminateDisconnectedPlayer()` registra públicamente cada influencia perdida, las añade a `revealedInfluences`, vacía `influences`, llama `checkEliminated()` (que deja `isDead` y `money = 0`) y actualiza estado/versionado. No devuelve cartas perdidas al mazo.
- Antes de manejar actor/decisión, una pausa previa con `pausedDecision === null` conserva esa pausa y solo actualiza la proyección. No se reinicia ni reasigna una decisión no recuperable de #26.
- Las cancelaciones cierran la decisión a clientes humanos, limpian timer y solicitudes Codex y avanzan la partida. En ventanas compartidas, el asiento muerto se quita de `allowed` y `responses`; una respuesta muerta no puede decidir challenge/block.
- `prove_claim` usa la misma concesión ante selección explícita y desconexión: queda `failed`, se registra `claim_not_proved`, no se reembolsa a un actor muerto y la pérdida posterior no abre una decisión nueva. La pérdida de influencia trata la muerte como efecto cumplido y no invoca el resolver con `[]`.
- El actor conserva el bloque pendiente en `currentAction.pendingBlock`. Si el blocker muere durante `block_challenge` (no pertenece a `decision.allowed`), el handler cierra esa decisión de inmediato, marca el bloque `cancelled` y continúa la acción original sin bloqueo. Foreign aid se resuelve normalmente; las acciones dirigidas omiten el efecto si el objetivo/blocker ya está muerto. Si el actor de la acción también está muerto, se cancela esa acción y se avanza sin reactivarla. Esto cubre tanto un pase como un reto ya iniciado.
- Como guarda adicional, `openProofDecision` no abre una decisión para un claimant muerto: marca su claim `failed`, registra `claim_not_proved` y ejecuta el callback de concesión existente. El camino normal de desconexión del blocker ya descarta `block_challenge` y no le quita otra influencia.
- Si el dueño de `exchange` muere, `pendingExchange` conserva el pool robado desde que se abre la decisión. La cancelación devuelve y mezcla únicamente esos draws; las influencias originales del muerto siguen fuera de la Corte. Al completar el intercambio, `pendingExchange` se limpia.
- Si el actor de `currentAction` muere mientras otro asiento vivo tiene una pérdida de influencia ya determinada, esa decisión continúa. `continueAfterLoss` detecta que el actor murió, cancela su acción y avanza sin ejecutar `resolveAction` ni otro callback que la continuaría.
- En pausas recuperables, la poda elimina al muerto de `allowed`, `responses` y `resumeOwnerSeats`. Sobrevivientes conservan sus permisos actuales; una ventana ya completa se resuelve con respuestas vivas y una incompleta sin propietario se cancela. `resume()` repite la búsqueda de asientos humanos sin socket antes de activar la decisión, procesando cada desconexión detectada.
- Si la eliminación deja un solo jugador vivo en una ruta recuperable/activa normal, `advanceTurn()` emite el `gameover`/`g-gameOver` existente. En `gameover` no se altera el ganador. Para partidas de dos asientos (`players.length < 3`), se mantiene la disolución terminal previa de #46; el umbral usa el total de asientos, incluso si una mesa 3+ tuvo eliminaciones antes.

## Matriz de evidencia estática

| Contexto | Resultado inspeccionado |
|---|---|
| `running`, actor antes de elegir | El actor muerto no responde; su turno se cancela y avanza. |
| `running`, actor en ventana multi-asiento | Se cancela la acción, se invalida/cierra la decisión y se avanza. No se ejecuta la acción del muerto. |
| `running`, actor muerto durante `lose_influence` de otro asiento | Se preserva la decisión/pérdida del otro asiento; al completarse, se cancela la acción original del muerto sin continuarla. |
| `running`, actor/claimant en `prove_claim` | Concesión registrada como fallida; no hay reembolso a muerto ni decisión posterior para elegir influencia. |
| `running`, actor en `exchange` | Se devuelve al mazo el pool de draws sin elegir y se cancela la acción. |
| `running`, respondedor en ventana multi-asiento | Se poda su permiso y respuesta; el resto resuelve con los mapas vivos. |
| `running`, blocker muere durante `block_challenge` | Se descarta la decisión de challenge y se cancela el bloque; foreign aid continúa, una acción dirigida no afecta a su objetivo muerto. Sin `prove_claim` al muerto. |
| `running`, objetivo | Su eliminación evita aplicar el efecto posterior a un asiento muerto; se mantiene la progresión normal. |
| `paused` recuperable | Se elimina/proyecta; se preservan solo dueños/respuestas vivos. `resume()` recorre repetidamente sockets humanos faltantes antes de reactivar. |
| `paused` recuperable, blocker pendiente | Se descarta `block_challenge`, se emite reanudación y la acción continúa sin bloqueo; si el actor es el único sobreviviente, su acción se resuelve antes del `gameover` normal. |
| `paused` con `pausedDecision === null` | Se elimina/proyecta y la pausa no reanudable queda intacta, conforme a #26 y al límite decidido por el Orquestador. |
| `gameover` | La ruta `onDisconnect()` ignora estados distintos de `running`/`paused`; ganador y revancha no se reabren. |
| Asiento ya muerto / espectador | Asiento muerto: no-op. Espectador: no pertenece a `players`, por lo que no activa eliminación. |
| Dos asientos | Se conserva `dissolve()` de #46. |

## Límites y siguiente fase

La inspección cubrió transiciones de estado, callbacks, eventos y guardas de decisión en `server/game/coup.js`, junto al formato existente de proyección `updatePlayers()`. No se observó el comportamiento Socket.IO en runtime ni la interfaz visual. La corrección del callback de pérdida pendiente y la búsqueda repetida en `resume()` requieren intento de falsificación independiente en F3. F3 no tiene veredicto todavía; no se abrió ni fusionó PR.

## Corrección F2 tras contraejemplo provisional de F3

El Verifier identificó que el blocker no forma parte de `block_challenge.allowed`; por eso una desconexión no podaba esa decisión y un reto podía crear `prove_claim` sin claimant, cuyo `resolve([])` provocaba una pausa falsa. Se corrigió con invalidación inmediata desde `eliminateDisconnectedPlayer()` cuando el asiento eliminado coincide con `currentAction.pendingBlock.blocker`. La decisión queda descartada, el historial del bloque queda `cancelled` y la acción pasa por `resolveAction()` sin bloqueo. La guarda en `openProofDecision()` impide además que cualquier claimant muerto cree una decisión vacía. Esta corrección solo tuvo inspección estática; el Verifier debe repetir F3 antes de cualquier integración.
