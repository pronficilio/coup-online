# Reporte issue #28 — F3: conteo autoritativo de Court

## Veredicto

`CLOSED` para el campo y su presentación, con build y auditoría estática completados. La inspección visual de la partida sigue pendiente del propietario en el preview local. No se afirma una ejecución manual de Exchange/desafío/revancha ni se agregaron o ejecutaron tests.

Commit prescrito: `feat(game-ui): issue 28 F3 court deck count`.

## Implementación

- `server/game/coup.js:updatePlayers()` añade `courtCount: this.deck.length` a cada `g-updatePlayers` enviado a jugadores y espectadores. Es un único número público; el payload de `players` y las manos privadas no cambian.
- `resolveAction()` publica una instantánea inmediatamente después de sacar dos cartas del mazo y antes de entrar a `openExchange()`/`openDecision()`. La cifra baja durante la elección sin cambiar el protocolo de decisión.
- Al resolver Exchange, las cartas no elegidas vuelven al mazo y este se baraja antes de `updatePlayers()`; la cifra refleja el valor restaurado. `advanceTurn()` publica después su propio snapshot.
- `returnProvenInfluence()` devuelve una carta y roba su reemplazo; el `updatePlayers()` existente de `openProofDecision()` proyecta el tamaño resultante, neto cero. Una pérdida permanente no vuelve a Court.
- `resetGame()` reconstruye y reparte el mazo antes del snapshot de inicio; `playAgain()` lo vuelve a publicar. Para el mazo normal de 15, Court queda en 11, 9, 7, 5 o 3 cartas con 2–6 jugadores respectivamente.
- El cliente guarda el campo numérico de `g-updatePlayers` y muestra una etiqueta bilingüe localizada, accesible mediante `role="status"`/`aria-live`, inmediatamente sobre el arte del mazo. No infiere el conteo de jugadores, roles o revelaciones.

## Evidencia y validación

- Inspección estática de `server/game/coup.js:144–172, 801–802, 892–894, 933–937, 967–974`; `courtCount` deriva en cada snapshot del tamaño real del array. Intercambio y reemplazo de prueba conservan intactas las decisiones.
- Inspección estática de `coup-client/src/components/game/Coup.js:252–259`, `PlayerBoard.js:105–118` y `PlayerBoardStyles.css:65–90`; el texto del contador está anclado sobre la imagen central.
- `git diff --check`: correcto; `node --check server/game/coup.js`: correcto; claves `es`/`en` parsean y están presentes.
- `npm run build` en `coup-client`: correcto. CRA reportó los mismos avisos existentes de `logo`/`Link` en `src/App.js`, `caniuse-lite` antigua y `postcss-calc` con `dvh` en `ReferencePanel.css`; el build terminó y generó `build/`.
- No se agregaron ni ejecutaron tests automatizados. El propietario hará la revisión visual en el preview; F4 conserva el recorrido final 2/3/6 jugadores y su verificación independiente.

## Archivos de producto

- `server/game/coup.js`
- `coup-client/src/components/game/Coup.js`
- `coup-client/src/components/game/PlayerBoard.js`
- `coup-client/src/components/game/PlayerBoardStyles.css`
- `coup-client/src/i18n/translations.json`
