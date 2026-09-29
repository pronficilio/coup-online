# Reporte F0 — contrato de reacciones de Codex

**Issue:** [#62](https://github.com/pronficilio/coup-online/issues/62)  
**Fase/veredicto:** `F0 CLOSED` (revisión estática documental; addendum solicitado por el Orquestador completado)
**Unidad:** `WAITING_ORCHESTRATOR`; F1 no iniciada  
**Branch/worktree:** `issue/62-codex-event-reactions` / `.worktrees/issue-62-codex-event-reactions`  
**Base:** `origin/master@b39f649e42011da07a2d82a27367eddd4e40410c`  
**Alcance:** contrato solamente; sin cambios de código, llamadas al runner/modelo, despliegue ni pruebas automáticas.

## Resultado

El flujo actual permite añadir una oportunidad cosmética a la petición Codex sin cambiar el conjunto de opciones ni la autoridad que valida la decisión. `playTurn()` abre `action`; `openDecision()` construye el mapa server-side de opciones; `activateDecision()` crea la decisión y, después de notificar a los jugadores humanos, invoca `requestCodexDecision()` para cada asiento Codex pendiente. Esta última arma `codexObservation()` y entrega exactamente una llamada a `codexClient.choose()` con `decisionId`, `stateVersion`, esfuerzo y observación. La llamada devuelve hoy solo `choiceId` y sus identificadores/versionado.

La primera acción de la partida se decide antes de que exista una entrada en el registro. En las decisiones posteriores ya puede haber eventos. El contrato de F0 ofrece como máximo el evento público más reciente que ya estaba emitido al construir la solicitud. En las ventanas de respuesta, el evento recién creado antes de abrir la ventana es el de la acción/bloqueo/desafío actual; en pasos de resolución, se usa la última evidencia pública causal. Si no hay evento o catálogo, se omite `reactionOpportunity`.

## Orden y evidencia de código

| Ruta | Evidencia estática | Consecuencia para F0 |
| --- | --- | --- |
| Evento público | `CoupGame.addLog()` crea ID, datos públicos y catálogo, lo guarda en `publicLogEvents`/`logEventsByID` y emite `g-addLog` (`server/game/coup.js:244`). | El ID solo se ofrece después de existir en el servidor y en la difusión pública. |
| Apertura de decisión | `openDecision()` arma `allowed`; `activateDecision()` incrementa versión, instala la decisión, notifica humanos y solicita Codex (`server/game/coup.js:594`, `:613`, `:660`). | Las opciones legales pertenecen al servidor antes de llamar el modelo. |
| Observación/llamada | `codexObservation()` expone asiento, estado público, influencias propias, historial y opciones; `requestCodexDecision()` llama `choose()` (`server/game/coup.js:695`, `:716`). | La nueva información cabe como único campo opcional de la observación. |
| Protocolo/runner | `normalizeRequest()`, `outputSchema()` y `parseChoice()` usan claves exactas y hoy exigen `choiceId` único (`server/ai/codex-protocol.js:77`, `:146`, `:182`). `CodexRunnerClient.choose()` valida metadata, versión y opción (`server/ai/codex-client.js:21`). | Extender la observación con allowlist por `event.type`; declarar `reaction` requerida pero nullable en el schema estricto, manteniendo validación independiente de `choiceId` y claves raíz exactas. |
| Autoridad | El callback Codex verifica decisión/versionado/reglas y llama `submitChoice(player.seat, ...)`; `submitChoice()` comprueba fase, decisión activa, asiento elegible y `choiceId` disponible (`server/game/coup.js:535`, `:716`). `actorKey()` distingue `codex:<seat>` (`:398`). | La reacción usa `player.seat` desde el estado servidor; no recibe asiento ni socket desde Codex. |
| Reacciones humanas | `reactionsForEvent()` fija el catálogo por tipo/datos; `reactionCounts()` agrega selecciones; `reactToEvent()` resuelve el asiento desde socket, verifica evento/catálogo, alterna o reemplaza la selección y emite presencia/conteos (`server/game/coup.js:47`, `:263`, `:330`). | F1 debe compartir mutación y difusión, separando la autorización Codex de la ruta de socket. |

## Matriz decisión → evento disponible

La observación toma `publicLogEvents.at(-1)` en el instante de construir la solicitud, y solo si sigue en `logEventsByID` y tiene un catálogo permitido. La tabla identifica qué evento debe estar más reciente en el flujo normal; no se reserva ni se inventa un ID.

| `decisionType` | Evento ya emitido antes de `requestCodexDecision()` |
| --- | --- |
| `action` | El último evento público de la resolución/turno anterior, si existe. En la apertura de la primera acción no existe evento y se omite la oportunidad. |
| `challenge` | `action_declared`, emitido en `beginAction()` antes de `openChallengeWindow()` (`server/game/coup.js:909`, `:927`). |
| `block` | Último evento de la acción aún no resuelta: `action_declared` si no hubo desafío; el evento más reciente de la resolución de reclamación si hubo desafío (`:909`, `:944`, `:950`, `:979`). |
| `block_challenge` | `block_declared`, emitido antes de `challengeBlock()` (`:1009`, `:1019`). |
| `prove_claim` | `challenge_started` o `block_challenge_started`, emitido antes de `openProofDecision()` (`:944`, `:950`, `:1043`, `:1049`). |
| `lose_influence` | Último evento que conduce a la pérdida: normalmente `claim_proved`, `claim_not_proved` o `action_declared`; si la misma resolución produjo otra pérdida, su `influence_lost`/`player_eliminated` ya emitido. La pérdida que decide el Codex se registra después de su respuesta (`:1070`, `:1124`). |
| `exchange` | `action_declared` para el intercambio actual; `action_result` se añade después de elegir influencias (`:909`, `:1207`, `:1259`). |

Los eventos están tipados en `EVENT_TYPES` y tienen catálogo contextual no vacío en `reactionsForEvent()` (`server/game/coup.js:27`, `:47`). Los campos del contexto deben proyectarse con allowlist por `event.type`: asientos, acción, resultado, rol revelado y cantidades públicas. Se omiten `translation` y nombres/texto libre para mantener el input estructurado y evitar texto no confiable.

### Allowlist exacta de `event.data`

`event` tiene exactamente `{ "type", "data" }`. Por tipo, `data` debe contener los campos requeridos, puede contener solo los opcionales listados y rechaza toda clave adicional. `seatCount` es el total de jugadores públicos (2–6); cada asiento es entero `0..seatCount-1`.

| `event.type` | Requeridos | Opcionales | Validación de valores |
| --- | --- | --- | --- |
| `action_declared` | `actorSeat`, `action` | `targetSeat`, `claimRole` | Asientos dentro de rango; acción en `income`, `foreign_aid`, `coup`, `tax`, `assassinate`, `exchange`, `steal`; rol en `duke`, `assassin`, `captain`, `ambassador`, `contessa`. |
| `action_result` | `actorSeat`, `action`, `result` | `targetSeat`, `blockerSeat`, `amount` | Asientos y acción como arriba; `result` en `resolved`, `blocked`; `amount` entero `0..3`. |
| `challenge_started` | `actorSeat`, `targetSeat`, `action`, `claimRole` | — | Asientos, acción y rol según los enums anteriores. |
| `block_declared` | `actorSeat`, `targetSeat`, `action`, `claimRole` | — | Asientos, acción y rol según los enums anteriores. |
| `block_challenge_started` | `actorSeat`, `targetSeat`, `action`, `claimRole` | — | Asientos, acción y rol según los enums anteriores. |
| `claim_proved` | `actorSeat`, `role` | `action` | Asiento válido; rol del enum de roles; acción del enum de acciones. |
| `claim_not_proved` | `actorSeat` | `action`, `claimRole` | Asiento válido; opcionales de los enums de acción y rol. |
| `influence_lost` | `actorSeat`, `role` | — | Asiento válido; rol del enum de roles. |
| `player_eliminated` | `actorSeat` | — | Asiento válido. |

`eventId` debe cumplir el patrón de ID del protocolo. `allowedReactions` es una lista no vacía y sin duplicados, cuyos valores salen de `like`, `bravo`, `laugh`, `skeptical`, `surprise`, `thinking`, `dislike`, `secret`. `countsByReaction` tiene exactamente las claves de `allowedReactions` y valores enteros `0..seatCount-1`. `normalizeRequest()` debe validar estas claves exactas y despachar `data` por `event.type`; un validador genérico de objetos no satisface este contrato.

## Contrato estructurado propuesto

**Observación:** `reactionOpportunity` es opcional. Cuando existe, sus claves exactas son `eventId`, `event`, `allowedReactions` y `countsByReaction`. `event` contiene solo `{type, data}` tipados y allowlisted. `allowedReactions` copia el catálogo del evento. `countsByReaction` contiene exactamente una clave por emoji permitido, con enteros desde 0 hasta `playerCount - 1`, incluidos los ceros. El agregado recorre las selecciones de ese evento excluyendo `player.seat`; no se serializa quién reaccionó ni `ownReactions`.

```json
{
  "reactionOpportunity": {
    "eventId": "a1b2c3-event-7",
    "event": {
      "type": "action_declared",
      "data": { "actorSeat": 2, "action": "tax", "claimRole": "duke" }
    },
    "allowedReactions": ["like", "bravo", "laugh", "skeptical"],
    "countsByReaction": { "like": 2, "bravo": 0, "laugh": 1, "skeptical": 0 }
  }
}
```

**Respuesta:** `choiceId` es obligatorio y legal. En el resultado estricto de App Server, `reaction` también se incluye siempre y admite `null` o un objeto exacto `{eventId, emoji}`. `null` significa no elegir/no cambiar reacción. El parser puede tratar un campo ausente como el mismo no cambio por compatibilidad, pero ausencia no es salida válida del schema estricto.

El schema exacto de App Server (con el enum dinámico de todos los `choiceId` ofrecidos) es:

```json
{
  "type": "object",
  "properties": {
    "choiceId": { "type": "string", "enum": ["tax"] },
    "reaction": {
      "type": ["object", "null"],
      "properties": {
        "eventId": { "type": "string" },
        "emoji": { "type": "string" }
      },
      "required": ["eventId", "emoji"],
      "additionalProperties": false
    }
  },
  "required": ["choiceId", "reaction"],
  "additionalProperties": false
}
```

Los tipos `eventId` y `emoji` se dejan como strings en el schema: una cadena válida pero ajena al evento o catálogo ofrecido debe ser descartable sin invalidar la decisión de juego. El parser primero valida `choiceId` de forma independiente contra las opciones legales; después acepta `reaction` solo si es null/ausente o si su forma exacta tiene el `eventId` ofrecido y `emoji` dentro de `allowedReactions`. Un candidato ajeno, obsoleto o fuera del catálogo se descarta preservando el `choiceId`; JSON ilegible, raíz con claves extra y `choiceId` ausente/ilegal conservan el error actual.

```json
{
  "choiceId": "tax",
  "reaction": { "eventId": "a1b2c3-event-7", "emoji": "bravo" }
}
```

```json
{ "choiceId": "tax", "reaction": null }
```

## Aplicación y límites de autoridad

El servidor captura el ID y catálogo ofrecidos al construir la solicitud. Al recibir la respuesta:

1. Conserva las guardas actuales de decisión pendiente, `decisionId`, `stateVersion`, `RULESET_VERSION` y `choiceId`.
2. Envía la elección por `submitChoice(player.seat, envelope)`; el actor deriva del objeto de jugador server-side.
3. Solo tras aceptar la opción de juego, vuelve a comprobar que el candidato apunta al ID capturado, que el mismo evento sigue en `logEventsByID` y que el emoji sigue en `event.reactions`.
4. Aplica una reacción válida mediante la mutación compartida y emite los canales existentes `g-reactionPresence` y `g-reactionCounts`. La autorización Codex usa el asiento del jugador en el servidor y la ruta interna no crea socket ni recibe asiento del modelo.
5. La mutación Codex es declarativa: si ya está seleccionado el mismo emoji para ese evento, conserva la selección; un emoji distinto reemplaza la anterior; `reaction: null` o la ausencia del campo no cambia nada. No existe retiro por repetición en el flujo Codex. La ruta humana mantiene intacto el toggle/reemplazo de #40.
6. Descarta una reacción null/ausente, mal formada en la capa de parsing, obsoleta o ajena a la oportunidad sin pausar ni cambiar la elección. Una decisión de juego inválida conserva su manejo actual.

No se agrega otra llamada, turno ni temporizador. Si la parte de juego es inválida, no se aplica reacción. Si la parte de juego es válida, su aceptación no depende de la reacción.

## Evidencia y límites

- Se leyeron estáticamente `server/game/coup.js`, `server/ai/codex-protocol.js`, `server/ai/codex-client.js`, `server/ai/codex-worker.js` y el plan/handoff de #62.
- El Orquestador devolvió F0 para aclarar la selección repetida, la forma nullable estricta de `reaction` y la allowlist de `event.data`; este addendum registra `RETURNED / WAITING_EXECUTOR` y el cierre posterior `CLOSED / WAITING_ORCHESTRATOR` en la bitácora.
- Fuentes oficiales consultadas para el contrato de App Server: [Codex App Server](https://learn.chatgpt.com/docs/app-server) documenta `turn/start.outputSchema`; [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) especifica que todos los campos de un objeto estricto son requeridos, que un campo opcional semántico se representa admitiendo `null`, y que los objetos estrictos declaran `additionalProperties: false`.
- No se modificó código, esquema ejecutable ni decisión de juego; no se invocó el runner ni un modelo.
- No se agregaron ni ejecutaron pruebas automatizadas, conforme al handoff.
- El trabajo local de #60 en el checkout raíz no fue modificado; este commit contiene solo documentación de #62 en su branch/worktree.
- El commit de cierre F0 contiene este informe, la matriz/contrato integrado al plan y los eventos `RETURNED` y `CLOSED` de la bitácora.
