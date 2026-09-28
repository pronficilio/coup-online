# Checkpoint de implementación — issue #40 F1

**Estado:** F1 `ACTIVE`; el trabajo continúa en la misma fase.
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

## Pendiente para cerrar F1

- Añadir y ejecutar cobertura de servidor para payload inválido, asiento/espectador, evento/reacción no permitidos, duplicados, reemplazo/remoción y dos asientos concurrentes.
- Verificar cantidades de robo 0/1/2, ayuda bloqueada/resuelta, snapshot/reset y que Exchange no exponga cartas.
- Revisar todos los emisores/diffs, completar reporte final de F1, anexar `phase_verdict` y crear el commit de cierre prescrito.

## Validaciones ejecutadas hasta este checkpoint

- `node --check server/game/coup.js`: PASS.
- `git diff --check`: PASS.
- Las pruebas automatizadas todavía no se ejecutaron; la cobertura de F1 está pendiente.
