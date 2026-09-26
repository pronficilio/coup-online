# Issue #14 — contrato del runner Codex F2

Estado: implementación local; F2 sigue `ACTIVE`, sin PHASE PASS. La aplicación del juego aún no llama al runner. No se inició sesión, no se leyeron credenciales y no se hizo una llamada real al modelo.

## Protocolo

El cliente del servidor enviará una línea JSON por socket Unix local. La solicitud contiene ID de petición y decisión, versión del estado, esfuerzo `low|medium|high`, asiento, mano propia, estado público resumido, historial acotado y las opciones que el servidor ya considera legales. El protocolo rechaza campos adicionales, nombres, texto libre, roles/acciones desconocidos, IDs repetidos y contextos mayores de 48 KiB. El modelo fijo es `gpt-6-luna`; la salida tiene un único `choiceId` que debe corresponder a una opción actual.

La respuesta repite los IDs/versiones de la solicitud y la versión de reglas `b189cc0`. El cliente compara todos esos valores y comprueba de nuevo que la opción exista. Un resultado inválido, tardío, desactualizado o de otra regla no modifica el juego. El servidor de runner atiende como máximo dos decisiones a la vez, limita solicitudes y errores, y cancela el proceso si vence el plazo o el cliente desaparece.

## Reglas y estilo

La fuente normativa es `docs/coup_transcription.md`; `docs/coup_play_reference.md`, `docs/coup_summary_card.md` y `docs/coup_llm_summary.md` son sus referencias derivadas, versionadas en el commit `b189cc0`. El prompt fijo incorpora las reglas operativas necesarias para decidir, señala esa versión y pide juego adaptable: mentir cuando compense, decir la verdad cuando convenga y desafiar según evidencia, nunca usar una estrategia de mentira permanente. Recuerda que una carta probada vuelve a Court y se reemplaza; una afirmación no desafiada no demuestra que el jugador tuviera la carta.

El prompt solo procesa campos enumerados por el contrato; no carga los Markdown ni el checkout. La mano privada se limita al asiento que decide. Cada llamada es efímera y sin memoria compartida deliberada entre asientos. El modelo devuelve una elección, nunca una transición: el servidor continúa como autoridad de reglas, costos, bloqueos, desafíos, pérdidas y turno.

La prioridad digital aprobada para desafíos/bloqueos simultáneos es el primer asiento elegible en sentido horario desde quien declaró la acción o bloqueo; no depende de la latencia. Está escrita en `docs/plans/codex-ai-players/f0_contract.md` y ya tiene regresiones F1 para desafíos y bloqueos concurrentes.

## Frontera de procesos

En despliegue, la aplicación web no tendrá `CODEX_HOME`, la sesión Plus ni permisos para leer su caché. Se ejecutará un proceso `coup-codex` separado, sin privilegios, conectado por `/run/coup-codex/runner.sock` con permisos de grupo limitados. Su código se instalará fuera del checkout web; el servicio ocultará el checkout con `InaccessiblePaths`, usará `/run/coup-codex-work` vacío y de solo lectura, HOME igual a ese directorio, `CODEX_HOME` separado, `PrivateTmp` y `ProtectSystem=strict`. `server/ai/coup-codex-runner.service.example` es una plantilla: el path canónico del checkout y el grupo se completan en Issue #13. La sesión queda en `/var/lib/coup-codex/auth`, protegida por el usuario de servicio; el archivo `auth.json` se trata como contraseña.

La primera prueba con `--sandbox read-only` pudo leer un archivo señuelo situado fuera del workspace. Ese modo no protege la caché Plus por sí solo. El runner ahora pasa un perfil de permisos inline: niega `:root`, concede lectura solo a `:minimal` y al workspace actual, niega temporales, deshabilita red para comandos y apaga shell/apps/subagentes/hooks. No pasa `--sandbox`, porque los perfiles de permisos no se combinan con el modo sandbox anterior. La prueba local `codex sandbox` con ese mismo perfil, ejecutada con un archivo señuelo falso, recibió `Permission denied`; no se hizo `codex exec` ni una llamada de red. El Verifier debe confirmar la política con la versión de CLI que se instale en Hetzner y con una comprobación que represente sus herramientas internas.

El runner falla cerrado si CODEX_HOME, workspace, raíz de la app y temporal se solapan, si hay symlinks que los solapan o si el workspace ya contiene archivos.

## Compatibilidad del login Plus y gate abierto

La documentación oficial dice que `codex exec` es para automatización, puede reutilizar auth guardada, acepta `--output-schema`, tiene sandbox de solo lectura y permite `--ephemeral` y `--ignore-user-config`. También advierte que no se use el flujo avanzado de auth gestionada por ChatGPT con repositorios públicos/open source. Coup Online es público. La separación propuesta implica que Codex recibe únicamente JSON del juego y no procesa el repo, pero la documentación no aclara si eso elimina la advertencia para este uso. El Verifier debe resolverlo antes de habilitar una sesión Plus o invocar el modelo real; no habrá API ni fallback.

Fuentes revisadas el 2026-09-26: [modo no interactivo](https://learn.chatgpt.com/docs/non-interactive-mode), [sandboxing](https://learn.chatgpt.com/docs/sandboxing), [opciones del CLI](https://learn.chatgpt.com/docs/developer-commands) y [esfuerzo de razonamiento](https://learn.chatgpt.com/docs/developer-settings).

## Evidencia local disponible

- Pruebas `node:test` cubren normalización, ausencia de texto libre, esquema y argumentos, allowlist del entorno, selección legal, respuestas inválidas, aislamiento de paths y symlinks, workspace vacío, timeout, socket Unix y cancelación al desconectar.
- El preflight del proceso exige que existan y no se solapen por path ni symlink el repo, CODEX_HOME, el workspace y el temporal; CODEX_HOME debe ser privado para el usuario del runner, `auth.json` debe estar protegido si existe y el workspace debe estar vacío.
- `--model gpt-6-luna`, esfuerzo por asiento, perfil filesystem deny-by-default, `--ask-for-approval never`, `--output-schema`, `--output-last-message`, `--ephemeral` y `--ignore-user-config` se forman como argumentos fijos; shell/apps/subagentes/hooks están deshabilitados, no hay flags arbitrarios del cliente ni API key.
- `npm test` terminó con 25/25 pruebas aprobadas; `node --check` pasó para los tres módulos del runner y su suite, y `git diff --check` no encontró errores. `systemd-analyze verify` aceptó la plantilla al copiarla a un nombre de unidad temporal.
- La prueba local de permisos niega la lectura de un archivo señuelo en Linux. Falta verificar con la versión fijada para Hetzner, una prueba que ejecute la ruta de `codex exec` sin credenciales reales y la revisión independiente PHASE. No se usaron credenciales reales ni se hizo una petición al modelo.
- No hay integración del lobby, cuotas por partida, palanca roja ni llamadas al modelo en F2; son F3/F4. No se afirma que el jugador sea invencible.
