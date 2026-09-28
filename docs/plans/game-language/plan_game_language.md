# Idioma español predeterminado y diccionario bilingüe — issue #19

**Estado:** `COMPLETED`; F1, F2, F3 y F4 `CLOSED`. Verifier FINAL `PASS` sobre el merge integrado `45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe` y aceptación de AC7 tras la respuesta del usuario.
**Unidad:** https://github.com/pronficilio/coup-online/issues/19
**Handoff final:** `docs/plans/completed/issue_19_game_language.md`
**Bitácora:** `docs/plans/log/issue-19.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Siguiente dueño:** ninguno; la issue #19 está `CLOSED` y la unidad `COMPLETED`.
**Integración:** PR #22 se fusionó parcialmente con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; la continuación de producto #33 se fusionó en `master` con `45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`. La PR documental [#38](https://github.com/pronficilio/coup-online/pull/38) quedó integrada en `master` con `64c1b295fe9586ea05c4e7dc2a713faec948ec24`, cerrando la documentación de fases y la unidad.

## Solicitud y definición de éxito

La solicitud es identificar las palabras en inglés del código, establecer el español como idioma predeterminado y preparar un archivo con traducciones para una futura opción de cambio de idioma. En esta unidad se traducen los textos de cara a quien juega y se prepara el diccionario; no se implementa selector ni cambio de idioma.

Éxito significa que las pantallas, mensajes, ayudas, textos accesibles y recursos gráficos usados por la interfaz aparecen en español; que hay entradas estables en inglés y español con parámetros equivalentes; y que no se cambia la lógica de Coup ni el protocolo entre cliente y servidor.

## Hechos confirmados, supuestos y fuentes

- El repositorio `coup-online` usa `master` como base, `origin` apunta al fork `pronficilio/coup-online`, GitHub es el tracker y el aislamiento local es un worktree por issue.
- El cliente es React 16/Create React App en `coup-client/`; el servidor Socket.IO/Node está en `server/`.
- La auditoría F1 confirmó cadenas visibles en `Home.js`, `CreateGame.js`, `JoinGame.js`, `RulesModal.js`, `CheatSheetModal.js`, componentes de decisión, `Coup.js` y `EventLog.js`; `CheatSheet.svg` y las cinco ilustraciones de personaje cargadas en `PlayerBoard.js` tienen texto inglés. `coup-client/public/index.html` declara `lang="en"` y `public/manifest.json` incluye nombre y descripción ingleses.
- Hallazgo F1 histórico antes de PR #23: `server/index.js` y `server/game/coup.js` aparecían como orígenes de mensajes ingleses `g-addLog`; PlayerBoard cargaba ilustraciones inglesas. Reauditoría tras PR #23 encontró ocho emisores vigentes solo en `server/game/coup.js` y ausencia de emisión directa en `server/index.js`; PlayerBoard ahora carga las cinco variantes españolas.
- PR #23 de #14 está integrada en `origin/master` `2d82fa1`; sus cambios publicados de lobby, decisiones, tablero y servidor están en la base de #19 mediante merge `74432a6`. No se copiaron cambios locales del worktree #14. Issue #18 se cerró tras PR #20 (`64a507d`) y ReferencePanel quedó liberado anteriormente. #13 trata de despliegue y queda fuera de esta unidad.
- Supuesto: usar español neutral de Latinoamérica, clave `es`, y conservar el texto inglés de origen bajo `en`. Los nombres propios de jugadores y los valores internos de cartas/acciones se conservan en los mensajes; solo cambia su presentación.
- Glosario inicial: usar los nombres que ya aparecen en la referencia española del juego —Duque, Asesino, Embajador, Capitán y Condesa— y las acciones Ingreso, Ayuda extranjera, Golpe, Impuesto, Robar, Intercambiar y Asesinar. F1 confirma la forma final contra las referencias vigentes del juego.

Fuentes de verdad: issue #19; contrato operativo `docs/plans/PROJECT_ORCHESTRATION.yaml`; reglas y términos de juego en `docs/coup_transcription.md`, `docs/coup_play_reference.md` y `docs/coup_summary_card.md`; recursos bilingües del issue #8; código y recursos que se inspeccionen en F1.

## Alcance y exclusiones

**Incluye:** textos visibles en portada, lobby y partida; reglas y ayudas; registro de eventos originados por el servidor; botones, estados y errores; etiquetas `alt`, `aria-label`, `title` y el atributo de idioma del documento; texto incrustado en recursos gráficos usados por la interfaz; diccionario `es`/`en` con claves y parámetros estables.

**Excluye:** selector de idioma, preferencia persistente, detección automática, configuración que permita elegir `en`, cambios de reglas, nombres de eventos/payloads Socket.IO, valores internos de cartas/acciones, nombres introducidos por jugadores, logs de desarrollo, comentarios, documentación que no se muestra dentro del juego y despliegue.

El archivo propuesto para el diccionario es `coup-client/src/i18n/translations.json`, con mapas paralelos `es` y `en`, claves con espacios de nombres y marcadores nombrados para valores dinámicos (por ejemplo, `{playerName}` y `{amount}`). El cliente solo leerá `es` de forma fija durante esta unidad. Los mensajes de `g-addLog` conservarán su payload string y se traducirán en su origen; sus plantillas también se anotarán en el diccionario para facilitar una integración futura. No se cambia ahora el protocolo para enviar claves de traducción.

## Criterios de aceptación

1. El inventario registra cada texto de jugador en inglés con archivo/origen, contexto, clave propuesta, valor inglés, traducción española y parámetros dinámicos; clasifica el texto ya español, assets bilingües y cadenas internas excluidas.
2. El flujo visible de portada, creación/ingreso al lobby, reglas, acciones, decisiones, estados de partida y registro de eventos queda en español.
3. El diccionario `translations.json` conserva los textos fuente en `en`, ofrece traducciones en `es` y tiene el mismo conjunto de claves y marcadores en ambos mapas.
4. Los textos visibles de accesibilidad, recursos gráficos y nombres instalables de la PWA quedan en español; los recursos de referencia inglesa solo permanecen donde se identifican explícitamente como material bilingüe.
5. `public/index.html` declara `lang="es"`; la interfaz usa español fijo y no ofrece selector, detección o persistencia de idioma.
6. Se preservan nombres de evento, forma y contenido de payloads, valores internos de juego, reglas y comportamiento de partida.
7. La auditoría final no encuentra texto inglés visible o accesible en los recorridos incluidos; build y recorrido manual quedan documentados y un Verifier independiente intenta refutar ese claim.

## Fases

### F1 — Inventariar cadenas y cerrar el contrato del diccionario (`CLOSED`)

**Pregunta:** ¿qué textos ingleses aparecen en la experiencia jugable y cómo se representan con claves y parámetros sin traducir datos del protocolo?

**Entrada:** archivos React del cliente, recursos SVG/HTML, mensajes `g-addLog` del servidor, referencias vigentes del juego y este plan.

**Salida/evidencia:** `docs/plans/game-language/translation_inventory.md`, con tabla de origen, contexto, clave propuesta, inglés, español propuesto, parámetros y decisión de inclusión; glosario español y propuesta de esquema `es`/`en`. Distinguir texto visible, accesibilidad, contenido gráfico, texto ya español y cadenas internas excluidas. Se inventariaron además `public/manifest.json` y las cinco ilustraciones de personaje que se muestran en inglés. No modificar código de producto en esta fase.

**Veredicto F1:** `CLOSED`. La lectura manual y el barrido de JSX, atributos, HTML/PWA, SVG/WebP y emisores/receptor `g-addLog` cubren las superficies encontradas; los parámetros están nombrados, los IDs de protocolo quedan excluidos y el glosario coincide con los recursos españoles existentes. El inventario registra por separado huecos de accesibilidad que no autorizan rediseñar controles.

**Avanzar:** una revisión de las rutas renderizadas, atributos accesibles, recursos gráficos y mensajes visibles deja cada hallazgo clasificado; las claves preservan variables y los términos coinciden con las referencias españolas.
**Pivotar:** si la auditoría descubre texto expuesto fuera del cliente/servidor contemplado, actualizar alcance e issue antes de incorporarlo.
**Repetir:** una pasada dirigida solo a rutas o recursos identificados como omitidos.
**Bloquear/cancelar:** si aparece una decisión de producto sobre terminología o alcance regional que no puede resolverse con las referencias vigentes, registrar la pregunta para el Orquestador/usuario.
**Commit:** `COMMIT_REQUIRED`; `docs(i18n): issue 19 F1 CLOSED advance_f2`.
**Validación:** búsqueda estática de literales/texto en atributos y assets más lectura manual de cada contexto encontrado; sin añadir ni ejecutar tests.

### F2 — Traducir la interfaz y preparar el diccionario fijo en español (`CLOSED`; integrado en PR #33)

**Pregunta:** ¿puede el cliente mostrar español desde un diccionario bilingüe con `es` como fuente fija y sin ruta para elegir otro idioma?

**Entrada:** inventario F1, glosario aceptado y `origin/master` sincronizado. PR #23 publica la liberación de las rutas previamente compartidas; los cambios de F2 se hacen en el worktree de #19.

**Salida/evidencia:** `translations.json` con claves paralelas `es`/`en`; texto visible del cliente y `CheatSheet.svg` en español; documento con `lang="es"`; metadatos `public/manifest.json` en español; carga por defecto de las cinco ilustraciones de personaje ya traducidas (`duque.webp`, `asesino.webp`, `capitan.webp`, `embajador.webp`, `condesa.webp`); etiquetas españolas superpuestas a los cinco rótulos incrustados de botones de respuesta de `action-buttons/`. Los valores internos que el cliente envía siguen en inglés; solo las etiquetas renderizadas pasan por el diccionario.

**Áreas principales:** `coup-client/src/i18n/`, `coup-client/public/index.html`, `coup-client/public/manifest.json`, `CreateGame.js`, `JoinGame.js`, `game/Coup.js`, `game/PlayerBoard.js`, los componentes F1 ya traducidos y `coup-client/src/assets/`. Las rutas liberadas se localizaron en #19 tras integrar `origin/master@2d82fa1`.

**Coordinación histórica (2026-09-26):** antes de PR #23, lobby/decisiones/tablero y servidor estaban reservados a #14. PR #23 ya está integrada en master y la última tanda sincronizó esa base en el worktree #19; las reservas anteriores ya no aplican a los cambios publicados.

**Tanda aislada 1 (histórica, 2026-09-26; commit principal `4b6b564`, corrección del fallback es-only `c9d5442`):** `translations.json` tenía mapas paralelos `es`/`en` para las cadenas cliente F1 y `src/i18n/index.js` fijaba la presentación en español sin selector ni fallback al mapa inglés. En ese checkpoint había 181 claves y F2 seguía `ACTIVE`; después se completaron las rutas compartidas, los assets y la validación final, según el cierre integrado abajo.

**Tanda liberada de ReferencePanel (histórica, 2026-09-26; commit `a63336c`):** después de sincronizar `origin/master` (`c0119cb`, merge `28e1046`), `ReferencePanel.js` se conectó al diccionario con 9 claves nuevas; el conteo de aquel checkpoint fue 190. En ese momento F2 seguía `ACTIVE` y F3 `BLOCKED`; ambas fases se completaron después, según el cierre integrado abajo.

**Barrido F2 adicional (histórico, 2026-09-26 21:30, hora local):** se revisaron las superficies no reservadas y no se encontró otra cadena elegible fuera de los archivos ocupados por #14. Ese bloqueo se resolvió al integrarse PR #23; los cambios de F2/F3 se completaron posteriormente.

**Liberación confirmada (2026-09-27):** PR #23 está publicada en `origin/master@2d82fa1` y el merge de #19 es `74432a6`. Las rutas `CreateGame.js`, `JoinGame.js`, `ActionDecision.js`, `Coup.js`, `PlayerBoard.js`, demás componentes de decisión y `server/game/coup.js` quedaron integradas en master. La tanda #19 trabaja sobre esos archivos integrados, sin trasladar cambios locales desde el worktree #14.

**Tanda posterior a PR #23 (histórica, antes de integrar PR #33):** lobby/decisiones/tablero estaban en español mediante el mapa `es`; el branch registró 307 claves espejo `es`/`en`, con placeholders concordantes. El árbol integrado final de PR #33 contiene 292/292, según confirmó el Verifier; la diferencia se conserva sin inferir causa.

**Criterio de parcialidad (instrucción histórica, ya satisfecha):** los commits incrementales de F2 no cerraban la fase hasta completar rutas reservadas, actualizar inventario/diccionario y validar. PR #22 se integró parcialmente mediante `5de95ee`; esa integración no cerró fases. El trabajo se completó más tarde en PR #33 y el Verifier FINAL dio PASS en el merge integrado `45a3eaa`.

**Hallazgo tardío de assets y corrección (checkpoint histórico de 2026-09-27):** al revisar `origin/master@3313d42` se encontraron cinco familias usadas por `Coup.js` con texto inglés en sus variantes normal/activa. F2 conectó las cinco etiquetas a claves `es`/`en` ya existentes y conservó acciones y protocolo. El primer Verifier devolvió FAIL/BLOCKED; después se ajustó el overlay de `Desafiar`, el usuario completó la revisión y el Verifier FINAL dio PASS para AC1–AC7 en el merge `45a3eaa`.

**Avanzar:** recorridos del cliente muestran etiquetas, decisiones y ayudas en español; ambos mapas tienen la misma estructura; solo se importa `es`; no existe selector, detección ni persistencia.
**Pivotar:** si una etiqueta dinámica no cabe en un string de diccionario sin cambiar el payload, usar marcadores nombrados en presentación.
**Repetir:** una corrección localizada por clave o contexto que falle la revisión.
**Bloquear/cancelar:** conflicto sin resolver con #14/#18, cambio requerido en reglas/protocolo o término que requiera aprobación de producto.
**Commit:** `COMMIT_REQUIRED`; `feat(i18n): issue 19 F2 spanish default and dictionary`.
**Validación:** build de cliente, revisión de paridad de claves y recorrido manual; no añadir ni ejecutar tests.

### F3 — Traducir mensajes de partida emitidos por el servidor (`CLOSED`; integrado en PR #33)

**Pregunta:** ¿los mensajes ingleses del registro de eventos pueden aparecer en español sin alterar el protocolo ni la resolución de acciones?

**Entrada:** inventario F1, esquema del diccionario F2 y cambios ya integrados/coordinados de #14.

**Salida/evidencia:** plantillas en español para mensajes de `g-addLog` que ve la persona que juega; entradas espejo `es`/`en` con los mismos marcadores en el diccionario; reporte que confirme que `g-addLog` sigue siendo un string y que valores dinámicos/tarjetas siguen sin alteración.

**Áreas principales:** las ocho llamadas `addLog()` actuales en `server/game/coup.js`; `server/index.js` no contiene emisiones directas `g-addLog` en `origin/master@2d82fa1`. `server/i18n.js` consume el mapa `es` del diccionario común; `Coup.js`/`EventLog.js` no cambian el transporte. No traducir `console.log`, valores internos de acción/cartas ni enums.

**Avanzar:** el registro de partida usa español en acciones, desafíos, bloqueos, pérdidas de influencia y desconexiones; nombres de jugadores y términos internos conservan su valor; el payload/socket permanece compatible.
**Pivotar:** si para localizar un mensaje hace falta reestructurar el protocolo, detenerse y proponer una reorquestación; no cambiar el protocolo aquí.
**Repetir:** una corrección por plantilla/marcador reproducible.
**Bloquear/cancelar:** se requiera alterar el protocolo fuera del alcance autorizado.
**Commit:** `COMMIT_REQUIRED`; `feat(i18n): issue 19 F3 spanish game log messages`.
**Validación:** inspección de los emisores y reproducción manual de mensajes disponibles sin modificar las decisiones; `git diff --check`; no añadir ni ejecutar tests.

### F4 — Cerrar cobertura y revisión independiente (`CLOSED`; Verifier FINAL PASS)

**Pregunta:** ¿la implementación satisface los criterios y no dejó texto en inglés visible ni una forma de seleccionar inglés?

**Entrada:** inventario F1, reportes/diff F2-F3, build y recorrido manual documentados para revisión independiente.

**Salida/evidencia:** reporte final con correspondencia inventario→diccionario/interfaz, comparación de claves y marcadores, build de producción y recorrido manual de portada, lobby y partida; revisión FINAL independiente con `PASS`, `FAIL` o `BLOCKED`.

**Falsificación para Verifier:** buscar por rutas normales cualquier inglés visible o accesible; intentar hallar una preferencia/selector/detección que active `en`; confirmar que las claves, marcadores y nombres/payloads de juego no cambiaron.

**Revisión independiente anterior:** el Verifier informó `FAIL` en AC1/AC2/AC4/AC7 al encontrar texto inglés incrustado en las cinco familias de botones usadas; informó `PASS` en AC3/AC5/AC6. La corrección puntual está publicada y exige nueva revisión visual independiente. El reporte previo del usuario (recorrido de portada, lobby y partida completa, todo en orden) se conserva como cita de su experiencia, sin inferir dispositivo/navegador/pasos ni convertirlo en veredicto; ocurrió antes de la corrección.

**Revisión FINAL anterior de la corrección:** en `0c913d8` el Verifier dejó AC1/AC3/AC5/AC6 `PASS` y AC2/AC4/AC7 `BLOCKED` hasta obtener observación humana del render y el ajuste responsive. La revisión posterior de `3c9a3af` detectó píxeles ingleses en `CHALLENGE` y devolvió esos criterios a corrección.

**Corrección focalizada posterior a `3c9a3af` (2026-09-27):** el Verifier midió el lettering de `c.webp`/`c-active.webp` en x≈201–399 de 512 px (39.3–77.9%); la capa anterior cubría x=40–77% (204.8–394.24 px), dejando bordes visibles. Se amplió únicamente la clase `.ResponseImageButton__art--challenge` a x=38–80%. Esto cubre el lettering con ~6.4 px de margen izquierdo y ~10.6 px derecho en 512 px; a 216 px la caja y los márgenes escalan proporcionalmente (~2.7/4.5 px). No cambió ninguna regla de las otras cuatro familias. `npm run build` terminó con exit 0 y avisos existentes de `App.js`, `caniuse-lite` y `ReferencePanel.css:dvh`; no se ejecutaron tests.

**Cierre integrado (2026-09-27):** PR #33 mergeada en `master` como `45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`. El Verifier FINAL dio `PASS` sobre ese árbol: AC1–AC7 `PASS`; el usuario, después del checklist completo, respondió «he probado y todo luce en orden, sugiero comenzar con el cierre del issue 19». El Verifier acepta AC7; no se documentaron navegador, dispositivo ni anchos exactos. El diccionario integrado en ese merge tiene 292 claves `es` y 292 `en`, paridad confirmada por el Verifier. La rama previa al merge tenía 307/307; se conservan ambos conteos asociados a sus árboles, sin inferir causa de la diferencia. F1–F4 `CLOSED`; unidad `WAITING_ORCHESTRATOR` hasta integrar estos documentos y cerrar la issue.

**Avanzar:** criterios AC1–AC7 sustentados y Verifier `PASS`; dejar la unidad `WAITING_ORCHESTRATOR` para integrar la PR documental de cierre. La issue #19 sigue abierta hasta esa integración y el cierre por Orquestación.
**Pivotar:** devolver a F2/F3 solo el criterio refutado con reproducción concreta.
**Repetir:** una ronda focalizada tras una corrección y repetir el chequeo del criterio afectado.
**Bloquear/cancelar:** falta entorno de recorrido/build o permanece una dependencia de #14/#18 sin liberar.
**Commit:** `COMMIT_REQUIRED`; `docs(i18n): issue 19 F4 CLOSED ready_for_review`.
**Validación:** verificación independiente FINAL; no añadir ni ejecutar tests automatizados.

**Comprobación de entorno anterior (2026-09-27):** en el worktree #19 no se encontraron `chromium`, `chromium-browser`, `google-chrome`, `google-chrome-stable`, `chrome` ni `firefox` en `PATH`; `coup-client/package.json` no declara Playwright/Puppeteer/WebDriver. En ese entorno no se inició recorrido ni se instaló nada; F4 quedó `BLOCKED`. Después el usuario informó haber recorrido portada, lobby y una partida completa, y dijo que todo se veía en orden. No informó navegador, dispositivo, pasos específicos ni capturas; no se infiere que haya verificado los cinco rótulos corregidos. El Verifier FINAL pasó AC1/AC3/AC5/AC6 y dejó AC2/AC4/AC7 `BLOCKED` hasta el recorrido visual focalizado.

## Topología, riesgos y decisiones

Históricamente, el issue #19 estuvo abierto y asignado a `pronficilio` mientras se completaban las fases. Después del PASS FINAL, PR #33 integró el producto y PR #38 integró el cierre documental; el issue quedó cerrado tras el merge de #38. El usuario autorizó la integración parcial de #22 para revisión incremental; esa autorización no sustituyó la aceptación F4, que se obtuvo posteriormente y quedó documentada arriba.

Riesgo principal: mantener equivalencia semántica de las decisiones dinámicas y evitar exponer IDs ingleses. La base publicada de PR #23 ya está integrada; no se copian cambios locales de otros worktrees. No cambiar reglas, enums o payloads para traducir etiquetas. Aplicar el glosario y referencias españolas existentes.

## Historial de decisiones

- 2026-09-26: crear unidad `FULL/MEDIUM/FINAL` porque incluye inventario y traducción transversal del cliente, servidor y recursos, con revisión independiente final.
- 2026-09-26: usar `es` fijo y conservar `en` en diccionario; no implementar selección, detección o persistencia.
- 2026-09-26: F1 queda independiente de #14; F2/F3 requieren coordinación por solapamiento de archivos.
- 2026-09-26: la issue #18 también requiere coordinación para F2 porque monta `ReferencePanel` dentro de `Coup.js`.

- 2026-09-26: F1 confirmó texto inglés en `CheatSheet.svg`, cinco ilustraciones de personaje usadas por `PlayerBoard.js`, metadatos de `public/index.html` y nombres de instalación en `public/manifest.json`; F2 incluye las variantes gráficas españolas existentes y el manifest. F1 queda cerrada.
- 2026-09-27: la inspección de los worktrees #14/#18 precisó los archivos en colisión. F2 avanza en las superficies aisladas enumeradas arriba; los componentes modificados por esas unidades quedan reservados hasta liberar/integrar sus ramas. F3 espera la liberación de #14.
- 2026-09-27: durante la tanda aislada F2, el Orquestador confirmó que PR #20 de #18 se fusionó como `64a507d` y liberó `ReferencePanel.js`/`.css`; después la issue #18 se cerró (2026-09-27T02:37:50Z). `Coup.js` continúa reservado por #14. El worktree #19 no se sincronizó en esta tanda; la siguiente sincronizará `origin/master` antes de editar las rutas liberadas.
- 2026-09-26: se verificaron de nuevo issue #19 y worktrees #14/#18; #14 mantiene cambios locales en rutas reservadas y #18 está cerrada. `origin/master` `c0119cb` se integró en #19 con merge `28e1046`; se registra `sync_base`. La integración upstream modifica `Coup.js` para montar `ReferencePanel`, pero #19 conserva esa modificación sin editarla. Se conectó únicamente `ReferencePanel.js` al diccionario y se añadieron 9 claves (190 total); F2 permanece `ACTIVE` y F3 `BLOCKED`.
- 2026-09-26: por solicitud explícita del usuario de validar los cambios, el Orquestador publicó `issue/19-spanish-default-dictionary` en `origin` y abrió la PR única #22 como `DRAFT` hacia `master`. La PR cubre el avance parcial de F2; no autoriza merge ni cierre de #19. F2 `ACTIVE`, F3 `BLOCKED` por #14.
- 2026-09-27 (registro de esa tanda; estado después actualizado): PR #23 de #14 se integró en `origin/master@2d82fa1`; #19 sincronizó mediante merge `74432a6` y registró `sync_base`. Se localizaron las superficies liberadas de lobby/decisiones/partida/tablero y las ocho emisiones actuales de `g-addLog`; diccionario 307/307, build del cliente y revisión sintáctica server completados. F2/F3 `ACTIVE`; F4 estaba `PENDING` en esa anotación, pero ahora está `BLOCKED` por falta de navegador para el recorrido manual.
- 2026-09-27: commit `9f97acb` publicó la tanda actual F2/F3 en el branch de #19. Después se reemplazaron y releyeron los cuerpos de issue #19 y PR #22; #19 sigue `OPEN` y asignada a `pronficilio`, PR #22 sigue `OPEN`/`DRAFT`. La tanda de tracker está registrada en `issue-19.jsonl`; no hubo cierre de fase ni merge.
- 2026-09-27: al iniciar F4 se comprobó que no hay navegador instalado/en `PATH` ni dependencia Playwright/Puppeteer/WebDriver en `coup-client`. No se hizo el recorrido manual; F4 `BLOCKED` hasta disponer de navegador/entorno seguro y después obtener Verifier FINAL independiente. Issue #19 permanece `OPEN`; PR #22 `DRAFT`; F2/F3 `ACTIVE`.
- 2026-09-27: se reemplazaron y releyeron los cuerpos de #19 y PR #22 para registrar el bloqueo F4 observado. La API confirmó #19 `OPEN`/asignada a `pronficilio` y PR #22 `OPEN`/`DRAFT`; ambos describen F4 `BLOCKED` y declaran que no hubo recorrido manual. Evento append-only en `issue-19.jsonl`.
- 2026-09-27 (histórico, antes del merge): el usuario autorizó explícitamente integrar PR #22 parcialmente para revisión incremental aunque F4 estuviera `BLOCKED`; no equivalía a aceptación/veredicto ni cierre de #19.
- 2026-09-27: #22 fue fusionada con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; issue #19 sigue `OPEN`. `origin/master` avanzó a `3313d42`; el branch #19 se sincronizó por fast-forward limpio desde `ca16e42`.
- 2026-09-27: antes de abrir la PR de continuación, #19 integró `origin/master@be93e97` (PR #31/#29) mediante merge limpio `318c119`; se conserva el branch/worktree único de la issue.
- 2026-09-27: el usuario informó exactamente que recorrió portada, lobby y partida completa y que ve todo en orden. Sin detalles de navegador/dispositivo/pasos; el informe corresponde al recorrido previo a la corrección de los rótulos. F4 `BLOCKED` hasta verificar los botones corregidos; F2/F3 siguen `ACTIVE`, sin cierre ni PASS.
- 2026-09-27: segunda revisión FINAL sobre `3c9a3af` devolvió `FAIL` en AC2/AC4/AC7 porque quedaban píxeles de `CHALLENGE` fuera de la máscara. Con autorización del usuario, se amplió solo el recubrimiento de `Desafiar` a 38–80%; las métricas y el handoff focalizado están en `report_issue_19_F4.md`. Unidad `WAITING_ORCHESTRATOR`; la nueva revisión visual y el veredicto del Verifier siguen pendientes. F4 `BLOCKED`; F2/F3 `ACTIVE`.
- 2026-09-27: la máscara corregida de `Desafiar` pasó build (`npm run build`, exit 0 con avisos existentes) y `git diff --check`. La cobertura JSONL se valida sin reordenar eventos. No se ejecutaron tests ni se afirma resultado de render. F4 sigue `BLOCKED` a la espera de inspección humana y Verifier independiente; issue #19 `OPEN`, PR #33 `DRAFT`, unidad `WAITING_ORCHESTRATOR`.
- 2026-09-27: commit `c9d62676ffa33a177a0edced26dfc91e2529365c` publicado en la rama canónica y cuerpos de #19/#33 sincronizados. API releyó #19 `OPEN`/asignada a `pronficilio` y PR #33 `OPEN`/`DRAFT` en el nuevo head. Verifier independiente y revisión humana focalizada siguen pendientes; F4 `BLOCKED`, F2/F3 `ACTIVE`.
- 2026-09-27: Verifier FINAL independiente revisó código `c9d62676ffa33a177a0edced26dfc91e2529365c` (HEAD en ese momento `cbfaee5fa527994e186a2b9116815da7bcd13d34`, commit solo documental) y devolvió global `BLOCKED`: AC1/AC3/AC5/AC6 `PASS`, AC2/AC4 `PASS` estático, AC7 `BLOCKED` a la espera del recorrido humano normal/activo y escritorio/ancho estrecho. F4 sigue `BLOCKED`, unidad `WAITING_USER`; issue #19 `OPEN`, PR #33 `DRAFT`, F2/F3 `ACTIVE`. No hubo tests ni observación en navegador por parte del Verifier.
- 2026-09-27: tras registrar el veredicto, se reemplazaron y releyeron los cuerpos de #19 y PR #33. API confirmó #19 `OPEN`/asignada a `pronficilio`, PR #33 `OPEN`/`DRAFT` con branch head `94c1082e5104e9d26b6c255e520b2f12ea44c1d4`. Ambos cuerpos mantienen F4 `BLOCKED`, AC7 pendiente de observación humana, y no reclaman PASS/cierre.
- 2026-09-27: el usuario respondió exactamente «se ve bien». El Verifier acepta la respuesta como aprobación visual general para AC2 y AC4, sin inferir navegador, dispositivo, ancho, controles o pasos. AC7 permanece `BLOCKED`: falta confirmar si las selecciones conservaron su acción y qué se observó en escritorio/ancho estrecho respecto a inglés visible, recorte y contacto con icono/marco. Unidad `WAITING_USER`; #19 `OPEN`, PR #33 `DRAFT`.
- 2026-09-27: PR #38 se integró a `master` con merge commit `64c1b295fe9586ea05c4e7dc2a713faec948ec24`; GitHub muestra #19 `CLOSED` desde 2026-09-27T23:50:13Z. La unidad pasa a `COMPLETED`; no queda siguiente dueño.
