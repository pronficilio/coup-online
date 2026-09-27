# Idioma español predeterminado y diccionario bilingüe — issue #19

**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `ACTIVE`; F3 `ACTIVE`; F4 `ACTIVE`, con corrección de un hallazgo del Verifier y nueva revisión FINAL pendiente.
**Unidad:** https://github.com/pronficilio/coup-online/issues/19
**Handoff:** `docs/plans/active/issue_19_game_language.md`
**Bitácora:** `docs/plans/log/issue-19.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Siguiente dueño:** Verifier FINAL independiente está preparando el recorrido local para que el usuario inspeccione la corrección; luego reportará su veredicto. El Alquimista no emite PASS.
**Integración:** PR #22 se fusionó parcialmente en `master` con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Luego PR #30 de #21 añadió cinco familias de botones ilustrados con texto inglés; la rama #19 se sincronizó con `origin/master@3313d42` y corrigió las cinco. Antes de abrir la continuación, también integró `origin/master@be93e97` (PR #31/#29) mediante merge `318c119`. Reorquestación documentada: PR de continuación [#33](https://github.com/pronficilio/coup-online/pull/33) está `DRAFT` desde el mismo branch/worktree porque #22 ya está fusionada y el alcance reveló este hallazgo posterior. Esta excepción mantiene una sola rama/worktree activa; la continuación queda pendiente de revisión FINAL y aprobación del usuario antes de merge. No cierra #19 ni acepta F4.

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

### F2 — Traducir la interfaz y preparar el diccionario fijo en español (`ACTIVE`; superficies de PR #23 ya liberadas)

**Pregunta:** ¿puede el cliente mostrar español desde un diccionario bilingüe con `es` como fuente fija y sin ruta para elegir otro idioma?

**Entrada:** inventario F1, glosario aceptado y `origin/master` sincronizado. PR #23 publica la liberación de las rutas previamente compartidas; los cambios de F2 se hacen en el worktree de #19.

**Salida/evidencia:** `translations.json` con claves paralelas `es`/`en`; texto visible del cliente y `CheatSheet.svg` en español; documento con `lang="es"`; metadatos `public/manifest.json` en español; carga por defecto de las cinco ilustraciones de personaje ya traducidas (`duque.webp`, `asesino.webp`, `capitan.webp`, `embajador.webp`, `condesa.webp`); etiquetas españolas superpuestas a los cinco rótulos incrustados de botones de respuesta de `action-buttons/`. Los valores internos que el cliente envía siguen en inglés; solo las etiquetas renderizadas pasan por el diccionario.

**Áreas principales:** `coup-client/src/i18n/`, `coup-client/public/index.html`, `coup-client/public/manifest.json`, `CreateGame.js`, `JoinGame.js`, `game/Coup.js`, `game/PlayerBoard.js`, los componentes F1 ya traducidos y `coup-client/src/assets/`. Las rutas liberadas se localizaron en #19 tras integrar `origin/master@2d82fa1`.

**Coordinación histórica (2026-09-26):** antes de PR #23, lobby/decisiones/tablero y servidor estaban reservados a #14. PR #23 ya está integrada en master y la última tanda sincronizó esa base en el worktree #19; las reservas anteriores ya no aplican a los cambios publicados.

**Tanda aislada 1 completada (2026-09-26; commit principal `4b6b564`, `feat(i18n): issue 19 F2 spanish default and dictionary`; corrección del fallback es-only `c9d5442`):** `translations.json` tiene mapas paralelos `es`/`en` para las cadenas cliente F1, y `src/i18n/index.js` fija la presentación en español sin selector ni fallback al mapa inglés. Se localizaron Home, RulesModal, CheatSheetModal, el encabezado de EventLog, el HTML/manifest y los nodos de texto de CheatSheet.svg. La bitácora y `report_issue_19_F2.md` registran 181 claves con marcadores concordantes y `git diff --check` limpio. `npm ci` y el build de producción completaron; CRA informó avisos ESLint preexistentes en `App.js` y `game/Coup.js`, archivos fuera de esta tanda. No se añadieron ni ejecutaron tests. F2 continúa `ACTIVE`: faltan las rutas compartidas, las ilustraciones que monta PlayerBoard y la validación final.

**Tanda liberada de ReferencePanel (2026-09-26; commit `a63336c`):** después de sincronizar `origin/master` (`c0119cb`, commit de merge `28e1046`), `ReferencePanel.js` se conectó al diccionario mediante 9 claves nuevas con marcadores concordantes. Los textos `es` visibles permanecen iguales; se añadieron equivalentes `en` para etiquetas del grupo, botones, modales, texto alternativo y acciones accesibles de abrir/cerrar. El diccionario ahora contiene 190 claves. La issue #19 se releyó tras esta tanda y sigue `OPEN`; su cuerpo ahora refleja `sync_base`, las 190 claves y el resultado del build. F2 sigue `ACTIVE`: creación/unión, decisiones, tablero y `Coup.js` siguen reservados a #14; F3 continúa `BLOCKED` hasta liberar los emisores del servidor.

**Barrido F2 adicional (2026-09-26 21:30, hora local):** se releyeron #19 y #14 y se recorrieron `App.js` y las superficies no reservadas ya traducidas (`Home`, reglas, ayuda, `EventLog`, `ReferencePanel`). No se encontró otra cadena visible F2 elegible: las cadenas pendientes están en lobby/decisiones/tablero/`Coup.js` bajo reserva #14, las imágenes españolas requieren seleccionar su variante en `PlayerBoard.js` (también reservada), y `g-addLog` pertenece a F3. #14 sigue `OPEN`, sin assignee; su worktree está `ahead 1`, con staging amplio y conflictos `UU` en `Coup.js`, `PlayerBoard.js` y `README_plans.md`. No se modificó ese worktree. El cuerpo de #19 se actualizó y releyó a las 2026-09-27T03:32:06Z para reflejar el hallazgo y la dependencia; #19 continúa `OPEN` y asignada a `pronficilio`. No hubo cambios de producto en este barrido; F2 queda `ACTIVE` y espera coordinación/liberación de #14.

**Liberación confirmada (2026-09-27):** PR #23 está publicada en `origin/master@2d82fa1` y el merge de #19 es `74432a6`. Las rutas `CreateGame.js`, `JoinGame.js`, `ActionDecision.js`, `Coup.js`, `PlayerBoard.js`, demás componentes de decisión y `server/game/coup.js` quedaron integradas en master. La tanda #19 trabaja sobre esos archivos integrados, sin trasladar cambios locales desde el worktree #14.

**Tanda actual posterior a PR #23:** lobby/decisiones/tablero están en español mediante el mapa `es`; PlayerBoard carga las cinco imágenes de personaje españolas. `translations.json` contiene 307 claves espejo `es`/`en`, con placeholders concordantes. Se añadió el helper de lobby para presentar códigos internos como mensajes localizados y se tradujeron las decisiones a partir de `decision.type`/`choiceId` sin cambiar protocolo.

**Criterio de parcialidad:** los commits incrementales de F2 pueden contener solo las superficies autorizadas. No declarar F2 `CLOSED` ni tratar la rama como aceptada hasta completar las rutas reservadas, actualizar el inventario/diccionario por cualquier texto nuevo y satisfacer la validación de F2. Reorquestación aprobada explícitamente por el usuario (2026-09-27) permitió integrar PR #22 parcialmente en `master` para revisión incremental mientras F4 estaba bloqueada; PR #22 se fusionó con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. El merge no satisface criterios, no cierra F2/F3/F4 ni issue #19, y no reemplaza el Verifier FINAL.

**Hallazgo tardío de assets y corrección en curso (2026-09-27):** al revisar `origin/master@3313d42` tras la fusión de #22 se encontraron cinco familias usadas por `Coup.js` cuyo arte normal y activo muestra `BLOCK ASSASSINATION`, `BLOCK FOREIGN AID`, `BLOCK STEAL`, `CHALLENGE` y `PASS`. El Verifier reportó `FAIL` para AC1/AC2/AC4/AC7 por esos rótulos; AC3/AC5/AC6 pasaron. `claim.webp` y `claim-active.webp` contienen `CLAIM`, pero no tienen importaciones ni referencias en `coup-client/src` y no se usan en la UI actual; se registran como dormidos. F2 agrega el hallazgo al inventario y conecta las cinco etiquetas a las claves `es`/`en` ya existentes. `ResponseImageButton` cubre el texto incrustado con una etiqueta española, preservando marco/icono y estados activo/inactivo. La lógica, los IDs y el protocolo permanecen intactos. Esta tanda requiere build y revisión visual/Verifier; F2 y F4 siguen `ACTIVE`, sin declaración de aceptación.

**Avanzar:** recorridos del cliente muestran etiquetas, decisiones y ayudas en español; ambos mapas tienen la misma estructura; solo se importa `es`; no existe selector, detección ni persistencia.
**Pivotar:** si una etiqueta dinámica no cabe en un string de diccionario sin cambiar el payload, usar marcadores nombrados en presentación.
**Repetir:** una corrección localizada por clave o contexto que falle la revisión.
**Bloquear/cancelar:** conflicto sin resolver con #14/#18, cambio requerido en reglas/protocolo o término que requiera aprobación de producto.
**Commit:** `COMMIT_REQUIRED`; `feat(i18n): issue 19 F2 spanish default and dictionary`.
**Validación:** build de cliente, revisión de paridad de claves y recorrido manual; no añadir ni ejecutar tests.

### F3 — Traducir mensajes de partida emitidos por el servidor (`ACTIVE`; archivos liberados por PR #23)

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

### F4 — Cerrar cobertura y revisión independiente (`ACTIVE`)

**Pregunta:** ¿la implementación satisface los criterios y no dejó texto en inglés visible ni una forma de seleccionar inglés?

**Entrada:** inventario F1, reportes/diff F2-F3, build y recorrido manual documentados para revisión independiente.

**Salida/evidencia:** reporte final con correspondencia inventario→diccionario/interfaz, comparación de claves y marcadores, build de producción y recorrido manual de portada, lobby y partida; revisión FINAL independiente con `PASS`, `FAIL` o `BLOCKED`.

**Falsificación para Verifier:** buscar por rutas normales cualquier inglés visible o accesible; intentar hallar una preferencia/selector/detección que active `en`; confirmar que las claves, marcadores y nombres/payloads de juego no cambiaron.

**Revisión independiente anterior:** el Verifier informó `FAIL` en AC1/AC2/AC4/AC7 al encontrar texto inglés incrustado en las cinco familias de botones usadas; informó `PASS` en AC3/AC5/AC6. La corrección puntual está en curso y exige nueva revisión visual independiente. El reporte previo del usuario (recorrido de portada, lobby y partida completa, todo en orden) se conserva como cita de su experiencia, sin inferir dispositivo/navegador/pasos ni convertirlo en veredicto.

**Avanzar:** criterios AC1–AC7 sustentados y Verifier `PASS`; dejar la unidad `WAITING_ORCHESTRATOR` para revisión de PR #33.
**Pivotar:** devolver a F2/F3 solo el criterio refutado con reproducción concreta.
**Repetir:** una ronda focalizada tras una corrección y repetir el chequeo del criterio afectado.
**Bloquear/cancelar:** falta entorno de recorrido/build o permanece una dependencia de #14/#18 sin liberar.
**Commit:** `COMMIT_REQUIRED`; `docs(i18n): issue 19 F4 CLOSED ready_for_review`.
**Validación:** verificación independiente FINAL; no añadir ni ejecutar tests automatizados.

**Comprobación de entorno anterior (2026-09-27):** en el worktree #19 no se encontraron `chromium`, `chromium-browser`, `google-chrome`, `google-chrome-stable`, `chrome` ni `firefox` en `PATH`; `coup-client/package.json` no declara Playwright/Puppeteer/WebDriver. En ese entorno no se inició recorrido ni se instaló nada; F4 quedó `BLOCKED`. Después el usuario informó haber recorrido portada, lobby y una partida completa, y dijo que todo se veía en orden. No informó navegador, dispositivo, pasos específicos ni capturas; no se infieren. F4 está ahora `ACTIVE`, pendiente del Verifier FINAL independiente, sin veredicto todavía.

## Topología, riesgos y decisiones

El issue #19 sigue abierto y está asignado a `pronficilio` en el fork. PR #22 se fusionó a `master` mediante `5de95ee`; el worktree canónico #19 se sincronizó por fast-forward desde `ca16e42` hasta `origin/master@3313d42` y luego integró `origin/master@be93e97` con merge `318c119`. El usuario autorizó la integración parcial para revisión incremental; no equivale a aceptación F4 ni al cierre de la issue.

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
- 2026-09-27: el usuario informó exactamente que recorrió portada, lobby y partida completa y que ve todo en orden. Sin detalles de navegador/dispositivo/pasos. F4 `ACTIVE`, pendiente del Verifier independiente; F2/F3 siguen `ACTIVE`, sin cierre ni PASS.
