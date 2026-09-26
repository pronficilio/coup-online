# Handoff para Agente Alquimista — issue #16

**Issue:** https://github.com/pronficilio/coup-online/issues/16
**Plan exacto:** `docs/plans/player-header/plan_player_header.md`
**Bitácora exacta:** `docs/plans/log/issue-16.jsonl`
**Estado:** `ACTIVE`; F1 inicial `FAILED`; F2 `READY_FOR_USER_REVIEW` tras reorquestación solicitada por el usuario.
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Verifier requerido ahora:** no; revisión final del Orquestador.
**Branch destino de toda la issue:** `issue/16-player-header`.
**Worktree destino de toda la issue:** `.worktrees/issue-16-player-header`.
**Merge target:** `master` de `pronficilio/coup-online`.
**PR esperada:** una PR desde la rama indicada a `master`, asociada a #16.

## Reclamo y aislamiento

Reclama #16 en GitHub, relee su estado y confirma que no existe reclamo incompatible. Solo entonces crea/confirma una rama única `issue/16-player-header` y worktree `.worktrees/issue-16-player-header` desde `origin/master` actualizado. Todo el trabajo de la unidad ocurre allí; no trabajes en `master` ni abras ramas por fase. Registra `claim` y `worktree_confirmed` en esta bitácora dentro de la rama, con el commit de control que corresponda. El checkout raíz contiene cambios locales preexistentes: no los limpies ni copies a esta unidad.

## F1 inicial — construir y revisar el encabezado

La implementación inicial incorporó la fila del jugador, su estado de turno, los assets y una abreviación CSS del nombre. Conserva `player.money`, `props.currentPlayer`, colores fuera del turno y la geometría de asientos. El informe registró el fallo inicial de colisiones en móviles de 5p/6p.

Las fuentes están en el checkout de orquestación, que no forma parte del remoto: `fotos/player.webp` y `fotos/coin.webp` (raíz actual `/mnt/e/dev/coup/fotos/`). Cópialas selectivamente al worktree solo después de confirmar que son las fuentes pedidas. Conserva proporción/transparencia y versiona solo las copias WebP del cliente. No añadas PNG fuente.

**F1 inicial:** `FAILED`; el usuario revisó el PR draft y autorizó la reorquestación siguiente.

## F2 — revisión según feedback del usuario

Reduce bastante la letra de los nombres; elimina `…` y permite que el texto completo expanda la barra. En móvil reduce la altura de esa barra y reduce también la altura de las cartas rivales. Se permite ajustar el alto visual de `PlayerInfluenceSlot` en CSS; conserva las cartas propias completas y no muevas asientos.

**Criterios:** nombre completo visible sin truncar ni salirse del viewport, saldo completo, barra móvil más baja y sin cruces visibles con cartas rivales para 2–6 jugadores. El neón sigue el turno real y los controles/datos quedan intactos.

**Evidencia:** `docs/plans/player-header/report_issue_16_F1.md` y capturas acotadas para escritorio y móvil, incluyendo ancho 320 px, composición de 2–6 jugadores, nombre largo, saldos 0/2/10 y ambos estados de turno. Registrar observaciones de eliminación y colisiones.

**Validaciones:** inspección visual/manual, `npm run build` desde `coup-client` y `git diff --check`. No añadir ni ejecutar tests automatizados. Registrar comandos y resultados reales, sin anticiparlos.

**Resultado F1 inicial (2026-09-26):** FAILED; en 5p/6p móvil se cruzaban barras y cartas laterales. El usuario autorizó reducir la altura de cartas rivales y compactar la tipografía/barra; F2 implementa esa reorquestación. Las capturas nuevas y resultados actuales están en `docs/plans/player-header/report_issue_16_F1.md`. La issue permanece abierta y el [PR #17](https://github.com/pronficilio/coup-online/pull/17) sigue en draft.

**Cierre:** compilar y revisar manualmente F2; mantener el PR draft para revisión del usuario, sin fusionar ni cerrar #16. Registrar el resultado y las capturas nuevas en `docs/plans/log/issue-16.jsonl`.

## Pregunta de falsificación

Con seis jugadores y nombres largos a 320 px, ¿se oculta el saldo, se recorta el neón o se superpone un encabezado con otro jugador, las cartas o controles?
