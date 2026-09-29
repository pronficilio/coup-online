# Handoff para Agente Alquimista — issue #62

- **Issue:** https://github.com/pronficilio/coup-online/issues/62 (`OPEN`, asignada a `pronficilio`; estado operativo `WAITING_ORCHESTRATOR`).
- **Plan exacto:** `docs/plans/codex-event-reactions/plan_codex_event_reactions.md`.
- **Bitácora exacta:** `docs/plans/log/issue-62.jsonl` (append-only).
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente.
- **Estado actual:** F0 `CLOSED` tras addendum documental solicitado en revisión; unidad `WAITING_ORCHESTRATOR`. F1 y F2 siguen `PENDING`; no iniciar F1 hasta autorización explícita del Orquestador.
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

Reclamo completado: #62 se asignó a `pronficilio` y se releyó en el fork; sigue abierta, coincide con este handoff y no hay reclamo incompatible ni PR canónica previa. La branch `issue/62-codex-event-reactions` y el worktree `.worktrees/issue-62-codex-event-reactions` parten de `origin/master@b39f649`. El handoff está en `active/`; el commit de setup registra `claim` y `worktree_confirmed` antes de F0. F0 se cerró como análisis estático, con reporte `docs/plans/codex-event-reactions/report_issue_62_F0.md`; la unidad queda en espera de revisión. No trabajar en `master`, upstream ni en el worktree de otra unidad.

## F0 — Contrato antes de producto

F0 pasó por `RETURNED / WAITING_EXECUTOR` a solicitud del Orquestador para un addendum, y se cierra ahora como `CLOSED`. Codex selecciona de forma declarativa: repetir el mismo emoji/evento conserva la selección, otro emoji la reemplaza, y `reaction: null` o ausencia no cambia el estado; no hay toggle Codex. El toggle humano #40 permanece intacto. La salida App Server tiene `choiceId` legal obligatorio y `reaction` presente como `null` o como `{eventId, emoji}` exacto; el parser valida `choiceId` independientemente y descarta candidatos fuera de oportunidad/catálogo sin perderlo. El plan define allowlist exacta de campos y tipos de `event.data` por cada `event.type`. Evidencia y esquema: `docs/plans/codex-event-reactions/report_issue_62_F0.md`. Unidad `WAITING_ORCHESTRATOR`; no comiences F1 sin aprobación explícita.

## F1/F2 y límites

Con F0 aprobado, integra la reacción en la misma llamada/respuesta Codex con semántica declarativa para Codex y conserva los canales ya usados por clientes y espectadores. Reporta por separado aceptación de `choiceId`, omisión/rechazo de reacción opcional, stale IDs, actor Codex, conteos propios/ajenos y ausencia de filtración. El Verifier FINAL es independiente y read-only. No escribas al upstream, no despliegues y no hagas llamadas reales al modelo.

## Addendum de revisión del Orquestador

El Orquestador devolvió F0 para fijar idempotencia Codex, el schema estricto nullable exacto y la allowlist de `event.data`. F0 regresó a `CLOSED` al quedar registrados esos tres puntos en plan/reporte/bitácora. No se inició F1 ni se tocó código. El checkout raíz conserva intacto el trabajo local de #60; no se modificaron sus archivos.
