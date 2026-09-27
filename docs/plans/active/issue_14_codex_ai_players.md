# Registro de cierre administrativo — issue #14

Issue: #14 — https://github.com/pronficilio/coup-online/issues/14
Plan: docs/plans/codex-ai-players/plan_codex_ai_players.md
Estado: `CLOSED` administrativamente por solicitud del propietario. El PR #23 está integrado en `master` con merge commit `2d82fa1e0d67ba9e48d7885f9c3ae171360425bd`. El propietario confirmó una partida Codex vs. Codex completada sin problemas. F0/F1 tienen PHASE PASS; F2/F3 están implementadas y la POC se desplegó en Hetzner. Esta aceptación registra la prueba manual indicada por el propietario; no equivale a un veredicto FINAL independiente ni afirma que se hayan repetido todos los escenarios originales.
Modo / riesgo / verificación: FULL / HIGH / PHASE (F0, F1, F2, F3 y cierre final)
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
Evidencia F1: docs/plans/active/issue_14_F1_evidence.md
Contrato/evidencia F2: docs/plans/codex-ai-players/f2_codex_runner.md
Implementación inicial revisada: 608089d4c839f367b9b0b0e92009d3daf536ce5c; las dos correcciones pasaron PHASE en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`.
PR: [#23](https://github.com/pronficilio/coup-online/pull/23), fusionado a `master`.
Siguiente paso: ninguno para #14; la issue quedó cerrada administrativamente tras la validación Codex vs. Codex reportada por el propietario. La checklist completa original no se certifica con esta única prueba.

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
- Sin auth nueva: solo el líder del lobby que validó el código compartido puede activar la palanca roja; la interfaz y el servidor aplican el mismo permiso. El apagado sigue siendo global, bloquea llamadas nuevas, intenta terminar las activas, invalida respuestas y pausa partidas. Solo el propietario rearma por SSH/consola; al reiniciar, Codex queda apagado.
- Límites conservadores de concurrencia, llamadas y tiempo. Registros operativos no contienen credenciales, manos ajenas ni razonamiento privado.
- No incluir texto libre de clientes ni acceso al repositorio/secretos en las solicitudes Codex; ejecutar en entorno aislado y de solo lectura.
- El usuario autorizó desplegar esta prueba en Hetzner desde un release separado y reversible, sin cambiar DNS/Nginx ni el release anterior. PR #23 se fusionó a `master`; posteriormente el propietario validó una partida Codex vs. Codex sin problemas y pidió cerrar #14 administrativamente.
- F0 y F1 cerraron con PHASE `PASS`. La guía operativa POC está en `docs/plans/codex-ai-players/poc-runbook.md`.

Registro histórico de la POC: la API y el runner `4ab5e52` estaban saludables junto al web `84b6f96`; OAuth persistía en `coup_codex_state` y el runner, aislado en `coup_codex_egress`, no publicaba puertos. El smoke API→runner→GPT-6 Luna `low` devolvió la opción legal `steal:1`. Tras un apagado accidental, el control rojo quedó restringido al líder que validó el código y el backend rechazó cualquier otro socket. La suite del servidor pasó 36/36 y el build del cliente pasó, con warnings preexistentes de imports sin uso en `src/App.js` y de `dvh` en el panel de referencias. Después, el propietario confirmó una partida Codex vs. Codex completada sin problemas; PR #23 se integró y #14 se cerró administrativamente a petición suya. No quedan pasos pendientes para #14. El cierre no registra un veredicto FINAL independiente ni afirma que se repitieran todos los escenarios de la checklist original.
