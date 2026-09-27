# Reporte F2 — issue #19, avances parciales

**Estado actual de la fase:** `ACTIVE`; las rutas antes compartidas ya están integradas en master y localizadas en #19. El recorrido manual está bloqueado por falta de navegador y F4 está `BLOCKED`.
**Estado de F3:** `ACTIVE`; las ocho emisiones actuales de `g-addLog` están localizadas en origen. El recorrido manual del registro está bloqueado (ver reporte F4).
**PR de revisión:** [#22](https://github.com/pronficilio/coup-online/pull/22), `DRAFT`, abierta por solicitud del usuario para validar el avance parcial; no está lista para fusionarse.
**Base sincronizada:** `origin/master` en `2d82fa1`, integrado por el merge `74432a6`; la base anterior `c0119cb`/merge `28e1046` queda como antecedente.
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
- F2 y F3 permanecen `ACTIVE` mientras no se complete el recorrido manual y F4. F4 está `BLOCKED` por falta de navegador; no se afirma cobertura verificada por recorrido ni veredicto independiente.
- Tras `9f97acb`, se reemplazaron y releyeron los cuerpos de issue #19 y PR #22: #19 continúa `OPEN` y asignada a `pronficilio`; PR #22 continúa `OPEN`/`DRAFT`. La bitácora registra esta sincronización.

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

## Validación actual tras PR #23

- Build cliente exit 0; warnings observados en esta ejecución: `logo`/`Link` sin uso en `src/App.js`, `caniuse-lite` desactualizado y `postcss-calc` con unidades `dvh` en `ReferencePanel.css:100/106`.
- Diccionario JSON sin duplicados; 307 claves por idioma y marcadores concordantes. `git diff --check` y `node --check` de `server/i18n.js`/`server/game/coup.js` limpios.
- Sin tests. No se realizó el recorrido manual; F2/F3 permanecen `ACTIVE` y F4 `PENDING`.
- Base vigente `origin/master@2d82fa1`, merge de sincronización `74432a6`. PR #23 liberó las rutas publicadas; no se copiaron cambios locales de otros worktrees.
