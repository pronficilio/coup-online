# Reporte F3 — issue #21: verificación final independiente

**Veredicto: `BLOCKED`**

**Unidad:** `WAITING_ORCHESTRATOR`; F1/F2 `CLOSED`; F3 `BLOCKED`.
**Branch/worktree:** `issue/21-action-image-buttons` / `.worktrees/issue-21-action-image-buttons`.
**Commit revisado:** `4d288199d14ccfeeeaec5a35dd4230b893ee0b4f`.
**Alcance:** verificación independiente de contrato, recursos, accesibilidad estática y build. No se editaron archivos de producto ni se ejecutaron tests automatizados.

## Motivo del bloqueo

El plan requiere recorrido manual de las cinco respuestas en escritorio y móvil, incluido teclado/foco y movimiento reducido. No hay navegador ejecutable desde esta sesión: `command -v chromium chromium-browser google-chrome google-chrome-stable firefox playwright` no encontró ejecutables; tampoco hay binario coincidente en `/usr/bin` o `/usr/local/bin`. Aunque existe Chrome en el host Windows (`/mnt/c/Program Files/Google/Chrome/Application/chrome.exe`), tanto `--version` como un intento headless con una página `data:` fallaron inmediatamente con `WSL (2 - ) ERROR: UtilBindVsockAnyPort:307: socket failed 1`. No instalé dependencias ni navegadores. Por ello AC6 no queda completo y no puedo confirmar en ejecución la legibilidad/contraste, el layout móvil, el foco real ni la transición visual. F3 no puede avanzar a `PASS` hasta contar con un navegador ejecutable y registrar ese recorrido.

## Contrato y mapeo

La comparación estática de `Coup.js` con `server/game/coup.js` confirma estos IDs y decisiones:

| Ventana y elección del servidor | Imagen del cliente | Resultado de la revisión |
|---|---|---|
| `challenge` / `block_challenge` + `challenge` | `c.webp` / `c-active.webp` | Coincide |
| `challenge` / `block` / `block_challenge` + `pass` | `pass.webp` / `pass-active.webp` | Coincide |
| `block` + `block:duke` | `bfa.webp` / `bfa-active.webp` | Coincide con Foreign Aid/Duke |
| `block` + `block:contessa` | `ba.webp` / `ba-active.webp` | Coincide con Assassination/Contessa |
| `block` + `block:captain` o `block:ambassador` | `bs.webp` / `bs-active.webp` | Coincide con Steal; etiqueta del rol sigue visible |
| Contexto `challenge` / `block_challenge` | `claim.webp` | Decorativa, no es una opción ni recibe foco |

En el servidor, `openWindow` añade `pass` y construye las otras opciones a partir de `BLOCKS`; `openDecision` genera las opciones permitidas por asiento. `submitChoice` vuelve a validar elegibilidad y `choiceId` contra esa lista. El cliente itera `decision.options` sin filtrarlas ni agregar opciones, y pasa el objeto original al mismo `submitChoice(option)`. El evento y el envelope siguen siendo `g-submitDecision({ decisionId, stateVersion, choiceId })`. No encontré una ruta que permita que la imagen cree una acción o choice no autorizado por el servidor.

## Accesibilidad y CSS — inspección estática

- `ResponseImageButton` usa `<button type="button">` con `aria-label`, `title` y las dos imágenes ocultas a AT; `Block Steal` conserva además el texto visible `Block with Captain/Ambassador`.
- `:focus-visible` define un contorno de 3 px; el botón conserva teclado nativo. El contexto Claim tiene `alt=""` y `aria-hidden="true"`; la descripción textual de la decisión sigue presente.
- CSS mantiene ambas imágenes superpuestas en un marco con `aspect-ratio: 3 / 1`; hover, foco y pulsación alternan opacidad/escala durante 160 ms. `prefers-reduced-motion: reduce` quita esa transición. Al ser imágenes posicionadas de forma absoluta dentro de un marco de proporción fija, no vi un cambio de tamaño introducido por estas reglas.
- Estas son observaciones del código, no una confirmación en navegador de foco, contraste, clic táctil, transición o distribución móvil.

## Inventario de WebP

Abrí los doce archivos con Pillow y verifiqué formato WebP, tamaño, modo `RGB` y bandas `R/G/B` (sin alfa). Las dimensiones corresponden al inventario esperado de F1/F2; cada pareja activa coincide con la normal.

| Archivo | Dimensiones | Modo / alfa | Bytes |
|---|---:|---|---:|
| `ba.webp` | 1086×362 | RGB / no | 98,820 |
| `ba-active.webp` | 1086×362 | RGB / no | 104,448 |
| `bfa.webp` | 512×171 | RGB / no | 22,790 |
| `bfa-active.webp` | 512×171 | RGB / no | 25,630 |
| `bs.webp` | 512×171 | RGB / no | 27,080 |
| `bs-active.webp` | 512×171 | RGB / no | 30,848 |
| `pass.webp` | 510×171 | RGB / no | 20,838 |
| `pass-active.webp` | 510×171 | RGB / no | 26,036 |
| `c.webp` | 700×234 | RGB / no | 39,370 |
| `c-active.webp` | 700×234 | RGB / no | 42,766 |
| `claim.webp` | 700×234 | RGB / no | 36,732 |
| `claim-active.webp` | 700×234 | RGB / no | 43,478 |

Total: 518,836 bytes. La inspección visual de los WebP disponibles muestra los rótulos y canvas/fondos descritos en F1/F2; no observé recortes ni halo accidental. `claim-active.webp` está presente para completar el par, aunque el contexto Claim no es interactivo y solo se usa `claim.webp`.

**Límite de procedencia:** las fuentes ignoradas actuales `fotos/c.png` y `c-active.png` miden 1024×342 RGB, mientras F1 registró 1400×468. Sus mtimes actuales son posteriores al commit F1, así que no son evidencia de las fuentes históricas usadas para generar el WebP. `c.webp` sí coincide con la dimensión esperada documentada (700×234); la dimensión original no se puede volver a verificar desde estas copias actuales.

## Build y estado Git

- `npm run build` en `coup-client`: **PASS**, `Compiled with warnings`. Observé imports `logo` y `Link` sin uso en `src/App.js`, errores de parseo de `dvh` de PostCSS en `ReferencePanel.css:100,106` y aviso de `caniuse-lite` desactualizado. No hubo warning en los archivos modificados de esta unidad.
- `git diff --check` y `git diff --check origin/master...HEAD`: **PASS** antes de agregar este reporte.
- Estado del worktree antes de la documentación F3: limpio en `issue/21-action-image-buttons`; HEAD era F2 `4d28819` y la rama estaba 8 commits por delante de `origin/master`.
- No se ejecutó ningún test automatizado.

## Dictamen

Contrato, mapeo y formato/dimensiones documentadas pasan la revisión estática; build también pasa. F3 permanece `BLOCKED` porque el recorrido manual exigido no es ejecutable en este entorno sin instalar un navegador, acción que este encargo prohíbe. Con un navegador disponible, repetir el walkthrough de Challenge, Block Foreign Aid, Block Steal, Block Assassination y Pass, además del contexto Claim, en escritorio/móvil y con teclado/reduced motion; después actualizar el veredicto.
