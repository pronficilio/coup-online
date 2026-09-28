# F2 — Verificación independiente de issue #47

**Veredicto: FAIL**  
**Commit de producto revisado:** `3773322af8e34f526e5e88524cfe618e0f77b061` (`feat(exchange): issue 47 F1 select from four visible cards`).  
**Alcance:** revisión estática del contrato, flujo Socket.IO, selección y render del cliente. No se ejecutaron tests automatizados ni se modificó código de producto.

## Hallazgo bloqueante

**AC de copias físicas / nombre accesible: copias con el mismo rol y origen quedan con nombres accesibles idénticos.** `ExchangeDecisionPanel.js:84-98` renderiza una tarjeta por índice de `poolSlots` y asigna una key única basada en `decisionId` e índice (`:92`), pero su `aria-label` contiene únicamente origen, rol y estado seleccionado (`:97`); no incluye identidad o posición del slot. Si las dos influencias originales fueran, por ejemplo, Duque y Duque, ambas se anuncian como “Tu carta: Duque” (y lo mismo ocurre con dos draws del mismo rol). Un usuario de lector de pantalla no puede identificar cuál de las copias físicas iguales está enfocando, aunque el estado interno sí las mantiene separadas por índice. Esto deja sin cumplir la exigencia del handoff de distinguir las copias por posición/nombre accesible sin depender del rol para distinguirlas.

## Intentos de falsificación que pasan por inspección estática

- **Alcanzabilidad y alternancia B/A:** el estado mantiene los índices seleccionados en los slots iniciales de mano original y fija `nextSlot: 1` con dos influencias (`ExchangeDecisionPanel.js:34-50`). Cada clic sobre slot no seleccionado reemplaza exactamente ese índice y alterna 1→0→1; clics sobre seleccionadas salen sin cambiar estado (`:61-70`). Para cualesquiera dos índices destino distintos del pool de cuatro, la primera sustitución puede poner uno en B y la segunda el otro en A; por tanto se alcanza cualquier pareja legal. Con una influencia, hay un slot seleccionado inicial y todo clic válido sustituye ese único slot.
- **`keepCount` y roles duplicados:** el servidor genera subconjuntos de tamaño `player.influences.length`, conserva una sola opción por firma canónica ordenada de roles (`server/game/coup.js:950-975`) y marca por separado cada índice como original/draw. El cliente conserva un arreglo de índices, ignora clics en índices ya seleccionados y compara el multiconjunto de roles ordenado para localizar la opción (`ExchangeDecisionPanel.js:51-70`). Las copias iguales no colapsan en el estado de selección; el defecto reportado es únicamente su denominación accesible indistinta.
- **Caption → firma → `choiceId`:** el caption se construye desde los roles de los índices seleccionados y el botón inferior se deshabilita si no hay opción cuya firma de roles coincida (`ExchangeDecisionPanel.js:51-59, 105-112`). Al confirmar, se entrega esa opción a `submitChoice`, que envía solo `decisionId`, `stateVersion` y su `choiceId` (`Coup.js:600-608`). El servidor valida que el `choiceId` pertenezca a las opciones autorizadas del asiento y resuelve los `keptIndices` de esa opción (`coup.js:320-347, 984-990`). Como las firmas se deduplican en servidor, el mapeo de un multiconjunto mostrado selecciona su representante autorizado.
- **Privacidad y protocolo:** `g-decision` se emite con `socketEmit` únicamente a los actores elegibles pendientes; para exchange proyecta `poolSlots` con solo `role`/`original` y opciones con `choiceId`/`roles` (`coup.js:393-413`). No se proyectan `value` ni `keptIndices`. `updatePlayers` envía influencias propias solo al jugador correspondiente y `ownInfluences: []` a espectadores (`coup.js:145-172`). El envelope entrante rechaza claves adicionales y requiere los tres campos actuales (`coup.js:293-298`).
- **Pausa, rechazo, cierre y nueva decisión:** una pausa recuperable conserva `allowed` y `responses`; `resume` reactiva la decisión, y `activateDecision` vuelve a proyectar el pool desde las opciones conservadas (`coup.js:265-285, 527-553, 393-413`). El cliente retira controles ante pausa/cierre, limpia `submitted` ante rechazo y reinicia estado visible ante nueva decisión (`Coup.js:326-410`). El selector usa `decisionId` para descartar selección local perteneciente a otra decisión (`ExchangeDecisionPanel.js:43-50`). No observé una fuga de estado entre decisiones en este flujo.

## Cierre

El defecto encontrado es reproducible por inspección del render y afecta la identificación accesible de cartas físicas con rol/origen duplicado. El veredicto F2 es `FAIL`; no se creó commit del reporte.

## Re-verificación focalizada — `cc7b568`

**Veredicto de esta ronda: PASS**
**Commit de producto revisado:** `cc7b568348d5a9916eff6ed0a3e68f0aeaaf1085` (`fix(exchange): issue 47 accessible slot names`).
**Alcance:** revisión del diff exacto, del render React del panel y de las claves de traducción ES/EN. No ejecuté tests automatizados ni modifiqué producto. Este resultado focalizado no borra el `FAIL` histórico de la revisión inicial sobre `3773322`.

### Intentos de falsificación

- **Nombres diferentes para copias físicas iguales:** el render hace `map` sobre `poolSlots`; para cada índice añade a `cardLabel` una posición calculada como `index + 1` y el total `poolSlots.length`. Así, dos slots con el mismo `role` y el mismo `original` reciben posiciones distintas aunque su origen y rol coincidan. Por ejemplo, dos originales Duque en un pool de cuatro se nombran `Tu carta: Duque, Carta 1 de 4` y `Tu carta: Duque, Carta 2 de 4`; dos draws iguales difieren del mismo modo conservando `Carta del mazo` como origen.
- **Pools de 3 y 4 slots:** el productor construye el pool como influencias actuales más dos robos (`coup.js:947-965`), por lo que un jugador con una influencia recibe 3 slots y con dos recibe 4. El render pasa la longitud real de `poolSlots`, de modo que el nombre queda `Carta n de 3` o `Carta n de 4`, respectivamente, en el rango 1…N.
- **Origen, rol, posición y selección:** el nombre sigue componiéndose de `source`, `label` y el estado `selected`; el rol se obtiene del slot, el origen de `slot.original`, y la posición del índice del mismo slot renderizado. `aria-pressed={selected}` continúa en el botón y usa el mismo booleano que el sufijo de nombre. No encontré una ruta donde el índice del nombre y el estado seleccionado se calculen desde identidades distintas.
- **Traducciones:** `translations.json` define `Carta {position} de {count}` / `{source}: {role}, {position}{selected}` en ES y `Card {position} of {count}` / `{source}: {role}, {position}{selected}` en EN. Los valores de origen y sufijo seleccionado también existen para ambos idiomas. La función actual `t()` selecciona `DEFAULT_LANGUAGE = 'es'`; la plantilla EN está presente y es coherente, aunque la revisión no atribuye un recorrido runtime EN a ese selector.
- **Regresión fuera de accesibilidad:** el diff de producto entre `3773322` y `cc7b568` solo añade interpolación de posición al `aria-label` y las claves ES/EN correspondientes. No cambia `selectedIndices`, cursor B/A, condición de clic, roles elegidos, lookup de opción/`choiceId`, payload, ni proyección del servidor. El mecanismo de privacidad revisado en la ronda inicial sigue sin cambios en este commit.

### Cierre de esta ronda

La corrección distingue copias con origen y rol idénticos y conserva en cada nombre el origen, rol, posición, total del pool y estado seleccionado; `aria-pressed` permanece sincronizado. No pude falsificar el criterio focalizado para pools de tres o cuatro cartas. **F2 focalizada sobre `cc7b568`: `PASS`.** La ronda inicial `FAIL` y su hallazgo quedan conservados arriba como historial.
