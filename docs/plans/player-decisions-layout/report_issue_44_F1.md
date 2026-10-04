# Issue #44 — F1: diagnóstico geométrico desktop y mapa del renderer

**Fecha:** 2026-09-28
**Branch/base:** `issue/44-player-decisions-layout`, sincronizado con `origin/master@2ef09de`
**Veredicto F1:** `CLOSED (PASS)` para el diagnóstico geométrico desktop. Las capturas DOM son evidencia dinámica aportada por el usuario, no reproducida por el agente. La matriz dinámica exhaustiva se mantiene en F3; no se afirma cobertura completa de botones.
**Alcance:** solo lectura de producto; sin tests automatizados.

## Resumen

La causa geométrica principal queda apoyada por dos mediciones DOM aportadas por el usuario en viewport 1247 × 563 CSS px: `.PlayerBoardContainer` conserva una caja cuadrada de 900 × 900, mientras la sección comienza 118 px bajo el borde visual inferior del tablero y 122–123 px bajo las influencias propias. Las dos capturas, con distinto `scrollY`, dan las mismas coordenadas de documento. El `transform` CSS calculado para ese viewport es aproximadamente −102.45 px y no reduce la caja de flujo; por tanto explica la mayor parte de la discrepancia visible. Los rectángulos DOM ya incorporan transform/translate; no deben tratarse como cajas sin transformar. La posición local habitual está en `top: 86%` del tablero.

En estas capturas (1247 px de ancho), los triggers de `ReferencePanel` aparecen en y=491–543 en ambas aunque el scroll difiere, coherente con `position: fixed`; no reservan altura de flujo y no explican este hueco. La regla de hasta 1199 px que los vuelve estáticos sí puede añadir cerca de 72 px en viewports estrechos, pero no aplica a estas mediciones. Entre el borde visual del tablero y la sección hay 118 px; los ~102.45 px del `transform` base explican la mayor parte, quedando ~15.5 px entre la posición contrafactual del borde sin ese transform y la sección. Ese remanente requiere inspeccionar los estilos calculados/márgenes del flujo para atribuirlo exactamente. En A, el contenedor de botones empieza unos 194–195 px después del borde inferior de las influencias: cerca de 72 px corresponden al título/descripción y queda aproximadamente el mismo espacio previo a la sección. Los botones estándar tienen además margen superior CSS de 20 px, sujeto a márgenes colapsados/layout real.

En la base actual, los paneles `action` y `exchange` usan `createPortal` a `document.body` dentro del único `ActionDecisionRail`, posicionado con coordenadas del ancla oculta de Cheat Sheet en la cabecera; `exchange` fue añadido a este rail por #47. Sus paneles tienen scroll propio con `max-height`. Las otras decisiones se dibujan en `.DecisionsSection`. Mover solo esta sección no resolvería action/exchange; insertar directamente hijos dentro de `PlayerBoardContainer` los expondría a su caja cuadrada, contexto de apilamiento y geometría circular.

## Evidencia y límite de medición

Hallazgos de fuente estática revisados en `origin/master@2ef09de` (rebase de #44 completado antes del veredicto). Entre `db1d22c` y esta base, la geometría CSS del tablero y de ReferencePanel no cambió; #47 sí modificó `Coup.js`, `CoupStyles.css` y `server/game/coup.js` para la UI de Exchange, actualizada en la matriz inferior.

- `coup-client/src/components/game/PlayerBoardStyles.css`: caja cuadrada, margen 12 px, `transform` responsive (`max-width: 520px`, `521–1023px`, regla base) y un `translate: 0 -6.88%` adicional para cinco asientos. Ni `transform` ni `translate` cambian el flujo normal.
- `coup-client/src/components/game/playerBoardLayout.js`: asiento local se ordena primero y sus coordenadas estándar son `left: 50%, top: 86%`; en otros conteos se deriva de un anillo.
- `coup-client/src/components/game/Coup.js`: árbol de render con tablero, `ReferencePanel`, sección de decisiones y portal del rail de acción; estados de socket y elegibilidad de render.
- `coup-client/src/components/game/CoupStyles.css` y `ReferencePanel.css`: `.DecisionsSection button` conserva `margin: 20px 20px 0`; los triggers de referencia cambian de fixed a normal flow bajo 1200 px.
- `server/game/coup.js`: construcción de decisiones, filtro de asientos vivos, opciones por asiento, emisión individual y aceptación/rechazo.

### Medición dinámica aportada por el usuario

No pude reproducir las capturas en este entorno. El usuario aportó medidas de `getBoundingClientRect()` para dos capturas del mismo viewport de escritorio (1247 × 563); se registran como **evidencia dinámica proporcionada, no reproducida por el agente**. El usuario confirma que A es una partida de dos jugadores durante una decisión Challenge/Block y que B representa el estado sin botones posterior al cierre. No identificó el subtipo exacto Challenge frente a Block ni aportó conteo de botones. Posiciones `top`/`bottom` indicadas en viewport se convierten a documento sumando `scrollY`.

| Elemento | Captura A (`scrollY=168`) | Captura B (`scrollY=82`) | Lectura |
|---|---:|---:|---|
| `.PlayerBoardContainer` | top −174, bottom 726, h 900 → doc top −6, bottom 894 | top −88, bottom 812, h 900 → doc top −6, bottom 894 | Caja pintada tiene idéntica posición de documento y tamaño cuadrado; DOMRect incluye desplazamiento CSS. |
| Influencias propias | bottom 721 → doc bottom 889 | bottom 808 → doc bottom 890 | El asiento/carta local coincide dentro de 1 px entre capturas. |
| `.DecisionsSection` | top 844 → doc top 1012 | top 930, h 20 → doc top 1012 | La sección comienza 118 px después del borde visual inferior del tablero en ambas. |
| `.DecisionButtonsContainer` | top 916 → doc top 1084 | No aparece; el usuario confirma estado posterior al cierre, sin botones | En A, el contenedor está 195 px bajo el borde de influencias (1084−889) o 194 px (1084−890); el tramo sección→contenedor es 72 px. |
| Triggers de `ReferencePanel` | top 491, bottom 543 | top 491, bottom 543 | Coordenada constante en viewport pese a distinto scroll; coherente con `position: fixed`, fuera del flujo en este ancho. |

El cálculo CSS base a 1247 × 563 es `min(-40px, 108px - 15vh - min(14vw, 126px)) = min(-40px, -102.45px) = -102.45px`. El usuario confirmó que A corresponde a dos jugadores, por lo que no aplica la regla adicional `translate: 0 -6.88%` de cinco asientos. Como `getBoundingClientRect()` incluye transform, el borde inferior de flujo estimado es docY≈996.45 (894 + 102.45), unos 15.55 px antes de la sección en docY=1012. Los 12 px de margen inferior declarado en `.PlayerBoardContainer` son compatibles con la mayor parte de ese remanente; los ~3.55 px restantes requieren confirmar estilos calculados/offsets exactos.

La sección empieza en docY=1012 en ambas capturas y el trigger del ReferencePanel conserva docY variable pero viewportY fijo; por ello la hipótesis de que el `ReferencePanel` aporta el hueco en este viewport queda refutada. El espacio se sostiene principalmente por la caja cuadrada en flujo y el desplazamiento pintado del tablero; el remanente exacto queda por verificar con estilos/márgenes calculados.

**Preview disponible; reproducción del agente y cobertura dinámica global pendientes.** Según el Orquestador, el frontend `http://localhost:3109` responde HTTP 200 y el backend Coup en `localhost:18000` completó el handshake de socket. El agente no dispone de automatización/browser para recorrer la UI, por lo que A/B siguen siendo medidas aportadas por el usuario. A es 2p; el subtipo Challenge vs Block, labels exactos y cantidad de botones no fueron identificados. Estos límites no bloquean el diagnóstico causal desktop de F1; la auditoría dinámica completa de decisiones/estados se mantiene en F3. El comportamiento responsive no fue medido aquí y se validará como consecuencia en F2/F3, no como precondición para iniciar el ajuste desktop tras despejar dependencias.

## Matriz de decisiones y controles

La autoridad de disponibilidad es `decision.options` que el servidor envía a cada humano elegible. El servidor filtra asientos eliminados antes de abrir la decisión; `activateDecision` emite solo al jugador humano cuya clave aparece en `allowed` y aún no respondió. No crea opciones a partir del estado del cliente.

| Tipo recibido | Asiento elegible según servidor | Opciones y control esperado según fuente | Renderer y habilitación local | Evidencia |
|---|---|---|---|---|
| `action` | Jugador vivo cuyo asiento es `currentPlayer`. | Menos de 10 monedas: `income`, `foreign_aid`, `tax`, `exchange`, objetivos vivos para `steal`; añade `assassinate:<seat>` desde 3 monedas y `coup:<seat>` desde 7. Con 10 o más: solo `coup:<seat>` contra otros vivos. | Panel único `ActionDecisionRail` portalizado; agrupa choiceIds recibidos y solo monta renglones con opciones. Acciones dirigidas abren botones por cada option/target y Cancel. La solicitud se valida contra objeto incluido en `decision.options`; panel/targets quedan deshabilitados tras envío o pausa. | Estática: `actionChoices`, `activateDecision`, `renderActionDecision`, `submitActionChoice`. |
| `claim` | No aplica. | No existe `openDecision({type:'claim'})`: `claim` es un evento de historial cuando se afirma un rol. No debe aparecer un botón de Claim. | Ningún control independiente. La posibilidad de desafiar aparece como decisión `challenge`. | Estática: `afterActionClaim` y llamada a `openChallengeWindow`. |
| `challenge` | Todos los asientos vivos excepto quien hizo la afirmación. | Por elegible, `challenge` y `pass`. | `.DecisionsSection`; Challenge y Pass usan `ResponseImageButton`. Un jugador sin opción no recibe `g-decision`. Los botones se deshabilitan mientras `submitted` o `gamePaused`. | Estática: `openChallengeWindow`, `responseButtonFor`, `DecisionsSection`. |
| `block` | Para Foreign Aid, todos los demás asientos vivos; para Assassinate o Steal, solo el objetivo vivo. | Pass más bloqueos definidos para la acción: `block:duke` (Foreign Aid), `block:contessa` (Assassinate), `block:ambassador` y `block:captain` (Steal). | `.DecisionsSection`; Pass y cada rol reconocido usan arte gráfico. Cada choiceId del servidor produce un botón y comparte disabled de envío/pausa. | Estática: `BLOCKS`, `openBlockWindow`, `responseButtonFor`. |
| `block_challenge` | Todos los asientos vivos excepto quien declaró el bloqueo. | `challenge` y `pass`. | Mismo renderer gráfico de `challenge`; solo quien recibió la opción ve esos controles. | Estática: `challengeBlock`, `responseButtonFor`. |
| `prove_claim` | Solo el dueño vivo de la afirmación, sea acción o bloqueo. | Un `prove:<card>:<index>` por carta propia que cumple el rol reclamado y `concede`. Para el bloqueo de Captain/Ambassador admite ambas cartas. | `.DecisionsSection`, botón textual localizado por option; prueba no ofrecida para una carta que el servidor no incluyó. Se deshabilita tras envío/pausa. | Estática: `openProofDecision`, `localizeOptionLabel`. |
| `lose_influence` | Solo el asiento vivo que debe perder una influencia. | Un `lose:<index>` por cada influencia que aún conserva; normalmente una o dos. | `.DecisionsSection`, botón textual por option/carta; puede mostrar una o dos opciones. Se deshabilita tras envío/pausa. | Estática: `loseInfluence`, `localizeOptionLabel`. |
| `exchange` | Solo el actor vivo que usó Exchange y conserva influencias. | El servidor genera selecciones de `keepCount` slots sobre mano + dos cartas y deduplica por conjunto de roles; cada opción enviada incluye `choiceId` y roles. El mensaje incluye slots privados con `original`. | Igual que action, se monta en `ActionDecisionRail` portalizado. `ExchangeDecisionPanel` muestra botones de cartas por slot, selección inicial de las cartas originales y un botón único de confirmar; este resuelve una opción real por firma de roles. Disabled durante envío/pausa o si no hay opción coincidente. Con dos influencias hay 6 combinaciones posicionales antes de deduplicar roles; con una, 3. | Estática en base `2ef09de`: `openExchange`, payload de `activateDecision`, `ExchangeDecisionPanel`; estado visual no reproducido. |

El cliente localiza etiquetas de acción/respuesta y roles de Exchange. En Exchange, el servidor ya no envía una etiqueta textual por cada combinación: el panel etiqueta cada slot (rol + carta original/draw) y el botón de confirmar resume la selección, resolviendo su `choiceId` desde opciones existentes. La prueba exhaustiva de lo que ve cada asiento y estado se realiza en F3.

## Matriz de estados y alcance de evidencia

Esta tabla describe comportamiento deducible de la fuente; **no acredita que los escenarios se hayan recorrido en vivo**.

| Estado/caso | Resultado estático esperado | Evidencia / observación |
|---|---|---|
| Antes de `g-decision` | Sección muestra espera; no hay botones de decisión. Action rail solo se monta con tipo action. | Estática; no reproducido. |
| Captura A aportada | Partida de 2 jugadores durante una decisión Challenge o Block; `.DecisionButtonsContainer` existe. | Dinámica aportada; el usuario confirmó partida de 2 jugadores y decisión Challenge/Block, pero falta identificar subtipo exacto, cantidad/texto de botones y elegibilidad; no reproducida por el agente. |
| Captura B aportada | Estado posterior al cierre, sin botones; `.DecisionsSection` mide 20 px y no aparece `.DecisionButtonsContainer`. | Dinámica aportada y contexto de cierre confirmado por usuario; no reproducida por el agente. |
| Acción propia | Rail único portalizado; renglones derivados de opciones disponibles. | Estática; no reproducido con conteos de 2–6. |
| Respuesta local elegible | Server emite opciones solo al humano elegible; control por option. | Estática; no recorrido por `challenge`, `block`, `block_challenge`. |
| Otro jugador sin elegibilidad | No se emite `g-decision`, por lo que el cliente no debe mostrar sus botones. | Estática en servidor. El componente no tiene filtro `isSpectator` alrededor de la sección normal; depende del contrato de no emitir. No reproducido. |
| Espectador | El servidor no le incluye en `allowed`; cliente no debería recibir decisión. En `PlayerBoard`, no tiene cartas privadas propias. | Estática. No reproducido. |
| Jugador eliminado | Se elimina de `eligibleSeats`; no recibe nuevas decisiones; influencias quedan en cero y se omite en `advanceTurn`. | Estática. No reproducido con eliminación local/espectador. |
| Envío aceptado | `g-decisionAccepted` activa `submitted`; los controles quedan deshabilitados hasta `g-decisionClosed`. | Estática cliente/servidor. No reproducido. |
| Rechazo/error | Cliente restablece `submitted=false`, muestra alerta traducida; permite reintentar si decision sigue vigente. | Estática. No se forzaron rechazos. |
| Decisión cerrada/cambiada | `g-decisionClosed` solo limpia decisión coincidente por id; quita rail y botones. Nueva decisión limpia estado previo. | Estática. No reproducido. |
| Pausa con dueño de timeout / pausa sin recuperación | `g-gamePaused` limpia decision y rail; overlay puede mostrar Reanudar solo a dueño. Otros muestran espera o overlay según `showOverlay`. | Estática. No temporizador ni pausa manual ejecutados. |
| Reanudación | Server reactiva decisión pendiente y la vuelve a emitir; cliente quita overlay y devuelve foco a control previo o sección. | Estática. No reproducido. |
| Fin de partida / revancha | `g-gameOver` limpia decisión/rail; muestra ganador. Revancha solo aparece después de `g-canPlayAgain` si cliente es líder. | Estática. No reproducido. |
| Desconexión de cliente | Evento socket `disconnect` muestra aviso de conexión; desconexión de participante lleva a `g-gameDissolved` y pantalla terminal. | Estática. No desconectado en vivo. |

El requisito amplio de auditoría de issue #44 no está cubierto dinámicamente: pendiente recorrido con tableros de 2–6 participantes, móvil y escritorio, cada tipo de respuesta, estado enviado/rechazado, espectador/eliminado, espera, pausa/reanudación, game over y desconexión. No se afirma que hoy el DOM muestre correctamente todos los casos.

## Evaluación de ubicación

| Criterio | Hermano dentro de un layout compartido | Hijo directo de `.PlayerBoardContainer` |
|---|---|---|
| `aspect-ratio` y altura | La caja cuadrada del tablero conserva su contrato; un wrapper puede reservar espacio de controles según estrategia medida. | El contenido puede exceder/forzar el sizing preferido de la caja cuadrada; la interacción no está medida. |
| Clipping/transform | Un sibling fuera de la caja evita el overflow recortado por futuros cambios de tablero; su coordenada puede anclarse al asiento mediante layout común. | El contenedor no declara `overflow:hidden` ahora, pero controles heredarían transform y aislamiento; una regla de clipping posterior los cortaría. |
| Apilamiento | Wrapper propio puede ordenar controles sobre asiento explícitamente sin alterar capas internas de centro/cartas. | `PlayerBoardContainer` crea stacking context por `isolation:isolate` y transform; el z-index queda restringido a ese contexto. |
| Scroll y alto variable | Un layout compartido puede dar scroll solo al rail (ya existe `max-height` en action rail) y mantener el tablero. | Crece contenido dentro del área cuadrada o se superpone; en móvil puede tapar tablero/cartas y requiere medir cada conteo. |
| Accesibilidad/tab order | Sibling en orden DOM junto a board conserva un orden secuencial comprensible y un `aria-live` propio. | Puede mezclar navegación de decisiones con controles de cartas/tablero si hay acciones futuras; requiere landmarks y foco definidos. |
| Action rail existente | Permite mantener un solo rail, cambiando solamente su anclaje/host cuando se implemente F2. | Portalizar dentro del nodo transformado cambia containing block/stacking para `position:absolute`/`fixed`; mantenerlo en body exigiría puente de coordenadas. |

**Recomendación F1:** no montar los controles como hijos directos del `PlayerBoardContainer`. Mantenerlos como hermanos del tablero dentro de una capa/layout compartido anclada a las influencias propias, administrando su propia altura/overflow. Las medidas muestran que el transform mueve el tablero pintado hacia arriba sin mover su límite de flujo, por lo que un hermano en flujo normal seguiría lejos: el wrapper debe superponer/usar el espacio inferior vacío del tablero o reservar un rail compacto. La geometría responsive se probará en F2/F3. Esta recomendación no autoriza cambios de producto antes de despejar la secuencia #40/#43.

## Coordinación #40 y #43

Estado reauditable tras sincronizar #44 a `origin/master@2ef09de`:

- #40 está `OPEN`, sin PR visible. Worktree/branch `issue/40-event-log-reactions` en `6886b5f`; respecto a master actual está 12 commits ahead y 16 behind. Su diff de producto incluye `Coup.js`, `PlayerBoard.js`, `PlayerBoardStyles.css`, `EventLog.js`/CSS, traducciones y `server/game/coup.js`; los cambios sin commit del worktree son documentos #40/README, no código. No editar esas superficies mientras #40 esté activa.
- #43 está `OPEN`; su handoff dice `WAITING_ORCHESTRATOR`/F1 `BLOCKED` por #40. Worktree/branch `issue/43-turn-vote-highlights` en `3879c96`, 2 ahead / 38 behind; su diff respecto al master actual contiene solo documentos, sin producto. Su trabajo futuro también afecta `PlayerBoard.js`, `Coup.js` y servidor.
- #44 se rebasó sin conflictos sobre `origin/master@2ef09de` antes de cerrar F1; el worktree quedó limpio y solo contiene commits/documentación #44. Releer issues y branches al salir de cada dependencia.

**Secuencia concreta para F2:** integrar #40 → sincronizar/revisar #43 y dejar que complete/integrar sus señales compartidas → reauditar diff final de #43 → sincronizar #44 al nuevo `origin/master` → iniciar F2. Ambas unidades abiertas no tienen PR y bloquean edición paralela de superficies compartidas; #40 es el bloqueo inmediato y #43 la siguiente integración serial.

## Veredicto F1 y límites trasladados a F3

**Veredicto:** F1 `CLOSED (PASS)` únicamente para identificar la causa del hueco desktop y recomendar layout. Las medidas A/B muestran la separación fija en coordenadas de documento, y la regla de transform explica ~102 px de los 118 px desde el borde pintado hasta la sección. `ReferencePanel` queda descartado como causa a 1247 px porque su trigger permanece fixed.

**Límites:** el agente no reprodujo el browser; subtipo y labels exactos de A, además del número de botones, no fueron observados; el viewport móvil tampoco fue medido. El pase de geometría desktop no equivale a auditoría completa de renderizado. F3 conserva auditoría manual de todos los tipos/estados y 2–6 participantes; F2 validará desktop y móvil como regresión del arreglo, sin esperar una captura móvil previa para empezar una vez integradas las dependencias.
