# Plan: tablero, influencias y mazo Court

- **Issue:** [#28 — Ajustar tablero, marcar cartas perdidas y contar mazo Court](https://github.com/pronficilio/coup-online/issues/28)
- **Estado:** WAITING_ORCHESTRATOR; F1–F4 `CLOSED (PASS)`. El ajuste final `ca02833` (`rgba(120, 120, 120, 0.73)`) pasó build y revalidación F4 FINAL del mismo Verifier, incluido C6. Se actualizará la PR #39 con el candidato; la issue remota sigue abierta hasta integrar.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Branch / worktree:** `issue/28-table-game-ux` / `.worktrees/issue-28-table-game-ux`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR para la unidad.
- **Handoff:** `docs/plans/active/issue_28_table_game_ux.md`.
- **Bitácora append-only:** `docs/plans/log/issue-28.jsonl`.

## Solicitud reescrita

Quitar el bloque global de influencias, mostrar solo los nombres debajo de las cartas del asiento local, marcar las influencias perdidas permanentemente con un símbolo/etiqueta accesible, subir moderadamente el tablero circular sin mover los controles superiores y mostrar sobre el mazo Court el número de cartas que realmente quedan en él.

## Objetivo y definición de éxito

En escritorio y móvil, la mano propia se entiende dentro de su asiento; el círculo queda más arriba sin tapar el nombre/saldo del usuario, Rules, Cheat Sheet ni Event Log; y cada jugador ve el tamaño vigente del Court encima de su imagen central. El valor del mazo procede del estado autoritativo del servidor y no expone identidades privadas.

## Reglas y hechos del código

Las reglas versionadas en `docs/coup_transcription.md` describen 15 cartas totales, tres por cada uno de cinco roles. La preparación normal reparte dos influencias a cada jugador, por lo que Court empieza con `15 − 2 × jugadores`: 11, 9, 7, 5 o 3 cartas para 2–6 jugadores. El servidor admite actualmente de 2 a 6 jugadores y construye tres copias de cada rol en `server/game/utils.js`.

La transcripción también documenta una variante opcional de dos jugadores que deja tres cartas de Court; la preparación del servidor no la implementa. No hay soporte normativo para configurar 10 cartas con dos jugadores, 20 con más jugadores o más de seis asientos. Esta unidad no cambia reglas ni prepara una variante.

En la inspección inicial del checkout local (que está atrasado respecto de `origin/master`) se observó que `server/game/coup.js` mantiene `this.deck`, lo modifica al repartir, intercambiar y reemplazar una carta probada en un desafío, pero `g-updatePlayers` no incluye su tamaño. Confirmar esta matriz en la base actual antes de implementar. Exchange roba dos cartas y devuelve dos al resolver la decisión; el tamaño final queda igual que antes, aunque durante la elección hay dos cartas menos en Court. El reemplazo tras desafío devuelve y roba una carta, así que conserva el tamaño. Una influencia revelada permanece fuera del mazo.

## Alcance

- Mover los nombres traducidos de las influencias propias al asiento local, bajo sus cartas; retirar `InfluenceSection`, su título y sus círculos de colores. Usar las claves `game.roles.*` vigentes.
- Marcar solo las influencias perdidas permanentemente con tratamiento gris y símbolo/etiqueta accesible; mantener legible el nombre del rol, no marcar cartas probadas temporalmente en desafíos y no revelar cartas rivales ocultas.
- Reubicar solo `PlayerBoardContainer` para dejar aproximadamente 50 px de margen superior hasta el encabezado del asiento más alto, manteniendo los componentes del `GameHeader` en sus posiciones.
- Proyectar el tamaño público de Court con la instantánea que ya reciben todos los jugadores y mostrarlo inmediatamente encima de la imagen del mazo, con una etiqueta accesible localizada en el diccionario `es`/`en`.
- Actualizar el dato cuando Court cambia, incluyendo el intervalo de elección de Exchange, la resolución de Exchange, los reemplazos por desafío y una revancha.
- Iluminar el rectángulo rojo del asiento local cuando su cliente tiene opciones de respuesta disponibles a una acción (Challenge, Block, Pass u otra opción del protocolo), aunque el turno formal siga en manos del actor; apagarlo al enviar la respuesta o cerrarse la decisión.

## Fuera de alcance

- Cambiar el mazo de 15 cartas, cantidad de copias, reglas, rango de jugadores o añadir la variante de dos jugadores.
- Enviar roles/identidades de cartas ajenas, alterar manos privadas o cambiar eventos y decisiones Socket.IO existentes.
- Mover `You are`, `Coins`, Rules, Cheat Sheet o Event Log.
- Añadir animaciones o dependencias.

## Fases

### F1 — Confirmar reglas, mutaciones y contrato visual (`CLOSED`)

- **Pregunta única:** ¿qué tamaño de Court y qué transiciones debe exponer la interfaz sin cambiar las reglas?
- **Entrada:** issue #28; `docs/coup_transcription.md`, `docs/coup_llm_summary.md`; base `origin/master` actualizada; `server/game/utils.js`, `server/game/coup.js`, `Coup.js`, `PlayerBoard.js` y estilos.
- **Salida:** matriz de preparación/intercambio/reemplazo/revancha y contrato de ubicación/estilo; confirmar la rama base y el contenido exacto de los campos de snapshot.
- **Criterio de cierre:** confirmar que el servidor crea 15 cartas y reparte dos por asiento en todas las partidas actuales; enumerar cada lectura/escritura de `this.deck` y cuándo se emite la siguiente instantánea; registrar medidas/colisiones superiores que deban comprobarse. Si la base o las reglas contradicen esto, detener implementación y devolver la decisión al Orquestador.
- **Artefacto:** `docs/plans/game-table-ux/report_issue_28_F1.md`.
- **Commit:** `COMMIT_REQUIRED`; `docs(ui): issue 28 F1 CLOSED advance_f2`.
- **Validación:** inspección estática/documental; no ejecutar tests.
- **Reporte:** `docs/plans/game-table-ux/report_issue_28_F1.md`.

### F2 — Integrar influencias perdidas, ajustar el círculo y resaltar respuestas (`ACTIVE`)

- **Pregunta única:** ¿la mano, el círculo y el estado visual de quien puede responder representan correctamente la partida sin desplazar ni cubrir el resto del HUD?
- **Entrada:** F1 cerrada; el propietario autorizó explícitamente continuar en este worktree aislado. La revisión visual reportada cubrió 2 jugadores en móvil; la nueva variante requiere revisión después del build. Registrar y sincronizar la rama desde `origin/master` vigente antes del código; no tocar ni copiar cambios de worktrees/branches #24 o #26.
- **Salida:** nombres de roles traducidos bajo las cartas propias, sin sección/título/bolitas globales; influencias perdidas permanentemente grises con símbolo/etiqueta accesible y rol legible; círculo algo más arriba con unos 50 px hasta el primer encabezado superior; asiento local iluminado mientras su cliente ofrece opciones de respuesta.
- **Criterio de cierre:** build de cliente y revisión estática; conservar controles y Event Log en sus coordenadas declaradas. Verificar estáticamente que el resaltado aparece con opciones locales, se apaga al enviar (incluido Pass) y al cerrar, y no marca clientes sin opciones. La revisión visual del propietario para la nueva variante (incluyendo 5p móvil y estados de respuesta) debe quedar registrada antes de repetir F4; no afirmar inspección manual propia de estados de juego.
- **Artefacto:** código y reporte F2.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-ui): issue 28 F2 board and response highlight`.
- **Seguimiento:** commit separado `fix(game-ui): issue 28 calibrate responsive board lift` por el tope real de 900 px del círculo.
- **Validación:** build de cliente e inspección visual; no añadir ni ejecutar tests automatizados.
- **Reporte:** `docs/plans/game-table-ux/report_issue_28_F2.md`.
- **Seguimiento de verificación (2026-09-27):** el Verifier FINAL midió el asiento superior a aproximadamente 81 px (viewport móvil de 390 px) y 112 px (escritorio ancho) para cinco jugadores; el criterio 2 pide unos 50 px. F2 vuelve a `RETURNED` únicamente para corregir la geometría de `.PlayerBoardContainer` según las coordenadas superiores de 2–6 jugadores y el tope real de 900 px, sin desplazar HUD/controles ni recortar asientos. Build/diff-check/sintaxis requeridos antes de cerrar F2 con un commit de seguimiento; después F4 vuelve a `ACTIVE` para el mismo Verifier.
- **Resolución del seguimiento (2026-09-27):** el layout superior de cinco jugadores queda en `top: 14%` efectivo: `.PlayerBoardContainer[data-player-count="5"]` aplica `translate: 0 -6.88%` para compensar el anillo que alcanza 20.88%. Es un ajuste del tablero cuadrado; las reglas responsive anteriores y el HUD conservan sus posiciones. `git diff --check` y `node --check server/game/coup.js` pasan; el build termina con código 0 y avisos ya observados en `App.js`, `ReferencePanel.css` y `caniuse-lite`. El preview de `localhost:3015` sigue activo. F2 queda `CLOSED`; F4 vuelve a `ACTIVE` para el mismo Verifier tras sincronizar el branch.
- **Cierre de F2 (2026-09-27, HEAD `4ccce679f082d84956de844472e395fc67a90bf7`):** se corrigió la geometría devuelta por F4: el Event Log recibe ancho/wrap hasta 1199 px; se compactan/desplazan asientos superiores en tablet y en mesas móviles de seis; el lift de `.PlayerBoardContainer` deja de saturarse en pantallas altas. El halo se deriva de `decision.options` no vacías de la decisión local; se limita al asiento local, cesa inmediatamente al enviar cualquier opción (incluido Pass), y la ventana desaparece con `g-decisionClosed`; sin opciones locales no hay halo y no cambia el protocolo. La inspección del cascade/estado de cliente confirma que You are, Coins, Rules y Cheat Sheet no se desplazan, y el Event Log conserva `top:60px; right:15px` hasta 1023 px y `top:10vh; right:10vw` desde 1024 px. Build, diff-check, sintaxis y JSON pasan; las cajas son cálculos CSS, no captura renderizada. F2 queda `CLOSED`; F4 `ACTIVE`, pendiente de revisión FINAL independiente. No tests automatizados.
- **Reapertura por segundo hallazgo (2026-09-27):** el Verifier confirmó el margen, pero devolvió F4 con severidad media porque en móvil el asiento superior derecho puede solapar texto y área desplazable del Event Log. El anclaje móvil/tablet es el base `top:60px; right:15px`; desde 1024 px una media query cambia a `top:10vh; right:10vw`. La capa posterior del tablero puede taparlo. Evidencia e incertidumbre de captura: `docs/plans/game-table-ux/report_issue_28_F4.md`. Ajustar solo la geometría responsive para conservar el anclaje vigente y mantener visibles los asientos; no ocultar ni mover el Event Log ni recortar cartas. F2 vuelve a `RETURNED` hasta revisión y build.
- **Corrección del cierre prematuro (2026-09-27):** `cbc0892` declaró F2 `CLOSED` tras poner `.GameHeader { z-index: 4 }`; el cambio solo alteraba qué capa pintaba encima y no separaba las cajas. El Verifier encontró además saturación del lift en escritorios altos. La bitácora conserva ese evento y registra la devolución correctiva; no se considera evidencia de cierre.
- **Resolución F2 (2026-09-27):** el Event Log conserva su anclaje real: `top:60px; right:15px` hasta 1023 px y `top:10vh; right:10vw` desde 1024 px; no se mueve. En cinco jugadores se limita su ancho a 100–130 px y se conserva 9vh de scroll con wrap. Las cotas estáticas de 390×844 dan log x≈245–375, asiento superior izquierdo x≈47–122 y derecho x≈134–203; a 320×844, log x≈205–305, izquierdo x≈29–95 y derecho x≈106–163. Los halos de nombre e influencia activa se compactan solo en móvil de cinco jugadores. `responseWindowOpen` requiere tipo de respuesta y opciones locales de `g-decision`; `responseAvailable` se apaga en `submitted`, el cierre borra la decisión y `--current` se suspende durante esa ventana hasta el cierre para que el rojo desaparezca tras enviar. No cambia el protocolo. Los tres `clamp()` se conservan; el piso desktop pasa de −180 a −240 px para cubrir alturas de 1200–1440 px. `git diff --check`, `node --check server/game/coup.js`, JSON de traducciones/bitácora y build pasan; build código 0 con avisos existentes de `App.js`, `ReferencePanel.css` y `caniuse-lite`. El usuario solo reportó revisión móvil de dos jugadores; no repetir F4 hasta revisar la nueva variante. No afirmar inspección propia de otros conteos/transiciones.

- **Seguimiento final F2 (2026-09-27):** el Event Log conserva `top:60px; right:15px` hasta 1023 px y `top:10vh; right:10vw` desde 1024 px. En 5p y hasta 520 px se estrecha a 100–130 px, mientras se compactan/desplazan los dos asientos superiores. Las cajas CSS calculadas quedan separadas en 390×844 y 320×844; estas estimaciones no son capturas. Se conservan los `clamp()`; el piso desktop se amplía de −180 a −240 px. El highlight local usa opciones de `g-decision` y se apaga al enviar/cerrar; la revisión visual de 5p/390 px y de esos estados está pendiente del propietario. El build del candidato terminó con código 0; diff-check, sintaxis y JSON pasan. F2 queda `CLOSED` en `4b1dc92`; F4 espera la confirmación visual antes de repetirse.

- **Devolución F4 sobre bae24fc (2026-09-27):** FAIL medio en criterio 2. La limitación/ancho del Event Log solo cubría cinco jugadores en móvil y las demás mesas podían expandirlo sobre asientos; tampoco cubría el rango tablet. El lift tablet se saturó en −240 px y dejó ~90 px de margen en 768×1200. F2 cambia la limitación/wrap del log para todo viewport ≤1199 px, separa asientos superiores derechos en tablet y 6p móvil, y elimina el piso inferior de los tres lifts. El candidato pasó build, diff-check, sintaxis y JSON; revisión visual del propietario de esta variante pendiente antes de repetir F4. Evidencia: report_issue_28_F4.md.
### F3 — Mostrar el conteo autoritativo de Court (`CLOSED`)

- **Pregunta única:** ¿el valor visible coincide con las cartas que están en Court en cada etapa del flujo?
- **Entrada:** F2 implementada en este worktree; F1 confirma las rutas de mutación. F2/F3 cuentan con autorización explícita del propietario pese a los solapamientos; no copiar cambios de otras ramas.
- **Salida:** campo numérico público en `g-updatePlayers` derivado de `this.deck.length` y contador localizado inmediatamente encima del mazo central, compartido por todas las vistas sin exponer cartas.
- **Criterio de cierre:** auditoría estática confirma que parte de 15 menos las cartas repartidas; baja dos mientras Exchange espera elección y vuelve al valor previo al devolver dos; no cambia por reemplazo uno-a-uno tras desafío; se reinicia correctamente al jugar otra vez. Controles del protocolo permanecen iguales. El propietario revisará estos estados en el preview; no se afirma recorrido manual en esta fase.
- **Artefacto:** código y reporte F3.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-ui): issue 28 F3 court deck count`.
- **Validación:** build de cliente y revisión estática del ciclo servidor/cliente; preview local para revisión visual del propietario; no añadir ni ejecutar tests automatizados.
- **Reporte:** `docs/plans/game-table-ux/report_issue_28_F3.md`.

### F4 — Revisión final independiente (`ACTIVE`)

- **Pregunta única:** ¿el conjunto cumple los criterios sin desplazar HUD ni publicar información privada?
- **Entrada:** F1–F3 implementadas; el usuario reportó revisión del preview con 2 jugadores en móvil, sin confirmar un SHA ni el rango de F4. El revisor devolvió F4 en `cbc0892` por cruce geométrico del Event Log y saturación del lift a 1200–1440 px de alto. F4 devolvió `bae24fc` con FAIL medio en criterio 2: el log cruza asientos en otros conteos/tablet y el lift tablet se satura. F2 corrige estos casos; el mismo Verifier repetirá después de la revisión visual del nuevo preview.
- **Salida:** sincronización documentada, build/diff-check/comprobaciones de sintaxis y veredicto FINAL independiente.
- **Criterio de cierre:** capturas/escalas 2, 3 y 6 jugadores en móvil y escritorio; revisar reserva superior, anclaje del conteo, intercambio pendiente/completado, desafío con reemplazo, revancha y el payload público. Durante una respuesta, confirmar que solo el asiento local con opciones disponibles se ilumina; que se apaga tras elegir (incluido Pass) o al cerrarse la decisión; y que no se ilumina si el cliente no puede votar. Refutar al menos una afirmación de éxito; corregir defectos antes del veredicto.
- **Artefacto:** `docs/plans/game-table-ux/report_issue_28_F4.md` y evidencia visual acotada.
- **Commit:** `COMMIT_REQUIRED` para el sync/control de F4; el commit de veredicto/cierre se reserva hasta cumplir el criterio de F4 y recibir PASS independiente.
- **Revalidación:** `cbc0892` tuvo PASS estático en 1 y 3–6 y FAIL medio en 2: intersección a 390 px y margen de ~68–104 px con alturas de 1200–1440 px. La corrección conserva los clamps y amplía solo el piso desktop de −180 a −240 px. La rama se sincronizó con `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe` en `488405097e94dd591903a5107589e75cdee781f1`, sin copiar trabajo de branches/worktrees hermanos. Build final, diff-check y sintaxis pasan. El propietario aún debe revisar 5p/390 px y el encendido/apagado/cierre del halo; no repetir F4 hasta confirmación. No ejecutar tests automatizados ni hacer push/PR antes del PASS.

#### Criterio visual añadido por el propietario (2026-09-27)

Al seleccionar una acción que inicia una ventana de decisión, el recuadro rojo del asiento de una persona se ilumina en su cliente si tiene al menos una opción de respuesta disponible, aunque el turno formal continúe en el jugador que inició la acción. La iluminación cesa inmediatamente cuando envía su opción (incluido `Pass`) y al cerrarse la decisión. Se deriva del estado de opciones del cliente; no cambia reglas ni protocolo. Issue comment: https://github.com/pronficilio/coup-online/issues/28#issuecomment-5860766944.

## Dependencias y coordinación

- El propietario reorientó el trabajo el 2026-09-27 y autorizó implementar F2/F3 desde este worktree aislado; después aprobó visualmente el preview de dos jugadores. La sincronización F4 previa incorporó `origin/master@5fffacfdadcf3e91453bda1d13e4c0b2e3327831` en `400c9e21a326c8c0cc56a37f380f10945590665b`; hubo conflicto de contenido en `CoupStyles.css`, resuelto conservando `.Pause*` de #26 y omitiendo `.circle` sin consumidores. La sincronización posterior incorporó `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2` (#37/#36) en `caa39f1`; el sync vigente agregó `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe` en `488405097e94dd591903a5107589e75cdee781f1`. Esta última base estaba 13 commits detrás del HEAD previo; el merge fue limpio en este worktree. No copiar trabajo de branches/worktrees hermanos. La issue remota sigue OPEN; no hacer push ni abrir PR antes del PASS independiente.

## Riesgo y pregunta de falsificación

**Riesgo MEDIUM:** una cifra desactualizada confunde un dato público de juego; el servidor mantiene la autoridad y solo expone el tamaño, nunca identidades. **Verificación FINAL** por cambio de varias superficies cliente/servidor.

Pregunta adversarial: ¿hay un instante, reinicio o intercambio en que el valor visible difiera del tamaño real de `this.deck`, o una instantánea nueva publica información de influencias privadas?

## Salida pendiente de F4 — 2026-09-27

El propietario confirmó en `http://localhost:3016` los dos casos solicitados del producto `4ccce67`: 5p móvil (~390 px), con asientos completos y Event Log legible/desplazable sin cruce; y ciclo del halo local durante Challenge/Block (solo con opciones, se apaga al enviar Pass/otra opción o cerrar). La rama está en `7711d20`, que solo contiene documentación. F4 queda `ACTIVE` mientras el mismo Verifier realiza la revisión FINAL independiente. No cerrar ni publicar la issue antes de ese PASS.

## Devolución F4 por escritorio ancho — 2026-09-27

El mismo Verifier emitió `FAIL` medio en criterio 2 sobre el producto `4ccce679f082d84956de844472e395fc67a90bf7`. A 1200×900 el tablero de 900 px empieza en x≈150; el asiento superior derecho de 5p queda cerca de x≈790 y sus cartas llegan hasta x≈859. Desde 1200 px el Event Log pierde el ancho limitado/wrap, conserva el borde derecho x≈1080 (`right:10vw`) y una línea larga puede ocupar ~260 px, empezando cerca de x≈820: cruce estimado de ~39 px con las cartas en la misma zona vertical. C1, C3–C7 pasaron estáticamente. El propietario confirmó solo el caso móvil 5p y el ciclo del halo, no escritorio.

F2 volvió a `ACTIVE` para mantener el `clamp()` y `overflow-wrap:anywhere` en todos los anchos, sin mover el anclaje del Event Log. El fix está comprometido en `d37dacc`; `npm run build` terminó con código 0 y el bundle actualizado se sirve en `http://172.25.161.252:3016`, conectado a `:8016`. Se pidió al propietario revisar 5p desktop (1280×900); con su confirmación, el mismo Verifier repetirá F4 sobre este SHA. No push/PR ni cierre antes del PASS.

### Corrección de conectividad del preview

El propietario reportó que `http://localhost:3016` no respondía. Se encontró que `3015/8015` ya servían procesos del worktree #24 y que el cliente #28 en `3016` apuntaba por error a esa API `8015`. No se detuvieron esos servicios. Se reinició el cliente #28 con API `8016`, ambos en `172.25.161.252`; la API responde HTTP 200 y el bundle incorpora el nuevo límite/wrap. El enlace corregido es `http://172.25.161.252:3016`. Falta confirmar accesibilidad desde el navegador del propietario y revisión 5p desktop.

En la revisión posterior, el propietario informó `Error del servidor` al intentar unirse. `JoinGame` muestra ese texto cuando falla por red/HTTP la consulta `/exists`; un código inválido tiene otro mensaje. Se reinició el cliente con `HOST=0.0.0.0`. `ss` confirmó `0.0.0.0:3016` y `*:8016`, y el API contestó HTTP 200 con CORS desde la dirección de red. Luego el propietario confirmó que el preview ya funciona y que en escritorio se ven bien los cinco jugadores y las cartas. F4 FINAL independiente se repite sobre `d37dacc`; no publicar/cerrar antes del PASS.

El mismo Verifier emitió `PASS` FINAL sobre `d37daccdbe37d997aaee3d7e23eb64e7712cf237`; revisó el tip documental `6003c8f` y confirmó que no había diff de cliente/servidor frente al producto. C1–C7 pasan, con ~41 px calculados entre el Event Log y las cartas superiores a 1200×900; la confirmación visual de 5p desktop es del propietario. El desglose y límites de evidencia están en `report_issue_28_F4.md`. F2/F4 quedan cerradas con PASS; se prepara PR y la issue no se cerrará hasta integrar.

### Ajuste final de legibilidad de influencias perdidas — 2026-09-28

Tras su revisión con el inspector de elementos, el propietario pidió elevar el alpha del fondo de `.PlayerInfluenceLostOverlay` de `0.43` a `0.73`, conservando `rgba(120, 120, 120, ...)`. El cambio quedó en `ca02833`; `npm run build` pasa con los avisos conocidos y el CSS generado contiene `hsla(0,0%,47%,.73)`. El mismo Verifier repitió F4 FINAL y dio PASS en C1–C7; en C6 confirma que el rol y la marca siguen legibles y que solo se oscurecen cartas perdidas. F2/F4 quedan cerradas de nuevo; se actualiza la PR #39 con este candidato antes de pedir aprobación de merge.
