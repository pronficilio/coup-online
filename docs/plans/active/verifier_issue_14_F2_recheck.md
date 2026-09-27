# Issue #14 — PHASE independiente F2 recheck

**Veredicto: BLOCKED**

Revisé el HEAD `005811565301df15042fab4d0b8ba841ccd19a5a`; contiene el fix F2 `04081b1` y, después, solo el append del log `0058115`. Comparé el cambio de producto `d8bd735..04081b1`, el worker, el protocolo, la unidad systemd, los tests y la evidencia/handoff. No modifiqué producto ni inicié sesión, inspeccioné credenciales reales, ejecuté `codex exec`, contacté el modelo ni probé red real.

## Hallazgos favorables

- `server/ai/codex-worker.js:40-75` canonicaliza y separa `CODEX_HOME`, workspace, raíz del código y temporal; exige que existan, que el workspace esté vacío, que el directorio de auth no sea grupal/público y que el temporal no tenga bits de grupo/otros. `:78-87` construye un entorno allowlist y fija tanto `TMPDIR` como `XDG_RUNTIME_DIR` al temporal privado. El scratch y el esquema de salida se crean allí con modos `0700` y `0600` (`:116-127`), y se eliminan al finalizar (`:210-212`).
- `server/ai/codex-protocol.js:167-186` fija modelo/esfuerzo y salida estructurada; usa `:root=deny`, `:minimal=read`, `:tmpdir=write`, `:slash_tmp=deny`, workspace en lectura, red deshabilitada para comandos locales y web search desactivado. También fija `--ephemeral`, `--ignore-user-config`, `--ask-for-approval never` y desactiva `shell_tool`, apps, multi-agent y hooks. No hay texto de flags libre del cliente.
- La plantilla `server/ai/coup-codex-runner.service.example:13-37,39-55` separa el proceso de la app, establece `TMPDIR`/`XDG_RUNTIME_DIR` bajo `/run/coup-codex/tmp`, prepara ese directorio con modo `0700`, oculta el checkout y hace de solo lectura el workspace de Codex. `systemd-analyze verify` aceptó una copia temporal de la unidad. Esto valida sintaxis, no el comportamiento del servicio desplegado.
- `server/test/codex.test.js:50-52,162-169,240-255,331-345` comprueba modo privado, propagación de ambas variables, rechazo de temporal compartido y allowlist de entorno. `npm test` pasó **26/26** fuera del sandbox; en el sandbox de esta revisión el proceso de test falló antes de presentar el detalle de `codex.test.js`. `node --check` pasó para worker, protocolo, cliente y test; `git diff --check d8bd735..HEAD` pasó.

## Bloqueos de evidencia y operación

1. **El perfil exacto no quedó demostrado con la prueba Linux disponible.** La CLI instalada es `codex-cli 0.157.1`; no hay versión fijada en la unidad ni evidencia de que coincida con la prevista para Hetzner. Con señuelos únicamente bajo `/tmp`, una prueba `codex sandbox` parcial —sin `:slash_tmp=deny`— pudo leer el marcador permitido. Al repetir con el perfil exacto de `codex-protocol.js`, la CLI terminó antes de ejecutar la orden con `error building bubblewrap command: app-server socket directory must be a user-owned directory with mode 0700`. Las pruebas de lectura externa, lectura del `auth.json` ficticio, escritura del workspace y escritura del temporal fallaron con el mismo error previo; no prueban las denegaciones ni la escritura permitida del perfil desplegable. Una variante diagnóstica con `:slash_tmp=write` tampoco superó ese preflight. El primer resultado no cubre la regla que separa `/tmp`, y esta prueba con rutas temporales no reproduce el destino `/run/coup-codex/tmp`.

   La documentación oficial describe los perfiles como beta y dice que Linux depende de bubblewrap, user namespaces y capacidades del kernel; también distingue `$TMPDIR` de `/tmp`. Por eso `systemd-analyze verify` y el test unitario de variables no sustituyen una prueba efectiva del CLI/host equivalente a Hetzner. Falta fijar o documentar la versión objetivo y demostrar con el perfil completo: lectura permitida, lectura denegada de señuelos fuera del scope, escritura denegada al workspace, escritura limitada al temporal privado, y ausencia de herramientas locales capaces de saltarse esos límites.

2. **Siguen sin resolverse dos gates de producto documentados.** La página oficial de modo no interactivo dice que la auth gestionada por ChatGPT trata `auth.json` como contraseña y “Do not use this workflow for public or open-source repositories”. El repositorio de Coup es público. La separación de procesos y la ausencia del checkout en el prompt reducen exposición, pero la guía no confirma que eso sea una excepción; no debe habilitarse una sesión Plus hasta que se resuelva formalmente la aplicabilidad de la advertencia.

   La documentación oficial lista `gpt-6-luna` en Codex, pero condiciona disponibilidad a plan, método de inicio, cliente y rollout. Su guía de retiro de GPT-5.5 indica que Plus/Pro/Business/Enterprise/Edu deben elegir GPT-6 Sol, mientras Free/Go eligen Luna en el cliente indicado. No se confirmó Luna en la cuenta Plus objetivo; como se prohibió login y la implementación fija Luna sin fallback, el gate sigue abierto y no corresponde una llamada real.

3. **Alcance de red y herramientas:** `permissions.coup-ai.network={enabled=false}` regula comandos locales bajo el sandbox; no es una regla de egreso del proceso Codex que debe comunicarse con el servicio del modelo. La unidad permite `AF_INET` y `AF_INET6` (`:51`). No hice una conexión real. Los flags estáticos desactivan las herramientas enumeradas, pero `codex sandbox` ejecuta una orden local y no demuestra la configuración de herramientas internas de una sesión `codex exec`; por la restricción de no invocar `codex exec` ni el modelo, esa parte queda sin verificación dinámica.

## Fuentes y cierre requerido

- [Modo no interactivo — auth gestionada por ChatGPT y repos públicos](https://learn.chatgpt.com/docs/non-interactive-mode), revisado el 2026-09-26; sección de auth avanzada, líneas 953-960.
- [Permisos — perfiles beta, alcance de `:tmpdir`/`:slash_tmp` y alcance de red](https://learn.chatgpt.com/docs/permissions), revisado el 2026-09-26; líneas 850-857, 968-1000 y 1127-1128.
- [Sandboxing Linux](https://learn.chatgpt.com/docs/sandboxing), revisado el 2026-09-26; requisitos de bubblewrap/user namespaces.
- [Modelos — disponibilidad Luna y guía de retiro](https://learn.chatgpt.com/docs/models), revisado el 2026-09-26; líneas 848-855 y 972-1001.

Para volver a PHASE hacen falta evidencia repetible del perfil en una CLI/host equivalente al destino, resolución documentada de la advertencia de auth en proyecto público y confirmación permitida de que el modelo fijo está disponible para la cuenta/cliente objetivo. Hasta entonces F2 permanece bloqueada y no autoriza login ni llamada al modelo.
