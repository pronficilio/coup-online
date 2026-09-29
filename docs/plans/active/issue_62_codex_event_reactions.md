# Handoff para Agente Alquimista — issue #62

- **Issue:** https://github.com/pronficilio/coup-online/issues/62 (`OPEN`, asignada a `pronficilio`; estado operativo `WAITING_ORCHESTRATOR`).
- **Plan exacto:** `docs/plans/codex-event-reactions/plan_codex_event_reactions.md`.
- **Bitácora exacta:** `docs/plans/log/issue-62.jsonl` (append-only).
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente.
- **Fase inicial:** F0 `CLOSED`; la matriz y el contrato están listos para revisión. No iniciar F1 hasta autorización explícita del Orquestador.
- **Pregunta de falsificación:** ¿una reacción omitida/inválida/obsoleta afecta una elección de juego válida, expone identidad privada o se atribuye a asiento/evento incorrecto?
- **Dependencias ya integradas:** #14 runner Codex y #40 registro tipado con conteos agregados/presencia. Issue #60 solo anima el panel, no es dependencia funcional; no tocarla.
- **Alcance:** enlazar oportunidad de reacción a una decisión Codex existente, exponer solo conteos agregados de terceros y aceptar una reacción opcional junto a `choiceId`, aplicándola desde el asiento de servidor.
- **Supuesto de término:** «contracción» significa respuesta/contraacción a una acción: desafío, bloqueo y decisiones asociadas de esa resolución. F0 documenta el mapa exacto de decisión a evento.
- **No cambiar:** reglas, opciones legales, ventanas, tiempo de Codex, cantidad de llamadas, UI humana, proveedor/modelo, herramientas, cuentas o acceso. No inventar evento si aún no se emitió uno.
- **Criterios:** ver AC1–AC8 en el plan. Conteos excluyen el asiento Codex; salida cosmética inválida se descarta sin perder `choiceId` legal; ID/versión y acción siguen validados por el servidor.
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

F0 `CLOSED`. El plan incorpora la matriz decisión→evento, la forma exacta de observación/salida y la secuencia de validación y aplicación. Evidencia estática, fuentes inspeccionadas y límite de privacidad/autoridad: `docs/plans/codex-event-reactions/report_issue_62_F0.md`. Queda pendiente la revisión del Orquestador, incluido el comportamiento de toggle si Codex repite su reacción propia no observada. No comiences F1 sin aprobación explícita.

## F1/F2 y límites

Con F0 aprobado, integra la reacción en la misma llamada/respuesta Codex. La función compartida debe conservar los canales ya usados por clientes y espectadores. Reporta por separado aceptación de `choiceId`, omisión/rechazo de reacción opcional, stale IDs, actor Codex, conteos propios/ajenos y ausencia de filtración. El Verifier FINAL es independiente y read-only. No escribas al upstream, no despliegues y no hagas llamadas reales al modelo.
