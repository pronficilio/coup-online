# Issue #14 — PHASE independiente F2, recheck del checkpoint `d74e71c`

**Veredicto: BLOCKED**

Revisé `HEAD d74e71cd9c27f29dddc6d341ea512e24de948651`, con el cambio de runner `1e36269` y los commits documentales posteriores. Comparé el cambio desde `04081b1`, `f2_codex_runner.md`, el handoff, worker, protocolo, unidad systemd y tests. No edité código ni usé auth real, login, `codex exec`, modelo, API o red. El juego sigue usando el desempate fijo horario aprobado por el usuario; F2 no lo modifica.

## Hallazgo que impide aprobar el runner

El cambio separa correctamente los directorios de trabajo temporal y de runtime: `server/ai/codex-worker.js:19-39,43-82,85-94` valida que `CODEX_RUNTIME_DIR` y `TMPDIR` existan, no se solapen con los otros paths y no permitan acceso a grupo/otros; expone `TMPDIR=paths.tempRoot` y `XDG_RUNTIME_DIR=paths.runtimeDir`. La unidad declara `/run/coup-codex/tmp` y `/run/coup-codex/runtime`, ambos preparados en modo `0700` (`server/ai/coup-codex-runner.service.example:10,13-29`). El perfil de `server/ai/codex-protocol.js:167-186` omite `:slash_tmp`, concede `:tmpdir=write`, limita el workspace a lectura, niega `:root`, deshabilita red para comandos y web search, e inhabilita shell, apps, multi-agent y hooks.

Sin embargo, el probe independiente no llegó a ejecutar ni siquiera la lectura permitida del marcador. Con CLI local `0.157.1`, perfil sin `:slash_tmp` y directorios señuelo privados y separados para `TMPDIR` y `XDG_RUNTIME_DIR`, `codex sandbox` terminó antes de ejecutar `/bin/cat` con:

```text
error building bubblewrap command: app-server socket directory must be a user-owned directory with mode 0700
```

Usé fixtures bajo `/tmp/issue14-f2-recheck-d74`; cada `CODEX_HOME`, `HOME`, `TMPDIR`, `XDG_RUNTIME_DIR` y workspace era distinto, modo `0700`, propiedad de `pronficilio:pronficilio`. El `auth.json` era un archivo ficticio `0600`. En una ejecución con la `UMask=0007` de la unidad, la CLI creó `CODEX_HOME/tmp/arg0/codex-*` en `0770` y dio el mismo error. También lo dio con umask `0077` aunque el árbol creado quedó `0700`; por ello el error no quedó explicado solo por los bits de grupo. No probé lectura de auth/decoy ni escritura al workspace/TMPDIR porque el sandbox no alcanzó a lanzar el comando. La evidencia anterior en `f2_codex_runner.md:25` reporta una prueba exitosa con CLI 0.157.1 y paths separados, pero no pude reproducirla en este checkpoint. La prueba local tampoco reproduce el host ni los paths `/run` de Hetzner.

La diferencia de `UMask=0007` es una señal concreta para el siguiente ajuste: bajo ese valor el CLI creó el directorio del socket con bits de grupo, pese a que el error exige modo `0700`. No queda demostrado que cambiar solo la umask resuelva el preflight, pues también falló con `0077`. `systemd-analyze verify` aceptó la sintaxis de la plantilla, pero no comprueba creación de directorios ni el runtime del CLI. La unidad y la CLI objetivo aún no tienen una prueba equivalente en Hetzner.

## Alcance de controles

- La lectura, escritura y aislamiento del perfil no quedaron probados efectivamente en esta pasada: el sandbox falló antes de ejecutar el marcador. Estáticamente, `:root=deny`, `:minimal=read`, `:tmpdir=write` y workspace read son compatibles con que el proceso solo escriba el temporal que recibe por `TMPDIR`; la guía define `:tmpdir` separado de `/tmp`. Esa lectura de configuración no sustituye una prueba que arranque.
- `network.enabled=false` limita comandos locales sandboxed; no restringe la comunicación del proceso Codex con el servicio remoto. La plantilla conserva `AF_INET` y `AF_INET6` (`:53`), necesarios para el servicio. No hice una conexión de red. Los flags estáticos desactivan las herramientas enumeradas, pero no llamé a `codex exec`, así que no validé dinámicamente el registro efectivo de herramientas internas.
- La plantilla instala el runner fuera del checkout y oculta `/srv/coup-online` con `InaccessiblePaths` (`:12-13,25-29,55-57`); el prompt contiene solo la observación JSON y no carga los Markdown (`f2_codex_runner.md:15`). Esto apoya la separación respecto del repo, pero el path de checkout es un placeholder que debe ajustarse en Issue #13 y no demuestra el despliegue real.

## Gates oficiales, evaluados por separado

**Auth gestionada por ChatGPT en un proyecto público:** la [guía oficial de modo no interactivo](https://learn.chatgpt.com/docs/non-interactive-mode) presenta este flujo como auth gestionada por ChatGPT en CI/CD, trata `auth.json` como contraseña y dice: “Do not use this workflow for public or open-source repositories” (sección avanzada, revisada el 2026-09-26). Coup Online es público. Que el runner no monte el checkout reduce lo que puede leer el proceso; la guía no declara que esa separación exima del límite, ni explica si una sesión de juego que solo envía JSON queda fuera del flujo. Por tanto no considero autorizado inferir una excepción: hace falta aclaración/documentación que resuelva aplicabilidad antes de habilitar esa cuenta.

**Disponibilidad de GPT-6 Luna en Plus:** la [página oficial de precios](https://learn.chatgpt.com/docs/pricing) lista que Plus incluye Codex en el CLI y GPT-6 Sol y Luna. La [página de modelos](https://learn.chatgpt.com/docs/models) también lista Luna en Codex, pero condiciona su disponibilidad al rollout, método de inicio de sesión y cliente. La recomendación de elegir Sol para Plus/Pro/Business/Enterprise/Edu en la sección de retiro es específicamente para reemplazar GPT-5.5, no una afirmación de que Luna esté excluida de Plus. Por tanto, la documentación sí respalda la oferta de plan; no verifica que esta cuenta Plus ni el CLI Linux objetivo tengan Luna habilitada. Sin login, la disponibilidad para esta instalación queda no verificada.

## Verificación y requisitos para reabrir PHASE

`npm test` pasó **26/26** fuera del sandbox; la ejecución ordinaria dentro del sandbox no completó `test/codex.test.js`. En el seguimiento del hardening `9670526`, el fixture corrigió el modo de `auth.json` con un `chmod` explícito y verifiqué `npm test` con `umask 0077`: **26/26**. La aserción verifica que el worker deja `runner.sock` en `0660`; junto con `UMask=0077`, esto verifica la intención del modo del socket en la prueba, pero no prueba acceso desde un proceso separado del grupo ni resuelve el preflight interno de Codex. `node --check` pasó para worker, protocolo, cliente y suite; `git diff --check 6a0dcb2..HEAD` pasó; `systemd-analyze verify` aceptó la unidad temporal; la CLI local reporta `codex-cli 0.157.1`. Los tests usan `fakeSpawn`, por lo que no refutan el fallo del CLI real.

Para una nueva PHASE hace falta resolver el preflight del directorio de socket con la configuración de permisos y la umask efectiva del servicio; reproducir con la CLI/host objetivo la lectura permitida, denegación de señuelos externos/auth, escritura denegada al workspace y escritura limitada al temporal; y resolver la advertencia oficial para auth gestionada por ChatGPT en este proyecto público. La disponibilidad de Luna para esta cuenta/CLI queda no verificada sin login. Hasta entonces, F2 queda bloqueada y no autoriza login ni llamadas reales.
