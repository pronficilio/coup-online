# Handoff para el agente ejecutor

Issue: #14 — https://github.com/pronficilio/coup-online/issues/14
Plan: docs/plans/codex-ai-players/plan_codex_ai_players.md
Estado: ACTIVE; F0/F1 CLOSED (PHASE PASS); F2 App Server y runner aislado implementados; F3 IA/lobby/kill switch implementados. El release `466a3b5` está activo en Hetzner: API y runner `healthy`, la web responde HTTP 200 y el runner sigue aislado en su propia red sin puertos publicados. OAuth normal se completó por túnel SSH y `codex login status` confirmó la sesión en el volumen privado. Una decisión real de GPT-6 Luna con esfuerzo `low` pasó por API → runner y devolvió una opción legal (`steal:1`).
Modo / riesgo / verificación: FULL / HIGH / PHASE (F0, F1, F2, F3 y cierre final)
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
Evidencia F1: docs/plans/active/issue_14_F1_evidence.md
Contrato/evidencia F2: docs/plans/codex-ai-players/f2_codex_runner.md
Implementación inicial revisada: 608089d4c839f367b9b0b0e92009d3daf536ce5c; las dos correcciones pasaron PHASE en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`.
PR: todavía no existe; el usuario pidió una prueba temporal y no publicar cambios al fork.
Siguiente paso: prueba manual del lobby en `https://coup.ejele.net`: persona contra dos IA y luego IA contra IA con el creador como espectador; verificar desafíos/bloqueos y la palanca roja. El código compartido se lee desde el `.env` privado por SSH y se introduce en el campo del lobby; no va en la URL. Si se activa la palanca roja, el rearme es manual desde el servidor. Mantener la rama sin publicar y no abrir PR.

## Contrato F0 y decisiones de producto definidos

El contrato F0 está en `docs/plans/codex-ai-players/f0_contract.md`. Define vistas públicas/privadas, actor por socket/asiento, opciones por fase, respuesta id/versionada, timeout/pausa y palanca. El usuario decidió conservar el acceso actual sin cuentas/login/invitaciones, versionar las cuatro fuentes de reglas y desempatar ventanas concurrentes por orden fijo de asientos. F0 cerró con PHASE `PASS`. F1 fue devuelta tras PHASE `FAIL`; los dos hallazgos y la evidencia están en `verifier_issue_14_F1.md`. Se consultaron los hallazgos confirmados en:

- docs/plans/active/report_issue_3_quick_security_check_F1.md
- docs/plans/active/verifier_issue_3_final.md
- docs/coup_llm_summary.md

Pregunta de falsificación: ¿puede otro socket, una respuesta Codex vencida o un proceso ya activo aprender una mano, mutar estado o ejecutar una decisión después de que la palanca detenga Codex?

Subtareas F0: mapear cada evento del motor por actor/datos/permisos; definir la observación privada y el esquema de elección; documentar el arbitraje de desafíos y bloqueos; conservar la asociación efímera socket/asiento sin agregar autenticación; fijar idempotencia, timeout, pausa y reanudación.

Evidencia registrada: matriz evento × actor × información/acción y contrato de respuesta documentados en `f0_contract.md`; el informe independiente PHASE PASS está en `verifier_issue_14_F0.md`. Si las reglas no definen una transición, bloquear la decisión y pedir orquestación; no inventar reglas.

Commits F0: `6b480fa` contiene el primer contrato; `b189cc0` contiene decisiones aprobadas y reglas versionadas; el cierre documental con PHASE PASS queda en este commit. Solo el Orquestador registra `CLOSED` tras PASS del Verifier.
Validación: revisión estática del contrato; no iniciar llamadas Codex reales durante F0.
El usuario eligió orden fijo de asientos en sentido horario desde quien declara la acción/bloqueo; si varias personas responden, se escoge la primera elegible en ese orden, sin ventaja por latencia. Los documentos fuente están versionados y la transcripción es normativa. F1 corrigió las discrepancias de reglas y cerró con PHASE `PASS`; evidencia y revisión están en `issue_14_F1_evidence.md` y `verifier_issue_14_F1_recheck.md`.

## Contrato global para las siguientes fases

- Codex App Server mediante login ChatGPT del propietario, GPT-6 Luna y esfuerzo low/medium/high por asiento; medium inicial. La disponibilidad quedó confirmada el 2026-09-26 con una llamada real `low` que devolvió una elección legal.
- Sin API key, facturación API ni fallback a otro modelo. Si Codex/Plus falla o llega a un límite, pausar con mensaje.
- La guía oficial ofrece App Server para integrar Codex dentro de productos, pero clasifica el protocolo como experimental/no soportado en producción; el uso aquí es una prueba temporal. El runner no monta el repo ni recibe texto libre, y el API web no ve la sesión. Si Luna no aparece en la cuenta, pausar sin cambiar de modelo ni usar API.
- Privacidad por asiento y autoridad del servidor se implementan antes de conectar el jugador Codex.
- Partidas humano contra dos IA e IA contra IA, dentro del lobby/acceso actual; no se agregan cuentas ni invitaciones.
- Propuesta de operación sin auth nueva: cualquier jugador conectado puede activar la palanca roja de solo apagado; solo el propietario la vuelve a habilitar desde SSH/consola. Apagar bloquea llamadas nuevas, intenta terminar las activas, invalida respuestas y pausa partidas. Al reiniciar, Codex queda apagado.
- Límites conservadores de concurrencia, llamadas y tiempo. Registros operativos no contienen credenciales, manos ajenas ni razonamiento privado.
- No incluir texto libre de clientes ni acceso al repositorio/secretos en las solicitudes Codex; ejecutar en entorno aislado y de solo lectura.
- El usuario autorizó desplegar esta prueba en Hetzner desde un release separado y reversible; no se tocará DNS/Nginx ni el release anterior. El branch no se publicará al fork.
- F0 y F1 cerraron con PHASE `PASS`. La guía operativa POC está en `docs/plans/codex-ai-players/poc-runbook.md`.

Secuencia actual: Issue #14 y branch/worktree conservados; F0 `b189cc0`; F1 `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`. La rama integra la base de Hetzner `55be894`. El release `466a3b5` está activo y conserva `5a13376` y `55be894` para rollback. La imagen del runner instala `ca-certificates`; Compose valida y los servicios API, runner y web están saludables. La sesión OAuth normal persiste en `coup_codex_state`; el runner permanece en `coup_codex_egress`, sin puertos publicados. Smoke real API→runner→GPT-6 Luna `low` PASS con opción legal `steal:1`. El código de acceso no se registró ni publicó. Faltan las comprobaciones manuales del lobby (humano vs. dos IA, IA vs. IA, desafío/bloqueo y palanca roja). No publicar PR ni branch.
