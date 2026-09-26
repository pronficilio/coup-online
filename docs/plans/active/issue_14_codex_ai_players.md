# Handoff para el agente ejecutor

Issue: #14 — https://github.com/pronficilio/coup-online/issues/14
Plan: docs/plans/codex-ai-players/plan_codex_ai_players.md
Estado: ACTIVE; F0 CLOSED (PHASE PASS); F1 CLOSED (PHASE PASS tras correcciones); F2 ACTIVE, implementación lista y en espera de PHASE
Modo / riesgo / verificación: FULL / HIGH / PHASE (F0, F1, F2, F3 y cierre final)
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
Evidencia F1: docs/plans/active/issue_14_F1_evidence.md
Contrato/evidencia F2: docs/plans/codex-ai-players/f2_codex_runner.md
Implementación inicial revisada: 608089d4c839f367b9b0b0e92009d3daf536ce5c; las dos correcciones pasaron PHASE en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`.
PR: todavía no existe; debe haber una sola integración a master para esta issue.
Siguiente dueño: Verifier F2. La implementación del runner está lista para PHASE en `docs/plans/codex-ai-players/f2_codex_runner.md`; debe revisar el uso de Plus, el aislamiento efectivo, la compatibilidad del perfil con la CLI prevista y la validación Linux del sandbox. F2 no habilita asientos IA desde el lobby ni autoriza login o llamadas reales.

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

- Codex CLI mediante login ChatGPT Plus del propietario, GPT-6 Luna y esfuerzo low/medium/high por asiento; medium inicial.
- Sin API key, facturación API ni fallback a otro modelo. Si Codex/Plus falla o llega a un límite, pausar con mensaje.
- La documentación oficial incluye GPT-6 Luna (`gpt-6-luna`) y `codex exec`, pero dice que la disponibilidad depende del plan, inicio de sesión, cliente y rollout; no garantiza Luna en la cuenta Plus del propietario. Se mantiene Luna como modelo fijo aprobado: si no está disponible, pausar sin cambiar de modelo ni usar API. La guía de autenticación en automatización trata `auth.json` como contraseña y desaconseja ese flujo para repositorios públicos/open source; este repo es público. F2 debe resolver con Verifier la compatibilidad y demostrar aislamiento del runner respecto del repo y del proceso web antes de habilitar asientos IA.
- Privacidad por asiento y autoridad del servidor se implementan antes de conectar el jugador Codex.
- Partidas humano contra dos IA e IA contra IA, dentro del lobby/acceso actual; no se agregan cuentas ni invitaciones.
- Propuesta de operación sin auth nueva: cualquier jugador conectado puede activar la palanca roja de solo apagado; solo el propietario la vuelve a habilitar desde SSH/consola. Apagar bloquea llamadas nuevas, intenta terminar las activas, invalida respuestas y pausa partidas. Al reiniciar, Codex queda apagado.
- Límites conservadores de concurrencia, llamadas y tiempo. Registros operativos no contienen credenciales, manos ajenas ni razonamiento privado.
- No incluir texto libre de clientes ni acceso al repositorio/secretos en las solicitudes Codex; ejecutar en entorno aislado y de solo lectura.
- Issue #13 sigue siendo la unidad canónica para el despliegue en Hetzner, después de integrar esta funcionalidad.
- F0 y F1 ya cerraron tras PHASE `PASS`; F2 puede iniciar en este branch sin PR por fase. La revisión F1 no invocó Codex.

Secuencia: issue #14 reclamada; branch/worktree confirmados; contrato y reglas versionadas; F0 cerró con PHASE `PASS` en `b189cc0`. F1 cerró con PHASE `PASS` en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee` tras corregir el desafío perdido contra Asesinato y Exchange con una influencia. `npm test` (25/25), `node --check`, `git diff --check` y la verificación de sintaxis de la unidad systemd pasan. F2 tiene la implementación local del runner; espera PHASE independiente sobre aislamiento, compatibilidad de CLI y el gate de uso de Plus. No crear PR todavía.
