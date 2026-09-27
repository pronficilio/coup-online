# Handoff para el agente ejecutor

Issue: #14 — https://github.com/pronficilio/coup-online/issues/14
Plan: docs/plans/codex-ai-players/plan_codex_ai_players.md
Estado: ACTIVE; F0/F1 CLOSED (PHASE PASS); F2 App Server y runner aislado implementados, handshake local PASS; F3 IA/lobby/kill switch implementados. La release POC `5a13376` sigue activa en Hetzner; API y runner healthy, la web responde HTTP 200 y el runner permanece en una red separada sin puertos publicados. La corrección `466a3b5` instala y valida el bundle CA del sistema en la imagen del runner; su release aislado y su imagen ya están preparados. El usuario no ve el ajuste device-code, por lo que se usa OAuth normal con túnel SSH. El primer callback llegó al CLI pero falló el canje OAuth; el segundo login sigue esperando autorización. No hay sesión verificada ni llamada al modelo.
Modo / riesgo / verificación: FULL / HIGH / PHASE (F0, F1, F2, F3 y cierre final)
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
Evidencia F1: docs/plans/active/issue_14_F1_evidence.md
Contrato/evidencia F2: docs/plans/codex-ai-players/f2_codex_runner.md
Implementación inicial revisada: 608089d4c839f367b9b0b0e92009d3daf536ce5c; las dos correcciones pasaron PHASE en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`.
PR: todavía no existe; el usuario pidió una prueba temporal y no publicar cambios al fork.
Siguiente paso: completar el OAuth que está abierto con la imagen `coup-codex-runner:466a3b5`. Si tiene éxito, comprobar `codex login status`, activar el release nuevo conservando `5a13376` y `55be894` para rollback, y probar una decisión Luna antes de entregar el código de acceso de IA o invitar amigos. El login temporal no monta código ni sockets y escribe directamente en el volumen privado. No publicar PR ni branch.

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

- Codex App Server mediante login ChatGPT del propietario, GPT-6 Luna y esfuerzo low/medium/high por asiento; medium inicial. La disponibilidad se confirmará con una llamada real.
- Sin API key, facturación API ni fallback a otro modelo. Si Codex/Plus falla o llega a un límite, pausar con mensaje.
- La guía oficial ofrece App Server para integrar Codex dentro de productos, pero clasifica el protocolo como experimental/no soportado en producción; el uso aquí es una prueba temporal. El runner no monta el repo ni recibe texto libre, y el API web no ve la sesión. Si Luna no aparece en la cuenta, pausar sin cambiar de modelo ni usar API.
- Privacidad por asiento y autoridad del servidor se implementan antes de conectar el jugador Codex.
- Partidas humano contra dos IA e IA contra IA, dentro del lobby/acceso actual; no se agregan cuentas ni invitaciones.
- Propuesta de operación sin auth nueva: cualquier jugador conectado puede activar la palanca roja de solo apagado; solo el propietario la vuelve a habilitar desde SSH/consola. Apagar bloquea llamadas nuevas, intenta terminar las activas, invalida respuestas y pausa partidas. Al reiniciar, Codex queda apagado.
- Límites conservadores de concurrencia, llamadas y tiempo. Registros operativos no contienen credenciales, manos ajenas ni razonamiento privado.
- No incluir texto libre de clientes ni acceso al repositorio/secretos en las solicitudes Codex; ejecutar en entorno aislado y de solo lectura.
- El usuario autorizó desplegar esta prueba en Hetzner desde un release separado y reversible; no se tocará DNS/Nginx ni el release anterior. El branch no se publicará al fork.
- F0 y F1 cerraron con PHASE `PASS`. La guía operativa POC está en `docs/plans/codex-ai-players/poc-runbook.md`.

Secuencia actual: Issue #14 y branch/worktree conservados; F0 `b189cc0`; F1 `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`. La rama integra la base activa de Hetzner `55be894`. El commit `5a13376` continúa activo; `466a3b5` añade `ca-certificates` y un check de build, y ya se archivó como release separado y se construyó su imagen en Hetzner. Compose validó antes de la corrección; API/runner siguen healthy, la web devuelve HTTP 200 y el runner actual solo está en `coup_codex_egress`. La release `55be894` sigue disponible para rollback. La suite del servidor pasó 36/36, `node --check` y build pasan (dos warnings previos de imports sin uso); socket `0660` con GID 10002, conexión API-runner y palanca persistente se validaron localmente. El login device-code no pudo usarse porque el ajuste no aparece. El primer OAuth de navegador llegó al callback y falló en el canje; el segundo intenta completar con la imagen corregida. Todavía no hay sesión verificada ni llamada real a Luna. No publicar PR ni branch.
