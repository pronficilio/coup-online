# PHASE independiente F2 — runner Codex Issue #14

**Veredicto: `BLOCKED`.** Revisión del worktree `issue/14-codex-ai-players`, HEAD documental `d8bd7359c6e420328c4e8db0d35949bdef5af2e1`; implementación F2 en `e4c82f3` (`feat(codex-player): issue 14 F2 isolated runner`). La revisión no autoriza login, llamadas reales al modelo ni despliegue.

## Alcance revisado

Revisé el diff F2 contra su padre: `server/ai/codex-protocol.js`, `server/ai/codex-client.js`, `server/ai/codex-worker.js`, `server/ai/coup-codex-runner.service.example`, `server/test/codex.test.js` y los documentos de plan/evidencia F2. Confirmé el estado del worktree y ejecuté la suite y checks locales seguros. No edité código, no inspeccioné credenciales y no ejecuté `codex exec`.

El código fija `gpt-6-luna` y restringe esfuerzo a `low|medium|high`; normaliza un protocolo cerrado, no acepta texto libre y usa un esquema de salida que solo permite un `choiceId` disponible (`server/ai/codex-protocol.js:3-14,77-140,143-209`). El worker aplica un entorno hijo allowlist, valida separación y permisos de paths, usa `shell: false`, limita tiempo, intenta terminar el grupo de procesos y cancela si el cliente Unix desaparece (`server/ai/codex-worker.js:19-83,111-206,214-318`). La plantilla separa usuario, CODEX_HOME, workspace vacío, checkout inaccesible y socket con permisos de grupo (`server/ai/coup-codex-runner.service.example:7-51`). No observé que el runner pase el checkout ni variables de credenciales/API al prompt o al entorno hijo.

## Hallazgos que bloquean el PASS

1. **El perfil de permisos no está demostrado en una CLI equivalente a la prevista para Hetzner.** La CLI local reportó `codex-cli 0.157.1`, pero ni la unidad systemd ni el contrato F2 fijan una versión concreta para el servidor. Las pruebas `node:test` revisan argumentos y sustituyen el proceso Codex con un fake; no comprueban que la CLI aplique el perfil. Intenté una prueba `codex sandbox` sin autenticación, red ni `codex exec`, con directorio temporal y señuelo ficticio. Tanto la lectura dentro del workspace como la externa terminaron antes de ejecutar el comando con `error building bubblewrap command: app-server socket directory must be a user-owned directory with mode 0700`. También probé `XDG_RUNTIME_DIR` temporal modo `0700` y `umask 0077`; el error persistió. Por lo tanto, esta ejecución no demuestra que el señuelo externo esté denegado. La guía oficial marca los perfiles como beta y advierte que el enforcement varía por plataforma; falta reproducir y aprobar el perfil con la versión y el runtime Linux del destino. Véanse `server/ai/coup-codex-runner.service.example:17-23,32-52`, `server/ai/codex-worker.js:74-83,123-124` y `docs/plans/codex-ai-players/f2_codex_runner.md:23,35-39`. [Documentación de permisos](https://learn.chatgpt.com/docs/permissions) y [sandbox Linux](https://learn.chatgpt.com/docs/sandboxing).

2. **La advertencia oficial de auth gestionada por ChatGPT en repositorios públicos sigue sin resolverse.** La guía dice que se trate `auth.json` como contraseña y que no se use este flujo para repositorios públicos/open source. El runner no monta el checkout y solo prepara JSON de juego, lo cual reduce exposición; la guía no declara que esa separación exima el flujo. Este proyecto es público y F2 exige resolver esta compatibilidad antes de habilitar IA. No hay evidencia oficial que permita declarar el uso Plus conforme para este caso. No se propone API ni otro fallback. Véanse `docs/plans/codex-ai-players/f2_codex_runner.md:21,27-31` y `docs/plans/codex-ai-players/plan_codex_ai_players.md:24-36,108,113`. [Guía oficial de modo no interactivo y autenticación](https://learn.chatgpt.com/docs/non-interactive-mode).

3. **No está confirmada la disponibilidad de Luna para la cuenta Plus.** La documentación oficial lista `gpt-6-luna` en Codex, pero condiciona su disponibilidad al plan, inicio de sesión, cliente y rollout; su orientación para Plus señala GPT-6 Sol como reemplazo de GPT-5.5, mientras Luna aparece para Free/Go. Sin iniciar sesión, esta revisión no puede confirmar el acceso de la cuenta prevista. F2 mantiene Luna como modelo fijo y sin fallback, y la evidencia actual indica correctamente que si no se confirma disponibilidad no se debe invocar y F2 permanece bloqueada. Véanse `server/ai/codex-protocol.js:3`, `docs/plans/codex-ai-players/f2_codex_runner.md:7,31` y `docs/plans/codex-ai-players/plan_codex_ai_players.md:26-29,108,113`. [Documentación oficial de modelos y disponibilidad](https://learn.chatgpt.com/docs/models).

Estos son gates de compatibilidad y evidencia pendientes; no son una afirmación de que se haya observado una fuga efectiva de credenciales. La separación del proceso y las validaciones locales tienen evidencia estática y de tests, pero no sustituyen los tres gates anteriores.

## Checks y límites

- `npm test` en `server/`: **25/25 aprobados** al ejecutarse fuera del sandbox. Dentro del sandbox dos pruebas de socket Unix fallaron con `EPERM`; la suite completa pasó al repetirla con autorización escalada.
- `node --check` pasó para `codex-worker.js`, `codex-protocol.js`, `codex-client.js` y `codex.test.js`; `git diff --check` pasó.
- `systemd-analyze verify` aceptó la plantilla al verificar una copia temporal.
- `codex --version` informó `codex-cli 0.157.1`. La prueba con `codex sandbox` no llegó a ejecutar el señuelo por el error de runtime citado; no prueba la efectividad del perfil.
- No hubo login, lectura de auth real, `codex exec`, llamada al modelo, partida en vivo ni despliegue.

## Condiciones para recheck

F2 podrá revisarse de nuevo cuando exista una versión de CLI fijada/equivalente a la prevista para Hetzner y una prueba Linux que ejecute el perfil en esa versión, lea un archivo permitido, rechace el señuelo externo y compruebe la restricción de escritura/red y las herramientas internas pertinentes. También se debe resolver formalmente si el flujo de auth gestionada por ChatGPT está permitido para este runner asociado a un proyecto público y confirmar la disponibilidad de Luna en la cuenta Plus prevista; si alguno no se confirma, mantener F2 bloqueada sin usar API ni cambiar silenciosamente de modelo.
