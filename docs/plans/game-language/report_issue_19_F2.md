# Reporte F2 — issue #19, avances parciales

**Estado actual de la fase:** `ACTIVE`; además de las superficies previas, esta tanda localiza los rótulos de las cinco familias de botones ilustrados que se integraron después de PR #22. El usuario informó que recorrió portada, lobby y una partida completa y que ve todo en orden; el Verifier encontró después los rótulos ingleses de los nuevos assets. F4 está `ACTIVE`, pendiente de revisión independiente tras esta corrección.
**Estado de F3:** `ACTIVE`; las ocho emisiones actuales de `g-addLog` están localizadas en origen. El reporte del usuario incluye una partida completa, sin pasos/detalles de registro especificados (ver reporte F4).
**PR de revisión:** [#22](https://github.com/pronficilio/coup-online/pull/22) se fusionó mediante `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; merge parcial para revisión incremental, sin aceptación F4 ni cierre de #19.
**Base sincronizada:** `origin/master@be93e97`, que incorpora PR #31/#29; integrada por merge `318c119` después del fast-forward inicial a `origin/master@3313d42` (merge de PR #30/#21) desde `ca16e42`. La base de PR #23 (`2d82fa1`, merge local `74432a6`) queda como antecedente.
**Commits de la unidad:** `4b6b564`, `c9d5442`, `a63336c` y `9f97acb` (`feat(i18n): issue 19 localize lobby and game logs`), publicado en `origin/issue/19-spanish-default-dictionary`. La sincronización de tracker se registró en un commit documental posterior.
**Fecha:** 2026-09-27.

## Tanda posterior a PR #23 — estado actual

PR #23 de #14 está integrada en `origin/master` `2d82fa1`; se verificó el merge publicado y se integró a #19 mediante `74432a6`. Las rutas de lobby, decisiones, partida, tablero y servidor antes reservadas quedaron liberadas por la integración publicada; no se copiaron cambios locales desde el worktree #14.

- Se localizaron `CreateGame.js` y `JoinGame.js`, incluidos estados listos/espectador, mensajes de error, controles Codex/IA, parámetros de esfuerzo, código de acceso y parada de emergencia. Los códigos internos de `joinFailed`/`startRejected` se conservan y se traducen solo al representarlos.
- Se localizaron estados, controles y decisiones de `game/Coup.js`; las etiquetas/roles de acción se resuelven en presentación a partir de `decision.type`/`choiceId`, sin alterar el sobre o los eventos de Socket.IO. `PlayerBoard.js` ahora carga las cinco imágenes españolas existentes y expone nombres accesibles de roles en español.
- El diccionario tiene 307 claves paralelas `es`/`en`; clave y marcador son idénticos en ambos mapas. `server/i18n.js` consume el mapa `es` fijo para presentar los registros.
- F3 modifica solo las ocho llamadas `addLog()` de `server/game/coup.js`. `server/index.js` no emite `g-addLog` en la base sincronizada. El payload sigue siendo un `string`; nombres de jugadores son valores y acciones/roles se localizan solo para mostrarlos.
- `npm run build` en `coup-client` terminó con exit 0. Warnings observados: imports `logo`/`Link` sin uso en `src/App.js`, `caniuse-lite` desactualizado y `postcss-calc` que no parsea `dvh` preexistente en `ReferencePanel.css:100/106`; no aparecieron warnings nuevos en las superficies localizadas.
- La comprobación de claves/parámetros dio 307/307 sin diferencias; `git diff --check`, `node --check server/i18n.js` y `node --check server/game/coup.js` limpios. No se añadieron ni ejecutaron tests.
- F2 y F3 permanecen `ACTIVE`; F4 está `ACTIVE`, pendiente de revisión independiente. El único dato de recorrido es el informe del usuario; no se afirma verificación propia ni veredicto.
- Históricamente, tras `9f97acb`, #19 estaba `OPEN` y PR #22 `OPEN`/`DRAFT`. El estado actual es PR #22 `MERGED` en `5de95ee`; issue #19 continúa `OPEN` y asignada a `pronficilio`.

## Tanda inicial F2 — histórico (2026-09-26)

- Se agregó `coup-client/src/i18n/translations.json` con 181 claves paralelas `es`/`en`, incluidas las cadenas cliente F1 de rutas todavía reservadas para que puedan adoptarlas en tandas posteriores. Los emisores de `g-addLog` no se incluyen: F3 permanece bloqueada.
- Se agregó `coup-client/src/i18n/index.js`. La función `t(key, params)` usa siempre `es`, interpola marcadores con nombre y devuelve la clave si falta una entrada `es` (nunca recurre a `en`); el diccionario queda exportado para una futura integración, sin selector, detección ni persistencia de idioma.
- Se localizaron las cadenas permitidas en `Home.js`, `RulesModal.js`, `CheatSheetModal.js` y el título de `EventLog.js`. Se conservaron las negritas, los colores y las etiquetas de roles/acciones de las reglas. El crédito de portada conserva el enlace al nombre propio y toma su prefijo del diccionario.
- Se fijó `lang="es"`, y se tradujeron título, metadatos sociales/búsqueda y texto `<noscript>` en `coup-client/public/index.html`; también se localizaron `short_name` y `name` de la PWA.
- Se tradujeron los nodos de texto visibles de `coup-client/src/assets/CheatSheet.svg`. El efecto del Golpe/Asesinato se compactó a «Elige quién pierde 1 influencia» para ajustarse a la columna del recurso.
- Tras cerrarse #18 y fusionarse su PR #20 (`64a507d`), `ReferencePanel.js` se conectó a `t()` para etiquetas del grupo, botones, modales, `alt` y controles accesibles. Los textos predeterminados españoles no cambian; se agregaron equivalentes `en` para sus nueve claves. El `Coup.js` recibido por el merge monta ReferencePanel desde master; #19 no modificó ese archivo.
- En el barrido adicional F2 del 2026-09-26 21:30 (hora local), las superficies compartidas seguían reservadas a #14; esa observación es histórica y quedó superada por la integración de PR #23 registrada arriba.

## Validación de la tanda inicial (histórica, 2026-09-26)

- En aquella tanda, JSON válido con 190 claves `es`/`en` y los mismos marcadores; las 9 claves `referencePanel.*` y `{referenceName}` conservaban paridad.
- El helper selecciona explícitamente `es`; su fallback no consulta el mapa inglés.
- `git diff --check` quedó limpio.
- El build de esa tanda tras integrar ReferencePanel terminó con exit 0; registró imports sin uso en `src/App.js`, `caniuse-lite` desactualizado y `postcss-calc` sin parsear expresiones `dvh` en `ReferencePanel.css:100/106`.
- No se añadieron ni ejecutaron tests. No se hizo recorrido manual de una partida; esta evidencia cubre solo la tanda aislada, no el criterio de cierre F2.
- La base de entonces `c0119cb` se integró mediante `28e1046`; `Coup.js` y demás rutas compartidas seguían reservadas a #14.
- En ese punto F2 estaba `ACTIVE` y F3 `BLOCKED`; el cierre de issue #19 no era elegible.

## Validación de la tanda tras PR #23 (histórica; base 2d82fa1)

- Build cliente exit 0; warnings observados en esta ejecución: `logo`/`Link` sin uso en `src/App.js`, `caniuse-lite` desactualizado y `postcss-calc` con unidades `dvh` en `ReferencePanel.css:100/106`.
- Diccionario JSON sin duplicados; 307 claves por idioma y marcadores concordantes. `git diff --check` y `node --check` de `server/i18n.js`/`server/game/coup.js` limpios.
- Sin tests. En ese punto el Alquimista aún no había hecho el recorrido manual; después el usuario informó el suyo (ver F4). F2/F3 permanecen `ACTIVE` y F4 no tiene cierre.
- Base vigente `origin/master@2d82fa1`, merge de sincronización `74432a6`. PR #23 liberó las rutas publicadas; no se copiaron cambios locales de otros worktrees.

## Addendum tras sincronizar PR #30/#21

- La reauditoría de `origin/master@3313d42` encontró texto inglés en las cinco familias de botones de decisión usadas por `game/Coup.js`: `ba` (BLOCK ASSASSINATION), `bfa` (BLOCK FOREIGN AID), `bs` (BLOCK STEAL), `c` (CHALLENGE) y `pass` (PASS), incluidas sus variantes `-active.webp`. El par `claim` dice `CLAIM`, pero no se importa ni referencia desde `coup-client/src`.
- `Coup.js` conecta cada imagen usada a la frase española ya existente en el diccionario; las cinco claves tienen pares `es`/`en`, así que permanecen 307 claves por idioma. `ResponseImageButton` presenta un rótulo español sobre el texto incrustado en normal y active, manteniendo imágenes, iconos, marcos, `choiceId`, `onClick` y protocolo. No se alteró el servidor.
- La revisión independiente previa registró `FAIL` en AC1/AC2/AC4/AC7 por estas cinco familias, y `PASS` en AC3/AC5/AC6. Este reporte no cambia ese veredicto: el build posterior a la corrección terminó exit 0; falta confirmación visual independiente.
- `npm run build` en `coup-client`: exit 0. Warnings: `logo`/`Link` sin uso en `src/App.js`; `caniuse-lite` desactualizado; `postcss-calc` no interpreta `dvh` en `ReferencePanel.css:100/106`.
- Diccionario JSON válido, sin claves duplicadas; 307/307 claves y marcadores concordantes. `git diff --check` limpio. No se añadieron ni ejecutaron tests.
- El entorno del Alquimista no tiene navegador local para inspeccionar el resultado visual de las etiquetas superpuestas; este build no demuestra su encaje/presentación. La revisión visual y la nueva pasada independiente quedan pendientes.
- F2 sigue `ACTIVE`; F3 sigue `ACTIVE`; F4 sigue `ACTIVE`, sin PASS general ni cierre de issue. #19 permanece `OPEN`; #22 ya está `MERGED`; PR de continuación #33 está `DRAFT`. La verificación FINAL y la aprobación del usuario siguen pendientes.
