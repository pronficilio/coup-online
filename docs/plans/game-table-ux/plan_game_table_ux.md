# Plan: tablero, influencias y mazo Court

- **Issue:** [#28 — Ajustar tablero, influencias y contador del mazo Court](https://github.com/pronficilio/coup-online/issues/28)
- **Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2/F3 `BLOCKED` por solapamiento de superficies; F4 `PENDING`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Branch / worktree:** `issue/28-table-game-ux` / `.worktrees/issue-28-table-game-ux`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR para la unidad.
- **Handoff:** `docs/plans/active/issue_28_table_game_ux.md`.
- **Bitácora append-only:** `docs/plans/log/issue-28.jsonl`.

## Solicitud reescrita

Quitar el bloque global de influencias, mostrar solo los nombres debajo de las cartas del asiento local, subir moderadamente el tablero circular sin mover los controles superiores y mostrar sobre el mazo Court el número de cartas que realmente quedan en él.

## Objetivo y definición de éxito

En escritorio y móvil, la mano propia se entiende dentro de su asiento; el círculo queda más arriba sin tapar el nombre/saldo del usuario, Rules, Cheat Sheet ni Event Log; y cada jugador ve el tamaño vigente del Court encima de su imagen central. El valor del mazo procede del estado autoritativo del servidor y no expone identidades privadas.

## Reglas y hechos del código

Las reglas versionadas en `docs/coup_transcription.md` describen 15 cartas totales, tres por cada uno de cinco roles. La preparación normal reparte dos influencias a cada jugador, por lo que Court empieza con `15 − 2 × jugadores`: 11, 9, 7, 5 o 3 cartas para 2–6 jugadores. El servidor admite actualmente de 2 a 6 jugadores y construye tres copias de cada rol en `server/game/utils.js`.

La transcripción también documenta una variante opcional de dos jugadores que deja tres cartas de Court; la preparación del servidor no la implementa. No hay soporte normativo para configurar 10 cartas con dos jugadores, 20 con más jugadores o más de seis asientos. Esta unidad no cambia reglas ni prepara una variante.

En la inspección inicial del checkout local (que está atrasado respecto de `origin/master`) se observó que `server/game/coup.js` mantiene `this.deck`, lo modifica al repartir, intercambiar y reemplazar una carta probada en un desafío, pero `g-updatePlayers` no incluye su tamaño. Confirmar esta matriz en la base actual antes de implementar. Exchange roba dos cartas y devuelve dos al resolver la decisión; el tamaño final queda igual que antes, aunque durante la elección hay dos cartas menos en Court. El reemplazo tras desafío devuelve y roba una carta, así que conserva el tamaño. Una influencia revelada permanece fuera del mazo.

## Alcance

- Mover los nombres traducidos de las influencias propias al asiento local, bajo sus cartas; retirar `InfluenceSection`, su título y sus círculos de colores. Usar las claves `game.roles.*` vigentes.
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

### F2 — Integrar influencias y ajustar el círculo (`BLOCKED`)

- **Pregunta única:** ¿la mano propia y el círculo pueden ocupar la posición solicitada sin desplazar ni cubrir el resto del HUD?
- **Entrada:** F1 cerrada y liberación de las ediciones de `Coup.js`/`CoupStyles.css` en #24 y del overlay planeado en #26. Sincronizar la rama desde `origin/master` después de las integraciones; no copiar cambios de worktrees ajenos.
- **Salida:** nombres de roles traducidos bajo las cartas propias, sin sección/título/bolitas globales; círculo algo más arriba con unos 50 px hasta el primer encabezado superior.
- **Criterio de cierre:** probar visualmente 2–6 jugadores en escritorio y móvil; conservar los controles y el Event Log en sus coordenadas existentes, sin solapamiento, recorte ni movimiento de la sección de decisiones.
- **Artefacto:** código y reporte F2.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-ui): issue 28 F2 player influences and board position`.
- **Validación:** build de cliente e inspección visual; no añadir ni ejecutar tests automatizados.

### F3 — Mostrar el conteo autoritativo de Court (`BLOCKED`)

- **Pregunta única:** ¿el valor visible coincide con las cartas que están en Court en cada etapa del flujo?
- **Entrada:** F2 cerrada; F1 confirma las rutas de mutación; superficies compartidas liberadas por el Orquestador.
- **Salida:** campo numérico público en `g-updatePlayers` derivado de `this.deck.length` y contador localizado inmediatamente encima del mazo central, compartido por todas las vistas sin exponer cartas.
- **Criterio de cierre:** parte de 15 menos las cartas repartidas; baja dos mientras Exchange espera elección y vuelve al valor inicial cuando devuelve dos; no cambia por un reemplazo uno-a-uno tras desafío; se reinicia correctamente al jugar otra vez. Controles del protocolo permanecen iguales.
- **Artefacto:** código y reporte F3.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-ui): issue 28 F3 court deck count`.
- **Validación:** build de cliente y revisión estática del ciclo servidor/cliente; no añadir ni ejecutar tests automatizados.

### F4 — Revisión final independiente (`PENDING`)

- **Pregunta única:** ¿el conjunto cumple los criterios sin desplazar HUD ni publicar información privada?
- **Entrada:** F2 y F3 cerradas.
- **Salida:** recorrido manual y veredicto FINAL independiente.
- **Criterio de cierre:** capturas/escalas 2, 3 y 6 jugadores en móvil y escritorio; revisar reserva superior, anclaje del conteo, intercambio pendiente/completado, desafío con reemplazo, revancha y el payload público. Refutar al menos una afirmación de éxito; corregir defectos antes del veredicto.
- **Artefacto:** `docs/plans/game-table-ux/report_issue_28_F4.md` y evidencia visual acotada.
- **Commit:** `COMMIT_REQUIRED`; `docs(game-ui): issue 28 F4 CLOSED ready_for_review`.
- **Validación:** build + recorrido manual + Verifier independiente FINAL; sin tests automatizados.

## Dependencias y coordinación

- Estado del Orquestador (2026-09-27): la rama remota de #24 está limpia, pero F2 espera revisión visual manual e integración; #26 tiene cambios de producto aún no confirmados en `Coup.js`, `CoupStyles.css`, traducciones y servidor. No editar esas superficies en paralelo.
- F1 puede auditar reglas y código desde su worktree propio; F2 y F3 permanecen bloqueadas hasta que el Orquestador confirme liberación/integración de #24/#26. Antes de F2, sincronizar el branch desde `origin/master` vigente; durante F1 `origin/master` avanzó de `5de95ee` a `c601410` al integrarse PR #27.

## Riesgo y pregunta de falsificación

**Riesgo MEDIUM:** una cifra desactualizada confunde un dato público de juego; el servidor mantiene la autoridad y solo expone el tamaño, nunca identidades. **Verificación FINAL** por cambio de varias superficies cliente/servidor.

Pregunta adversarial: ¿hay un instante, reinicio o intercambio en que el valor visible difiera del tamaño real de `this.deck`, o una instantánea nueva publica información de influencias privadas?
