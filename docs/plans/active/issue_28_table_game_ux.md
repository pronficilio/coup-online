# Handoff para Agente Alquimista — issue #28

- **Issue:** https://github.com/pronficilio/coup-online/issues/28
- **Plan exacto:** `docs/plans/game-table-ux/plan_game_table_ux.md`
- **Bitácora exacta:** `docs/plans/log/issue-28.jsonl`
- **Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2/F3 `BLOCKED` hasta liberar superficies compartidas.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Branch único:** `issue/28-table-game-ux`.
- **Worktree único:** `.worktrees/issue-28-table-game-ux`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR para la unidad.

## Reclamo y aislamiento verificados

El issue se asignó a `pronficilio` y se releyó en estado `OPEN`, con título y cuerpo coincidentes y sin otros assignees. La actualización visible enlaza este handoff activo en [el comentario de reclamo](https://github.com/pronficilio/coup-online/issues/28#issuecomment-5859072354). La rama `issue/28-table-game-ux` y el worktree `.worktrees/issue-28-table-game-ux` se crearon desde `origin/master` actualizado (`5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`). Se copiaron selectivamente este handoff, el plan y la bitácora; no se copiaron ni limpiaron cambios del checkout raíz.

Estado de coordinación confirmado por el Orquestador el 2026-09-27: la rama remota de #24 está limpia, pero F2 sigue a la espera de revisión visual manual e integración; #26 tiene cambios de producto sin confirmar en `Coup.js`, `CoupStyles.css`, traducciones y servidor. F1 continúa como auditoría estática/documental, sin editar código de producto compartido. **F2 y F3 están `BLOCKED`**: no empieces esas fases ni resuelvas conflictos por inferencia; el Orquestador debe confirmar que #24 y #26 liberaron/integraron las superficies compartidas. `origin/master` avanzó de `5de95ee` a `c601410` por PR #27 mientras esta unidad estaba en F1; antes de F2 sincroniza desde el `origin/master` vigente, después de obtener esa confirmación. Conserva el branch/worktree canónico para toda la issue.

## Primera fase: F1

Confirma desde la base actualizada que el modo normal tiene 15 cartas, tres por cada rol, y reparte dos por jugador; la variante opcional de dos jugadores deja tres en Court, pero no está implementada. Enumera cada `pop`, `push` y barajado de `this.deck`, la duración del Exchange y qué eventos vuelven a emitir `g-updatePlayers`. Revisa cómo incorporar el dato numérico sin revelar cartas ni cambiar protocolo de decisiones. No modifiques reglas.

Entrega `docs/plans/game-table-ux/report_issue_28_F1.md` con fuentes, observaciones, rutas y criterio de cierre. Cierra F1 con commit `docs(ui): issue 28 F1 CLOSED advance_f2`. No ejecutes tests.

## Alcance que queda para F2–F4

- Quitar la sección global de influencias; mostrar solo los nombres propios traducidos como texto debajo de las cartas propias en el asiento local. Usar `game.roles.*`.
- Subir moderadamente el círculo, manteniendo `You are`, `Coins`, Rules, Cheat Sheet y Event Log en sus posiciones; dejar cerca de 50 px arriba del asiento superior.
- Mostrar el conteo localizado de Court inmediatamente encima de la imagen del mazo, derivado del tamaño real `this.deck.length` que proyecta el servidor. En un Exchange pendiente hay dos cartas menos; al devolver las dos, el conteo final no cambia. Un reemplazo por desafío devuelve y roba una; tampoco cambia el total. Reinicio vuelve a inicializarlo.
- Conservar 15 cartas, cinco roles, 2–6 jugadores, identidades privadas y protocolo existentes.

El contador va encima del mazo, según la aclaración del propietario. No crear la variante opcional de dos jugadores ni una configuración de 10/20 cartas.

## Commits y validación

Cada fase con artefactos requiere commit en el único branch. F2/F3 requieren build e inspección visual/estática; F4 requiere recorrido 2/3/6 jugadores en móvil/escritorio y Verifier FINAL independiente. No agregues ni ejecutes tests automatizados. Deja issue y unidad abiertas; no integres ni cierres. Reporta al Orquestador commit, archivos, evidencia y bloqueos.
