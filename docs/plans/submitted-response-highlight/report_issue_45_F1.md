# Reporte F1 — issue #45

**Veredicto:** `CLOSED` tras verificación manual del propietario con tres participantes; evidencia dinámica registrada a continuación.
**Estado de unidad:** `WAITING_ORCHESTRATOR`.
**Branch/worktree:** `issue/45-persist-submitted-response-highlight` / `.worktrees/issue-45-persist-submitted-response-highlight`.
**Base:** `origin/master` = `f900c0947a0b27ac9c6e0372e3c1871a883be7e6` en la API al reclamar.
**Sincronización:** merge de `origin/master@db1d22c11fc78dcd91b5f4242b1ae1591f9ba16b` en `918e070`; sin conflictos restantes.
**Tracker:** #45 `OPEN`, asignada a `pronficilio`.
**PR:** ninguna.

## Cambio y alcance

`ResponseImageButton.js` guarda una selección local al dispararse el `onClick`, conserva las imágenes y etiqueta `-active` aunque el padre deshabilite el botón, y limpia esa selección antes de pintar un control reactivado. El ciclo existente de `Coup.js` deshabilita controles al enviar (`submitted`), los vuelve a habilitar en rechazo o al recibir una decisión nueva, y desmonta la decisión al cerrar/pausar. La selección propia solo existe en la opción pulsada; las demás no reciben estilo activo. La entrada de mouse, teclado y touch comparte el evento `click` nativo de React.

El cambio de producto quedó estrictamente en `coup-client/src/components/game/ResponseImageButton.js`. No se editaron `Coup.js`, `PlayerBoard.js`, el protocolo, `choiceId`, ni CSS compartido. Se conserva `aria-label`, `title` y el `disabled` nativo; no se agregó una semántica ARIA de toggle.

## Coordinación #43/#44

- #43 sigue `OPEN` y asignada a `pronficilio`; su comentario remoto declara estado `ACTIVE`. Su branch canónica devuelve 404 en GitHub, no existe como branch local y su worktree no figura en el registro local. No se pudo revisar su diff.
- La implementación se limitó al componente de imágenes existente, según la instrucción de mantener fuera `Coup.js`/`PlayerBoard.js`. No hay archivos de producto compartidos con el alcance que declara el handoff de #43.
- #44 sigue `OPEN`, sin assignee/comentarios; su F1 continúa siendo de solo lectura.
- El bloqueo inicial por solapamiento se supersedió para este cambio acotado. La falta de walkthrough, no la topología, es el único bloqueo actual.

## Validación

- Build inicial: salió con código 127 y el texto exacto `sh: 1: react-scripts: not found`, porque `coup-client/node_modules` no estaba instalado.
- Tras `npm ci`, el build de cliente compiló (`Compiled with warnings`, salida de producción generada). Advertencias observadas: variables `logo` y `Link` sin uso en `src/App.js`; `postcss-calc` no interpreta las expresiones `66.6667dvh - ...` y `133.3333dvh - ...` en `ReferencePanel.css` líneas 100 y 106; Browserslist reporta `caniuse-lite` desactualizado. No se reportaron errores de compilación en el componente modificado.
- `git diff --check`: sin errores.
- Tests automatizados: no agregados ni ejecutados.
- Walkthrough requerido (jugador local envía primero, sale del botón, espera respuestas y observa el cierre): completado por el propietario en una partida de tres participantes; los detalles y límites de lo observado están atribuidos en la sección siguiente.

### Reintento autorizado del walkthrough (2026-09-28)

- El Orquestador levantó el bloqueo operativo previo y autorizó continuar #45 en este mismo worktree. Se releyó #45 mediante la API de GitHub: sigue `OPEN`, asignada a `pronficilio`; el criterio 5 conserva el build y el walkthrough de dos jugadores como requisitos. El comentario más reciente pide intentar el recorrido local y devolver `WAITING_ORCHESTRATOR` si el entorno lo impide.
- Aislamiento confirmado antes del reintento: `.worktrees/issue-45-persist-submitted-response-highlight`, branch `issue/45-persist-submitted-response-highlight`, HEAD `b4bf8031867eca6921a6b275036058bf32005f1f`; árbol de trabajo limpio. No se tocaron `Coup.js`, `PlayerBoard.js` ni otros archivos de producto.
- Intento de habilitar una sesión local: las dependencias del cliente estaban presentes y se instalaron las dependencias del backend; al iniciar el backend en su puerto habitual (`8000`), Node informó `EADDRINUSE`. Las solicitudes posteriores a `localhost:8000` y `127.0.0.1:8000` fallaron con `curl: (7) Failed to connect`; `localhost:3000` también rechazó la conexión. No se encontró un binario de Chromium, Chrome ni Firefox.
- Comprobación adicional informada por el Orquestador fuera del sandbox: `ss` mostró `127.0.0.1:8000` en escucha, pero sin PID visible. Esto no identifica el proceso ni habilitó acceso desde el intento del sandbox; no se atribuye `EADDRINUSE` a un proceso concreto.
- Resultado en ese reintento: no fue posible abrir dos clientes en una interfaz de navegador ni crear/observar dinámicamente la ventana de respuestas. No se simuló la interacción por código ni se infirió PASS de inspección estática; entonces quedó `BLOCKED` / `WAITING_ORCHESTRATOR`. La evidencia posterior del propietario, registrada abajo, completó el walkthrough y supersede ese bloqueo.

### Walkthrough completado por el propietario (2026-09-28)

- Evidencia: [comentario del propietario en #45](https://github.com/pronficilio/coup-online/issues/45#issuecomment-5875638751), verificado en el fork.
- El propietario probó una partida con tres participantes. Reportó que la respuesta elegida permanece `active` al apartar el puntero mientras esperan los demás; también probó `Pasar` y varios bloqueos, y reportó que todo luce bien.
- Esto satisface el walkthrough manual pendiente de F1 para el flujo observado con mouse. No se afirma cobertura dinámica de teclado ni touch; esas modalidades conservan inspección estática del evento `click` nativo, sin observación manual reportada.
- Veredicto F1: `CLOSED`. La evidencia no cambia el alcance ni los criterios pendientes de otras fases.

### Validación después de sincronizar la base (2026-09-28)

- `origin/master` avanzó 15 commits desde la base del branch; se integró por merge, siguiendo los precedentes locales. El único conflicto fue la lista de seguimiento en `README_plans.md`; se conservaron la entrada #45 y las entradas nuevas #46/#49.
- `npm run build` en `coup-client`: terminó con código 0 (`Compiled with warnings`). Advertencias: `logo`/`Link` sin uso en `src/App.js`; operadores mixtos en `Coup.js:444` (cambio traído por la base sincronizada); `postcss-calc` no interpreta las expresiones `dvh` en `ReferencePanel.css:100,106`; `caniuse-lite` desactualizado. No hubo error de compilación.
- `git diff --check` y `git diff --check origin/master...HEAD`: sin errores. No se agregaron ni ejecutaron pruebas automatizadas.
- El merge trajo al branch cambios de base para #46/#49 en `Coup.js`, traducciones y servidor; no se editaron esos archivos para #45.

## Falsificación y siguiente acción

La inspección estática confirma que solo el botón clicado conserva el arte activo mientras `disabled` se mantiene y que el estado se limpia al reactivar controles o desmontar la decisión. El walkthrough del propietario confirmó con tres participantes el estado `active` tras apartar el puntero y el uso de `Pasar` y varios bloqueos. F1 se cierra con esa evidencia manual atribuida; no se afirma observación dinámica de teclado ni touch.
