# Handoff para Agente Alquimista — issue #62

- **Issue:** https://github.com/pronficilio/coup-online/issues/62 (`OPEN`, asignada a `pronficilio`; estado operativo `WAITING_ORCHESTRATOR`).
- **Plan exacto:** `docs/plans/codex-event-reactions/plan_codex_event_reactions.md`.
- **Bitácora exacta:** `docs/plans/log/issue-62.jsonl` (append-only).
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente.
- **Estado actual:** F0 y F1 `CLOSED`; F0 aprobado por el Orquestador; F1 corregida tras devolución P3 y lista para re-revisión; F2 `PENDING`.
- **Pregunta de falsificación:** ¿una reacción omitida/inválida/obsoleta afecta una elección de juego válida, expone identidad privada o se atribuye a asiento/evento incorrecto?
- **Dependencias ya integradas:** #14 runner Codex y #40 registro tipado con conteos agregados/presencia. Issue #60 solo anima el panel, no es dependencia funcional; no tocarla.
- **Alcance:** enlazar oportunidad de reacción a una decisión Codex existente, exponer solo conteos agregados de terceros y aceptar una reacción opcional junto a `choiceId`, aplicándola desde el asiento de servidor.
- **Supuesto de término:** «contracción» significa respuesta/contraacción a una acción: desafío, bloqueo y decisiones asociadas de esa resolución. F0 documenta el mapa exacto de decisión a evento.
- **No cambiar:** reglas, opciones legales, ventanas, tiempo de Codex, cantidad de llamadas, UI humana, proveedor/modelo, herramientas, cuentas o acceso. No inventar evento si aún no se emitió uno.
- **Criterios:** ver AC1–AC8 en el plan. Conteos excluyen el asiento Codex; el parser valida `choiceId` legal independientemente y descarta un candidato de reacción ajeno al evento/catálogo sin perderlo; ID/versión y acción siguen validados por el servidor.
- **Evidencia:** contrato/matriz F0; reporte F1 de flujo, esquemas, privacidad y rutas del asiento; informe independiente F2 `PASS|FAIL|BLOCKED`.
- **Política de validación:** no agregar ni ejecutar pruebas automatizadas durante esta unidad; revisión estática y Verifier independiente según el plan. No desplegar ni iniciar Codex real.
- **Política de commit:** `COMMIT_REQUIRED` al cerrar F0 y F1; mantener ambos commits en la branch única. Informe/veredicto F2 se incorpora según revisión y contrato del repositorio.
- **Branch destino:** `issue/62-codex-event-reactions`.
- **Worktree destino:** `.worktrees/issue-62-codex-event-reactions`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **Única integración esperada:** una PR para #62; antes de abrirla confirma que no exista otra PR canónica.

## Reclamo y aislamiento

Reclamo completado: #62 se asignó a `pronficilio` y se releyó en el fork; sigue abierta, coincide con este handoff y no hay reclamo incompatible ni PR canónica previa. La branch `issue/62-codex-event-reactions` y el worktree `.worktrees/issue-62-codex-event-reactions` partieron de `origin/master@b39f649` y se sincronizaron primero con `origin/master@6b1d54f` tras #64. Después de corregir el hallazgo P3 de F2, el Orquestador pidió sincronizar el `origin/master@9ef5856` actual, que incluye #65/#63; el merge `e84abc3` se hizo solo en la branch #62 y preserva las entradas #62 y #63 del README. F0 quedó cerrado y aprobado con el reporte `docs/plans/codex-event-reactions/report_issue_62_F0.md`; F1 corregida espera re-revisión. No trabajar en `master`, upstream ni en el worktree de otra unidad.

## F0 — Contrato antes de producto

F0 pasó por `RETURNED / WAITING_EXECUTOR` a solicitud del Orquestador y se cerró como `CLOSED`; el Orquestador aprobó el contrato el 2026-09-29 y autorizó F1. Codex selecciona de forma declarativa: repetir el mismo emoji/evento conserva la selección, otro emoji la reemplaza, y `reaction: null` o ausencia no cambia el estado; no hay toggle Codex. El toggle humano #40 permanece intacto. La salida App Server tiene `choiceId` legal obligatorio y `reaction` presente como `null` o como `{eventId, emoji}` exacto; el parser valida `choiceId` independientemente y descarta candidatos fuera de oportunidad/catálogo sin perderlo. El plan define allowlist exacta de campos y tipos de `event.data` por cada `event.type`. Evidencia: `docs/plans/codex-event-reactions/report_issue_62_F0.md`.

## F1/F2 y límites

F1 `CLOSED` tras corrección P3: integra la reacción en la misma llamada/respuesta Codex con semántica declarativa para Codex y conserva los canales ya usados por clientes y espectadores. La revisión F2 preliminar reportó `PASS` para AC1–AC8, pero detectó que `validatePublicEventData()` permitía claves requeridas u opcionales con valor `undefined`; la fase volvió a F1 para corregirlo. Ahora los requeridos deben existir y no ser `undefined`, y los opcionales presentes tampoco pueden valer `undefined`, conservando `exactKeys`. F2 vuelve a `PENDING` para re-revisión independiente. `git diff --check` pasó; no se agregaron ni ejecutaron pruebas automatizadas ni se llamó al runner/modelo. No se escribió al upstream ni se desplegó. La unidad queda `WAITING_ORCHESTRATOR`.

## Addendum de revisión del Orquestador

El Orquestador devolvió F0 para fijar idempotencia Codex, el schema estricto nullable exacto y la allowlist de `event.data`; luego aprobó F0 y autorizó F1. La branch se sincronizó con `origin/master@6b1d54f`, incluyendo #64 y su cierre. Tras la devolución P3 se integró `origin/master@9ef5856` en la branch #62, conservando #62/#63 en README. El checkout raíz no fue modificado por esta unidad.

## F1 — Implementación lista para revisión

F1 conserva el mismo request/turno Codex. `reactionOpportunity` contiene solo el último evento público proyectado por allowlist, su catálogo y conteos agregados de asientos distintos al Codex. El schema App Server requiere `{choiceId, reaction}` con `reaction` nullable y forma exacta `{eventId, emoji}`; el parser valida primero `choiceId` y descarta una reacción inválida sin perder una elección legal. Cuando no hay reacción seleccionada, el objeto de éxito interno y la línea JSONL del runner omiten la clave para mantener la interfaz anterior. Tras aceptar la elección, el servidor vuelve a comprobar evento/catálogo y aplica la selección declarativa desde `player.seat`; la ruta humana `reactToEvent()` permanece sin cambios. Evidencia: `docs/plans/codex-event-reactions/report_issue_62_F1.md`.

## Devolución P3 de F2 y corrección

El Orquestador reportó `PASS` para AC1–AC8 junto con este borde P3 y devolvió F1 antes de cerrar F2: el validador de `event.data` aceptaba un required ausente por ser `undefined`, o un optional explícito `undefined`; `JSON.stringify` elimina ambas propiedades. Se corrigió el validador manteniendo `exactKeys`, y F2 queda `PENDING` para re-revisión independiente. El reporte F1 conserva esta observación y evidencia del fix.
