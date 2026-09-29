# Handoff para Agente Alquimista — issue #60

- **Issue:** https://github.com/pronficilio/coup-online/issues/60 (`OPEN`, asignada a `pronficilio`; estado operativo `ACTIVE`).
- **Plan exacto:** `docs/plans/event-log-transition/plan_event_log_transition.md`.
- **Bitácora exacta:** `docs/plans/log/issue-60.jsonl` (append-only).
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no; la política predeterminada del proyecto es `NONE` para este tipo de cambio visual.
- **Pregunta de falsificación:** ¿una secuencia rápida o una vista móvil con decisión activa deja el panel a media altura, pierde scroll, oculta controles o solapa decisiones?
- **Fase activa:** F1 `ACTIVE` — implementar y validar la transición del panel.
- **Por qué sigue:** issue #40 cerró el rediseño del registro; las capturas muestran los dos estados actuales y no hay una transición entre ellos.
- **Documentos fuente:** plan anterior y actual del registro: `docs/plans/event-log-reactions/plan_event_log_reactions.md`, issue #40; referencias locales ignoradas por Git: `fotos/log1.png`, `fotos/log2.png`.
- **Subtareas listas:** medir/animar alto del panel respetando topes; entrada/salida breve del cuerpo; preservar scroll y reversiones rápidas; reducir movimiento; coordinar rail móvil si hace falta; compilar y hacer revisión visual de los casos definidos.
- **Criterios de aceptación:** ver sección correspondiente del plan y el cuerpo de issue #60; en resumen, anclaje superior, 220 ms al abrir/180 ms al cerrar como punto inicial, sin desbordamiento/salto, scroll conservado, movimiento reducido, controles accesibles y escritorio/móvil utilizables. En móvil, con el registro expandido, `.ActionDecisionRail.ActionDecisionRail--event-log-expanded` debe usar `top: 15px` y `left: 15px`.
- **Evidencia requerida:** reporte corto con resultado de `cd coup-client && npm run build`, revisión visual en ambos tamaños, clics rápidos, decisión activa en móvil y `prefers-reduced-motion`. No agregar pruebas automatizadas.
- **Riesgos/bloqueos:** las capturas están ignoradas por Git; no incluirlas en el PR. Revisar scroll y max-height durante la animación y que el nuevo anclaje no oculte controles ni solape el registro. El ajuste `top: 15px; left: 15px` del rail expandido queda incorporado a esta unidad como coordinación del estado móvil.
- **Política de commit:** `COMMIT_REQUIRED` para F1; mensaje de cierre `fix(event-log): issue 60 F1 CLOSED`.
- **Branch destino del issue:** `issue/60-event-log-transition`.
- **Worktree destino del issue:** `.worktrees/issue-60-event-log-transition`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **Bitácora:** `docs/plans/log/issue-60.jsonl`.
- **PR/MR esperado:** una única PR para issue #60 hacia `master`.

## Reclamo y aislamiento

Antes de trabajo técnico, reclama #60 en el tracker, vuelve a leer la issue y confirma que no haya un reclamo incompatible. Después crea/entra al branch y worktree canónicos desde la base actual correcta. Copia estos documentos de control al worktree, mueve el handoff de `inbox/` a `active/` y registra el reclamo/worktree en la bitácora; commitea el setup antes del código. No trabajes en `master` ni en `upstream`; no crees otra rama o PR para esta unidad.

## Validaciones y cierre de fase

F1 debe responder si el movimiento mantiene el panel usable en ambos tamaños. Cierra con build, recorrido visual documentado, criterio de falsificación respondido y un commit que contenga código, reporte y evento `phase_verdict`. Si queda un fallo material, no marques PASS ni abras la PR como lista.

**Siguiente dueño:** Agente Alquimista tras reclamar la issue.
