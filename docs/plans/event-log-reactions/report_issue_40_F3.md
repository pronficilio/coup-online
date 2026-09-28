# Reporte F3 — Globos efímeros de presencia

**Issue:** #40 — rediseñar el registro de eventos y añadir reacciones efímeras  
**Estado:** F3 `CLOSED / PASS`; revisión del Orquestador. F4 inicia para falsificación independiente.  
**Branch/worktree:** `issue/40-event-log-reactions` / `.worktrees/issue-40-event-log-reactions`  
**Alcance:** presencia temporal junto al participante; sin vínculo persistente con un evento.

## Implementación

- `Coup.js` escucha `g-reactionPresence` y guarda como máximo una entrada temporal por asiento. Una reacción nueva reemplaza la anterior y reinicia su ventana de 3.5 s; al terminar, el globo se desvanece durante 180 ms. El evento de retiro `reaction: null` quita el globo inmediatamente. Desmontar el juego retira el listener y limpia todos los timers.
- `PlayerBoard` traduce el asiento del servidor al participante original aunque el tablero rote al observador. Cada globo muestra el emoji correspondiente, un nombre accesible y ningún avatar, ID de evento o fila del registro. El estado es público solo durante el destello y no cambia los conteos agregados.
- Los globos se posicionan absolutamente junto al nombre para evitar saltos de layout. En el borde izquierdo se colocan arriba y hacia el interior; en los demás asientos quedan al lado opuesto de las monedas. CSS reduce las animaciones con `prefers-reduced-motion`.

## Recorrido visual y evidencia

Se montó temporalmente el `PlayerBoard` real con seis participantes y presencia simultánea en todos los asientos; después se restauró `App.js` y se retiró el servidor local. Chromium no registró errores de página. Se revisaron los globos centrales y de ambos bordes en escritorio y móvil; todos quedaron dentro del viewport. La comprobación de `prefers-reduced-motion` resolvió la duración a `0.001s`.

- Escritorio: 1440×960, seis asientos y seis globos: [captura](evidence_issue_40_F3/reactions-desktop.jpg).
- Móvil: 390×844 con `deviceScaleFactor=2`, seis asientos y seis globos: [captura](evidence_issue_40_F3/reactions-mobile.jpg).

El recorrido es una comprobación de presentación con estado de presencia simultáneo; F4 debe falsificar reemplazo, retiro, caducidad y privacidad en el flujo completo.

## Verificaciones y revisión

- `npm run build` en `coup-client`: PASS. Permanecen los avisos ajenos a F3: imports `logo` y `Link` sin uso en `src/App.js`, `postcss-calc` no reconoce `dvh` en `ReferencePanel.css:100,106` y la base de datos de Browserslist está desactualizada.
- `git diff --check`: PASS; `translations.json`: parseo JSON PASS.
- Revisión del Orquestador: cada asiento tiene timers independientes; los tokens protegen contra una expiración antigua que borre una reacción reemplazada; `g-reactionPresence` acepta solo los ocho tipos conocidos y `{seat, reaction}` no aporta identidad de evento. No se ejecutó la suite de pruebas de cliente.

**Resultado F3:** PASS. Commit requerido: `feat(reaction-bubbles): issue 40 F3 CLOSED advance_f4`. La aceptación final queda en manos del Verifier de F4.
