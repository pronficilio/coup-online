# Coup — resumen operativo para LLM

Este documento reúne las reglas de `coup_transcription.md`, `coup_play_reference.md` y `coup_summary_card.md` en una descripción autocontenida para interpretar o simular una partida.

La transcripción contiene las reglas completas. Las dos tarjetas son resúmenes compactos: si omiten quién puede realizar una contraacción o qué ocurre con un costo, aplica la regla detallada que sigue aquí. No inventes reglas para casos que estos documentos no definan; señala la ambigüedad.

## Objetivo y estado de los jugadores

- Gana la última persona que conserve influencia.
- Cada jugador empieza con dos cartas de influencia boca abajo. Esas cartas son secretas y sus personajes conceden las acciones asociadas.
- Al perder influencia, el jugador elige una de sus cartas boca abajo, la revela y la deja boca arriba. Las cartas reveladas ya no dan influencia.
- Quien revela sus dos cartas queda eliminado de inmediato; devuelve todas sus monedas a la Tesorería y deja las cartas reveladas en la mesa.
- El dinero de cada jugador permanece visible. Los demás no pueden ver sus cartas ocultas.

## Preparación

- El mazo tiene 15 cartas: tres de cada personaje —Duke, Assassin, Captain, Ambassador y Contessa—. Barájalas y reparte dos a cada jugador; las restantes forman el mazo Court.
- Cada jugador recibe dos monedas. Las restantes forman la Tesorería.
- El ganador de la partida anterior empieza; los turnos siguen en sentido horario.
- En una partida de dos jugadores, quien empieza recibe solo una moneda al inicio.
- Existe una variante opcional para dos jugadores: divide las cartas en tres grupos de cinco, cada uno con una copia de cada personaje. Cada jugador elige en secreto una carta de su grupo y descarta las otras cuatro. Baraja el tercer grupo, reparte una carta a cada jugador y deja las otras tres como mazo Court.

## Turno y resolución

1. En su turno, el jugador elige exactamente una acción que pueda pagar. No puede pasar.
2. Si empieza el turno con 10 monedas o más, debe elegir Coup como su única acción.
3. Las acciones y contraacciones que reclaman un personaje pueden ser desafiadas. La ventana para desafiar ocurre después de declarar la acción o contraacción y antes de que se resuelva; no se aceptan desafíos retroactivos.
4. Cualquier otro jugador puede desafiar un reclamo de personaje, aunque no sea parte de esa acción.
5. Resuelve primero todos los desafíos aplicables; después resuelve la contraacción y la acción que sobreviva.
6. Si nadie desafía ni bloquea una acción, esta tiene éxito automáticamente.

## Acciones

| Acción | Requisito/costo | Efecto | Desafío y bloqueo |
|---|---|---|---|
| Income | Ninguno | Toma 1 moneda de la Tesorería. | No se desafía ni bloquea. |
| Foreign Aid | Ninguno | Toma 2 monedas de la Tesorería. | No se desafía. Cualquier jugador puede reclamar Duke para bloquearla. |
| Coup | Paga 7 monedas a la Tesorería. | Elige a otro jugador: pierde una influencia. | Siempre tiene éxito; no se desafía ni bloquea. Es obligatorio si el turno empieza con 10 o más monedas. |
| Tax (Duke) | Reclama Duke. | Toma 3 monedas de la Tesorería. | El reclamo puede desafiarse. No se bloquea. |
| Assassinate (Assassin) | Paga 3 monedas y reclama Assassin. | Elige a otro jugador: pierde una influencia si la acción tiene éxito. | El reclamo puede desafiarse. Solo el jugador atacado puede reclamar Contessa para bloquear. Si el bloqueo tiene éxito, la acción falla y las 3 monedas siguen gastadas. |
| Steal (Captain) | Reclama Captain. | Toma hasta 2 monedas de otro jugador; si tiene solo 1, toma 1. | El reclamo puede desafiarse. Solo el jugador al que intentan robar puede reclamar Captain o Ambassador para bloquear. |
| Exchange (Ambassador) | Reclama Ambassador. | Toma dos cartas aleatorias de Court, decide cuáles conservar entre esas cartas y sus cartas de influencia boca abajo, y devuelve dos cartas a Court. | El reclamo puede desafiarse. No se bloquea. |

Contessa no tiene acción propia; su contraacción es bloquear una Asesinación contra sí misma. Captain y Ambassador no tienen contraacciones adicionales aparte de bloquear un Robo cuando son reclamados por la persona a quien intentan robar.

## Desafíos y contraacciones

- Solo se desafían reclamos de personaje: una acción de personaje o una contraacción que afirma tener un personaje.
- Si el jugador desafiado muestra la carta requerida boca abajo, gana el desafío. El retador pierde una influencia. El jugador que probó el reclamo devuelve esa carta a Court, baraja Court y toma una carta aleatoria de reemplazo; luego se resuelve la acción o contraacción.
- Si no tiene la carta o decide no mostrarla, pierde el desafío y una influencia. Si el reclamo era la acción, esa acción falla y se devuelven las monedas pagadas como su costo. Si era una contraacción, el bloqueo falla y la acción original continúa.
- Si una contraacción se prueba, bloquea la acción original.
- Si una contraacción válida bloquea una acción con costo, el costo permanece pagado. En particular, bloquear una Asesinación no devuelve sus 3 monedas.
- Una defensa fallida contra Asesinación puede hacer perder dos influencias en el mismo turno: una por perder el desafío y otra por la Asesinación que entonces tiene éxito. Esto ocurre tanto al desafiar sin éxito el reclamo Assassin como al reclamar Contessa sin tenerla y perder ese desafío.

## Información y acuerdos

- Los jugadores pueden mirar sus propias cartas ocultas, pero no pueden revelárselas voluntariamente a otros.
- Se permiten negociaciones, pero no son vinculantes.
- No se pueden dar ni prestar monedas a otros jugadores.
- No hay segundo lugar: la partida termina cuando solo queda un jugador activo.

## Instrucciones para interpretar una partida

- Mantén separadas las cartas ocultas, las cartas reveladas, las monedas, los jugadores activos, la Tesorería y el mazo Court.
- Trata cada personaje declarado como un reclamo. Si nadie lo desafía, se acepta; si alguien lo desafía, espera el resultado antes de resolver la acción o contraacción.
- Antes de aplicar un efecto, comprueba el costo, si la acción puede desafiarse, quién tiene derecho a bloquearla y si el costo se devuelve o permanece gastado.
- Al resolver una pérdida de influencia, deja que el jugador afectado elija cuál de sus cartas ocultas revelar.
- Avanza al siguiente jugador activo en sentido horario después de resolver por completo la acción y cualquier eliminación.
