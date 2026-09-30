# F2 recheck — respuesta Codex tras cierre anticipado (#77)

**Motivo:** F3 `FAIL` anterior en AC8, commit documental `9006853`.
**Estado:** F2 `CLOSED`; F3 `READY` para repetición independiente.

## Regresión añadida

`server/test/coup.test.js` mantiene pendiente la promesa de `codexClient.choose()` durante una ventana `challenge`. El actor humano declara `tax`; el humano de prioridad inmediata envía `challenge`, que cierra la ventana antes de que Codex responda. Después se resuelve Codex con un resultado válido pero ligado al `decisionId` y `stateVersion` ya cerrados.

La prueba verifica que la partida sigue `running`, permanece en `prove_claim` para el challenger humano original, el ID y versión activos son nuevos, el evento `challenge_started` no se duplica, no se emite una pausa ni un cierre adicional a sockets humanos elegibles, y el callback Codex termina sin dejar request pendiente.

## Validación

- `node test/coup.test.js` desde `server/`: **19 pasaron, 3 fallaron**. La nueva regresión Codex pasa, al igual que la matriz de 144 escenarios y las pruebas de challenge/block/timeout/reanudación.
- Las tres fallas preexistentes ajenas permanecen: labels de opciones de Exchange (`coup.test.js:431`); expectativa de pausa frente a disolución al desconectar (`:528`, política fuera de alcance #77); y búsqueda de `g-gamePaused` en el broadcast aunque la emisión es directa a sockets humanos (`:652`).
- `git diff --check`: sin errores.
- No se modificó código de producción en este retorno; la revisión anterior encontró correcta la guarda Codex por decisión/versión, pero faltaba esta evidencia dinámica.

## Siguiente paso

F2 `CLOSED`: la secuencia exacta solicitada por F3 está cubierta y pasa. Repetir F3 de forma independiente sobre el commit de esta reejecución. Mantener las fallas fuera de alcance registradas; no integrar sin veredicto `PASS`.
