# Handoff para el agente ejecutor

Issue: #14 — https://github.com/pronficilio/coup-online/issues/14
Plan: docs/plans/codex-ai-players/plan_codex_ai_players.md
Estado: PLANNED; iniciar solo F0 (READY)
Modo / riesgo / verificación: FULL / HIGH / PHASE (F0, F1, F2, F3 y cierre final)
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
PR: todavía no existe; debe haber una sola integración a master para esta issue.

## Primera fase lista

F0 define el contrato de vistas públicas/privadas, actor por socket, opciones por fase, respuestas concurrentes o vencidas, invitación y permisos de la palanca administrativa. Lee antes los hallazgos confirmados en:

- docs/plans/active/report_issue_3_quick_security_check_F1.md
- docs/plans/active/verifier_issue_3_final.md
- docs/coup_llm_summary.md

Pregunta de falsificación: ¿puede un invitado, otro socket o una respuesta Codex vencida aprender una mano, mutar estado o ejecutar una decisión después de que la palanca detenga Codex?

Subtareas F0: mapear cada evento del motor por actor/datos/permisos; definir la observación privada y el esquema de elección; documentar el arbitraje de desafíos y bloqueos; separar autenticación de invitado y administrador; fijar idempotencia, timeout, pausa y reanudación.

Evidencia de cierre: matriz evento × actor × información/acción, protocolo de respuesta y permiso documentados, revisión independiente del contrato de privacidad. Si las reglas no definen una transición, bloquear la decisión y pedir orquestación; no inventar reglas.

Commit de cierre F0: docs(codex-ai): issue 14 F0 contract
Validación: revisión estática del contrato; no iniciar llamadas Codex reales durante F0.
Bloqueo: ambigüedad material en reglas, identidad Socket.IO, autorización o cancelación del runner.

## Contrato global para las siguientes fases

- Codex CLI mediante login ChatGPT Plus del propietario, GPT-6 Luna y esfuerzo low/medium/high por asiento; medium inicial.
- Sin API key, facturación API ni fallback a otro modelo. Si Codex/Plus falla o llega a un límite, pausar con mensaje.
- Privacidad por asiento y autoridad del servidor se implementan antes de conectar el jugador Codex.
- Partidas humano contra dos IA e IA contra IA. Para partidas IA se valida una invitación compartida; el panel rojo administrativo usa autorización separada.
- La palanca bloquea llamadas nuevas, termina las activas cuando sea posible, invalida respuestas y pausa partidas. Al reiniciar, Codex queda deshabilitado hasta habilitación administrativa explícita.
- Límites conservadores de concurrencia, llamadas y tiempo. Registros operativos no contienen credenciales, manos ajenas ni razonamiento privado.
- No incluir texto libre de clientes ni acceso al repositorio/secretos en las solicitudes Codex; ejecutar en entorno aislado y de solo lectura.
- Issue #13 sigue siendo la unidad canónica para el despliegue en Hetzner, después de integrar esta funcionalidad.
- No comenzar F1 antes de cerrar F0; no crear ramas, worktrees ni PR por fase.

Secuencia: reclamar issue #14 en GitHub, confirmar este branch/worktree y registrar claim/worktree_confirmed en la bitácora; ejecutar F0; actualizar plan/handoff/bitácora y hacer commit de fase; solicitar el Verifier cuando indica el plan. La preparación creó el branch y worktree canónicos, pero el ejecutor debe confirmarlos tras reclamar la issue.
