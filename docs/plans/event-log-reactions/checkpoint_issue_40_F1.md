# Checkpoint de implementación — issue #40 F1

**Estado:** F1 `CLOSED`; handoff en `WAITING_ORCHESTRATOR`.
**Commit base de control:** `250573e` (`chore(event-reactions): issue 40 activate F1`).
**Branch/worktree:** `issue/40-event-log-reactions` / `.worktrees/issue-40-event-log-reactions`.
**Alcance:** servidor únicamente; F2 no ha comenzado.

## Contrato público implementado hasta ahora

`g-addLog` difunde una entrada estructurada con esta forma:

```js
{
  id,                 // matchId + secuencia monotónica dentro de la partida
  type,               // tipo estable, no texto localizado
  turn,               // turno de la partida
  data,               // asientos, acción/resultado/cantidad y roles que ya son públicos
  translation: { key, params },
  reactions           // catálogo permitido para este tipo/resultado
}
```

Los tipos ya migrados son `action_declared`, `action_result`, `challenge_started`, `block_declared`, `block_challenge_started`, `claim_proved`, `claim_not_proved`, `influence_lost` y `player_eliminated`. Los campos de `data` usan identificadores estables y asientos; el cliente podrá obtener nombres/colores del tablero y aplicar el diccionario es/en. No se incluyen timestamps.

El cliente enviará `g-reactToEvent` con `{ eventId, reaction, requestId }`. El servidor deriva el asiento del socket, valida forma, existencia del evento y catálogo contextual; serializa la actualización en el event loop, deduplica `requestId`, reemplaza o quita la selección y emite conteos sin asientos. `g-reactionOwn` es privado al socket propietario. `g-reactionPresence` publica solamente `{ seat, reaction }`, nunca el `eventId`. `g-requestEventLogState` devuelve eventos y conteos públicos más las selecciones del solicitante humano; a espectadores les devuelve una lista propia vacía.

## Implementación ya presente

- Todos los emisores existentes usan el envelope tipado; las entradas tienen ID por partida y turno.
- Se añadieron los resultados reales para ingreso (+1), ayuda (+2 o bloqueada), impuesto (+3), robo (0–2 monedas) e intercambio sin identidades privadas.
- La autoridad de selección vive en mapas de memoria por partida; cada jugador humano conserva como máximo una selección por evento.
- Se añadieron catálogos contextuales de 3–4 reacciones; no se ofrece risa para pérdida/eliminación.
- Conteos agregados, confirmación privada, presencia transitoria, snapshot y limpieza al rematch están implementados.
- Issue #24 no se tocó: no hay cambios de cliente.

## Verificaciones F1 completadas

La cobertura está en `server/test/event-log-reactions.test.js`; además se adaptaron las dos aserciones de eventos en `server/test/coup.test.js` al envelope tipado.

- Payload inválido/extra, asiento espectador y asiento Codex: rechazo; evento inexistente y reacción fuera del catálogo: rechazo.
- Unicidad por asiento/evento, request duplicado idempotente, reutilización del ID con cuerpo distinto rechazada, reemplazo y toggle: conteos exactos.
- Dos asientos reaccionando al mismo evento: agregado correcto sin mapa público asiento→reacción; presencia omite `eventId`.
- Catálogo contextual para los nueve tipos de evento, incluida exclusión de risa en pérdida/eliminación.
- Ingreso +1, ayuda +2/bloqueada 0, impuesto +3 y robo real de 0/1/2 monedas.
- Snapshot separado por jugador/espectador, Exchange sin cartas privadas, y limpieza de eventos/reacciones/requests/presencia en rematch.
- Todos los emisores `addLog` producen el envelope tipado; no queda emisor de `g-addLog` con string.

## Validaciones ejecutadas

- Suite dedicada `node --test test/event-log-reactions.test.js`: PASS; los once escenarios F1 aparecen aprobados en la salida de la suite completa.
- `node --check game/coup.js`, `node --check test/coup.test.js`, `node --check test/event-log-reactions.test.js`: PASS.
- `git diff --check`: PASS.
- `npm test -- --test-concurrency=1`: 43/47 PASS. Los cuatro fallos restantes son las pruebas preexistentes de pausa/reanudación (`coup.test.js:313, 336, 367, 491`): tres buscan `g-gamePaused` en el outbox del namespace aunque el código base lo emite por socket; la cuarta espera autorización exclusiva del líder aunque el código base autoriza a asientos humanos sin respuesta. F1 no modifica esas rutas. Queda expresamente para revisión del Orquestador; no se alteraron reglas de pausa fuera del alcance.

El contrato, cobertura y detalle de esta limitación están en `docs/plans/event-log-reactions/report_issue_40_F1.md`. F1 se entrega cerrada para revisión; F2 no ha empezado.
