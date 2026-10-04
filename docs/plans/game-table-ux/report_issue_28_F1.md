# Reporte F1 — reglas, mazo y snapshots

## Veredicto

**F1: `CLOSED`.** La inspección documental y estática confirma las reglas normales y las rutas actuales de mutación de Court. No encontré contradicción que requiera cambiar reglas o devolver la decisión al Orquestador.

La rama se creó desde `origin/master` en `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Durante F1, `origin/master` avanzó a `c601410952184c85f552ee5cbb73ef6fe52519ff` al integrarse PR #27. La comparación de los archivos de reglas, servidor y tablero incluidos en esta auditoría entre ambos SHA no muestra diferencias; la evidencia también describe esos archivos en el `origin/master` actual.

La fase no modificó código de producto ni reglas. No se agregaron ni ejecutaron pruebas.

## Reglas y preparación actual

- `docs/coup_transcription.md:15-23` define 15 cartas, tres de cada uno de cinco roles, y reparte dos influencias por jugador. `server/utilities/constants.js:1-9` enumera Duke, Assassin, Captain, Ambassador y Contessa; `server/game/utils.js:3-8` añade tres copias de cada valor y baraja las 15.
- `server/game/coup.js:74-75` acepta entre dos y seis jugadores. `resetGame()` construye el mazo en `:113` y extrae exactamente dos cartas por asiento en `:121-126`; la regla de dos jugadores en `:127-129` solo ajusta la moneda inicial del jugador que empieza.
- Por tanto, la preparación normal deja `15 − 2 × jugadores` cartas en Court:

| Jugadores | Influencias repartidas | Court inicial |
|---:|---:|---:|
| 2 | 4 | 11 |
| 3 | 6 | 9 |
| 4 | 8 | 7 |
| 5 | 10 | 5 |
| 6 | 12 | 3 |

- La variante opcional de dos jugadores está documentada en `docs/coup_transcription.md:191-199`: usa tres sets de cinco, una carta por jugador y deja tres en Court. El servidor no la implementa; la unidad conserva la preparación normal. No hay soporte actual para mazos de 10 o 20 cartas.
- `docs/coup_transcription.md:100-101` dice que Exchange toma dos cartas y devuelve dos. `:132` describe el reemplazo uno-a-uno tras probar correctamente un reclamo. Las cartas reveladas por pérdida quedan fuera de Court; el flujo de `loseInfluence()` quita una carta de la mano y la agrega a `revealedInfluences` sin tocar `this.deck` (`server/game/coup.js:823-860`).

## Mutaciones de `this.deck`

El barrido estático de fuentes de producción encontró estas operaciones en `server/game/coup.js`; las otras referencias a `deck` bajo `server/` son fixtures de pruebas, que no se ejecutaron.

| Flujo | Operaciones | Cambio neto de Court | Snapshot actual |
|---|---|---:|---|
| Construcción/reparto inicial o revancha | `buildDeck()` asigna las 15; `resetGame()` hace dos `pop()` por jugador (`:113`, `:121-126`). | `15 − 2 × jugadores` | `start()` emite `updatePlayers()` tras repartir (`:88-97`); `playAgain()` también resetea y emite después (`:964-971`). |
| Reclamo probado con éxito | `returnProvenInfluence()` hace `push(card)`, baraja y hace `pop()` de reemplazo (`:811-820`). | 0: devuelve una y roba una | El resolver de la prueba llama `updatePlayers()` después del reemplazo (`:792-801`). |
| Exchange pendiente | `resolveAction()` hace hasta dos `pop()` y pasa las cartas privadas a `openExchange()` (`:888-891`); `filter(Boolean)` permite que un mazo agotado entregue menos de dos. | Baja por la cantidad realmente robada; normalmente 2 | **No se emite `g-updatePlayers` después de esos `pop()`.** Se abre un `g-decision` dirigido a quien elige (`:918-923`). |
| Exchange resuelto | La resolución devuelve las cartas no conservadas con `push(...returned)`, baraja y actualiza (`:924-934`). | Vuelve al valor previo si se devolvieron las mismas cartas robadas | `updatePlayers()` se llama al terminar el intercambio (`:933`) y de nuevo al avanzar turno (`:939-944`). |
| Influencia perdida/revelada | Se quita de `player.influences` y se agrega a `revealedInfluences`; no se agrega a Court (`:847-858`). | 0 | La instantánea posterior actualiza influencias reveladas, sin cambio de Court. |

El contador debe derivarse de `this.deck.length`, no de una fórmula del cliente. Durante un Exchange debe publicarse una instantánea después del robo y antes de esperar la elección; el `updatePlayers()` previo que puede ocurrir al iniciar la acción (`:631`) es anterior al robo y no refleja el valor pendiente. Al resolverse el intercambio, la instantánea existente vuelve a reflejar el tamaño final. El conteo dinámico también conserva exactitud si quedan menos de dos cartas antes de un Exchange.

## Snapshot público y privacidad

`updatePlayers()` (`server/game/coup.js:144-171`) emite `g-updatePlayers` a cada jugador humano y espectador. El objeto público por jugador contiene `name`, `controller`, `effort` solo para Codex, `money`, `color`, `isDead`, `influenceCount` y `revealedInfluences`. A cada jugador humano se le agrega su `ownInfluences` privada; al espectador se le envía `ownInfluences: []`, más `spectator: true`. Ambos incluyen `currentPlayer`, `phase` y `stateVersion`.

El payload no incluye el tamaño del mazo ni las cartas ocultas. Para F3, el dato aditivo puede ser un entero público `courtCount: this.deck.length` en las dos variantes de `g-updatePlayers`; no se necesita agregar cartas al objeto `players`, ni alterar `g-decision` o el envelope `g-submitDecision` (`decisionId`, `stateVersion`, `choiceId`). La decisión Exchange ya entrega sus opciones solo al asiento elegible (`server/game/coup.js:335-367`).

El cliente escucha `g-updatePlayers` en `coup-client/src/components/game/Coup.js:197-203`, donde hoy guarda `players`, `ownInfluences` y `currentPlayer`, pero no un conteo de Court. `PlayerBoard` recibe esos datos en `:308-313`; dibuja la imagen del mazo en `coup-client/src/components/game/PlayerBoard.js:94-102`. F3 deberá llevar el nuevo entero por ese recorrido y renderizarlo inmediatamente encima de la imagen, sin derivarlo en cliente.

## Contrato visual y observaciones estáticas

- Hoy `Coup.js:299-306` inserta `InfluenceSection` entre `GameHeader` y `PlayerBoard`, con título localizado, círculos y nombres. El asiento local ya obtiene `ownInfluences` para representar cartas propias en `PlayerBoard.js:41-70`; `roleLabel()` y `ROLE_KEYS` (`:24-35`) usan `game.roles.*` para nombres localizados. F2 puede alojar allí el texto de los roles bajo las cartas propias y retirar el bloque global sin cambiar la privacidad del payload.
- `PlayerBoardContainer` (`PlayerBoardStyles.css:1-8`) está en flujo normal, con `width: min(100%, 900px)`, proporción cuadrada y margen de 12 px. `PlayerBoardCenter` y `PlayerBoardDeck` se centran dentro del contenedor (`:30-58`). `Coup.js` renderiza el tablero como hijo posterior a `GameHeader`/`InfluenceSection` (`:285-314`).
- El HUD está dentro de `GameHeader`: `.PlayerInfo`, `.Rules`, `.CheatSheet` y `.EventLogContainer` tienen posiciones absolutas en `CoupStyles.css` (`:1-29`, `:47-49`, `:190-205`); el encabezado mide 22vh por defecto y 15vh desde 1024 px (`:266-269`, `:803-805`). En escritorio los controles usan offsets de 5vh, 17vh, 22vh y 10vh (`:772-805`). El ajuste pedido debe actuar sobre el tablero y comprobar estas anclas sin cambiar el encabezado.
- `playerBoardLayout.js:1-35` coloca los asientos en un círculo; las posiciones superiores son 14% para 2–4 y 6 jugadores, y aproximadamente 20.9% para 5 jugadores. En móvil, `PlayerBoardStyles.css:267-348` aplica ajustes adicionales para asientos de borde y las distribuciones de 5/6. No hay medición de píxeles del borde superior en una página renderizada en F1; la reserva de ~50 px y ausencia de solapamientos deben comprobarse visualmente después del ajuste para 2–6 jugadores en móvil y escritorio.
- `TurnTableShell` solo aparece en selectores CSS (`CoupStyles.css:591-697`), sin markup con esa clase bajo `coup-client/src`; esos selectores no describen el layout activo que renderiza `Coup.js`.

## Cierre y siguiente dueño

Los criterios de F1 quedan confirmados: 15 cartas / cinco roles, dos influencias repartidas por cada asiento, mutaciones y snapshots enumerados, y contrato público compatible con un número sin identidades. Queda documentado un requisito concreto para F3: emitir snapshot tras el robo de Exchange pendiente. El tamaño final después de Exchange y el reemplazo por desafío permanecen invariantes; una revancha reinicializa y reparte de nuevo.

F1 queda `CLOSED`. F2 y F3 permanecen `BLOCKED` por la coordinación vigente de #24/#26. El siguiente dueño es el Orquestador: confirmar que esas superficies están liberadas e integradas; después, sincronizar el branch desde el `origin/master` vigente antes de iniciar F2. La issue #28 permanece abierta.
