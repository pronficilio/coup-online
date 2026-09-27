# Reporte issue #28 — F2: influencias y posición del tablero

## Veredicto

`CLOSED` para la implementación F2 y su build. La revisión visual queda pendiente del propietario en el preview local solicitado; este reporte no afirma haber validado partidas en vivo ni los 2–6 asientos en dispositivos reales. El propietario autorizó continuar F3 en paralelo con esa revisión.

Commit prescrito: `feat(game-ui): issue 28 F2 influences, lost cards and board position`.

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
