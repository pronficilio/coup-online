# F1 — prefijo suficiente para resolver ventanas (#77)

**Estado:** `CLOSED`; F2 `READY`.
**Base inspeccionada:** `server/game/coup.js` en `issue/77-decision-window-performance`, desde `origin/master@ce53c28`.
**Alcance:** análisis estático de las llamadas vigentes a `openWindow()`, el resolver de referencia y el ciclo de decisión. F1 no modifica código ni declara pruebas ejecutadas.

## Regla formal

Sea `P = [p1, p2, …, pn]` el resultado de `nextInPriorityOrder(anchor, eligibleSeats)`: asientos elegibles vivos en sentido horario, después del anchor, saltando al final de la mesa. Sea `r(pi)` la respuesta del asiento `pi`.

- Si existe una primera posición `j` con `r(pj).kind !== 'pass'`, el resultado es `r(pj)` cuando todas las respuestas `r(p1)…r(pj)` existen. Las respuestas posteriores a `pj` no pueden cambiar ese resultado.
- Si todavía falta responder cualquier `pi` anterior a un voto no-pass recibido, la ventana sigue abierta: ese asiento todavía podría elegir un resultado de prioridad mayor.
- Si todas las respuestas existentes son `pass`, el resultado solo queda determinado cuando respondieron los `n` asientos; entonces el resultado es `null`.
- El orden de llegada no participa en la selección. Los votos recibidos fuera del prefijo decisivo pueden conservarse en el mapa, pero la selección de referencia los ignora si hay un no-pass anterior.
- Si `n = 1`, la única respuesta determina el resultado, sea `pass` o no-pass. Si `n = 0`, `openDecision()` ejecuta el resolver con `[]` sin abrir una decisión.

Esto es exactamente la primera respuesta no-pass del resolver existente una vez que se conocen los posibles asientos anteriores. No depende de cambiar prioridad, opciones ni anchor.

## Matriz de llamadas vigentes

| Ventana | Call site, anchor y elegibles | Opciones y prefijo decisivo | Resultado cuando todos pasan |
|---|---|---|---|
| `challenge` | `openChallengeWindow()` (`coup.js:979–1022`); anchor: actor de la acción; elegibles: todos los demás asientos vivos (`979–987`). | Cada elegible puede `pass` o `challenge`. Aplicar el prefijo formal en orden horario. El primer challenge inicia `prove_claim`; los pases de prioridad anterior son necesarios. | `afterActionClaim(action)`: abre `block` si la acción admite bloqueo; si no, resuelve la acción (`988–989`, `1024–1027`). |
| `block` — Ayuda Extranjera | `openBlockWindow()` (`1030–1069`); anchor: actor; elegibles: todos los demás asientos vivos (`1032–1044`). | Cada elegible puede `pass` o elegir un bloqueo Duke. El primer bloqueo según prioridad crea el bloque y abre `block_challenge` (`1050–1067`). | Resuelve la acción de Ayuda Extranjera sin bloqueo (`1050–1053`). |
| `block` — acción con objetivo | `openBlockWindow()` (`1030–1069`); anchor: actor; elegible: solo el objetivo si sigue vivo (`1032–1044`). | Solo el objetivo puede pasar o bloquear, así que su única respuesta basta. Si bloquea, abre `block_challenge` (`1050–1067`). La lista vacía resuelve como `null` inmediatamente. | Resuelve la acción sin bloqueo (`1050–1053`). En las llamadas actuales, el objetivo fue validado como vivo al declarar la acción (`948`). |
| `block_challenge` | `challengeBlock()` (`1071–1124`); anchor: blocker; elegibles: todos los demás asientos vivos (`1071–1079`). | Cada elegible puede `pass` o `challenge`. Aplicar el prefijo formal en orden horario. El primer challenge inicia `prove_claim` para el blocker (`1089` en adelante). | Confirma el bloqueo y avanza el turno (`1080–1087`). |

Las ventanas de desafío solo tienen `challenge` como opción no-pass; `block` tiene uno o más bloqueos no-pass válidos para esa acción. En todos los casos el resolver busca `kind !== 'pass'` en el orden de asientos. Los muertos y el actor/anchor están excluidos de la lista elegible; no deben bloquear el prefijo ni recibir una decisión.

## Comprobación de llegada, timeout y cierre

- `submitChoice()` valida fase, decision ID, state version, asiento y opción; admite el mismo voto repetido de forma idempotente y rechaza un voto distinto del ya registrado (`coup.js:544–583`). Hoy cierra solo cuando el mapa contiene a todos los elegibles (`581`).
- `closeDecision()` cancela el timer, elimina `activeDecision`, incrementa `stateVersion`, envía `g-decisionClosed` a los humanos elegibles y llama al resolver una vez con una instantánea de las respuestas (`844–861`). Para F2, el criterio anticipado debe invocar este mismo camino de cierre; los efectos de la siguiente transición continúan en el callback actual.
- Tras cerrar, un envío tardío no encuentra decisión activa o no coincide con el ID/versión del siguiente envelope (`549–556`). La respuesta de un seat inferior que llegó antes del cierre tampoco desplaza al primer no-pass en prioridad.
- El timeout comprueba el ID de la decisión antes de pausar (`651–655`). `pause()` conserva una copia de respuestas, opciones y callback; `resume()` vuelve a activar esa plantilla con un ID nuevo y una versión nueva, y no vuelve a pedir voto a quien ya respondió (`485–505`, `613–627`, `814–841`). El cierre anticipado debe cancelar el timer por `closeDecision()` y no debe abrir una pausa recuperable después del cierre.
- Los callbacks Codex comprueban fase, decisión y versión antes de aplicar resultado (`server/game/coup.js:770–790`); tras el cierre, un resultado de la ventana anterior no satisface esa guarda.

### Divergencia preexistente de cobertura

La prueba `server/test/coup.test.js:336–364` se titula “empty response set”, envía `pass` en la ventana antes del timeout, espera que reanude el líder y luego exige `responses.size === 0`. El código inspeccionado conserva el pase en `pause()` y solo permite reanudar a un humano que no contestó (`coup.js:488–500`, `823–825`); al reactivar, copia las respuestas conservadas (`624`). Para esa secuencia de tres asientos, el test y la implementación no describen el mismo contrato. La evidencia estática confirma la intención de conservar respuestas, pero F1 no afirma que la prueba existente esté pasando. F2 debe alinear/agregar cobertura de timeout/reanudación con el criterio de aceptación #6 y verificar al actor autorizado según la política vigente o escalar cualquier cambio de política.

## Casos mínimos y falsificación

En prioridad `[s1, s2, s3]`:

| Respuestas observadas | ¿Cerrar? | Ganador según referencia |
|---|---|---|
| `s3=challenge`; s1 pendiente | No | Indeterminado: s1 todavía puede ganar. |
| `s3=challenge`, `s1=pass`; s2 pendiente | No | Indeterminado: s2 todavía puede ganar. |
| `s3=challenge`, `s1=pass`, `s2=pass` | Sí | s3, igual que al esperar a s3 como último asiento. |
| `s2=challenge`, `s1=pass`; s3 pendiente | Sí | s2; la respuesta futura de s3 no puede desplazarlo. |
| `s1=challenge`; s2/s3 pendientes | Sí | s1, prioridad máxima. |
| `s1=s2=s3=pass` | Sí, al recibir la última respuesta | `null`. |

Permutar la llegada no altera estas condiciones: la decisión se calcula sobre la prioridad de asientos, no sobre el orden temporal. Un asiento anterior que aún no responde sí puede cambiar el ganador; un asiento posterior a un ganador determinado no puede.

## Evidencia inspeccionada y siguiente fase

- Orden y resolver: `server/game/coup.js:863–894`.
- Desafío de acción, bloqueo y desafío al bloqueo: `server/game/coup.js:979–1124`.
- Envelopes, timer, cierre y reanudación: `server/game/coup.js:544–583`, `613–662`, `814–861`.
- Pruebas ya presentes sobre prioridad de challenge/block, respuestas repetidas y timeout: `server/test/coup.test.js:115–192`, `314–385`. No ejecutadas en F1.
- F2 debe comparar anticipación contra respuesta completa para las cuatro rutas de la matriz, permutaciones de llegada, todos pasan, asientos muertos, timeout/reanudación, un solo cierre y envelope tardío; detenerse después del commit F2 para F3 independiente.
