# Issue #49 — reporte F2: autorización y resolución de Coup

**Fase:** F2 — implementación revisada estáticamente

**Base de implementación:** `fc32104` (F1) sobre `origin/master@0a467c10a8d2c6c1b57eff5911c682aab9362ebf`

## Cambio

En `server/game/coup.js`, se retiró la condición que enviaba a `playTurn()` cuando el actor elegía Coup con menos de 10 monedas. `beginAction()` conserva el coste Coup de 7 y el guard que impide cualquier otra acción desde 10 monedas (`server/game/coup.js:646–653`). `actionChoices()` sigue ofreciendo Coup desde 7 y solo Coup desde 10 (`server/game/coup.js:621–642`). El objetivo continúa validándose contra asiento existente, vivo y distinto del actor.

## Recorrido estático de criterios

- **7–9 monedas:** la lista contiene Coup; al aceptar el `choiceId` de la lista, ya no existe un guard que lo rechace por tener menos de 10. El código registra la acción, descuenta `action.cost` una sola vez y resuelve Coup por la ruta normal de pérdida de influencia (`server/game/coup.js:654–670, 924–926`).
- **10 o más:** `actionChoices()` devuelve solo objetivos para Coup; `beginAction()` mantiene el guard que rechaza una acción no-Coup. Se preserva la obligatoriedad.
- **Decisión inválida/obsoleta:** `submitChoice()` sigue rechazando envelopes obsoletos o `choiceId` que no pertenece a las opciones permitidas con `g-decisionRejected`; el cliente muestra el error existente. No se cambió ni debilitó ese protocolo (F1 documenta las rutas exactas).
- **Contessa y bloqueos:** Coup no tiene reclamo de personaje ni entrada en `BLOCKS`; Contessa sigue ligada únicamente a Assassinate. La resolución de Coup no abre una decisión de bloqueo.
- **Autoridad:** actor actual, opción permitida, saldo y objetivo siguen controlados por el servidor; costo deducido una vez antes de resolver la influencia.

## Validación y límites

`git diff --check`: **PASS**. Inspección estática del diff y de las rutas descritas arriba: **PASS**. No se modificó cliente, por lo que no aplica build de cliente. No se agregaron ni ejecutaron pruebas automatizadas; tampoco se ejecutó el servidor ni se hizo una partida dinámica. Así, la evidencia confirma el flujo en código, pero no es una validación runtime.

## Veredicto

**F2 `CLOSED`; F3 `READY`**, sujeto a Verifier independiente FINAL sobre el commit exacto. El único cambio de producto es la eliminación del guard contradictorio; no se amplió el alcance del canal común de decisiones.
