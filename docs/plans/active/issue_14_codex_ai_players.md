# Handoff para el agente ejecutor

Issue: #14 — https://github.com/pronficilio/coup-online/issues/14
Plan: docs/plans/codex-ai-players/plan_codex_ai_players.md
Estado: WAITING_USER; F0 BLOCKED; F1 PENDING
Modo / riesgo / verificación: FULL / HIGH / PHASE (F0, F1, F2, F3 y cierre final)
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
PR: todavía no existe; debe haber una sola integración a master para esta issue.

## Contrato F0 documentado; decisiones pendientes

El contrato F0 está en `docs/plans/codex-ai-players/f0_contract.md`. Define vistas públicas/privadas, actor, opciones por fase, respuesta id/versionada, timeout/pausa, invitación y palanca. F0 está bloqueada hasta recibir aprobación de tres propuestas; después corresponde el checkpoint PHASE independiente antes de F1. Se consultaron los hallazgos confirmados en:

- docs/plans/active/report_issue_3_quick_security_check_F1.md
- docs/plans/active/verifier_issue_3_final.md
- docs/coup_llm_summary.md

Pregunta de falsificación: ¿puede un invitado, otro socket o una respuesta Codex vencida aprender una mano, mutar estado o ejecutar una decisión después de que la palanca detenga Codex?

Subtareas F0: mapear cada evento del motor por actor/datos/permisos; definir la observación privada y el esquema de elección; documentar el arbitraje de desafíos y bloqueos; separar autenticación de invitado y administrador; fijar idempotencia, timeout, pausa y reanudación.

Evidencia registrada: matriz evento × actor × información/acción y contrato de respuesta documentados en `f0_contract.md`; la revisión PHASE sigue pendiente. Si las reglas no definen una transición, bloquear la decisión y pedir orquestación; no inventar reglas.

Commit documental de espera F0: docs(codex-ai): issue 14 F0 pending decisions
Validación: revisión estática del contrato; no iniciar llamadas Codex reales durante F0.
Decisiones elevadas al usuario/Orquestador, aún no aprobadas: (1) desempate de challenges/blocks concurrentes; (2) identidad autenticada de propietario/admin, invitaciones y reconexión; (3) si el resumen de reglas es normativa y debe versionarse en la base, incluida discrepancia de inicio/monedas en dos jugadores. No se cambió código.

## Contrato global para las siguientes fases

- Codex CLI mediante login ChatGPT Plus del propietario, GPT-6 Luna y esfuerzo low/medium/high por asiento; medium inicial.
- Sin API key, facturación API ni fallback a otro modelo. Si Codex/Plus falla o llega a un límite, pausar con mensaje.
- Codex CLI GPT-6 Luna, `codex exec` y `--output-schema` están disponibles con Plus; el uso comparte límites/cuota del plan, no es ilimitado. La guía de autenticación en automatización trata `auth.json` como contraseña y dice no usar este flujo con repositorios públicos/open source; este repo es público. F2 debe resolver con Verifier la compatibilidad y demostrar aislamiento del runner respecto del repo y del proceso web antes de atender invitados; si no, bloquear sin cambiar a API.
- Privacidad por asiento y autoridad del servidor se implementan antes de conectar el jugador Codex.
- Partidas humano contra dos IA e IA contra IA. Para partidas IA se valida una invitación compartida; el panel rojo administrativo usa autorización separada.
- La palanca bloquea llamadas nuevas, termina las activas cuando sea posible, invalida respuestas y pausa partidas. Al reiniciar, Codex queda deshabilitado hasta habilitación administrativa explícita.
- Límites conservadores de concurrencia, llamadas y tiempo. Registros operativos no contienen credenciales, manos ajenas ni razonamiento privado.
- No incluir texto libre de clientes ni acceso al repositorio/secretos en las solicitudes Codex; ejecutar en entorno aislado y de solo lectura.
- Issue #13 sigue siendo la unidad canónica para el despliegue en Hetzner, después de integrar esta funcionalidad.
- No comenzar F1 antes de cerrar F0; no crear ramas, worktrees ni PR por fase.

Secuencia: issue #14 reclamada con comentario visible 5846606137; branch/worktree confirmados y registrados en la bitácora; contrato documental comprometido. Estado de unidad `WAITING_USER`; F0 `BLOCKED` y F1 `PENDING`. No iniciar F1 ni solicitar Verifier PHASE hasta resolver las decisiones pendientes. No abrir PR ni invocar Codex desde F0.
