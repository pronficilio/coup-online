# Plan — reacciones opcionales de Codex en el registro de eventos

**Issue:** [#62 — Permitir que Codex reaccione opcionalmente en el registro de eventos](https://github.com/pronficilio/coup-online/issues/62)  
**Estado:** `WAITING_ORCHESTRATOR`; F0 `CLOSED` (aprobado); F1 `CLOSED`; F2 `PENDING`
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
3. El servidor asocia la reacción al asiento Codex desde el estado de la partida, nunca mediante un socket o asiento suministrado por el modelo. Codex usa una selección declarativa: repetir el mismo emoji para el mismo evento conserva la selección; elegir otro emoji la reemplaza; `reaction: null` o la ausencia del campo no cambia nada. Repetir no retira la selección. La interacción humana conserva intacto el toggle/reemplazo de #40.
4. La reacción es cosmética y opcional. Una reacción omitida, obsoleta o fuera del evento/catálogo ofrecido se descarta sin invalidar una opción de juego válida. El parser valida `choiceId` legal independientemente y conserva el manejo actual para una salida de juego inválida.
5. La reacción comparte la llamada/respuesta Codex ya usada para la decisión. No abre un turno, temporizador, decisión o llamada adicional y nunca demora ni altera costos, opciones o avance del juego.
6. La observación solo revela conteos públicos agregados de otros asientos. No añade mapa asiento→reacción, socket IDs, mano ajena, datos ocultos ni texto libre.

## Criterios de aceptación

1. En una decisión Codex existente, la opción legal de juego se procesa con el flujo vigente y la respuesta puede incluir una reacción opcional al evento ofrecido.
2. Codex recibe solo el ID/contexto público del evento pertinente, su catálogo permitido y conteos actuales por emoji de los demás asientos; el conteo no revela quién reaccionó y excluye la propia selección del asiento Codex.
3. La reacción omitida, inválida o dirigida a otro evento no impide aplicar una opción de juego válida. Una decisión de juego ausente, obsoleta o ilegal sigue las guardas actuales.
4. El servidor resuelve el actor como el asiento Codex de la solicitud pendiente y aplica selección declarativa por asiento/evento, sin falsificar una identidad de socket: igual emoji conserva; otro reemplaza; null/ausencia no cambia.
5. Una reacción aceptada publica los agregados y la presencia efímera mediante los canales ya consumidos por clientes y espectadores; la UI muestra el emoji/conteo existente sin cambios de presentación.
6. La información enviada al runner continúa cumpliendo el contrato estricto: sin datos privados ajenos, texto libre, identidad de quienes reaccionaron ni herramientas adicionales.
7. Decisiones humanas y sus controles/conteos mantienen el toggle/reemplazo integrado por #40; el setter declarativo Codex no cambia la ruta humana.
8. El Verifier independiente no encuentra una secuencia que permita reacción a un evento no ofrecido/obsoleto, atribución a otro asiento, doble mutación de juego o filtración de identidad/contenido privado.

## F0 — Contrato de oportunidad, conteos y respuesta

**Pregunta:** ¿Puede cada decisión Codex elegible quedar enlazada a un evento público concreto, con conteos de terceros, y devolver una reacción estructurada sin ampliar autoridad ni datos privados?

- **Estado:** `CLOSED`; el Orquestador devolvió F0 para un addendum documental, que se completó antes de cerrar esta fase nuevamente.
- **Entrada:** `server/game/coup.js`, `server/ai/codex-protocol.js`, `server/ai/codex-client.js`, `server/ai/codex-worker.js`, `server/test/event-log-reactions.test.js` y contrato vigente de #14.
- **Tareas:** completadas según `report_issue_62_F0.md`.
- **Salida:** contrato y matriz siguientes; evidencia de lectura estática, schema estricto de salida y allowlist completa por evento en `report_issue_62_F0.md`.
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

La allowlist de `event.data` es cerrada. Cada objeto requiere exactamente los campos indicados como obligatorios; solo admite los opcionales señalados, y rechaza claves extra:

| `event.type` | Campos requeridos | Campos opcionales | Tipos y límites |
| --- | --- | --- | --- |
| `action_declared` | `actorSeat`, `action` | `targetSeat`, `claimRole` | Asientos enteros `0..seatCount-1`; `action` de `income`, `foreign_aid`, `coup`, `tax`, `assassinate`, `exchange`, `steal`; `claimRole` de `duke`, `assassin`, `captain`, `ambassador`, `contessa`. |
| `action_result` | `actorSeat`, `action`, `result` | `targetSeat`, `blockerSeat`, `amount` | Mismos tipos de asiento/acción; `result` es `resolved` o `blocked`; `amount` entero `0..3`. |
| `challenge_started` | `actorSeat`, `targetSeat`, `action`, `claimRole` | — | Asientos enteros válidos; enum de acción y rol como arriba. |
| `block_declared` | `actorSeat`, `targetSeat`, `action`, `claimRole` | — | Asientos enteros válidos; enum de acción y rol como arriba. |
| `block_challenge_started` | `actorSeat`, `targetSeat`, `action`, `claimRole` | — | Asientos enteros válidos; enum de acción y rol como arriba. |
| `claim_proved` | `actorSeat`, `role` | `action` | Asiento válido; `role` del enum de rol y `action` del enum de acción. |
| `claim_not_proved` | `actorSeat` | `action`, `claimRole` | Asiento válido; opcionales del enum de acción y rol. |
| `influence_lost` | `actorSeat`, `role` | — | Asiento válido; `role` del enum de rol. |
| `player_eliminated` | `actorSeat` | — | Asiento entero válido. |

El objeto `event` admite exactamente `{ "type", "data" }`; `eventId` cumple el formato de ID del protocolo. `allowedReactions` es una lista no vacía, sin duplicados, de los emojis conocidos (`like`, `bravo`, `laugh`, `skeptical`, `surprise`, `thinking`, `dislike`, `secret`). `countsByReaction` tiene exactamente las mismas claves que `allowedReactions`; cada valor es entero `0..seatCount-1`. `normalizeRequest()` debe despachar la validación de `data` por `event.type` y aplicar estas formas exactas, no aceptar un objeto genérico.

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

`choiceId` es obligatorio, string y debe pertenecer a `observation.options`. La salida App Server usa este schema exacto en modo estricto (el enum `choiceId` se construye con las opciones legales de la solicitud):

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

El campo `reaction` debe estar presente bajo salida estricta: `null` significa que Codex no elige ni cambia reacción. El parser también trata la ausencia como no cambio para compatibilidad con entradas previas; la ausencia no es una respuesta válida del schema estricto. El objeto no nulo tiene exactamente `{ "eventId": string, "emoji": string }`. Los strings no llevan enum en el schema para que un candidato semánticamente ajeno no invalide la elección: el parser valida `choiceId` de forma independiente y luego conserva el candidato solo si coincide con el ID ofrecido y un emoji de `allowedReactions`; si no coincide, lo descarta y devuelve la elección legal. El servidor vuelve a validar la captura y el catálogo vigente antes de mutar. JSON ilegible, `choiceId` ausente/ilegal, claves extra de raíz o metadata obligatoria incorrecta conservan el error actual.

Ejemplos de salida:

```json
{
  "choiceId": "tax",
  "reaction": { "eventId": "a1b2c3-event-7", "emoji": "bravo" }
}
```

```json
{ "choiceId": "tax", "reaction": null }
```

La aplicación queda ordenada así: (1) validar solicitud pendiente, `decisionId`, `stateVersion`, `RULESET_VERSION` y `choiceId` como hoy; (2) enviar la elección al `submitChoice(player.seat, ...)`, usando el asiento del objeto de jugador del servidor; (3) solo si esa elección fue aceptada, validar de nuevo que el candidato coincide con el ID/catálogo capturados y el evento sigue vigente; (4) aplicar la reacción mediante la mutación compartida y publicar `g-reactionPresence` / `g-reactionCounts`. La ruta Codex selecciona declarativamente: igual emoji/evento deja el valor actual; otro emoji sustituye; `null` o ausencia deja el estado intacto. La ruta humana sigue usando el toggle de #40. La ruta interna Codex no finge socket ni lee asiento desde la salida. Un candidato omitido, inválido, ajeno a la oportunidad u obsoleto no pausa ni retrasa la partida. Una decisión de juego inválida conserva el manejo actual.

Codex no recibe `ownReactions`; la semántica declarativa elimina la ambigüedad: repetir su emoji actual es idempotente, no lo retira. Esta regla solo aplica a selección desde la respuesta del asiento Codex; los controles humanos y su toggle #40 quedan intactos.

## F1 — Integrar reacción opcional a la decisión Codex

**Pregunta:** ¿Puede Codex acompañar un evento del registro desde la misma respuesta de su turno sin cambiar la acción legal ni la ruta humana?

- **Estado:** `CLOSED`; implementación y revisión estática terminadas el 2026-09-29; lista para revisión del Orquestador. F2 sigue `PENDING`. La branch se sincronizó con `origin/master@6b1d54f`, que incluye el merge y cierre de #60.
- **Entrada:** contrato F0 aprobado; #40 permanece como implementación base de eventos, catálogos, agregados y presencia.
- **Tareas:** extender observación/esquema del runner con el contexto agregado acotado; extender salida según el schema estricto F0 con `reaction` nullable; validar `choiceId` independientemente y descartar el candidato cosmético fuera de evento/catálogo sin perder la elección; aplicar selección Codex declarativa desde el asiento server-side con la mutación compartida; preservar intacto el toggle humano #40; mantener guardas de versión y documentar cambios/evidencia estática.
- **Salida:** integración server/runner y `report_issue_62_F1.md` dentro del branch único del issue.
- **Avance:** revisión estática de criterios 1–7; la reacción no altera `choiceId`, el toggle humano, las reglas ni la UI. La respuesta estricta de App Server conserva `reaction` requerido nullable; si es nula/ausente, el cliente y el runner omiten la propiedad en su objeto de éxito para conservar la forma previa.
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
- 2026-09-29: el Orquestador devolvió F0 para un addendum. Se cerró de nuevo con selección Codex idempotente/declarativa, salida App Server estricta con `reaction` nullable y forma exacta, parser que preserva `choiceId` legal al descartar un candidato ajeno, y allowlist completa por tipo en `event.data`. El toggle humano #40 permanece intacto. F0 `CLOSED`; unidad `WAITING_ORCHESTRATOR`; F1 no iniciada. El checkout raíz conserva sin cambios el trabajo local de #60.
- 2026-09-29: el Orquestador aprobó F0 y autorizó F1. Se sincronizó exclusivamente esta branch con `origin/master@6b1d54f` mediante merges `d66d8c9` y `ffa5d28`; se conservaron los commits/contenido de #62 y master, incluida la entrada #60 cerrada por #64. F1 `ACTIVE`; F2 `PENDING`.
- 2026-09-29: F1 implementada y revisada estáticamente en el worktree canónico. `countsByReaction` cuenta solo a otros asientos; la salida estricta mantiene `reaction` nullable y el parser valida `choiceId` de forma independiente; el runner/cliente omiten `reaction` nula en sus objetos de éxito; el servidor aplica solo tras aceptar la elección y conserva intacta la ruta humana #40. `git diff --check` pasó. No se agregaron ni ejecutaron pruebas ni se llamó al modelo. F1 `CLOSED`; unidad `WAITING_ORCHESTRATOR`; F2 `PENDING`.
