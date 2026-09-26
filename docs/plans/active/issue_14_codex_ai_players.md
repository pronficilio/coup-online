# Handoff para el agente ejecutor

Issue: #14 — https://github.com/pronficilio/coup-online/issues/14
Plan: docs/plans/codex-ai-players/plan_codex_ai_players.md
Estado: ACTIVE; F0 CLOSED (PHASE PASS); F1 WAITING_EXECUTOR_REVIEW
Modo / riesgo / verificación: FULL / HIGH / PHASE (F0, F1, F2, F3 y cierre final)
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
Evidencia F1: docs/plans/active/issue_14_F1_evidence.md
Commit F1: 608089d4c839f367b9b0b0e92009d3daf536ce5c (local; sin push)
PR: todavía no existe; debe haber una sola integración a master para esta issue.

## Contrato F0 y decisiones de producto definidos

El contrato F0 está en `docs/plans/codex-ai-players/f0_contract.md`. Define vistas públicas/privadas, actor por socket/asiento, opciones por fase, respuesta id/versionada, timeout/pausa y palanca. El usuario decidió conservar el acceso actual sin cuentas/login/invitaciones, versionar las cuatro fuentes de reglas y desempatar ventanas concurrentes por orden fijo de asientos. F0 cerró con PHASE `PASS`; la implementación F1 está entregada y espera su revisión PHASE independiente. Se consultaron los hallazgos confirmados en:

- docs/plans/active/report_issue_3_quick_security_check_F1.md
- docs/plans/active/verifier_issue_3_final.md
- docs/coup_llm_summary.md

Pregunta de falsificación: ¿puede otro socket, una respuesta Codex vencida o un proceso ya activo aprender una mano, mutar estado o ejecutar una decisión después de que la palanca detenga Codex?

Subtareas F0: mapear cada evento del motor por actor/datos/permisos; definir la observación privada y el esquema de elección; documentar el arbitraje de desafíos y bloqueos; conservar la asociación efímera socket/asiento sin agregar autenticación; fijar idempotencia, timeout, pausa y reanudación.

Evidencia registrada: matriz evento × actor × información/acción y contrato de respuesta documentados en `f0_contract.md`; el informe independiente PHASE PASS está en `verifier_issue_14_F0.md`. Si las reglas no definen una transición, bloquear la decisión y pedir orquestación; no inventar reglas.

Commits F0: `6b480fa` contiene el primer contrato; `b189cc0` contiene decisiones aprobadas y reglas versionadas; el cierre documental con PHASE PASS queda en este commit. Solo el Orquestador registra `CLOSED` tras PASS del Verifier.
Validación: revisión estática del contrato; no iniciar llamadas Codex reales durante F0.
El usuario eligió orden fijo de asientos en sentido horario desde quien declara la acción/bloqueo; si varias personas responden, se escoge la primera elegible en ese orden, sin ventaja por latencia. Los documentos fuente están versionados y la transcripción es normativa. F1 corrigió la discrepancia de setup; la evidencia queda en `issue_14_F1_evidence.md`.

## Contrato global para las siguientes fases

- Codex CLI mediante login ChatGPT Plus del propietario, GPT-6 Luna y esfuerzo low/medium/high por asiento; medium inicial.
- Sin API key, facturación API ni fallback a otro modelo. Si Codex/Plus falla o llega a un límite, pausar con mensaje.
- Codex CLI GPT-6 Luna, `codex exec` y `--output-schema` están disponibles con Plus; el uso comparte límites/cuota del plan, no es ilimitado. La guía de autenticación en automatización trata `auth.json` como contraseña y dice no usar este flujo con repositorios públicos/open source; este repo es público. F2 debe resolver con Verifier la compatibilidad y demostrar aislamiento del runner respecto del repo y del proceso web antes de habilitar asientos IA; si no, bloquear sin cambiar a API.
- Privacidad por asiento y autoridad del servidor se implementan antes de conectar el jugador Codex.
- Partidas humano contra dos IA e IA contra IA, dentro del lobby/acceso actual; no se agregan cuentas ni invitaciones.
- Propuesta de operación sin auth nueva: cualquier jugador conectado puede activar la palanca roja de solo apagado; solo el propietario la vuelve a habilitar desde SSH/consola. Apagar bloquea llamadas nuevas, intenta terminar las activas, invalida respuestas y pausa partidas. Al reiniciar, Codex queda apagado.
- Límites conservadores de concurrencia, llamadas y tiempo. Registros operativos no contienen credenciales, manos ajenas ni razonamiento privado.
- No incluir texto libre de clientes ni acceso al repositorio/secretos en las solicitudes Codex; ejecutar en entorno aislado y de solo lectura.
- Issue #13 sigue siendo la unidad canónica para el despliegue en Hetzner, después de integrar esta funcionalidad.
- F0 ya cerró antes de F1; no avanzar a F2 ni crear PR por fase antes del veredicto independiente de F1.

Secuencia: issue #14 reclamada; branch/worktree confirmados; contrato y reglas versionadas; Verifier PHASE emitió `PASS` para F0 en `b189cc0`; F0 `CLOSED`. Ejecución F1 documentada en `issue_14_F1_evidence.md`: lobby y motor derivan autoridad del socket, proyección privada/pública separada, decisiones `choiceId` con IDs/versiones, arbitraje horario, timeout/pausa/reanudación limitada, corrección de reglas y pruebas `node:test`. `npm test` en `server/`, `node --check` y `git diff --check` pasan. Los checks React no corrieron por falta de `react-scripts`; no hubo partida en vivo. F1 espera revisión PHASE independiente; F2 sigue pendiente. No abrir PR ni invocar Codex en F1.
