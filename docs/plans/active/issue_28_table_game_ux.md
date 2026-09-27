# Handoff para Agente Alquimista — issue #28

- **Issue:** https://github.com/pronficilio/coup-online/issues/28
- **Plan exacto:** `docs/plans/game-table-ux/plan_game_table_ux.md`
- **Bitácora exacta:** `docs/plans/log/issue-28.jsonl`
- **Estado:** `ACTIVE`; F1 `CLOSED`; F2 `RETURNED`; F3 `CLOSED`; F4 `RETURNED`. El propietario aprobó visualmente el preview; el Verifier independiente devolvió F4 con `FAIL` medio por el criterio 2 en partidas de cinco jugadores. Corregir F2 y después reanudar F4 con el mismo Verifier.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Branch único:** `issue/28-table-game-ux`.
- **Worktree único:** `.worktrees/issue-28-table-game-ux`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR para la unidad.

## Reclamo, aislamiento y reorientación

El issue se asignó a `pronficilio` y se releyó en estado `OPEN`, con título y cuerpo coincidentes y sin otros assignees. La actualización visible enlaza este handoff activo en [el comentario de reclamo](https://github.com/pronficilio/coup-online/issues/28#issuecomment-5859072354). La rama `issue/28-table-game-ux` y el worktree `.worktrees/issue-28-table-game-ux` se crearon desde `origin/master` actualizado (`5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`). Se copiaron selectivamente este handoff, el plan y la bitácora; no se copiaron ni limpiaron cambios del checkout raíz.

El propietario reorientó explícitamente el trabajo el 2026-09-27: autorizó implementar F2 y F3 en este único worktree pese a los solapamientos previos, pidió un preview local y reservó para sí la revisión visual. El Orquestador registró la reorientación en el issue y confirmó que los puertos 3015 y 8015 se pueden usar (no detener ni reutilizar el servicio que ya ocupa 8000). El propietario aprobó visualmente el preview y pidió continuar; el hold visual quedó levantado. Se mantienen las restricciones: no tocar worktrees/branches hermanos ni hacer cherry-pick; no hacer push ni abrir PR hasta el PASS del Verifier independiente. La rama permanece en `issue/28-table-game-ux`.

## F4 activa: sincronización con master

El 2026-09-27 se confirmó `origin/master@5fffacfdadcf3e91453bda1d13e4c0b2e3327831`, cuyo padre es `12115856c71de8b8abb5d13a81cf8458a2cae240` (#35/#26 integrado). Hubo un conflicto de contenido real en `coup-client/src/components/game/CoupStyles.css`: se conservan los estilos `.Pause*` que #26 integró y los estilos vigentes de #28; se omite `.circle`, que no tiene consumidores. No hay reglas `.InfluenceSection` ni `.InfluenceUnitContainer` activas. Los merges automáticos de `Coup.js`, `translations.json` y `server/game/coup.js` conservan las funciones integradas de pausa y los cambios #28 de Court/influencias; el escaneo no encontró cambio al protocolo de decisiones de #28. La sincronización quedó comprometida en `400c9e21a326c8c0cc56a37f380f10945590665b`. `git diff --check`, `node --check server/game/coup.js`, el parseo JSON de traducciones y el build de cliente pasaron. El build dejó warnings existentes de variables sin uso en `App.js` y de minificación `postcss-calc` en `ReferencePanel.css`; terminó con código 0. La issue remota fue releída en estado OPEN con F4 ACTIVE y criterios 1–6 preservados.

El Verifier independiente informó `FAIL` medio para F4 el 2026-09-27: con cinco jugadores, el asiento superior quedó a unos 81 px del borde en móvil de 390 px y 112 px en escritorio ancho, frente a los ~50 px del criterio 2. Los demás criterios pasaron estáticamente. F2 se devuelve para ajustar el desplazamiento del tablero según la geometría superior de 2–6 asientos y el ancho máximo de 900 px; no se cambia el HUD, los controles ni el protocolo. F4 se reanudará para el mismo Verifier después del build y commit del seguimiento.

El cuerpo actualizado de #28 también pide que las influencias perdidas permanentemente permanezcan visibles con tratamiento gris y símbolo/etiqueta accesible que no dependa solo del color; el rol debe seguir legible. No marcar cartas probadas temporalmente durante un desafío, ya que vuelven a Court, y no revelar las influencias ocultas activas de rivales.

## Primera fase: F1

Confirma desde la base actualizada que el modo normal tiene 15 cartas, tres por cada rol, y reparte dos por jugador; la variante opcional de dos jugadores deja tres en Court, pero no está implementada. Enumera cada `pop`, `push` y barajado de `this.deck`, la duración del Exchange y qué eventos vuelven a emitir `g-updatePlayers`. Revisa cómo incorporar el dato numérico sin revelar cartas ni cambiar protocolo de decisiones. No modifiques reglas.

Entrega `docs/plans/game-table-ux/report_issue_28_F1.md` con fuentes, observaciones, rutas y criterio de cierre. Cierra F1 con commit `docs(ui): issue 28 F1 CLOSED advance_f2`. No ejecutes tests.

## Alcance que queda para F2–F4

- Quitar la sección global de influencias; mostrar solo los nombres propios traducidos como texto debajo de las cartas propias en el asiento local. Usar `game.roles.*`.
- Mantener las influencias perdidas de forma permanente visibles y legibles con estilo gris y símbolo/etiqueta accesible; no etiquetar las cartas de prueba temporal de un desafío ni publicar identidades rivales ocultas.
- Subir moderadamente el círculo, manteniendo `You are`, `Coins`, Rules, Cheat Sheet y Event Log en sus posiciones; dejar cerca de 50 px arriba del asiento superior.
- Mostrar el conteo localizado de Court inmediatamente encima de la imagen del mazo, derivado del tamaño real `this.deck.length` que proyecta el servidor. En un Exchange pendiente hay dos cartas menos; al devolver las dos, el conteo final no cambia. Un reemplazo por desafío devuelve y roba una; tampoco cambia el total. Reinicio vuelve a inicializarlo.
- Conservar 15 cartas, cinco roles, 2–6 jugadores, identidades privadas y protocolo existentes.

El contador va encima del mazo, según la aclaración del propietario. No crear la variante opcional de dos jugadores ni una configuración de 10/20 cartas. F2 y F3 cerraron implementación y build; el propietario hará la revisión visual en el preview completo. F4 permanece pendiente para el recorrido y revisión final independiente.

## Preview local para revisión visual

- Cliente: `http://localhost:3015` — HTTP 200; proceso iniciado desde este worktree, exec session `17958`.
- Backend: `http://localhost:8015` — escuchando desde este worktree, exec session `84755` (la ruta `/` responde 404 porque no es una ruta de aplicación).
- No se creó una sala de juego. El servicio existente del puerto 8000 sigue intacto; 3015 y 8015 estaban libres antes del inicio.
- La fórmula responsive del lift se calibró para el ancho máximo de 900 px del tablero; el cliente activo recibe el CSS por HMR y el build de seguimiento terminó correctamente.
- El propietario confirmó la revisión visual y autorizó continuar el 2026-09-27. Mantener ambas sesiones activas mientras el Verifier independiente realiza la revisión final.

## Commits y validación

Cada fase con artefactos requiere commit en el único branch. F2 está `RETURNED` por el margen superior de cinco jugadores y F4 por el `FAIL` independiente. Corrige solo la geometría responsive, corre build/diff-check/sintaxis, actualiza el reporte y cierra el seguimiento F2 con commit; entonces devuelve F2 a `CLOSED` y F4 a `ACTIVE` para el mismo Verifier. No agregues ni ejecutes tests automatizados. Deja issue y unidad abiertas; no integres. No hagas push ni abras PR hasta PASS independiente.
