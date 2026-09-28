# PHASE independiente F3 — issue #24, renderer de acciones del turno

**Estado:** `READY_FOR_INDEPENDENT_RECHECK`; debe ejecutarlo un Verifier distinto del primer intento F3 sobre el HEAD publicado que indique Orquestación.
**Issue:** [#24](https://github.com/pronficilio/coup-online/issues/24), todavía `OPEN`, asignada a `pronficilio`.
**Plan:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`.
**Reporte de implementación F2:** `docs/plans/turn-action-row-clarity/report_issue_24_F2.md`.
**Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`; destino `master` del fork.
**Base actual:** rebase sobre `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`. Revisar el HEAD publicado que acompaña este handoff y confirmar que el worktree esté limpio.

**Primer resultado F3:** `FAIL` en `6d63199910c5a0e3b24ed60c847eef1bb231f6f7`; reporte en `docs/plans/turn-action-row-clarity/report_issue_24_F3.md`. F2 eliminó la segunda llamada action en `DecisionsSection`; verificar el commit exacto que Orquestación proporcione tras confirmar el push.

## Límite de la verificación

F2 se cerró previamente `CLOSED / PASS` por aprobación de la usuaria del preview, con una excepción explícita de AC9: ella observó que los detalles se desmontan sin animación/transición visible y aceptó expresamente esa limitación. F2 está reabierta por el doble montaje hallado abajo. El waiver AC9 sigue vigente; no reportar esa transición como verificada ni pedir al usuario que vuelva a aprobarlo. Verificar el resto de AC9 y el renderer; si se descubre cualquier limitación adicional, documentarla como hallazgo y devolverla al Orquestador.

La usuaria no cerró issue ni aprobó PR/integración. El Verifier debe limitarse a revisión, evidencia, build y handoff; no cambiar estado remoto de issue, abrir PR, integrar ni cerrar.

## Pregunta de falsificación

¿Puede refutarse que el renderer de `decision.type === 'action'` conserva elegibilidad y `choiceId` del servidor, que las filas omitidas no crean controles/huecos, o que rail y CheatSheet mantienen su relación durante scroll y al compactar?

## Ataques prioritarios

1. **Opciones y emisión:** contrastar filas y objetivos con `decision.options`; confirmar que solo aparecen acciones con al menos una opción y que no se sintetiza ningún ID. Revisar target, Cancelar y emisión única del objeto/`choiceId` original. No-action decisions deben conservar su renderer vigente.
2. **Rail y ancla:** comprobar en DOM que `ActionDecisionRail` está en portal a `document.body` y usa `position: absolute`; revisar que la medición use `getBoundingClientRect() + scrollX/scrollY`, que no se recalculen coordenadas al hacer scroll y que resize vuelva a medir el ancla. Recorrer scroll inicial y repetido para refutar deriva, cambio de alineación/gap, z-index insuficiente o interferencia con PlayerBoard/cartas.
3. **Filas, foco y divisor:** revisar estado normal, hover, foco teclado, foco restaurado/cancelación, separador como hermano del hover entre filas permitidas consecutivas; confirmar responsive, touch/no-hover, textos ES/EN y `prefers-reduced-motion`.
4. **Ciclo compacto:** decisión nueva inicia expandida; mouseenter habilita el ciclo; mouseleave compacta tras 500 ms; reentrada previa cancela timer y restaura; compacto conserva títulos, precios y controles, ocupa 50% del ancho normal del rail y baja solo `.DecisionActionLabel` a 70%; los detalles se desmontan/remontan. La ausencia de animación al desmontar es la excepción aceptada; la transición de ancho/font-size sigue sujeta a revisión. Touch/no-hover no compacta. Confirmar cleanup al cambiar/cerrar/pausar/finalizar decisión y unmount.
5. **Integración master:** revisar especialmente `Coup.js` después del rebase: pause overlay, estado `gamePaused`, bloqueo de decisiones y retorno de foco deben conservar comportamiento de master mientras el renderer action usa timers/rail. Revisar conflictos resueltos en `Coup.js`; no aceptar que se haya perdido el flujo de pausa o el ciclo de compactación.
6. **Foco del fallo previo:** para una decisión action debe existir exactamente un `.DecisionActionPanel`, dentro de `.ActionDecisionRail`; `DecisionsSection` no debe montar una segunda copia. Comprobar que no hay IDs duplicados, que `firstActionTargetRef` apunta a la instancia del rail y que abrir/cancelar target devuelve el foco a la fila del mismo panel. El botón Codex de emergencia debe seguir en `DecisionsSection`; los decision types no-action deben conservar ahí su renderer.

## Validación y entrega

- Ejecutar `git diff --check` y build frontend según instrucciones del plan; no añadir ni ejecutar tests automatizados.
- Hacer recorrido manual con las decisiones/montos disponibles; si no se puede, separar claramente revisión estática de evidencia de navegador.
- Registrar resultado, archivos/líneas y comandos reales en `docs/plans/turn-action-row-clarity/report_issue_24_F3.md` y añadir evento append-only en `docs/plans/log/issue-24.jsonl`.
- Si `PASS`, entregar el HEAD exacto al Orquestador para revisión de una única PR. Si hay hallazgo, describir reproducción, criterio y severidad y devolver a F2. No modificar código de producto como parte de la verificación.
