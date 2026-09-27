# Issue #5 — Informe F1: asientos estables y contrato visual

**Veredicto:** `CLOSED`

**Branch:** `issue/5-circular-board`

**Worktree:** `.worktrees/issue-5-circular-board`

**Base:** `origin/master` en `febec397`

**Commit de control previo:** `85a71310d1ec028eaf01ef52b7a9c2530a9ab7f9`

## Resultado

`getPlayerBoardSeats(players, observerName)` rota una copia del roster entregado por el servidor para colocar al observador en el asiento 0 y conserva el orden relativo de los demás. No filtra ni modifica jugadores; cada resultado mantiene la referencia del objeto original. Un nombre de observador ausente conserva el orden recibido. Cero jugadores produce una lista vacía y un jugador queda abajo.

Las coordenadas son centros de asiento como porcentajes `(left, top)`. En n=5 y n=6 se usa un círculo de radio 36% centrado en `(50, 50)`, equidistante y comenzando abajo.

| Jugadores | Asientos en orden desde el observador |
|---|---|
| 2 | Observador abajo `(50,86)`; rival arriba `(50,14)`. |
| 3 | Observador abajo `(50,86)`; rival 1 arriba `(50,14)`; rival 2 a la derecha `(86,50)`. |
| 4 | Observador abajo `(50,86)`; rivales a la derecha `(86,50)`, arriba `(50,14)` e izquierda `(14,50)`. |
| 5 | `(50,86)`, `(84.24,61.12)`, `(71.16,20.88)`, `(28.84,20.88)`, `(15.76,61.12)`. |
| 6 | `(50,86)`, `(81.18,68)`, `(81.18,32)`, `(50,14)`, `(18.82,32)`, `(18.82,68)`. |

La eliminación no compacta los asientos: Coup conserva el roster completo en `boardPlayers` para el tablero y mantiene `players` filtrado para las decisiones existentes. Por ejemplo, con roster `A, B (isDead), C` y observador `C`, la función entrega `C, A, B`, con `B.isDead` intacto.

## Cartas y turno

`PlayerBoard` consume el roster, `observerName` y `currentPlayer`. Cada asiento dibuja dos slots. Las cartas activas propias muestran su influencia; las rivales solo producen un reverso sin texto ni atributo derivado del valor secreto. Los slots sin influencia y los de eliminados quedan inactivos. No se muestran nombres de influencia rival en el DOM.

El asiento actual recibe `.PlayerBoardSeat--current`, `aria-current` y `data-current-player`; el CSS aplica borde rojo neón a sus slots activos. No se añadieron animaciones.

## Evidencia y validación

- Revisión de `playerBoardLayout.js` y cálculo manual de las coordenadas para n=2..6.
- Revisión estática de `Coup.js`, `PlayerBoard.js` y `PlayerBoardStyles.css`, incluidos los casos propio, rival, slot inactivo y `isDead`.
- `git diff --check` terminó con código 0. Git informó que normalizará finales LF a CRLF al actualizar el working copy.
- No se añadieron ni ejecutaron tests o build en F1.

La comprobación visual de colisiones en tamaños concretos y la adaptación móvil siguen dentro de F3. La conversión/centrado del mazo y su integración corresponden a F2.

## Archivos de F1

- `coup-client/src/components/game/playerBoardLayout.js`
- `coup-client/src/components/game/PlayerBoard.js`
- `coup-client/src/components/game/PlayerBoardStyles.css`
- `coup-client/src/components/game/Coup.js`
