# Issue #49 — reporte F1: contrato del rechazo y alcance

**Fase:** F1 — `CLOSED`

**Base inspeccionada:** `origin/master@0a467c10a8d2c6c1b57eff5911c682aab9362ebf`

**Método:** inspección estática del código y reglas versionadas. No se ejecutaron pruebas automatizadas ni una partida dinámica.

## Hallazgo principal

La discrepancia queda confirmada en el servidor:

1. `CoupGame.playTurn()` obtiene las opciones con `actionChoices()` (`server/game/coup.js:600–618`).
2. `actionChoices()` agrega Coup cuando el saldo es al menos 7 (`server/game/coup.js:621–642`), y devuelve únicamente Coup cuando el saldo es al menos 10 (`server/game/coup.js:626–627`).
3. El cliente envía el identificador de la opción junto con `decisionId` y `stateVersion` (`coup-client/src/components/game/Coup.js:594–603`). El servidor comprueba que el asiento y la opción pertenezcan a la decisión activa (`server/game/coup.js:301–348`) y luego pasa el valor aceptado a `beginAction()` (`server/game/coup.js:613–617`).
4. `beginAction()` calcula Coup a 7 monedas, pero vuelve a llamar `playTurn()` cuando el saldo es menor que 10 (`server/game/coup.js:646–653`). Por eso Coup con 7, 8 o 9 monedas se acepta como respuesta de decisión y después se descarta sin consumir el turno ni comunicar rechazo: aparece otra decisión de acción.

La regla versionada dice que Coup cuesta 7 monedas, se puede elegir si se puede pagar y es obligatorio solo al comenzar un turno con 10 o más (`docs/coup_transcription.md:67–84`; resumen equivalente en `docs/coup_llm_summary.md:23–40`). El resultado requerido para F2 es alinear la validación con las opciones: Coup es legal desde 7 monedas y obligatorio desde 10.

## Decisiones inválidas u obsoletas

Los rechazos del envelope sí tienen un canal existente. `submitChoice()` llama `rejectDecision()` con una razón para envelope mal formado, decisión inexistente/obsoleta, asiento no elegible, opción fuera del mapa permitido o una segunda opción distinta (`server/game/coup.js:288–348`). El evento `g-decisionRejected` llega al cliente; este libera el bloqueo de envío y presenta el error bajo `role="alert"` (`coup-client/src/components/game/Coup.js:363–371, 753`). La selección obsoleta, por tanto, no reproduce el ciclo de Coup descrito.

`beginAction()` contiene además retornos silenciosos a `playTurn()` para coste insuficiente, acción distinta de Coup con 10+, y objetivo inválido (`server/game/coup.js:649–653`). Son defensas posteriores a la lista permitida; la ruta reproducible con saldo 7–9 es la comprobación de Coup `< 10`, que contradice explícitamente `actionChoices()`. No hay evidencia F1 de otra ruta normal alcanzable mediante una opción válida que amplíe el alcance. Si una de esas defensas se activa por estado inconsistente, también reabre la decisión sin motivo visible; F2 debe preservar las validaciones y no convertir ese caso en un rechazo genérico que oculte la causa.

## Bloqueo y resolución

`ROLE_BY_ACTION` no asigna rol reclamado a Coup y `BLOCKS` solo incluye `assassinate: [{ id: 'contessa', role: Contessa }]` (`server/game/coup.js:10–22`). `afterActionClaim()` abre una ventana de bloqueo únicamente cuando existe una entrada para el tipo de acción (`server/game/coup.js:726–729`). Coup se resuelve directamente y hace perder influencia al objetivo (`server/game/coup.js:924–926`). Esto concuerda con las reglas: Coup no puede bloquearse; Contessa solo bloquea Assassinate (`docs/coup_transcription.md:82–84, 112–114`).

## Secuencia causal reproducible por inspección

Con 8 monedas, `actionChoices()` incluye `coup:<asiento rival>`. La decisión autoriza ese `choiceId`, `submitChoice()` la acepta y cierra la ventana; el callback invoca `beginAction()`. Allí `money < 10` resulta verdadero y `playTurn()` crea otra decisión. No se crea `action`, no se deducen monedas, no se abre bloqueo y no se envía `g-decisionRejected`. La Condessa rival no participa en esta ruta.

## Veredicto

**F1 `CLOSED`; F2 `READY`.** El cambio mínimo de producto es retirar la restricción `< 10` para Coup en `beginAction()` y conservar el coste 7, el requisito de Coup con 10+, el objetivo válido y la ruta de resolución actual. El protocolo `g-decisionRejected` ya cubre decisiones inválidas/obsoletas detectadas al recibirlas; no requiere mensajes paralelos. No se ejecutaron pruebas automatizadas por restricción explícita del propietario.
