# Reporte F3 — mensajes `g-addLog` de issue #19

**Estado:** `ACTIVE`; las plantillas actuales se localizaron en el servidor. Falta el recorrido manual del registro, que se coordinará con F4.
**Base:** `origin/master@2d82fa1`, integrada en #19 por `74432a6`.
**PR:** [#22](https://github.com/pronficilio/coup-online/pull/22), debe permanecer `DRAFT`; issue #19 permanece `OPEN`.
**Commit publicado:** `9f97acb` (`feat(i18n): issue 19 localize lobby and game logs`); la sincronización de los cuerpos de tracker se registró después en un commit documental.

## Cambios

- `server/game/coup.js` localiza las ocho llamadas actuales a `addLog()` mediante `server/i18n.js`, que lee el mapa `es` de `coup-client/src/i18n/translations.json`.
- Las claves espejo en `es`/`en` cubren acción usada, acción contra objetivo, desafío, bloqueo declarado, desafío a bloqueo, afirmación demostrada/no demostrada, influencia perdida y eliminación.
- El evento `g-addLog` conserva el nombre y el payload `string`. No se cambian decisiones, valores de acciones/cartas, nombres de eventos ni datos internos; solo se localizan sus etiquetas presentadas.
- No hay emisión directa de `g-addLog` en `server/index.js` en la base `2d82fa1`; las ocho emisiones encontradas están en `server/game/coup.js`.
- `EventLog.js` muestra los mensajes como texto plano en esta base; no aplica resaltado por tokens, así que los nombres pueden aparecer junto a puntuación sin modificar el payload.

## Validación

- `node --check server/i18n.js`: PASS.
- `node --check server/game/coup.js`: PASS.
- Diccionario JSON parseable; 307 claves en cada mapa y mismos marcadores dinámicos.
- `npm run build` del cliente: exit 0; warnings por imports sin uso preexistentes en `App.js`, `caniuse-lite` desactualizado y `postcss-calc` con unidades `dvh` en `ReferencePanel.css:100/106`.
- `git diff --check`: limpio.
- No se añadieron ni ejecutaron tests. No se hizo una partida manual; falta confirmar visualmente los mensajes del registro.
- Tras publicar `9f97acb`, se actualizaron y releyeron los cuerpos de #19 y #22. #19 sigue `OPEN`/asignada a `pronficilio`; #22 sigue `OPEN`/`DRAFT`.
