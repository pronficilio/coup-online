# Plan — reacciones opcionales de Codex en el registro de eventos

**Issue:** [#62 — Permitir que Codex reaccione opcionalmente en el registro de eventos](https://github.com/pronficilio/coup-online/issues/62)  
**Estado:** `WAITING_ORCHESTRATOR`; F0 `CLOSED`; F1–F2 `PENDING`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente  
**Branch / worktree / integración:** `issue/62-codex-event-reactions` / `.worktrees/issue-62-codex-event-reactions` / `master`  
**Handoff:** `docs/plans/active/issue_62_codex_event_reactions.md`  
**Bitácora:** `docs/plans/log/issue-62.jsonl`

## Solicitud y objetivo

Cuando Codex ocupe un asiento de jugador y reciba una decisión de juego, podrá enviar junto con su opción legal una reacción emoji opcional a un evento del registro. La observación que recibe incluirá el número agregado de reacciones que otros asientos dieron a ese evento, para que Codex pueda decidir si acompaña una de ellas. Omitir la reacción debe conservar intacta la decisión de juego.

Interpretación operativa de «acción o contracción»: decisiones del turno de acción y ventanas de respuesta a una acción (desafío, bloqueo, desafío al bloqueo y decisiones que resuelven esas ventanas). El servidor enlaza una oportunidad de reacción solo cuando ya existe un evento público pertinente; no inventa IDs ni crea eventos nuevos para habilitarla.

## Estado y límites existentes

- La issue #14 ya integró Codex. Su salida actual contiene únicamente `choiceId`, y `codexObservation()` expone el estado e historial públicos, la mano propia y las opciones legales.
- La issue #40 ya integró el registro tipado, su catálogo contextual de emojis, conteos agregados y presencia visual efímera. `reactToEvent()` deriva el asiento desde un socket humano, por lo que un asiento Codex (sin socket) no puede usar esa ruta directamente.
- Esta unidad conecta esas dos capacidades. No reabre ni cambia las decisiones de juego, reglas, acceso/runner Codex, la UI del registro ni la semántica de reacciones humanas.

## Contrato propuesto

1. La solicitud Codex mantiene las opciones actuales como fuente autoritativa. Para una decisión elegible, el servidor añade como máximo un evento público pertinente, su ID, su catálogo de reacciones permitido y conteos por emoji de asientos distintos al Codex que decide. Si no hay evento pertinente, omite el contexto de reacción.
2. Codex devuelve su `choiceId` legal actual y, opcionalmente, una reacción estructurada que referencia el evento ofrecido. No puede escoger un evento, emoji, asiento ni campo arbitrario fuera de ese contexto.
3. El servidor asocia la reacción al asiento Codex desde el estado de la partida, nunca mediante un socket o asiento suministrado por el modelo. La selección atraviesa las mismas reglas de una reacción humana: una selección por asiento/evento, reemplazo o retiro según el comportamiento existente, actualización agregada y presencia efímera pública.
4. La reacción es cosmética y opcional. Una reacción omitida, obsoleta o inválida se descarta sin invalidar una opción de juego válida. La validación normal de `decisionId`, `stateVersion` y `choiceId` permanece obligatoria; una salida de juego inválida conserva el manejo actual.
5. La reacción comparte la llamada/respuesta Codex ya usada para la decisión. No abre un turno, temporizador, decisión o llamada adicional y nunca demora ni altera costos, opciones o avance del juego.
6. La observación solo revela conteos públicos agregados de otros asientos. No añade mapa asiento→reacción, socket IDs, mano ajena, datos ocultos ni texto libre.

## Criterios de aceptación

1. En una decisión Codex existente, la opción legal de juego se procesa con el flujo vigente y la respuesta puede incluir una reacción opcional al evento ofrecido.
2. Codex recibe solo el ID/contexto público del evento pertinente, su catálogo permitido y conteos actuales por emoji de los demás asientos; el conteo no revela quién reaccionó y excluye la propia selección del asiento Codex.
3. La reacción omitida, inválida o dirigida a otro evento no impide aplicar una opción de juego válida. Una decisión de juego ausente, obsoleta o ilegal sigue las guardas actuales.
4. El servidor resuelve el actor como el asiento Codex de la solicitud pendiente y aplica la misma semántica de reacción por asiento/evento, sin falsificar una identidad de socket.
5. Una reacción aceptada publica los agregados y la presencia efímera mediante los canales ya consumidos por clientes y espectadores; la UI muestra el emoji/conteo existente sin cambios de presentación.
6. La información enviada al runner continúa cumpliendo el contrato estricto: sin datos privados ajenos, texto libre, identidad de quienes reaccionaron ni herramientas adicionales.
7. Decisiones humanas y sus controles/conteos mantienen el comportamiento integrado por #40.
8. El Verifier independiente no encuentra una secuencia que permita reacción a un evento no ofrecido/obsoleto, atribución a otro asiento, doble mutación de juego o filtración de identidad/contenido privado.

## F0 — Contrato de oportunidad, conteos y respuesta

**Pregunta:** ¿Puede cada decisión Codex elegible quedar enlazada a un evento público concreto, con conteos de terceros, y devolver una reacción estructurada sin ampliar autoridad ni datos privados?

- **Estado:** `CLOSED`; revisión estática completada y entregada al Orquestador.
- **Entrada:** `server/game/coup.js`, `server/ai/codex-protocol.js`, `server/ai/codex-client.js`, `server/ai/codex-worker.js`, `server/test/event-log-reactions.test.js` y contrato vigente de #14.
- **Tareas:** completadas según `report_issue_62_F0.md`.
- **Salida:** contrato y matriz siguientes; evidencia de lectura estática en `report_issue_62_F0.md`.
- **Avance:** se ofrece como máximo el evento público más reciente que ya existe cuando se construye la observación; el contexto conserva solo campos públicos tipados; los conteos excluyen el asiento Codex; la respuesta opcional no decide actor ni amplía el catálogo.
- **Pivote aplicado:** en la primera decisión de acción, si todavía no existe ningún evento público, se omite el contexto de reacción. No se genera un evento artificial.
- **Política de commit:** `COMMIT_REQUIRED`; el cierre documental incluye plan/reporte F0 y evento `phase_verdict`.

### Orden observado y matriz de elegibilidad

`playTurn()` abre `action`; `openDecision()` fija opciones del servidor; `activateDecision()` publica la decisión humana y después llama `requestCodexDecision()` para cada asiento Codex pendiente. `codexObservation()` se arma inmediatamente antes de `codexClient.choose()`. Por tanto, la elegibilidad consulta solo el registro público que ya existe en ese instante. `addLog()` guarda el evento, su catálogo y lo emite con `g-addLog` sincrónicamente antes de abrir las decisiones de respuesta.

| Decisión Codex | Evento vigente disponible al construir su observación |
| --- | --- |
| `action` | Evento público más reciente del turno anterior, si existe; en la apertura inicial no existe ninguno y se omite la oportunidad. |
| `challenge` | `action_declared` de la acción que se está respondiendo. |
| `block` | Evento más reciente de la acción todavía no resuelta: normalmente `action_declared`; si la reclamación pasó por desafío, el último evento de esa resolución pública. |
| `block_challenge` | `block_declared` recién emitido para el bloqueo actual. |
| `prove_claim` | `challenge_started` o `block_challenge_started`, según la reclamación que se debe demostrar. |
| `lose_influence` | Evento público más reciente que conduce a la pérdida, como `claim_proved`, `claim_not_proved`, `action_declared` o una pérdida anterior de la misma resolución. `influence_lost` y `player_eliminated` de esta elección aún no existen. |
| `exchange` | `action_declared` de la acción actual; `action_result` se crea después de elegir las cartas. |

Regla uniforme: el servidor captura `publicLogEvents.at(-1)` al preparar la solicitud. La oportunidad se omite si no hay evento o si el evento no sigue presente en `logEventsByID` / su `reactions` está vacío. La respuesta solo puede referirse al ID capturado, nunca a otro evento histórico.

### Contrato exacto de observación

Se añade el campo opcional `observation.reactionOpportunity`; el resto del contrato vigente queda intacto. Si existe, sus claves exactas son `eventId`, `event`, `allowedReactions` y `countsByReaction`. `event` contiene `type` del enum público de #40 y una proyección de `data` con lista permitida por tipo (asientos, acciones, resultado, rol público, cantidad); no incluye `translation`, nombres, texto libre ni datos privados. `allowedReactions` copia el catálogo ya asociado al evento. `countsByReaction` tiene exactamente esos emojis como claves, incluye ceros y cuenta selecciones de asientos distintos al que decide. Cada valor es entero entre 0 y `playerCount - 1`. No incluye mapa de asientos ni `ownReactions`.

```json
{
  "reactionOpportunity": {
    "eventId": "a1b2c3-event-7",
    "event": { "type": "action_declared", "data": { "actorSeat": 2, "action": "tax", "claimRole": "duke" } },
    "allowedReactions": ["like", "bravo", "laugh", "skeptical"],
    "countsByReaction": { "like": 2, "bravo": 0, "laugh": 1, "skeptical": 0 }
  }
}
```

El conteo se deriva de `reactionsByEvent[eventId]`, recorriendo selecciones cuyo asiento sea distinto de `player.seat`. Solo se envían agregados; los conteos reflejan la fotografía de la solicitud y pueden cambiar por reacciones concurrentes mientras Codex decide.

### Contrato exacto de salida y aplicación

`choiceId` continúa siendo obligatorio y debe pertenecer a `observation.options`. `reaction` es opcional y, cuando es válida, tiene exactamente `{ "eventId": string, "emoji": string }`. El esquema de salida declara solo `choiceId` y `reaction` en la raíz (`additionalProperties: false`); el valor opcional de `reaction` se parsea como candidato y se valida después contra la oportunidad capturada. Así un candidato cosmético mal formado o con ID/emoji no ofrecido se descarta sin invalidar la elección. Las claves extra del objeto raíz, un JSON ilegible, un `choiceId` ausente/ilegal o metadata obligatoria incorrecta conservan el error actual.

```json
{
  "choiceId": "tax",
  "reaction": { "eventId": "a1b2c3-event-7", "emoji": "bravo" }
}
```

La aplicación queda ordenada así: (1) validar solicitud pendiente, `decisionId`, `stateVersion`, `RULESET_VERSION` y `choiceId` como hoy; (2) enviar la elección al `submitChoice(player.seat, ...)`, usando el asiento del objeto de jugador del servidor; (3) solo si esa elección fue aceptada, validar de nuevo que el candidato coincide con el ID/catálogo capturados y el evento sigue vigente; (4) aplicar la reacción por una función compartida con la ruta humana, usando la semántica de reemplazo/retiro de un asiento por evento y publicando `g-reactionPresence` / `g-reactionCounts`. La ruta interna Codex no finge socket ni lee asiento desde la salida. Un candidato omitido, inválido, ajeno a la oportunidad u obsoleto no pausa ni retrasa la partida. Una decisión de juego inválida conserva el manejo actual.

Si Codex devuelve la misma reacción que ya tenía para ese evento, la semántica humana actual la retira. Como la observación no revela `ownReactions`, Codex no recibe estado propio para distinguir ese caso; el Orquestador debe aprobar expresamente conservar esa semántica antes de F1.

## F1 — Integrar reacción opcional a la decisión Codex

**Pregunta:** ¿Puede Codex acompañar un evento del registro desde la misma respuesta de su turno sin cambiar la acción legal ni la ruta humana?

- **Estado:** `PENDING` hasta la revisión/aprobación del contrato F0 por el Orquestador.
- **Entrada:** contrato F0 aprobado; #40 permanece como implementación base de eventos, catálogos, agregados y presencia.
- **Tareas:** extender observación/esquema del runner con el contexto agregado acotado; extender salida para aceptar solo una reacción opcional del evento ofrecido; aplicar la selección desde el asiento Codex en el servidor a través de lógica compartida y segura; mantener la respuesta normal `choiceId` y las guardas de versión; descartar la parte cosmética inválida sin perder una elección de juego válida; documentar cambios y evidencia estática.
- **Salida:** integración server/runner y reporte F1 dentro del branch único del issue.
- **Avance:** criterios 1–7 se cumplen en la revisión del código y no cambian protocolo humano, reglas ni UI.
- **Pivote:** si la unión al flujo normal acopla la reacción al resultado de la acción o exige una segunda llamada Codex, reducirla a la oportunidad ya presente en la decisión y reportar las limitaciones; no crear turnos/calls paralelos.
- **Política de commit:** `COMMIT_REQUIRED`; `feat(codex-reactions): issue 62 F1 CLOSED advance_f2`.

## F2 — Revisión final independiente

**Pregunta:** ¿Se puede refutar la validación independiente, el límite de privacidad o la independencia de la decisión de juego?

- **Estado:** `PENDING`.
- **Entrada:** F1 y código candidato en su commit de cierre.
- **Tareas:** revisión read-only del Verifier sobre AC1–AC8; intentar reacción con ID/evento/emoji no ofrecido, reacción inválida con elección legal, respuesta obsoleta, asiento Codex distinto, dos Codex en ventana común, y conteos con reacciones propias y ajenas; seguir la serialización completa hasta el runner y la difusión pública.
- **Salida:** informe independiente con veredicto `PASS`, `FAIL` o `BLOCKED`; sin modificaciones por el Verifier.
- **Avance:** `PASS` de todos los criterios; cualquier fallo devuelve F1 al Ejecutor con el mismo branch y worktree.
- **Política:** `COMMIT_AFTER_REVIEW` para incorporar el informe/veredicto al cierre de F2 cuando corresponda.

## Validación y límites de la sesión

Esta delegación no autoriza despliegue, publicación de release, activación de Codex ni una llamada real al modelo. No se agregan ni ejecutan pruebas automatizadas en esta preparación; la fase de ejecución entrega evidencia de revisión estática y el Verifier independiente intenta refutar el contrato. Cualquier necesidad de llamada Codex real o validación live se eleva al Orquestador antes de iniciar.

## Pregunta de falsificación

¿Puede una respuesta Codex con elección de juego válida, pero sin reacción o con reacción inválida/obsoleta, pausar o mutar incorrectamente el juego; revelar quién reaccionó; o aplicar el emoji a otro asiento/evento?

## Historial

- 2026-09-29: unidad creada como seguimiento distinto de #14 y #40; interpretación de «contracción» fijada como respuesta/desafío a una acción. Sin cambios de producto.
- 2026-09-29: #62 reclamada por `pronficilio`; branch `issue/62-codex-event-reactions` y worktree `.worktrees/issue-62-codex-event-reactions` confirmados desde `origin/master@b39f649`. Handoff movido a `active/`; F0 en curso, F1 sigue pendiente de revisión y aprobación del Orquestador.
- 2026-09-29: F0 `CLOSED`; matriz, conteos, salida opcional, orden de validación/aplicación y límite de autoridad server-side documentados en este plan y `report_issue_62_F0.md`. Unidad `WAITING_ORCHESTRATOR`; no se inició F1.
