# F3 — verificación independiente de ventanas de decisión (#77)

**Veredicto:** `FAIL` — F3 no habilita integración.
**Árbol revisado:** `issue/77-decision-window-performance`, commit F2 `7aea6e43b76e799157594cf323ce36941c05046b`.
**Issue canónico:** [pronficilio/coup-online#77](https://github.com/pronficilio/coup-online/issues/77), abierto y asignado a `pronficilio` al verificarlo. El cuerpo vigente conserva AC1–AC8 y excluye cambiar prioridad, timeout y política de reconexión.
**Alcance:** inspección independiente del código, pruebas y reportes F1/F2. No se ejecutaron pruebas adicionales; los resultados de F2 se citan como evidencia declarada por ese reporte, no como corrida propia.

## Veredicto por criterio

| Criterio | Estado | Evidencia y alcance |
|---|---|---|
| AC1 — cerrar al quedar determinado el primer no-pass | `PASS` | `coup.js:878–885` requiere que todas las respuestas anteriores al primer no-pass estén presentes; `submitChoice()` llama a `closeDecision()` cuando el predicado se cumple (`545–587`). El test diferencial documenta cierres en el prefijo mínimo (`coup.test.js:146–223`). |
| AC2 — esperar asientos anteriores | `PASS` | El recorrido en prioridad retorna `false` al primer asiento sin respuesta (`coup.js:880–883`). El test de challenge posterior espera el pase previo (`coup.test.js:225–248`); el diferencial mide el prefijo mínimo (`146–223`). |
| AC3 — equivalencia sin importar llegada | `PASS` | F1 define la regla como el primer no-pass en `nextInPriorityOrder`; F2 compara ocho asignaciones pass/no-pass y seis órdenes de llegada en `challenge`, `block` y `block_challenge` (144 escenarios; `coup.test.js:146–223`). El resolver de cierre usa el mismo orden (`coup.js:901–906`). F2 reporta que esas pruebas pasan. |
| AC4 — todos pasan produce `null` | `PASS` | El predicado solo devuelve `true` al hallar un no-pass; con todos pass se cierra únicamente por `responses.size === allowed.size` (`coup.js:582–585`) y el resolver no encuentra selección (`901–906`). Las asignaciones all-pass están en el diferencial (`coup.test.js:146–223`). |
| AC5 — anchors y elegibles de las cuatro rutas | `PASS` | Challenge usa actor como anchor y los demás vivos (`coup.js:995–1003`); Foreign Aid usa actor y demás vivos (`1046–1065`); bloqueo dirigido usa solo el objetivo vivo (`1050–1052`); `block_challenge` usa blocker y demás vivos (`1087–1095`). La integración de Foreign Aid prueba bloqueo y challenge por prefijo (`coup.test.js:302–328`); Assassin recorre el bloqueo de objetivo (`354–470`); muertos omitidos están cubiertos (`250–275`). |
| AC6 — timeout, reanudación y envelopes | `PASS` | `pause()` copia respuestas y predicado (`coup.js:485–502`); `resume()` reactiva la plantilla conservada con ID/versión nuevos y omite a quien ya respondió (`832–845`, `617–665`). La prueba confirma conservación, autorización del no respondiente y rechazo del envelope viejo (`coup.test.js:497–526`). Una repetición idéntica con envelope vigente conserva la idempotencia anterior sin insertar otra respuesta (`coup.js:571–579`; `coup.test.js:330–352`); los envelopes anteriores a reanudar se rechazan. |
| AC7 — cierre, timer y transición únicos; tardías inocuas | `PASS` | `closeDecision()` deja inactiva la decisión, cancela el timer, emite un cierre a cada humano elegible y llama una vez al resolver (`coup.js:849–866`). El diferencial comprueba un cierre por socket, timer nulo, una resolución y envío tardío rechazado (`coup.test.js:204–220`). |
| AC8 — matriz/validación incluye Codex, timeout y muertos | `FAIL` | Timeout/reanudación y asientos muertos sí tienen cobertura (`coup.test.js:497–526`, `250–275`). No hay prueba que cierre anticipadamente una ventana con una respuesta Codex pendiente y compruebe la respuesta asíncrona después del cierre. Las pruebas Codex presentes verifican una acción normal y apagado durante un challenge (`604–650`, `652–691`), no su interacción con el nuevo predicado. Aunque el callback comprueba ID/versión antes de aceptar (`coup.js:781–794`), esa protección no se valida en la matriz como exige AC8. |

## Hallazgo que impide PASS

La cobertura diferencial de F2 llama `submitChoice()` directamente con respuestas manuales y recorre todas las permutaciones cubiertas, pero no incluye un asiento `controller: 'codex'` ni una respuesta diferida de `codexClient.choose()`. Tampoco existe otra prueba que cubra esa combinación con el cierre anticipado. Falta evidencia exigida expresamente por AC8 para «respuesta de Codex si existe»; no concluyo que la guarda de producción falle, sino que la validación pedida no la ejercita.

Una comprobación focalizada debería poner un Codex en un asiento posterior al ganador de prioridad: dejar pendiente su `choose()`, completar antes el prefijo que contiene un ganador humano y luego resolver Codex con su respuesta antigua. Debe comprobar que esa respuesta no altera ganador/transición, no reabre la decisión ni provoca pausa o resolución duplicada. F3 debe repetirse después de añadir cobertura.

## Pregunta de falsificación

Con anchor en asiento 0, asientos 1 y 2 humanos y asiento 3 Codex, ¿puede completarse `1=pass, 2=challenge` y cerrar antes de la respuesta de Codex; luego, al resolver Codex con el envelope previo, queda el mismo challenger y una sola transición, sin pausa ni cierre adicional?

## Siguiente estado

F3 `FAIL`; devolver a F2 únicamente para añadir y ejecutar la regresión Codex descrita. No abrir integración ni declarar listo. Las tres fallas ajenas de `coup.test.js` registradas por F2 (Exchange, pausa al desconectar y broadcast Codex) no se reatribuyen a este hallazgo. Esta revisión no ejecutó pruebas.
