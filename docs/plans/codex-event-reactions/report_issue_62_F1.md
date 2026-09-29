# Reporte F1 — reacciones opcionales de Codex (#62)

- **Estado:** `CLOSED`; listo para revisión del Orquestador. F2 `PENDING` e independiente.
- **Branch / worktree:** `issue/62-codex-event-reactions` / `.worktrees/issue-62-codex-event-reactions`
- **Base para re-revisión:** `origin/master@9ef5856` (incluye #64/#65 y los cambios de #63); merge `e84abc3` aplicado solo a la branch #62.

**Alcance:** integración de la reacción opcional a la misma decisión Codex existente, sin pruebas automatizadas, llamada real al modelo, publicación upstream ni despliegue.

## Addendum por hallazgo P3 de F2

La revisión estática preliminar informó `PASS` para AC1–AC8 y señaló un borde P3 antes de cerrar F2: `exactKeys()` comprobaba la presencia de claves requeridas, pero una propiedad requerida con valor `undefined` pasaba esa verificación y desaparecía al serializar JSON. También podía desaparecer una propiedad opcional explícita con ese valor. F1 se devolvió para corregirlo. `validatePublicEventData()` ahora exige que cada campo requerido tenga valor distinto de `undefined` y rechaza todo campo opcional presente cuyo valor sea `undefined`, sin quitar la comprobación `exactKeys()`. El Verifier volvió a revisar el código corregido y emitió F2 `PASS` estático para AC1–AC8; el informe está en `report_issue_62_F2_verifier.md`.

## Resultado

Codex recibe como máximo una oportunidad basada en el evento público más reciente que ya existe cuando se crea su solicitud. La proyección incluye el `eventId`, el `event.type` y los campos `event.data` permitidos por la allowlist F0, el catálogo de emojis disponible y `countsByReaction`. Cada conteo suma las selecciones de otros asientos para ese evento y excluye el asiento Codex; no se serializa un mapa de identidades, `ownReactions`, texto de traducción ni contenido privado.

El prompt informa que los conteos reflejan reacciones agregadas de otros asientos para el evento ofrecido y que Codex puede acompañar un emoji con conteo si lo desea. La elección legal siempre tiene prioridad.

La salida de App Server sigue el contrato estricto F0: `choiceId` pertenece al enum legal de la solicitud y `reaction` es obligatorio, nullable, y si no es nulo tiene exactamente `{eventId, emoji}`. El parser comprueba `choiceId` antes de normalizar la reacción. Un candidato nulo, ausente, fuera del evento o fuera del catálogo se descarta como no cambio sin descartar una elección legal; una elección ilegal conserva el error de decisión existente. Por compatibilidad con resultados previos, el objeto de éxito de `runCodexDecision()`, la línea JSONL del runner y `CodexRunnerClient.choose()` omiten la clave `reaction` cuando no hay selección. Esto no cambia el schema estricto enviado a App Server.

En la partida, `codexObservation()` captura la oportunidad antes de llamar al cliente. Al volver la respuesta, el servidor valida la decisión pendiente, su `decisionId`, `stateVersion` y `RULESET_VERSION`, y envía primero el `choiceId` a `submitChoice()` desde el asiento del jugador. Solo después de una elección aceptada considera la reacción: comprueba el evento capturado y el emoji contra el catálogo vigente y escribe la selección bajo `player.seat`. Repetir el mismo emoji/evento es idempotente; un emoji distinto reemplaza; ausencia/null no hace nada. Una reacción inválida u obsoleta no pausa ni altera la decisión legal. Las actualizaciones salen por `g-reactionPresence` y `g-reactionCounts`, que ya consumen clientes y espectadores.

La ruta humana `reactToEvent()` y su semántica toggle de #40 permanecen intactas. No se añadió una segunda llamada, temporizador, opción de juego, decisión ni evento artificial.

## Archivos afectados

- `server/ai/codex-protocol.js`: allowlist tipada de `event.data`; validación y proyección de `reactionOpportunity`; schema estricto nullable; instrucciones sobre conteos; normalización independiente de la reacción después de validar `choiceId`.
- `server/ai/codex-worker.js`: conserva ambos valores de la selección internamente y omite `reaction` nula/ausente en los resultados internos y JSONL.
- `server/ai/codex-client.js`: acepta la propiedad opcional de compatibilidad y omite `reaction` si no resulta un candidato válido.
- `server/game/coup.js`: expone oportunidad y conteos agregados; aplica la selección Codex declarativa desde el asiento del jugador después de aceptar la elección, con validación del evento/catálogo y emisión de eventos existentes.
- `docs/plans/README_plans.md`, `docs/plans/active/issue_62_codex_event_reactions.md`, `docs/plans/codex-event-reactions/plan_codex_event_reactions.md` y `docs/plans/log/issue-62.jsonl`: reflejan F0 aprobado, F1 cerrado y F2 pendiente.

## Evidencia de revisión

| Criterio | Evidencia estática |
| --- | --- |
| Evento elegible y privacidad | `codexObservation()` usa solo `publicLogEvents.at(-1)`, omite eventos sin catálogo y copia los campos devueltos por `projectPublicEvent()`. `validateReactionOpportunity()` despacha `event.data` por tipo y rechaza claves extra. |
| Conteos excluyen al asiento Codex | El bucle sobre `reactionsByEvent` incrementa el agregado solo cuando `seat !== player.seat`; se crea una entrada para cada reacción permitida, incluso si cuenta cero. |
| Elección legal independiente | `parseChoice()` valida `choiceId` contra `observation.options` antes de llamar `normalizeReactionCandidate()`. El cliente vuelve a validar el `choiceId`; el juego conserva sus guardas de decisión, versión y ruleset. |
| Reacción server-side | `requestCodexDecision()` conserva la oportunidad capturada, somete primero `choiceId` y aplica después la reacción aceptada. `applyCodexReaction()` deriva el asiento de `player`, valida evento/catálogo y usa las emisiones existentes. |
| Idempotencia Codex y toggle humano | `applyCodexReaction()` deja intacto el mismo emoji, reemplaza por uno distinto y no hace nada para una reacción ausente. La implementación de `reactToEvent()` no aparece modificada en el diff de F1. |
| Compatibilidad sin reacción | El schema App Server mantiene `reaction` como requerida nullable. Los objetos del runner/cliente usan una inclusión condicional para no exponer la clave cuando el valor normalizado es nulo. |
| Calidad documental/diff | `git diff --check` pasó. Revisión de los cambios de protocolo, flujo de juego, emisión, proyección y contratos; no se agregó ni ejecutó ninguna prueba automatizada. |

F2 debe revisar de forma independiente la secuencia completa, las respuestas inválidas/obsoletas, múltiples asientos Codex y la ruta de reacciones humana. Esta entrega no afirma cobertura dinámica ni ejecución de Codex real.
