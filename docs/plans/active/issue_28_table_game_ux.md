# Handoff para Agente Alquimista — issue #28

- **Issue:** https://github.com/pronficilio/coup-online/issues/28
- **Plan exacto:** `docs/plans/game-table-ux/plan_game_table_ux.md`
- **Bitácora exacta:** `docs/plans/log/issue-28.jsonl`
- **Estado:** ACTIVE; F1/F3 CLOSED; F2 CLOSED en 4b1dc92 tras build y aprobación visual; F4 ACTIVE, listo para repetir con el mismo Verifier.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Branch único:** `issue/28-table-game-ux`.
- **Worktree único:** `.worktrees/issue-28-table-game-ux`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR para la unidad.

## Reclamo, aislamiento y reorientación

El issue se asignó a `pronficilio` y se releyó en estado `OPEN`, con título y cuerpo coincidentes y sin otros assignees. La actualización visible enlaza este handoff activo en [el comentario de reclamo](https://github.com/pronficilio/coup-online/issues/28#issuecomment-5859072354). La rama `issue/28-table-game-ux` y el worktree `.worktrees/issue-28-table-game-ux` se crearon desde `origin/master` actualizado (`5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`). Se copiaron selectivamente este handoff, el plan y la bitácora; no se copiaron ni limpiaron cambios del checkout raíz.

El propietario reorientó explícitamente el trabajo el 2026-09-27: autorizó implementar F2 y F3 en este único worktree pese a los solapamientos previos, pidió un preview local y reservó para sí la revisión visual. El Orquestador registró la reorientación en el issue y confirmó que los puertos 3015 y 8015 se pueden usar (no detener ni reutilizar el servicio que ya ocupa 8000). El propietario aprobó visualmente el preview y pidió continuar; el hold visual quedó levantado. Se mantienen las restricciones: no tocar worktrees/branches hermanos ni hacer cherry-pick; no hacer push ni abrir PR hasta el PASS del Verifier independiente. La rama permanece en `issue/28-table-game-ux`.

## F4 activa: sincronización con master

El 2026-09-27 se confirmó `origin/master@5fffacfdadcf3e91453bda1d13e4c0b2e3327831`, cuyo padre es `12115856c71de8b8abb5d13a81cf8458a2cae240` (#35/#26 integrado). Hubo un conflicto de contenido real en `coup-client/src/components/game/CoupStyles.css`: se conservan los estilos `.Pause*` que #26 integró y los estilos vigentes de #28; se omite `.circle`, que no tiene consumidores. No hay reglas `.InfluenceSection` ni `.InfluenceUnitContainer` activas. Los merges automáticos de `Coup.js`, `translations.json` y `server/game/coup.js` conservan las funciones integradas de pausa y los cambios #28 de Court/influencias; el escaneo no encontró cambio al protocolo de decisiones de #28. La sincronización quedó comprometida en `400c9e21a326c8c0cc56a37f380f10945590665b`. `git diff --check`, `node --check server/game/coup.js`, el parseo JSON de traducciones y el build de cliente pasaron. El build dejó warnings existentes de variables sin uso en `App.js` y de minificación `postcss-calc` en `ReferencePanel.css`; terminó con código 0. La issue remota fue releída en estado OPEN con F4 ACTIVE y criterios 1–6 preservados.

El Verifier independiente informó `FAIL` medio para F4 el 2026-09-27: con cinco jugadores, el asiento superior quedó a unos 81 px del borde en móvil de 390 px y 112 px en escritorio ancho, frente a los ~50 px del criterio 2. Los demás criterios pasaron estáticamente. F2 corrigió ese caso con un lift adicional de 6.88% del tablero cuadrado, que compensa la coordenada superior de 20.88% frente al 14% de las demás configuraciones; HUD, controles y protocolo no cambian. `git diff --check`, `node --check server/game/coup.js` y el build del cliente pasan. El mismo Verifier repetirá F4 después de sincronizar `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2`.

El seguimiento F4 sincronizó después `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2` (#37/#36, recuperación de recursos de cartas) en `caa39f1ec82eca193ce00f8b0e0f3707db142cf9`, sin conflictos. Sobre este HEAD pasan `git diff origin/master...HEAD --check`, `node --check server/game/coup.js`, parseo JSON de traducciones y bitácora JSONL; el build de cliente termina con código 0 y conserva solo los avisos conocidos. El cliente continúa respondiendo HTTP 200 en `localhost:3015`; no se ejecutaron tests automatizados. La issue #28 fue actualizada y conserva los criterios 1–6.

El 2026-09-27 se confirmó `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`; era 13 commits por delante del último sync documentado. El merge en este worktree quedó en `488405097e94dd591903a5107589e75cdee781f1`, sin conflictos. No se copiaron branches/worktrees #24 o #26. El preview `http://localhost:3015` permanece activo.

La repetición de F4 sobre `a9cbeb2` confirmó el margen superior pero devolvió F4 por un posible solapamiento en móvil. El siguiente pase, sobre `cbc0892`, confirmó que el `z-index: 4` pone el Event Log delante, pero texto y cartas todavía se cruzan a 390 px. También detectó que el lift truncado en −180 px deja márgenes de ~68 px a 1200 px de alto y ~104 px a 1440 px. Los criterios 1, 3–6 pasaron estáticamente. F2 y F4 vuelven a `ACTIVE` para corregir la geometría e incorporar el halo de respuesta pedido por el propietario.

La declaración de F2 `CLOSED` registrada para `cbc0892` fue prematura: el `z-index` priorizaba el log sin separar las superficies. Se conserva la fila append-only original y se registra su devolución correctiva. El candidato quita ese `z-index`, mantiene el anclaje vigente del Event Log (`top:10vh; right:10vw` hasta 1199 px; `top:60px; right:15px` a partir de 1200 px), 9vh de scroll y wrap de texto. En cinco jugadores y hasta 520 px limita el ancho del log y desplaza/compacta los asientos superiores para separar las cajas. El lift responsive usa `clamp(-240px, calc(...), -40px)` y evita saturarse en pantallas altas. El halo local deriva de opciones de `g-decision`, se apaga en submit (incluido Pass) y al cerrar; el indicador `--current` se suspende durante la ventana respondible local. El build final terminó con código 0; diff-check y sintaxis pasan. La revisión visual de 5p/390 px y de abrir/enviar/cerrar respuesta sigue pendiente; después el mismo Verifier puede repetir F4. Preview activo en `http://localhost:3015`.

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

El contador va encima del mazo, según la aclaración del propietario. No crear la variante opcional de dos jugadores ni una configuración de 10/20 cartas. F3 está cerrada; el seguimiento F2 compila y sus cotas son estáticas. El propietario debe revisar el preview actualizado en 5p/390 px y los estados del halo antes de repetir F4.

## Preview local para revisión visual

- Cliente: `http://localhost:3015` — HTTP 200; proceso iniciado desde este worktree, exec session `17958`.
- Backend: `http://localhost:8015` — escuchando desde este worktree, exec session `84755` (la ruta `/` responde 404 porque no es una ruta de aplicación).
- No se creó una sala de juego. El servicio existente del puerto 8000 sigue intacto; 3015 y 8015 estaban libres antes del inicio.
- La fórmula responsive del lift se calibró para el ancho máximo de 900 px del tablero; el cliente activo recibe el CSS por HMR y el build de seguimiento terminó correctamente.
- El propietario aprobó visualmente un preview anterior de dos jugadores el 2026-09-27. La revisión de este ajuste de cinco jugadores y del halo sigue pendiente; mantener ambas sesiones activas para esa comprobación.

## Commits y validación

Cada fase con artefactos requiere commit en el único branch. F2 cerró en 4b1dc92 tras build, diff-check, sintaxis y aprobación visual. F4 repite ahora con el mismo Verifier. No agregues ni ejecutes tests automatizados. Deja issue y unidad abiertas; no integres. No hagas push ni abras PR hasta PASS independiente.

## Criterio visual añadido por el propietario — incorporar en F2/F4

Issue comment: https://github.com/pronficilio/coup-online/issues/28#issuecomment-5860766944.

Cuando una acción abre una ventana de respuesta, ilumina el borde rojo del asiento local si este cliente ofrece al usuario al menos un botón/opción para elegir (por ejemplo, Challenge, Block o Pass). Esto aplica aunque `currentPlayer` siga siendo quien inició la acción. Apaga el borde al enviar cualquier respuesta, incluido Pass, y al cerrarse la decisión. No ilumines a un cliente/asiento sin opciones disponibles; no cambies reglas ni protocolo.

Alquimista: F2 cerró en 4b1dc92 y el propietario aprobó visualmente el candidato. El mismo Verifier repetirá F4 para comprobar encendido, apagado tras envío y cierre del halo, además de los criterios existentes. No push/PR hasta PASS.
