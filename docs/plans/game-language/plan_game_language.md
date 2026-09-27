# Idioma español predeterminado y diccionario bilingüe — issue #19

**Estado:** `ACTIVE`; F1 `CLOSED`; F2 `ACTIVE` para superficies sin colisión y pendiente en rutas compartidas; F3 `BLOCKED` por #14; F4 `PENDING`.
**Unidad:** https://github.com/pronficilio/coup-online/issues/19
**Handoff:** `docs/plans/active/issue_19_game_language.md`
**Bitácora:** `docs/plans/log/issue-19.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Siguiente dueño:** Alquimista para avanzar F2 en el alcance aislado confirmado; el Orquestador coordinará después las rutas compartidas.
**Integración única esperada:** `issue/19-spanish-default-dictionary` en `.worktrees/issue-19-spanish-default-dictionary`, una PR a `master`.

## Solicitud y definición de éxito

La solicitud es identificar las palabras en inglés del código, establecer el español como idioma predeterminado y preparar un archivo con traducciones para una futura opción de cambio de idioma. En esta unidad se traducen los textos de cara a quien juega y se prepara el diccionario; no se implementa selector ni cambio de idioma.

Éxito significa que las pantallas, mensajes, ayudas, textos accesibles y recursos gráficos usados por la interfaz aparecen en español; que hay entradas estables en inglés y español con parámetros equivalentes; y que no se cambia la lógica de Coup ni el protocolo entre cliente y servidor.

## Hechos confirmados, supuestos y fuentes

- El repositorio `coup-online` usa `master` como base, `origin` apunta al fork `pronficilio/coup-online`, GitHub es el tracker y el aislamiento local es un worktree por issue.
- El cliente es React 16/Create React App en `coup-client/`; el servidor Socket.IO/Node está en `server/`.
- La auditoría F1 confirmó cadenas visibles en `Home.js`, `CreateGame.js`, `JoinGame.js`, `RulesModal.js`, `CheatSheetModal.js`, componentes de decisión, `Coup.js` y `EventLog.js`; `CheatSheet.svg` y las cinco ilustraciones de personaje cargadas en `PlayerBoard.js` tienen texto inglés. `coup-client/public/index.html` declara `lang="en"` y `public/manifest.json` incluye nombre y descripción ingleses.
- `server/index.js` y `server/game/coup.js` envían mensajes ingleses mediante `g-addLog`; el cliente los muestra en el registro. `PlayerBoard.js` y `ReferencePanel.js` tienen etiquetas accesibles en español, pero el tablero carga cinco ilustraciones inglesas aunque existen variantes españolas. La referencia de juego muestra `card-es.webp` y `table-es.webp`; las variantes `en` no están cargadas.
- La issue #14 está abierta y su plan documenta cambios pendientes del lobby y de `server/game/coup.js`/`server/index.js`. Esas superficies se solapan con la traducción. La issue #18 sigue abierta, pero su PR #20 se fusionó en `origin/master` como `64a507d`; `ReferencePanel.js`/`.css` quedaron liberados. `Coup.js` sigue reservado por #14. #13 trata de despliegue y queda fuera de esta unidad.
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

### F2 — Traducir la interfaz y preparar el diccionario fijo en español (`ACTIVE` en superficies aisladas; rutas compartidas reservadas)

**Pregunta:** ¿puede el cliente mostrar español desde un diccionario bilingüe con `es` como fuente fija y sin ruta para elegir otro idioma?

**Entrada:** inventario F1, glosario aceptado y la base de #19. El trabajo empieza en archivos sin cambios en #14/#18; se sincroniza la base y se obtiene liberación de rutas compartidas antes de editarlas.

**Salida/evidencia:** `translations.json` con claves paralelas `es`/`en`; texto visible del cliente y `CheatSheet.svg` en español; documento con `lang="es"`; metadatos `public/manifest.json` en español; carga por defecto de las cinco ilustraciones de personaje ya traducidas (`duque.webp`, `asesino.webp`, `capitan.webp`, `embajador.webp`, `condesa.webp`). Los valores internos que el cliente envía siguen en inglés; solo las etiquetas renderizadas pasan por el diccionario.

**Áreas principales:** `coup-client/src/i18n/`, `coup-client/public/index.html`, `coup-client/public/manifest.json`, `coup-client/src/components/`, `coup-client/src/assets/CheatSheet.svg`, `coup-client/src/assets/characters/` y el reporte F2. Cargar las variantes españolas existentes en `PlayerBoard.js`; coordinar primero cualquier edición de superficies compartidas.

**Coordinación y archivos autorizados ahora (2026-09-27):** la inspección de worktrees confirmó cambios activos de #14 en componentes de lobby/decisión y rutas de servidor; la PR #20 de #18 se fusionó en `origin/master` como `64a507d`, liberando `ReferencePanel.js`/`.css`. `Coup.js` sigue reservado por #14. La tanda actual ya estaba acotada a `coup-client/src/i18n/**`, `Home.js`, `RulesModal.js`, `CheatSheetModal.js`, `EventLog.js`, `public/index.html`, `public/manifest.json`, `CheatSheet.svg` y el reporte F2; no sincronizará la base ni editará rutas recién liberadas. La siguiente tanda debe sincronizarse con `origin/master` actualizado antes de usar `ReferencePanel`. F2 seguirá abierta hasta actualizar los componentes aún reservados y auditar textos nuevos que entren con #14.

**Tanda aislada 1 completada (2026-09-26; commit `feat(i18n): issue 19 F2 spanish default and dictionary`):** `translations.json` tiene mapas paralelos `es`/`en` para las cadenas cliente F1, y `src/i18n/index.js` fija la presentación en español sin selector. Se localizaron Home, RulesModal, CheatSheetModal, el encabezado de EventLog, el HTML/manifest y los nodos de texto de CheatSheet.svg. La bitácora y `report_issue_19_F2.md` registran 181 claves con marcadores concordantes y `git diff --check` limpio. `npm ci` y el build de producción completaron; CRA informó avisos ESLint preexistentes en `App.js` y `game/Coup.js`, archivos fuera de esta tanda. No se añadieron ni ejecutaron tests. F2 continúa `ACTIVE`: faltan las rutas compartidas, las ilustraciones que monta PlayerBoard y la validación final.

**Rutas reservadas, no editar en F2 todavía:** #14 conserva `coup-client/src/components/CreateGame.js`, `coup-client/src/components/JoinGame.js`, `coup-client/src/components/game/ActionDecision.js`, `BlockChallengeDecision.js`, `BlockDecision.js`, `ChallengeDecision.js`, `ChooseInfluence.js`, `Coup.js`, `ExchangeInfluences.js`, `PlayerBoard.js` y `RevealDecision.js`; los últimos nueve archivos están bajo `coup-client/src/components/game/`. #18 ya liberó `ReferencePanel.js`/`.css` al fusionar `64a507d`; la siguiente tanda debe sincronizar el worktree con `origin/master` y registrar `sync_base` antes de editarlos. No sincronizar ni editar rutas reservadas dentro de esta tanda. F3 permanece bloqueada hasta que #14 libere `server/index.js` y `server/game/coup.js`.

**Criterio de parcialidad:** los commits incrementales de F2 pueden contener solo las superficies autorizadas. No declarar F2 `CLOSED`, no abrir PR ni entregar integración hasta completar las rutas reservadas, actualizar el inventario/diccionario por cualquier texto nuevo y satisfacer la validación de F2. La integración sigue siendo una única PR de #19.

**Avanzar:** recorridos del cliente muestran etiquetas, decisiones y ayudas en español; ambos mapas tienen la misma estructura; solo se importa `es`; no existe selector, detección ni persistencia.
**Pivotar:** si una etiqueta dinámica no cabe en un string de diccionario sin cambiar el payload, usar marcadores nombrados en presentación.
**Repetir:** una corrección localizada por clave o contexto que falle la revisión.
**Bloquear/cancelar:** conflicto sin resolver con #14/#18, cambio requerido en reglas/protocolo o término que requiera aprobación de producto.
**Commit:** `COMMIT_REQUIRED`; `feat(i18n): issue 19 F2 spanish default and dictionary`.
**Validación:** build de cliente, revisión de paridad de claves y recorrido manual; no añadir ni ejecutar tests.

### F3 — Traducir mensajes de partida emitidos por el servidor (`BLOCKED` hasta liberar los archivos compartidos)

**Pregunta:** ¿los mensajes ingleses del registro de eventos pueden aparecer en español sin alterar el protocolo ni la resolución de acciones?

**Entrada:** inventario F1, esquema del diccionario F2 y cambios ya integrados/coordinados de #14.

**Salida/evidencia:** plantillas en español para mensajes de `g-addLog` que ve la persona que juega; entradas espejo `es`/`en` con los mismos marcadores en el diccionario; reporte que confirme que `g-addLog` sigue siendo un string y que valores dinámicos/tarjetas siguen sin alteración.

**Áreas principales:** literales de presentación en `server/index.js` y `server/game/coup.js`; revisión de `Coup.js`/`EventLog.js` sin cambios de transporte. No traducir `console.log`, valores de acción, cartas ni enums.

**Avanzar:** el registro de partida usa español en acciones, desafíos, bloqueos, pérdidas de influencia y desconexiones; nombres de jugadores y términos internos conservan su valor; el payload/socket permanece compatible.
**Pivotar:** si para localizar un mensaje hace falta reestructurar el protocolo, detenerse y proponer una reorquestación; no cambiar el protocolo aquí.
**Repetir:** una corrección por plantilla/marcador reproducible.
**Bloquear/cancelar:** la superficie siga ocupada por #14 o dependa de un cambio de protocolo fuera de alcance.
**Commit:** `COMMIT_REQUIRED`; `feat(i18n): issue 19 F3 spanish game log messages`.
**Validación:** inspección de los emisores y reproducción manual de mensajes disponibles sin modificar las decisiones; `git diff --check`; no añadir ni ejecutar tests.

### F4 — Cerrar cobertura y revisión independiente (`PENDING`)

**Pregunta:** ¿la implementación satisface los criterios y no dejó texto en inglés visible ni una forma de seleccionar inglés?

**Entrada:** F1–F3 cerradas, diff consolidado y build/recorridos documentados.

**Salida/evidencia:** reporte final con correspondencia inventario→diccionario/interfaz, comparación de claves y marcadores, build de producción y recorrido manual de portada, lobby y partida; revisión FINAL independiente con `PASS`, `FAIL` o `BLOCKED`.

**Falsificación para Verifier:** buscar por rutas normales cualquier inglés visible o accesible; intentar hallar una preferencia/selector/detección que active `en`; confirmar que las claves, marcadores y nombres/payloads de juego no cambiaron.

**Avanzar:** criterios AC1–AC7 sustentados y Verifier `PASS`; dejar la unidad `WAITING_ORCHESTRATOR` para revisión de la única PR.
**Pivotar:** devolver a F2/F3 solo el criterio refutado con reproducción concreta.
**Repetir:** una ronda focalizada tras una corrección y repetir el chequeo del criterio afectado.
**Bloquear/cancelar:** falta entorno de recorrido/build o permanece una dependencia de #14/#18 sin liberar.
**Commit:** `COMMIT_REQUIRED`; `docs(i18n): issue 19 F4 CLOSED ready_for_review`.
**Validación:** verificación independiente FINAL; no añadir ni ejecutar tests automatizados.

## Topología, riesgos y decisiones

El issue #19 sigue abierto y está asignado a `pronficilio` en el fork; se releyó tras el claim y no había asignación incompatible. Se creó `issue/19-spanish-default-dictionary` desde `origin/master` actualizado y el worktree canónico `.worktrees/issue-19-spanish-default-dictionary` quedó verificado. El handoff ya pasó de `inbox/` a `active/`. Todo el trabajo de la unidad, incluidos commits F1–F4, va en esa rama y culmina en una única PR a `master`.

Riesgo principal: textos de servidor/protocolo y código de #14 comparten componentes de lobby y `Coup.js`. La PR #20 de #18 ya se integró y libera `ReferencePanel.js`/`.css`, pero no sincronizar la base a mitad de esta tanda. La mitigación es separar auditoría de solo lectura y bloquear edición de las rutas que siguen reservadas. No cambiar reglas, enums o payloads para traducir etiquetas. Riesgo secundario: una traducción de acción/tarjeta puede cambiar significado; aplicar el glosario y referencias españolas existentes.

## Historial de decisiones

- 2026-09-26: crear unidad `FULL/MEDIUM/FINAL` porque incluye inventario y traducción transversal del cliente, servidor y recursos, con revisión independiente final.
- 2026-09-26: usar `es` fijo y conservar `en` en diccionario; no implementar selección, detección o persistencia.
- 2026-09-26: F1 queda independiente de #14; F2/F3 requieren coordinación por solapamiento de archivos.
- 2026-09-26: la issue #18 también requiere coordinación para F2 porque monta `ReferencePanel` dentro de `Coup.js`.

- 2026-09-26: F1 confirmó texto inglés en `CheatSheet.svg`, cinco ilustraciones de personaje usadas por `PlayerBoard.js`, metadatos de `public/index.html` y nombres de instalación en `public/manifest.json`; F2 incluye las variantes gráficas españolas existentes y el manifest. F1 queda cerrada.
- 2026-09-27: la inspección de los worktrees #14/#18 precisó los archivos en colisión. F2 avanza en las superficies aisladas enumeradas arriba; los componentes modificados por esas unidades quedan reservados hasta liberar/integrar sus ramas. F3 espera la liberación de #14.
- 2026-09-27: durante la tanda aislada F2, el Orquestador confirmó que PR #20 de #18 se fusionó como `64a507d` y liberó `ReferencePanel.js`/`.css`; #18 sigue abierta y `Coup.js` continúa reservado por #14. El worktree #19 no se sincronizó en esta tanda; la siguiente sincronizará `origin/master` antes de editar las rutas liberadas.
