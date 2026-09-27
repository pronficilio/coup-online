# Handoff para Agente Alquimista — issue #16

**Issue:** https://github.com/pronficilio/coup-online/issues/16
**Plan exacto:** `docs/plans/player-header/plan_player_header.md`
**Bitácora exacta:** `docs/plans/log/issue-16.jsonl`
**Estado:** `COMPLETED`; F1 inicial `FAILED`; F2 `PASSED` e integrada tras la aprobación del usuario.
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Verifier requerido ahora:** no; revisión final del Orquestador.
**Branch destino de toda la issue:** `issue/16-player-header`.
**Worktree destino de toda la issue:** `.worktrees/issue-16-player-header`.
**Merge target:** `master` de `pronficilio/coup-online`.
**Integración:** [PR #17](https://github.com/pronficilio/coup-online/pull/17), merge commit `ffcca7b8cd3006d86c68f9830fa7fb615b2cc6ca` en `master`.

## Reclamo y aislamiento

Reclama #16 en GitHub, relee su estado y confirma que no existe reclamo incompatible. Solo entonces crea/confirma una rama única `issue/16-player-header` y worktree `.worktrees/issue-16-player-header` desde `origin/master` actualizado. Todo el trabajo de la unidad ocurre allí; no trabajes en `master` ni abras ramas por fase. Registra `claim` y `worktree_confirmed` en esta bitácora dentro de la rama, con el commit de control que corresponda. El checkout raíz contiene cambios locales preexistentes: no los limpies ni copies a esta unidad.

## F1 inicial — construir y revisar el encabezado

La implementación inicial incorporó la fila del jugador, su estado de turno, los assets y una abreviación CSS del nombre. Conserva `player.money`, `props.currentPlayer`, colores fuera del turno y la geometría de asientos. El informe registró el fallo inicial de colisiones en móviles de 5p/6p.

Las fuentes están en el checkout de orquestación, que no forma parte del remoto: `fotos/player.webp` y `fotos/coin.webp` (raíz actual `/mnt/e/dev/coup/fotos/`). Cópialas selectivamente al worktree solo después de confirmar que son las fuentes pedidas. Conserva proporción/transparencia y versiona solo las copias WebP del cliente. No añadas PNG fuente.

**F1 inicial:** `FAILED`; el usuario revisó el PR draft y autorizó la reorquestación siguiente.

## F2 — revisión según feedback del usuario

Reduce bastante la letra de los nombres; elimina `…` y permite que el texto completo expanda la barra. En móvil reduce la altura de esa barra. Para las cartas rivales, reduce el ancho y conserva su proporción (`aspect-ratio: 0.68`) para que el alto se reduzca en consecuencia; las cartas propias conservan tamaño y aspecto. No muevas asientos.

**Criterios:** nombre completo visible sin truncar ni salirse del viewport, saldo completo, barra móvil más baja y sin cruces visibles con cartas rivales para 2–6 jugadores. El neón sigue el turno real y los controles/datos quedan intactos.

**Evidencia:** `docs/plans/player-header/report_issue_16_F1.md` y capturas acotadas para escritorio y móvil, incluyendo ancho 320 px, composición de 2–6 jugadores, nombre largo, saldos 0/2/10 y ambos estados de turno. Registrar observaciones de eliminación y colisiones.

**Validaciones:** inspección visual/manual, `npm run build` desde `coup-client` y `git diff --check`. No añadir ni ejecutar tests automatizados. Registrar comandos y resultados reales, sin anticiparlos.

**Resultado F1 inicial (2026-09-26):** FAILED; en 5p/6p móvil se cruzaban barras y cartas laterales. El usuario autorizó reducir la altura de cartas rivales y compactar la tipografía/barra; F2 implementó esa reorquestación. Las capturas y resultados finales están en `docs/plans/player-header/report_issue_16_F1.md`.

**Cierre:** el usuario aprobó la integración. La revisión final confirmó capturas CDP de 2–6 jugadores en 320×900 y 1280×1000, build con código 0 y `git diff --check` aprobado. PR #17 integrada en `master`; issue #16 cerrada el 2026-09-26 (UTC−06:00). No quedan acciones pendientes.

## Pregunta de falsificación

Con seis jugadores y nombres largos a 320 px, ¿se oculta el saldo, se recorta el neón o se superpone un encabezado con otro jugador, las cartas o controles?
