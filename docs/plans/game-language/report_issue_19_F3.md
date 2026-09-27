# Reporte F3 — mensajes `g-addLog` de issue #19

**Estado:** `ACTIVE`; las plantillas actuales se localizaron en el servidor. El usuario informó haber recorrido una partida completa y que todo se ve en orden, pero no indicó detalles específicos de los mensajes del registro (ver `report_issue_19_F4.md`). F3 sigue `ACTIVE`, pendiente de revisión independiente.
**Base del trabajo F3:** `origin/master@2d82fa1`, integrada en #19 por `74432a6`.
**Base actual:** `origin/master@be93e97`, que además contiene PR #31/#29 e integra en #19 por merge `318c119`; ya incluía PR #22 (`5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`) y PR #30/#21. Esta reauditoría de assets no cambia el alcance ni el protocolo de F3.
**PR:** [#22](https://github.com/pronficilio/coup-online/pull/22) está `MERGED`; issue #19 permanece `OPEN`. El merge parcial no constituye aceptación F4 ni cierre de la issue.
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
- No se añadieron ni ejecutaron tests. El Alquimista no observó los mensajes en una partida local; el usuario informó haber completado una partida, sin detallar registro ni mensajes concretos. La validación independiente de cobertura visible sigue pendiente.
- Históricamente, tras publicar `9f97acb`, #19 estaba `OPEN`/asignada a `pronficilio` y #22 `OPEN`/`DRAFT`; luego #22 se fusionó en `5de95ee`.
