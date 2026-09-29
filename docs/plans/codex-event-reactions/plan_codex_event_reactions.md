# Plan — reacciones opcionales de Codex en el registro de eventos

**Issue:** [#62 — Permitir que Codex reaccione opcionalmente en el registro de eventos](https://github.com/pronficilio/coup-online/issues/62)  
**Estado:** `ACTIVE`; F0 `ACTIVE`; F1–F2 `PENDING`  
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

- **Estado:** `READY`.
- **Entrada:** `server/game/coup.js`, `server/ai/codex-protocol.js`, `server/ai/codex-client.js`, `server/ai/codex-worker.js`, `server/test/event-log-reactions.test.js` y contrato vigente de #14.
- **Tareas:** reconstruir el orden entre `addLog()`, apertura de cada tipo de decisión y llamada Codex; fijar el evento ofrecido o la ausencia de oportunidad en cada ventana; definir forma exacta de observación/salida y validación estricta; determinar cómo contar excluyendo al asiento Codex y cómo compartir la mutación de reacción sin socket; documentar orden de aplicación ante salida válida, omitida, inválida y obsoleta.
- **Salida:** sección de contrato y matriz decisión→evento/eligibilidad en este plan, con ejemplos estructurados que respeten el límite de observación existente.
- **Avance:** cada oportunidad referencia únicamente un evento ya emitido y actual; los agregados excluyen de forma demostrable al asiento Codex; ninguna salida del modelo decide actor ni amplía catálogo.
- **Pivote:** si una decisión abre antes de que exista un evento pertinente, no inventar un ID: mantenerla sin oportunidad de reacción y ofrecer contexto únicamente en decisiones posteriores que sí tengan un evento.
- **Política de commit:** `COMMIT_REQUIRED`; el cierre documental incluye plan/reporte F0 y evento `phase_verdict`.

## F1 — Integrar reacción opcional a la decisión Codex

**Pregunta:** ¿Puede Codex acompañar un evento del registro desde la misma respuesta de su turno sin cambiar la acción legal ni la ruta humana?

- **Estado:** `PENDING` hasta el cierre F0 y autorización de avance del Orquestador.
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
