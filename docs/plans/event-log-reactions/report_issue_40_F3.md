# Reporte F3 — Globos efímeros de presencia

**Issue:** #40 — rediseñar el registro de eventos y añadir reacciones efímeras
**Estado:** F3 `CLOSED / PASS` tras una corrección AC9 descubierta durante F4. Revisión del Orquestador; F4 independiente continúa.
**Branch/worktree:** `issue/40-event-log-reactions` / `.worktrees/issue-40-event-log-reactions`
**Alcance:** presencia temporal junto al participante; sin vínculo persistente con un evento.

## Implementación

- `Coup.js` escucha `g-reactionPresence` y guarda como máximo una entrada temporal por asiento. Una reacción nueva reemplaza la anterior y reinicia su ventana de 3.5 s; al terminar, el globo se desvanece durante 180 ms. El evento de retiro `reaction: null` quita el globo inmediatamente. Desmontar el juego retira el listener y limpia todos los timers.
- `PlayerBoard` traduce el asiento del servidor al participante original aunque el tablero rote al observador. Cada globo muestra el emoji correspondiente, un nombre accesible y ningún avatar, ID de evento o fila del registro. El estado es público solo durante el destello y no cambia los conteos agregados.
- Los globos se posicionan absolutamente junto al nombre para evitar saltos de layout. En el borde izquierdo se colocan arriba y hacia el interior; en los demás asientos quedan al lado opuesto de las monedas. La entrada anima opacidad, desenfoque y escala del emoji; la salida reduce opacidad y escala. CSS reduce las animaciones con `prefers-reduced-motion`.

## Recorrido visual y evidencia

Se montó temporalmente el `PlayerBoard` real con seis participantes y presencia simultánea en todos los asientos; después se restauró `App.js` y se retiró el servidor local. Chromium no registró errores de página. Se revisaron los globos centrales y de ambos bordes en escritorio y móvil; todos quedaron dentro del viewport. La comprobación de `prefers-reduced-motion` resolvió la duración a `0.001s`.

- Escritorio: 1440×960, seis asientos y seis globos: [captura](evidence_issue_40_F3/reactions-desktop.jpg).
- Móvil: 390×844 con `deviceScaleFactor=2`, seis asientos y seis globos: [captura](evidence_issue_40_F3/reactions-mobile.jpg).

El recorrido es una comprobación de presentación con estado de presencia simultáneo; F4 debe falsificar reemplazo, retiro, caducidad y privacidad en el flujo completo.

## Verificaciones y revisión

- `npm run build` en `coup-client`: PASS después del rebase y la corrección AC9. Permanecen avisos de imports `logo` y `Link` sin uso en `src/App.js`, mezcla de `&&`/`||` en el listener de desconexión añadido por #46 (`Coup.js:451`), `postcss-calc` no reconoce `dvh` en `ReferencePanel.css:100,106` y la base de Browserslist está desactualizada.
- `git diff --check`: PASS; `translations.json`: parseo JSON PASS.
- Revisión del Orquestador: cada asiento tiene timers independientes; los tokens protegen contra una expiración antigua que borre una reacción reemplazada; `g-reactionPresence` acepta solo los ocho tipos conocidos y `{seat, reaction}` no aporta identidad de evento. No se ejecutó la suite de pruebas de cliente.

**Resultado F3:** PASS tras la corrección AC9. Commit base: `feat(reaction-bubbles): issue 40 F3 CLOSED advance_f4`; commit correctivo AC9 se registra en F4. La aceptación final queda en manos del Verifier independiente.

## Corrección descubierta en F4

La primera revisión cerró F3 sin una transición de escala explícita, aunque AC9 pide opacidad/escala. Se reabrió F3, se añadió escala de entrada (`0.72 → 1`) y salida (`1 → 0.82`) al emoji, y se incluyó la transición en `prefers-reduced-motion`. El build volvió a pasar; el Verifier independiente de F4 aún debe revisar el cambio.
