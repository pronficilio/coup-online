# Handoff para Agente Alquimista — issue #16

**Issue:** https://github.com/pronficilio/coup-online/issues/16
**Plan exacto:** `docs/plans/player-header/plan_player_header.md`
**Bitácora exacta:** `docs/plans/log/issue-16.jsonl`
**Estado:** `ACTIVE`; F1 `FAILED` — requiere reorquestación.
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Verifier requerido ahora:** no; revisión final del Orquestador.
**Branch destino de toda la issue:** `issue/16-player-header`.
**Worktree destino de toda la issue:** `.worktrees/issue-16-player-header`.
**Merge target:** `master` de `pronficilio/coup-online`.
**PR esperada:** una PR desde la rama indicada a `master`, asociada a #16.

## Reclamo y aislamiento

Reclama #16 en GitHub, relee su estado y confirma que no existe reclamo incompatible. Solo entonces crea/confirma una rama única `issue/16-player-header` y worktree `.worktrees/issue-16-player-header` desde `origin/master` actualizado. Todo el trabajo de la unidad ocurre allí; no trabajes en `master` ni abras ramas por fase. Registra `claim` y `worktree_confirmed` en esta bitácora dentro de la rama, con el commit de control que corresponda. El checkout raíz contiene cambios locales preexistentes: no los limpies ni copies a esta unidad.

## F1 — construir y revisar el encabezado

Implementa conjuntamente la fila del jugador y su estado de turno según el plan canónico. Cambia solo `coup-client/src/components/game/PlayerBoard.js`, `PlayerBoardStyles.css` y agrega `coup-client/src/assets/player.webp` y `coin.webp`. Conserva `player.money`, `props.currentPlayer`, colores fuera del turno y la geometría actual. El nombre activo recibe el neón rojo coordinado con las cartas; las monedas conservan fondo neutro. En móvil, el encabezado queda en una fila, el nombre se puede abreviar y el contador permanece entero.

Las fuentes están en el checkout de orquestación, que no forma parte del remoto: `fotos/player.webp` y `fotos/coin.webp` (raíz actual `/mnt/e/dev/coup/fotos/`). Cópialas selectivamente al worktree solo después de confirmar que son las fuentes pedidas. Conserva proporción/transparencia y versiona solo las copias WebP del cliente. No añadas PNG fuente.

**Criterios:** sigue los seis criterios de aceptación y límites de `docs/plans/player-header/plan_player_header.md`. Si no puedes evitar recortes/colisiones sin tocar asientos u otras áreas, detente y reporta evidencia al Orquestador para reorquestar.

**Evidencia:** `docs/plans/player-header/report_issue_16_F1.md` y capturas acotadas para escritorio y móvil, incluyendo ancho 320 px, composición de 2–6 jugadores, nombre largo, saldos 0/2/10 y ambos estados de turno. Registrar observaciones de eliminación y colisiones.

**Validaciones:** inspección visual/manual, `npm run build` desde `coup-client` y `git diff --check`. No añadir ni ejecutar tests automatizados. Registrar comandos y resultados reales, sin anticiparlos.

**Resultado F1 (2026-09-26):** FAILED; reorquestación requerida. La evidencia CDP confirma el saldo entero dentro del viewport CSS de 320 px, pero en 5p/6p los encabezados se cruzan con cartas/asientos laterales. El baseline tiene la misma geometría saturada; quitar las colisiones requiere mover asientos/cartas/controles, que el alcance actual prohíbe. Ver `docs/plans/player-header/report_issue_16_F1.md` y sus capturas CDP. La compilación final y `git diff --check` pasaron; no se ejecutaron tests. A petición explícita del usuario, se publicará un PR draft para revisar las capturas; F1 no está listo para integrar y la issue permanece abierta.

**Cierre:** política `COMMIT_REQUIRED` para una F1 exitosa. En este resultado fallido, el usuario autorizó publicar un PR draft solo para revisar cambios y capturas; el PR debe explicar que requiere reorquestación, sin integrar ni cerrar #16. Registrar ambos eventos en `docs/plans/log/issue-16.jsonl`.

## Pregunta de falsificación

Con seis jugadores y nombres largos a 320 px, ¿se oculta el saldo, se recorta el neón o se superpone un encabezado con otro jugador, las cartas o controles?
