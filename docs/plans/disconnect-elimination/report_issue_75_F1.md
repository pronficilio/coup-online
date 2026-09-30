# Issue #75 — reporte F1: recuperación de decisiones al desconectarse

## Veredicto

**`CLOSED (PASS)` por inspección estática.** Cada ruta de desconexión solicitada tiene una salida definida para `running`, `paused` y `gameover`, incluidos los roles de actor, respondedor y objetivo. No se añadieron ni ejecutaron pruebas automatizadas y no hay evidencia dinámica.

## Fuentes inspeccionadas

- `server/game/coup.js`: `onDisconnect`, `dissolve`, `pause`, `resume`, `openDecision`, `activateDecision`, `submitChoice`, `closeDecision`, `requestCodexDecision`, `openProofDecision`, `loseInfluence`, `openExchange`, `checkEliminated` y `advanceTurn`.
- `coup-client/src/components/game/Coup.js`: manejadores de `g-updatePlayers`, `g-decision`, `g-decisionClosed`, `g-gamePaused`, `g-gameResumed`, `g-gameOver` y `g-gameDissolved`.
- `docs/plans/paused-disconnect/plan_paused_disconnect.md`: contrato previo de #46 y preservación de pausas/reanudación de #26.
- Issue #75 y comentario de alcance sobre `pausedDecision === null`.

## Matriz F1

`Actor` significa el dueño del turno o `currentAction.actor`; `respondedor` es un asiento en `allowed` para una ventana activa o pausada; `objetivo` es `currentAction.target`. Los roles pueden coincidir: el actor tiene precedencia para cancelar su propia acción y un objetivo en `lose_influence` usa la ruta de efecto de objetivo.

| Fase | Estado del asiento | Actor | Respondedor | Objetivo |
|---|---|---|---|---|
| `running` | vivo | Antes de declarar acción, cancelar turno y avanzar. En ventana multi-asiento, cancelar acción pendiente y avanzar. En `prove_claim`, tratar la desconexión como concesión: registrar `claim_not_proved`/`failed`, ejecutar `onConceded` sin reembolso a muerto; el `loseInfluence` posterior detecta `isDead`, no abre decisión, mantiene `money=0` y llama `onLost`. En `lose_influence`, la muerte satisface la pérdida y ejecuta `onLost`. En `exchange`, cancelar el intercambio y devolver al mazo las cartas robadas para el pool. | En ventana multi-asiento, quitar de `allowed` y `responses`; el resolver procesa respuestas de vivos. En `lose_influence`, muerte equivale a la pérdida y llama `onLost`, nunca al resolver con `[]`. `prove_claim` y `exchange` tienen actor único, no una ventana de respuesta compartida. | En `lose_influence`, la muerte satisface la pérdida y se ejecuta `onLost`. En otra ventana, quitar su respuesta; al resolver, el efecto dirigido al objetivo muerto se omite. |
| `running` | eliminado | Sin cambio. | Sin cambio. | Sin cambio. |
| `paused` con `pausedDecision` | vivo | Aplicar el efecto de la fase: cancelar y avanzar si aún no declaró acción o si abandona una ventana multi-asiento; ejecutar `onConceded` si era claimant de `prove_claim`; ejecutar `onLost` si estaba perdiendo influencia; en `exchange`, cancelar y devolver al mazo las cartas robadas para el pool. | Quitar de `allowed`, `responses` y `resumeOwnerSeats`. Si quedan propietarios, conservan resume. Si no queda ninguno, resolver una ventana solo si las respuestas vivas ya la completan; si quedan respuestas pendientes, cancelar la acción y avanzar. `lose_influence` siempre usa `onLost`, nunca el resolver con `[]`. | Si pierde influencia, la muerte satisface ese efecto y continúa por `onLost`. En otra ventana, podar respuesta y conservar los propietarios de resume restantes. |
| `paused` con `pausedDecision` | eliminado | Sin cambio. | Sin cambio; la pausa reanudable y sus propietarios siguen intactos. | Sin cambio. |
| `paused` con `pausedDecision === null` | vivo | Eliminar y actualizar la proyección, pero conservar la pausa no reanudable preexistente. | Igual: no reiniciar ni reasignar una decisión ni cambiar la autorización de #26. | Igual; el estado de pausa existente permanece. |
| `paused` con `pausedDecision === null` | eliminado | Sin cambio. | Sin cambio. | Sin cambio. |
| `gameover` | vivo | Sin cambio; preservar ganador y revancha normal. | Sin cambio. | Sin cambio. |
| `gameover` | eliminado | Sin cambio. | Sin cambio. | Sin cambio. |

Un espectador no ocupa asiento de `players` y su desconexión no cambia el juego. En partidas de dos asientos, una desconexión de asiento vivo conserva `dissolve()` de #46; la desconexión de un asiento ya eliminado sigue siendo no-op. El conteo de #75 es `players.length`, incluidos los asientos eliminados.

## Invariantes para F2

1. Marcar la eliminación antes de cualquier continuación: vaciar las influencias vivas sin devolverlas al mazo, dejar `money` en cero, usar `isDead` y emitir el evento existente `player_eliminated` una sola vez. `updatePlayers()` proyecta `isDead`/`influenceCount` a conectados sin recarga.
2. Tras eliminar, evaluar victoria con el flujo normal de `gameover`/`g-gameOver`; no emitir `g-gameDissolved` para tres o más asientos.
3. Invalidar y cerrar la decisión afectada antes de continuar. Una respuesta humana requiere el `decisionId`/`stateVersion` vigente; callbacks Codex deben quedar abortados o fallar las guardas de fase/decisión. Limpiar timers al cancelar o cerrar.
4. Si el actor abandona una acción declarada en una ventana multi-asiento, registrarla cancelada y avanzar; no ejecutar callbacks de resolución de esa acción. Excepciones ya determinadas: `prove_claim` equivale a conceder, registra reclamo fallido y usa `onConceded` sin reembolsar al muerto; el `loseInfluence` resultante toma la rama de jugador muerto, no abre una decisión y llama `onLost`, manteniendo `money=0`. `lose_influence` de retador/objetivo también equivale a perder la última influencia y usa `onLost`; desconectar durante `exchange` cancela y devuelve al mazo, mezclándolas, solo las cartas robadas para el pool. Nunca pasar `[]` al resolver de pérdida, que pausaría por respuesta ausente.
5. En ventanas con varios respondedores, eliminar del mapa tanto el permiso como una respuesta ya enviada por el asiento desconectado; así no puede ganar un challenge/block tardío. Mantener respuestas de los asientos vivos.
6. En una pausa recuperable, preservar `resumeOwnerSeats` menos el muerto. No transferir propiedad; si no hay propietario restante, resolver solo una ventana cuyas respuestas vivas ya estén completas; si la decisión aún requiere respuesta, cancelar la acción y avanzar. En `lose_influence`, usar el callback de pérdida. Una pausa no reanudable ya existente con `pausedDecision === null` permanece así, conforme a la decisión de alcance del Orquestador y #26.
7. Todas las rutas de eliminación son idempotentes: una segunda desconexión de un asiento muerto no vuelve a emitir eliminación ni cambia el turno.

## Aclaración de callback incorporada en F2

La revisión del flujo concreto añadió un caso a la matriz: `currentAction.actor` puede desconectarse cuando `activeDecision.type === 'lose_influence'` pertenece a otro asiento vivo, por ejemplo cuando un retador probado pierde influencia tras una concesión del bloqueador. Esa pérdida ya está determinada y debe permanecer pendiente hasta resolverse. Su callback no puede reanudar la acción del actor muerto: al cerrar la pérdida, la acción se cancela y el turno avanza. La ruta se refleja en F2 y queda para falsificación independiente en F3.

## Límites de evidencia

La inspección estática confirma emisores, consumidores y guardas existentes para decisiones, pausa, Codex y eventos de estado. No se validaron intercalaciones en runtime, proyección visual, temporizadores reales ni entrega Socket.IO; el Verifier FINAL de F3 debe intentar refutar los criterios 1–7. No se ejecutaron pruebas automatizadas, build ni recorrido dinámico.
