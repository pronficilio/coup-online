# Reporte issue #28 — F2: influencias y posición del tablero

## Veredicto

`ACTIVE` hasta registrar el seguimiento corregido. Build y comprobaciones estáticas pasan; el propietario aprobó visualmente esta versión del preview, por lo que F4 puede repetirse. Este reporte no afirma haber inspeccionado visualmente una partida actual ni validado dispositivos reales.

Commit de implementación original: `feat(game-ui): issue 28 F2 influences, lost cards and board position`. Commit de cierre de seguimiento: `fix(game-ui): issue 28 F2 responsive geometry and response highlight`.

## Cambios

- Quité `InfluenceSection`, el texto global “Your influences”, las bolitas y sus estilos/colores. Cada rol propio aparece como texto traducido debajo de su tarjeta local, sin título.
- Las cartas que llegan por `revealedInfluences` se presentan como pérdidas permanentes: capa gris translúcida, símbolo `×`, etiqueta accesible localizada y nombre del rol debajo de la carta. La imagen del rol se conserva.
- Las influencias ocultas activas de otras personas siguen mostrando el reverso y no pasan su identidad a atributos del DOM. El marcado de pérdida usa solo el estado público `revealedInfluences`; una carta temporal probada en desafío no entra en esa lista y no recibe marca.
- Moví visualmente solo `.PlayerBoardContainer` con `transform`, usando desplazamientos de viewport distintos para desktop y móvil. El transform no cambia el flujo de la página: `.GameHeader`, nombre/monedas, Rules, Cheat Sheet, Event Log, `ReferencePanel` y decisiones mantienen sus reglas actuales de posición y flujo.
- En el seguimiento de F2, calibré el desplazamiento para que su término de ancho use el ancho real del tablero, limitado a 900 px, y separé tablet (521–1023 px) de móvil (hasta 520 px). Así el cálculo no usa el ancho de viewport completo cuando el tablero ya alcanzó su tope.

## Evidencia y validación

- Base sincronizada antes del producto: `origin/master@3313d426ebe5cf3d0612e692e1fe44137468362f`; el merge en HEAD `78b27089e0ad379a350a3ff6a5d4b82c6a3cbe18` no presentó conflictos. Los cambios integrados de #21 en botones de respuesta se conservaron.
- Inspección estática: `PlayerBoard` consume `revealedInfluences` público y la mano `ownInfluences` solo del asiento local; los rivales activos ocultos siguen usando el reverso sin roles en atributos/DOM.
- `git diff --check`: correcto.
- `translations.json`: parsea como JSON.
- `npm run build` en `coup-client`: correcto. CRA mostró avisos preexistentes de `logo`/`Link` sin uso en `src/App.js`, base `caniuse-lite` antigua y `postcss-calc` no reconoce las unidades `dvh` de `ReferencePanel.css` (líneas 100 y 106). El build terminó y dejó `build/` listo.
- Después de calibrar el lift responsive, `git diff --check` y un segundo `npm run build` también pasaron con esos mismos avisos preexistentes.
- No se agregaron ni ejecutaron tests automatizados.
- F3 añadió el contador y el preview está activo para la revisión visual del propietario, que permanece pendiente.

## Archivos de producto

- `coup-client/src/components/game/Coup.js`
- `coup-client/src/components/game/CoupStyles.css`
- `coup-client/src/components/game/PlayerBoard.js`
- `coup-client/src/components/game/PlayerBoardStyles.css`
- `coup-client/src/i18n/translations.json`

## Seguimiento del Verifier independiente (2026-09-27)

La revisión FINAL devolvió F4 con `FAIL` medio en el criterio 2: en mesas de cinco jugadores, el asiento superior queda aproximadamente a 81 px del borde en móvil de 390 px y 112 px en escritorio ancho, frente al objetivo de unos 50 px. Los demás criterios pasaron estáticamente. Por ese hallazgo, F2 vuelve a `RETURNED` solo para ajustar el desplazamiento de `.PlayerBoardContainer` con base en las posiciones superiores de 2–6 jugadores, incluyendo el ancho del tablero limitado a 900 px. No cambiar HUD, controles, asientos visibles, reglas, privacidad ni protocolo. El seguimiento se cierra tras build, diff-check y sintaxis; el mismo Verifier repetirá F4.

### Resolución F2 del margen superior

Se añadió `.PlayerBoardContainer[data-player-count="5"] { translate: 0 -6.88%; }`. El tablero es cuadrado y tiene ancho máximo de 900 px; el ajuste compensa la diferencia entre la coordenada superior de 20.88% en el anillo de cinco jugadores y el 14% usado por los otros layouts. No cambia los transforms responsive existentes ni los controles fuera del tablero.

Verificación del seguimiento: `git diff --check` pasó, `node --check server/game/coup.js` pasó y `npm run build` en `coup-client` terminó con código 0. Persisten los avisos de `logo`/`Link` sin uso en `App.js`, `postcss-calc` con `dvh` en `ReferencePanel.css` y `caniuse-lite` desactualizado; la corrección no añadió warnings. No se ejecutaron tests automatizados. El preview `http://localhost:3015` sigue activo. El Verifier confirmó el margen superior, pero devolvió F4 por un posible solapamiento del asiento superior derecho con el Event Log en móvil; F2 y F4 se reabren en el criterio 2 para conservar accesibles ambas superficies.

### Seguimiento F2: geometría móvil, pantallas altas y asiento respondible

El Verifier repitió F4 sobre `cbc0892` y confirmó que `z-index: 4` priorizaba el Event Log sin eliminar la intersección. También midió que el piso de −180 px del `clamp()` deja márgenes de ~68–104 px en escritorios de 1200–1440 px de alto. La declaración `CLOSED` de ese commit fue prematura y se conserva como evento histórico; la bitácora posterior devuelve F2. Se quitó el `z-index` añadido al `.GameHeader`.

El anclaje real del Event Log en viewports de hasta 1199 px sigue siendo `right: 10vw; top: 10vh` por una media query existente; el anclaje base de 60 px/15 px rige fuera de ella. En cinco jugadores y hasta 520 px, solo se limita su ancho a 100–130 px y se ajusta el wrap; el área desplazable conserva 9vh. La geometría estática resultante: a 390×844, el log ocupa x≈221–351, el asiento superior izquierdo x≈47–122 y el derecho x≈134–203; gaps estimados ≈12 px entre asientos y ≈18 px hasta el log. A 320×844, el log ocupa x≈188–288, el izquierdo x≈29–95 y el derecho x≈106–163; gaps ≈11 px y ≈25 px. Son cajas calculadas desde CSS/layout, no medidas de una captura. El halo de nombre e influencias activas se reduce únicamente en cinco jugadores/móvil; su blur sigue necesitando revisión visual del propietario.

Los `clamp()` de las tres escalas se conservan. En desktop el piso cambia de −180 a −240 px; con tablero limitado a 900 px, la fórmula da lift ≈−198 px a 1440×1200 y ≈−234 px a 1440×1440, en vez de saturar a −180 px. La estimación del margen superior queda cerca de 50 px en esos casos; el clamp mantiene un límite para alturas extremas. HUD y anclaje del Event Log no cambian.

`Coup.js` abre `responseWindowOpen` solo si el cliente recibe una decisión de Challenge/Block/Block Challenge con `decision.options` no vacío. El servidor emite esas opciones solo a asientos elegibles. `PlayerBoard.js` asigna `PlayerBoardSeat--respondable` únicamente al asiento local; el estado formal `--current` se suspende mientras esa ventana local siga abierta. `responseAvailable` deja de iluminar en cuanto `submitChoice` pone `submitted=true`, incluso al elegir Pass; `responseWindowOpen` mantiene apagado `--current` hasta que `g-decisionClosed` elimina la decisión. Sin opciones locales, `--current` conserva su comportamiento. No se alteran reglas ni protocolo.

`git diff --check` y `node --check server/game/coup.js` pasan; el parseo JSON de traducciones/bitácora pasa. `npm run build` en `coup-client` terminó con código 0 y `Compiled with warnings`: `logo`/`Link` sin uso en `App.js`, `postcss-calc` con unidades `dvh` en `ReferencePanel.css` y `caniuse-lite` desactualizado. No se agregaron ni ejecutaron tests automatizados. El preview `http://localhost:3015` responde HTTP 200. El propietario aprobó visualmente esta versión el 2026-09-27; el mismo Verifier repetirá F4 sobre el commit de seguimiento. No se afirma una inspección propia de una partida viva.
