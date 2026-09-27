# Handoff para Agente Alquimista — issue #28

- **Issue:** https://github.com/pronficilio/coup-online/issues/28
- **Plan exacto:** `docs/plans/game-table-ux/plan_game_table_ux.md`
- **Bitácora exacta:** `docs/plans/log/issue-28.jsonl`
- **Estado:** `ACTIVE`; F1 `CLOSED`; F2 `CLOSED` (implementación/build; revisión visual del propietario pendiente); F3 `CLOSED` (implementación/build; revisión visual del propietario pendiente); F4 `PENDING`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Branch único:** `issue/28-table-game-ux`.
- **Worktree único:** `.worktrees/issue-28-table-game-ux`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR para la unidad.

## Reclamo, aislamiento y reorientación

El issue se asignó a `pronficilio` y se releyó en estado `OPEN`, con título y cuerpo coincidentes y sin otros assignees. La actualización visible enlaza este handoff activo en [el comentario de reclamo](https://github.com/pronficilio/coup-online/issues/28#issuecomment-5859072354). La rama `issue/28-table-game-ux` y el worktree `.worktrees/issue-28-table-game-ux` se crearon desde `origin/master` actualizado (`5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`). Se copiaron selectivamente este handoff, el plan y la bitácora; no se copiaron ni limpiaron cambios del checkout raíz.

El propietario reorientó explícitamente el trabajo el 2026-09-27: autorizó implementar F2 y F3 en este único worktree pese a los solapamientos previos, pidió un preview local y reservó para sí la revisión visual. El Orquestador registró la reorientación en el issue y confirmó que los puertos 3015 y 8015 se pueden usar (no detener ni reutilizar el servicio que ya ocupa 8000). Se mantienen las restricciones de aislamiento: no modificar ni copiar cambios de #24/#26, no abrir PR, no hacer push ni integrar. Antes del código de producto, registrar y completar la sincronización con el `origin/master` vigente. La rama debe permanecer en `issue/28-table-game-ux`.

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

## Commits y validación

Cada fase con artefactos requiere commit en el único branch. F2/F3 requieren build e inspección estática. El propietario revisará visualmente el preview local, así que registra esa revisión como pendiente hasta recibirla; F4 requiere recorrido 2/3/6 jugadores en móvil/escritorio y Verifier FINAL independiente. No agregues ni ejecutes tests automatizados. Deja issue y unidad abiertas; no integres ni cierres. Reporta al Orquestador commit, archivos, evidencia y bloqueos.
