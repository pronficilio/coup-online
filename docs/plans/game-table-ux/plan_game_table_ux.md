# Plan: tablero, influencias y mazo Court

- **Issue:** [#28 — Ajustar tablero, marcar cartas perdidas y contar mazo Court](https://github.com/pronficilio/coup-online/issues/28)
- **Estado:** `ACTIVE`; F1 `CLOSED`; F2 `RETURNED`; F3 `CLOSED`; F4 `RETURNED`. El lift de cinco jugadores ya deja 14% efectivo; el Verifier encontró posible solapamiento del asiento superior derecho con el Event Log en móvil. Resolver el criterio 2 sin mover el Event Log y repetir F4 con el mismo Verifier.
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

### F2 — Integrar influencias perdidas y ajustar el círculo (`RETURNED`)

- **Pregunta única:** ¿la mano propia y el círculo pueden ocupar la posición solicitada sin desplazar ni cubrir el resto del HUD?
- **Entrada:** F1 cerrada; el propietario autorizó explícitamente continuar en este worktree aislado y hará la revisión visual del preview. Registrar y sincronizar la rama desde `origin/master` vigente antes del código; no tocar ni copiar cambios de worktrees/branches #24 o #26.
- **Salida:** nombres de roles traducidos bajo las cartas propias, sin sección/título/bolitas globales; influencias perdidas permanentemente grises con símbolo/etiqueta accesible y rol legible; círculo algo más arriba con unos 50 px hasta el primer encabezado superior.
- **Criterio de cierre:** build de cliente y revisión estática; mantener controles y Event Log en sus coordenadas declaradas, sin cambiar reglas ni protocolo de decisiones. La revisión visual del propietario queda pendiente explícitamente para el preview después de F3; no afirmar inspección manual propia de estados de juego.
- **Artefacto:** código y reporte F2.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-ui): issue 28 F2 influences, lost cards and board position`.
- **Seguimiento:** commit separado `fix(game-ui): issue 28 calibrate responsive board lift` por el tope real de 900 px del círculo.
- **Validación:** build de cliente e inspección visual; no añadir ni ejecutar tests automatizados.
- **Reporte:** `docs/plans/game-table-ux/report_issue_28_F2.md`.
- **Seguimiento de verificación (2026-09-27):** el Verifier FINAL midió el asiento superior a aproximadamente 81 px (viewport móvil de 390 px) y 112 px (escritorio ancho) para cinco jugadores; el criterio 2 pide unos 50 px. F2 vuelve a `RETURNED` únicamente para corregir la geometría de `.PlayerBoardContainer` según las coordenadas superiores de 2–6 jugadores y el tope real de 900 px, sin desplazar HUD/controles ni recortar asientos. Build/diff-check/sintaxis requeridos antes de cerrar F2 con un commit de seguimiento; después F4 vuelve a `ACTIVE` para el mismo Verifier.
- **Resolución del seguimiento (2026-09-27):** el layout superior de cinco jugadores queda en `top: 14%` efectivo: `.PlayerBoardContainer[data-player-count="5"]` aplica `translate: 0 -6.88%` para compensar el anillo que alcanza 20.88%. Es un ajuste del tablero cuadrado; las reglas responsive anteriores y el HUD conservan sus posiciones. `git diff --check` y `node --check server/game/coup.js` pasan; el build termina con código 0 y avisos ya observados en `App.js`, `ReferencePanel.css` y `caniuse-lite`. El preview de `localhost:3015` sigue activo. F2 queda `CLOSED`; F4 vuelve a `ACTIVE` para el mismo Verifier tras sincronizar el branch.
- **Reapertura por segundo hallazgo (2026-09-27):** el Verifier confirmó el margen, pero devolvió F4 con severidad media porque en móvil el asiento superior derecho puede solapar texto y área desplazable del Event Log (`top: 60px`) y la capa posterior del tablero puede taparlo. Evidencia e incertidumbre de captura: `docs/plans/game-table-ux/report_issue_28_F4.md`. Ajustar solo la geometría/apilamiento responsive para conservar el Event Log anclado y usable y mantener visibles los asientos; no ocultar ni mover el Event Log ni recortar cartas. F2 vuelve a `RETURNED` hasta revisión y build.

### F3 — Mostrar el conteo autoritativo de Court (`CLOSED`)

- **Pregunta única:** ¿el valor visible coincide con las cartas que están en Court en cada etapa del flujo?
- **Entrada:** F2 implementada en este worktree; F1 confirma las rutas de mutación. F2/F3 cuentan con autorización explícita del propietario pese a los solapamientos; no copiar cambios de otras ramas.
- **Salida:** campo numérico público en `g-updatePlayers` derivado de `this.deck.length` y contador localizado inmediatamente encima del mazo central, compartido por todas las vistas sin exponer cartas.
- **Criterio de cierre:** auditoría estática confirma que parte de 15 menos las cartas repartidas; baja dos mientras Exchange espera elección y vuelve al valor previo al devolver dos; no cambia por reemplazo uno-a-uno tras desafío; se reinicia correctamente al jugar otra vez. Controles del protocolo permanecen iguales. El propietario revisará estos estados en el preview; no se afirma recorrido manual en esta fase.
- **Artefacto:** código y reporte F3.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-ui): issue 28 F3 court deck count`.
- **Validación:** build de cliente y revisión estática del ciclo servidor/cliente; preview local para revisión visual del propietario; no añadir ni ejecutar tests automatizados.
- **Reporte:** `docs/plans/game-table-ux/report_issue_28_F3.md`.

### F4 — Revisión final independiente (`RETURNED`)

- **Pregunta única:** ¿el conjunto cumple los criterios sin desplazar HUD ni publicar información privada?
- **Entrada:** F1/F3 cerradas y aprobación visual del propietario recibida el 2026-09-27; hold visual levantado. El primer `FAIL` medio (margen superior de cinco jugadores) se corrigió en F2; el segundo pase confirmó ese margen y devolvió F4 por el posible solapamiento del Event Log a 390 px. Corregir F2 y repetir F4 con el mismo Verifier.
- **Salida:** sincronización documentada, build/diff-check/comprobaciones de sintaxis y veredicto FINAL independiente.
- **Criterio de cierre:** capturas/escalas 2, 3 y 6 jugadores en móvil y escritorio; revisar reserva superior, anclaje del conteo, intercambio pendiente/completado, desafío con reemplazo, revancha y el payload público. Refutar al menos una afirmación de éxito; corregir defectos antes del veredicto.
- **Artefacto:** `docs/plans/game-table-ux/report_issue_28_F4.md` y evidencia visual acotada.
- **Commit:** `COMMIT_REQUIRED` para el sync/control de F4; el commit de veredicto/cierre se reserva hasta cumplir el criterio de F4 y recibir PASS independiente.
- **Revalidación:** la rama se sincronizó sin conflictos con `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2` mediante `caa39f1`; build y comprobaciones pasan. El informe de la repetición está en `report_issue_28_F4.md`: criterios 1, 3, 4, 5 y 6 pasan; criterio 2 `FAIL` medio por Event Log potencialmente cubierto en móvil. F2 se devuelve; no hay nuevo pase independiente hasta corregir. No se agregaron ni ejecutaron tests automatizados. No hacer push ni abrir PR antes del PASS.

## Dependencias y coordinación

- El propietario reorientó el trabajo el 2026-09-27 y autorizó implementar F2/F3 desde este worktree aislado; después aprobó visualmente el preview y levantó el hold para continuar. La sincronización F4 previa incorporó `origin/master@5fffacfdadcf3e91453bda1d13e4c0b2e3327831` en `400c9e21a326c8c0cc56a37f380f10945590665b`; hubo conflicto de contenido en `CoupStyles.css`, resuelto conservando `.Pause*` de #26 y omitiendo `.circle` sin consumidores. La sincronización final incorporó `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2` (#37/#36, assets de cartas) sin conflictos en `caa39f1ec82eca193ce00f8b0e0f3707db142cf9`; build y comprobaciones posteriores pasan. La issue remota sigue OPEN con criterios 1–6. No editar branches/worktrees hermanos, copiar ni cherry-pickear sus cambios. No hacer push ni abrir PR hasta recibir PASS del Verifier independiente.

## Riesgo y pregunta de falsificación

**Riesgo MEDIUM:** una cifra desactualizada confunde un dato público de juego; el servidor mantiene la autoridad y solo expone el tamaño, nunca identidades. **Verificación FINAL** por cambio de varias superficies cliente/servidor.

Pregunta adversarial: ¿hay un instante, reinicio o intercambio en que el valor visible difiera del tamaño real de `this.deck`, o una instantánea nueva publica información de influencias privadas?
