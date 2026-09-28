# Reporte F1 — issue #45

**Veredicto:** `BLOCKED` únicamente por el walkthrough manual pendiente; se reintentó tras autorización del Orquestador y la limitación del entorno persiste.
**Estado de unidad:** `WAITING_ORCHESTRATOR`.
**Branch/worktree:** `issue/45-persist-submitted-response-highlight` / `.worktrees/issue-45-persist-submitted-response-highlight`.
**Base:** `origin/master` = `f900c0947a0b27ac9c6e0372e3c1871a883be7e6` en la API al reclamar.
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
- Walkthrough requerido (jugador local envía primero, sale del botón, espera la respuesta de otro y observa el cierre): no ejecutado. Este entorno no tiene navegador interactivo ni una partida compartida disponible; no se presenta la inspección estática como observación dinámica.

### Reintento autorizado del walkthrough (2026-09-28)

- El Orquestador levantó el bloqueo operativo previo y autorizó continuar #45 en este mismo worktree. Se releyó #45 mediante la API de GitHub: sigue `OPEN`, asignada a `pronficilio`; el criterio 5 conserva el build y el walkthrough de dos jugadores como requisitos. El comentario más reciente pide intentar el recorrido local y devolver `WAITING_ORCHESTRATOR` si el entorno lo impide.
- Aislamiento confirmado antes del reintento: `.worktrees/issue-45-persist-submitted-response-highlight`, branch `issue/45-persist-submitted-response-highlight`, HEAD `b4bf8031867eca6921a6b275036058bf32005f1f`; árbol de trabajo limpio. No se tocaron `Coup.js`, `PlayerBoard.js` ni otros archivos de producto.
- Intento de habilitar una sesión local: las dependencias del cliente estaban presentes y se instalaron las dependencias del backend; al iniciar el backend en su puerto habitual (`8000`), Node informó `EADDRINUSE`. Las solicitudes posteriores a `localhost:8000` y `127.0.0.1:8000` fallaron con `curl: (7) Failed to connect`; `localhost:3000` también rechazó la conexión. No se encontró un binario de Chromium, Chrome ni Firefox.
- Comprobación adicional informada por el Orquestador fuera del sandbox: `ss` mostró `127.0.0.1:8000` en escucha, pero sin PID visible. Esto no identifica el proceso ni habilitó acceso desde el intento del sandbox; no se atribuye `EADDRINUSE` a un proceso concreto.
- Resultado: no fue posible abrir dos clientes en una interfaz de navegador ni crear/observar dinámicamente la ventana de respuestas. No se simuló la interacción por código y no se infiere PASS de inspección estática. Se mantiene `BLOCKED` / `WAITING_ORCHESTRATOR`; hace falta un entorno con navegador y backend accesibles para observar el envío local, salida del puntero, espera de la respuesta del segundo jugador y cierre de la ventana.

## Falsificación y siguiente acción

La inspección estática confirma que solo el botón clicado conserva el arte activo mientras su `disabled` se mantiene. El ciclo debería limpiar una respuesta rechazada o una selección ante una decisión nueva; esa transición y el cierre de ventana aún requieren walkthrough manual. El reintento autorizado confirmó que este entorno tampoco puede proporcionar los dos clientes interactivos: el intento del sandbox no pudo conectar por loopback y la comprobación externa del Orquestador no identificó el proceso que escucha en `127.0.0.1:8000`; tampoco hay navegador. El Orquestador debe coordinar una partida en un entorno con navegador y backend accesibles para completar esa única validación y después decidir si F1 puede cerrarse.
