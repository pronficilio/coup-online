# Handoff para Agente Alquimista — issue #5

**Issue:** https://github.com/pronficilio/coup-online/issues/5

**Plan exacto:** `docs/plans/circular-board/plan_circular_board.md`

**Bitácora exacta:** `docs/plans/log/issue-5.jsonl`

**Estado:** `WAITING_ORCHESTRATOR`

**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`

**Verifier requerido ahora:** no; invocarlo al final, antes de integrar.

**Fases cerradas:** F1, asientos estables y contrato visual; F2, integración visual de WebP y mazo centrado; F3, disposición responsiva y evidencia. El Orquestador aprobó F1 en `5d77ffdc3805b3ba7b50d0d0619caca15e7613d9`; F2 se cerró tras la aprobación visual del usuario de las capturas de dos y tres jugadores. En F2 no se hizo una partida socket ni se interactuó con una decisión. En F3 se confirmó visualmente que las ventanas actuales de turno/acciones y sus controles quedan disponibles debajo del tablero, sin rediseñarlos. Reporte: `docs/plans/circular-board/report_issue_5_F3.md`. **Estado:** `WAITING_ORCHESTRATOR`; verificación independiente final pendiente.

**Branch destino de toda la issue:** `issue/5-circular-board`

**Worktree destino de toda la issue:** `.worktrees/issue-5-circular-board`

**Merge target:** `master` de `origin` (`pronficilio/coup-online`).

**PR esperado:** uno desde `issue/5-circular-board` a `master`, asociado a #5.

## Reclamo y aislamiento

El reclamo está confirmado: issue abierta, asignada a `pronficilio`, rereleída sin reclamo incompatible y sin PR previo. Branch y worktree canónicos se crearon desde `origin/master` en `febec397`. El plan, la bitácora y este handoff se copiaron al worktree; este handoff ya está en `docs/plans/active/`. `claim` y `worktree_confirmed` están registrados en la bitácora. El control se confirmó antes de F1. No trabajes desde `master` ni abras ramas por fase.

Los tres documentos nuevos de #5 (plan, handoff y bitácora) están inicialmente sin seguimiento en el checkout raíz, no aparecen automáticamente en otro worktree. Tras confirmar el reclamo, cópialos desde `E:\dev\coup` al worktree de #5 antes de mover el handoff a `active/`; conserva intactos los originales hasta confirmar que el primer commit de control del branch contiene las copias. La issue remota reproduce el alcance si necesitas contrastar las copias.

El checkout raíz `master` tiene dos commits locales de reglas y WebP y está divergido de `origin/master`; también contiene PNGs y archivos de planes sin seguimiento. No hagas reset ni limpieza. Si la rama remota carece de imágenes de personajes, copia selectivamente los WebP pertinentes desde el checkout local y registra la procedencia; no arrastres completos los commits de reglas/planes por comodidad.

## Primera subtarea y fases

- **F1 CLOSED:** tabla y tratamiento de eliminados documentados en `docs/plans/circular-board/report_issue_5_F1.md`; el cierre está en `feat(board): issue 5 F1 CLOSED advance_f2`.
- **F2 CLOSED:** `deck.webp` se convirtió desde `fotos/deck.png` conservando su alfa; se integraron las caras inglesas propias y el reverso rival, y la pila Court se centra en el tablero. El usuario aprobó las capturas visuales de dos y tres jugadores. No se hizo una partida/socket ni se interactuó con una decisión; el cierre no afirma esa validación. El reporte registra la limitación. Assets versionados: solo siete WebP; sin PNG fuente ni commits locales ajenos.
- **F3 CLOSED / READY_REVIEW:** el breakpoint compacto inicia a 520 px; matriz visual de 2..6 en escritorio/viewport estrecho, turno, pérdida/eliminación, y disponibilidad visible de controles está en el reporte F3. Las capturas documentan las vistas. `npm run start-pc` compiló y `git diff --check` pasó. Harness temporal restaurado; no hubo partida ni clic de acción por socket. Verificación independiente final pendiente.

Cada cierre de fase incluye su `report_issue_5_F*.md`, código/evidencia y evento `phase_verdict` en la misma confirmación. El plan largo contiene entradas, cierres, pivotes y límites de cada fase. Si existe una política vigente de delegación de subtareas, aplícala dentro del worktree; no inventes agentes o permisos.

## Criterios de aceptación y evidencia

Cumplir los seis criterios del plan: posiciones exactas de 2, 3 y 4; cálculo estable de 5 y 6; cartas propias/ajenas correctas; asientos persistentes; resaltado del turno; centro y WebP; controles accesibles; estructura apta para futuras animaciones sin animarlas ahora. Deja capturas de escritorio/móvil, tabla 2..6, inspección del diff de assets y comprobación del flujo de decisiones. Usa comandos de validación solo cuando resuelvan un riesgo concreto; el build disponible es `npm run build` en `coup-client`.

**Pregunta de falsificación para Verifier:** ¿hay n entre 2 y 6 o una transición de turno/pérdida/eliminación que mueva un asiento, revele una carta ajena en la interfaz, tape controles o descentre el mazo? El Verifier revisa de forma independiente el head final y emite `PASS`, `FAIL` o `BLOCKED` sin implementar.

## Revisión del Orquestador y liberación F2

El Orquestador revisó el diff de F1, el reporte y la bitácora. F1 cumple los criterios y queda aprobada; `git diff --check` y la bitácora pasaron. No se ejecutaron tests/build. El issue sigue abierto, asignado a `pronficilio`; no hay PR. F2 está `READY` y se autoriza reanudarla en el mismo worktree/branch. Siguiente dueño: Agente Alquimista.

## Alcance y límites

Fuentes: `fotos/mini.png`, `fotos/ejemplo.png`, `fotos/deck.png`, `docs/coup_*.md`, `Coup.js`, `PlayerBoard.js`, `server/index.js`. `fotos/` es local e ignorado: no commitear PNGs. Los paneles de acción/turno de `ejemplo.png` quedan para otro issue. No alterar servidor, reglas ni protocolo; el servidor actualmente comunica influencias ajenas, por lo que esta entrega solo garantiza ocultarlas en la interfaz.

**Qué actualizar:** issue al reanudar F2 y al entregar PR; este handoff a `active/`; plan/estado por fase; bitácora append-only; reportes F1-F3; PR con evidencia. Al terminar F2, deja F3 como siguiente fase y conserva el estado activo. Al terminar la unidad, deja `WAITING_ORCHESTRATOR` para revisión e integración. No cerrar la issue.

**Checkpoint F3:** F1–F3 `CLOSED`; estado global `WAITING_ORCHESTRATOR`. El tablero se verificó en vistas 2..6 y en turnos/pérdida/eliminación con eventos simulados. La acción por socket real no se recorrió y no se declara aprobada. Siguiente dueño: Orquestador para la verificación independiente final. Mantener issue abierta; no integrar ni cerrar antes de ese veredicto.
