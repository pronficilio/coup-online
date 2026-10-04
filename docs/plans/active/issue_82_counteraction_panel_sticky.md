# Handoff — issue #82

**Issue:** [#82 — ajustar el título y la posición del panel de contraacciones](https://github.com/pronficilio/coup-online/issues/82), `OPEN`.
**Plan:** `docs/plans/counteraction-panel-sticky/plan_counteraction_panel_sticky.md`.
**Estado:** unidad `ACTIVE`; F1 `ACTIVE`.
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Verifier requerido ahora:** no.
**Branch/worktree/merge target:** `issue/82-counteraction-panel-sticky` / `.worktrees/issue-82-counteraction-panel-sticky` / `master`.
**Bitácora:** `docs/plans/log/issue-82.jsonl`.
**Siguiente dueño:** Agente Alquimista.

## F1 en ejecución

El claim se publicó y releyó en [la issue #82](https://github.com/pronficilio/coup-online/issues/82#issuecomment-5982324120); la issue sigue `OPEN`, sin reclamo incompatible ni PR candidata. La branch `issue/82-counteraction-panel-sticky` y el worktree `.worktrees/issue-82-counteraction-panel-sticky` se crearon desde `origin/master` en `02bcf3e` y se verificaron limpios.

El plan, el handoff y la bitácora de esta unidad ya están dentro del worktree; el handoff está en `active/`. Los eventos `claim` y `worktree_confirmed` están registrados en la bitácora. El commit de control precede al cambio de producto.

Implementa el título específico español/inglés para `challenge`, `block` y `block_challenge`; conserva el título genérico para las demás decisiones. Haz que el rail quede fijo y visible al hacer scroll en escritorio. Conserva el layout y comportamiento móvil, incluido el registro de eventos expandido. Mantén las opciones, callbacks, estados enviados/error y reglas sin cambios.

**Criterios:** título contextual visible y accesible; rail operativo durante scroll en escritorio; móvil sin cambios; build del cliente y `git diff --check` documentados. No añadas ni ejecutes pruebas automatizadas.

**Política de commit:** `COMMIT_REQUIRED` para F1. Cierra con `fix(counteraction-panel): issue 82 F1 CLOSED ready_review`.

**Pregunta de falsificación:** al desplazarse en escritorio con una decisión activa, ¿el rail sale del viewport o se solapa con el registro de eventos? ¿El layout móvil difiere del estado previo?

## Secuencia de integración

Una branch `issue/82-counteraction-panel-sticky`, un worktree `.worktrees/issue-82-counteraction-panel-sticky` y una PR hacia `master`, solo para #82. Tras implementar, actualiza la bitácora con veredicto, commit y validaciones; deja el handoff en `active/` para revisión del Orquestador. No fusiones ni cierres la unidad.
