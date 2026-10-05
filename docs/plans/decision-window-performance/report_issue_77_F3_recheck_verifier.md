# F3 recheck — verificación independiente de ventanas de decisión (#77)

**Veredicto:** `PASS` para AC1–AC8; habilita revisión de integración, no una integración automática.
**Árbol revisado:** branch `issue/77-decision-window-performance`, commit de recheck `4d8be42a6d95b5907e630a473edc723703c0fd5e`.
**F3 previo:** `FAIL` en AC8, commit documental `9006853`; se conserva en `report_issue_77_F3_verifier.md` como historial.
**Issue canónico:** [pronficilio/coup-online#77](https://github.com/pronficilio/coup-online/issues/77), abierto y asignado a `pronficilio`; AC1–AC8 corresponden al cuerpo vigente.
**Alcance:** revisión independiente de código, diff, pruebas y reportes F1/F2/recheck. No se editaron ni ejecutaron código o pruebas.

## Veredicto por criterio

| Criterio | Estado | Evidencia revisada |
|---|---|---|
| AC1 — cerrar cuando el primer no-pass de prioridad determina el resultado | `PASS` | `windowIsDetermined()` recorre prioridad y solo acepta un no-pass después de todas las respuestas anteriores (`server/game/coup.js:878–885`); `submitChoice()` cierra por ese predicado (`545–586`). El diferencial valida el prefijo mínimo para las ventanas (`server/test/coup.test.js:146–223`). |
| AC2 — esperar a cualquier asiento anterior pendiente | `PASS` | El predicado devuelve `false` al primer asiento anterior sin respuesta (`coup.js:880–883`). La matriz de respuestas y permutaciones mide ese prefijo (`coup.test.js:146–223`); la integración de challenge posterior demuestra que espera el pase anterior (`225–248`). |
| AC3 — equivalencia por prioridad sin importar el orden de llegada | `PASS` | El resolver de `openWindow()` selecciona el primer no-pass en orden de asiento, igual que el predicado de cierre (`coup.js:901–907`). F2 cubre 8 asignaciones pass/no-pass × 6 órdenes en `challenge`, `block` y `block_challenge` (144 escenarios) y reporta que pasan (`report_issue_77_F2.md`; prueba `coup.test.js:146–223`). |
| AC4 — todos pasan conserva resultado `null` | `PASS` | El predicado no cierra por una serie de pases; `submitChoice()` conserva el cierre completo cuando todos respondieron (`coup.js:582–585`). Las asignaciones all-pass están en la matriz y el reporte F2 registra sus resultados. |
| AC5 — anchors y elegibles de challenge, block, Foreign Aid y block challenge | `PASS` | Challenge usa como anchor al actor y elegibles vivos (`coup.js:995–1003`); Foreign Aid usa al actor y demás jugadores vivos; bloqueos dirigidos usan solo al objetivo vivo (`1046–1065`); block challenge usa al blocker (`1087–1095`). Hay cobertura de Foreign Aid/block/block challenge (`coup.test.js:302–328`), bloqueo de objetivo en la secuencia de Assassin (`354–470`) y omisión de asientos muertos (`250–275`). |
| AC6 — timeout, reanudación y envelopes | `PASS` | La pausa conserva respuestas y el predicado (`coup.js:485–502`); reanudar genera identidad/versión nuevas y solo admite al asiento pendiente (`617–665`, `832–845`). La prueba verifica respuestas conservadas, permiso de reanudación y rechazo del envelope anterior (`coup.test.js:497–526`); F2 reporta la prueba pasando. |
| AC7 — un cierre y transición; tardías no alteran el resultado | `PASS` | `closeDecision()` limpia el timer, invalida la decisión, envía cierre por elegible humano y llama al resolver una vez (`coup.js:849–866`). La matriz instrumenta una resolución y tres cierres, y rechaza una respuesta posterior (`coup.test.js:204–220`). El caso Codex también confirma que el cierre humano previo sigue contado una sola vez y no registra otro `challenge_started` después de la respuesta tardía (`715–750`). |
| AC8 — prioridad, llegada, Codex, timeout/reanudación y asientos muertos | `PASS` | El caso nuevo deja pendiente `codexClient.choose()`, cierra `challenge` con el voto humano del asiento 1 mientras el Codex del asiento 2 sigue pendiente y luego entrega un `challenge` válido con el ID/versión viejos (`coup.test.js:700–750`). Se conserva `prove_claim`, la fase sigue `running`, el ID/versión activos difieren, el evento `challenge_started` no aumenta, no hay `g-gamePaused`, queda limpio `codexRequests` y el socket humano elegible tuvo exactamente un cierre para la ventana vieja. La cobertura de timeout y asientos muertos está en `497–526` y `250–275`. |

## Revisión del hallazgo F3 previo

El commit `4d8be42` no cambia `server/game/coup.js`; su cambio de producto relevante es solo la regresión de `server/test/coup.test.js`. La secuencia observa que la solicitud Codex comparte el envelope de la ventana `challenge`; el humano de prioridad inmediata responde `challenge` y abre `prove_claim` antes de que se resuelva Codex. Luego la prueba entrega una respuesta Codex válida pero obsoleta.

La guarda en `requestCodexDecision()` elimina el request y retorna si la partida dejó de correr, no hay decisión activa o el ID/versión ya no coinciden (`coup.js:781–794`). Por eso el resultado viejo no llega a `submitChoice()` ni puede cambiar al challenger humano seleccionado, reabrir una ventana, pausar ni invocar otro resolver. El cierre original ya anuló la decisión y avanzó la versión una vez (`849–865`). Las aserciones de la prueba verifican la transición `prove_claim` estable, la ausencia de incremento de `challenge_started`, la ausencia de pausa y un solo cierre para el humano participante. La selección del challenger sigue viniendo del resolver fijo por asiento (`901–907`, `995–1021`).

## Validación y límites

- No repetí pruebas: el ejecutor registró la corrida focalizada `node test/coup.test.js` del recheck con **19 aprobadas y 3 fallas ajenas**, incluida la nueva regresión Codex aprobada y la matriz/timeout aprobados (`report_issue_77_F2_recheck.md`). La revisión aquí fue independiente de ese ejecutor y contrastó sus aserciones con el código actual.
- Las tres fallas registradas siguen siendo ajenas al alcance: labels de Exchange (`coup.test.js:431`), expectativa de pausa tras desconexión cuando la política disuelve (`:528`) y expectativa de broadcast para un evento enviado directamente a sockets (`:652`). No las reatribuyo a #77.
- El F3 original `FAIL` no se borra ni reemplaza: documentó una brecha real de cobertura en `9006853`. La regresión añadida y su corrida satisfacen ese hallazgo en el commit actual.
- No se abrió PR ni se modificó GitHub. El issue permanece abierto; F3 `PASS` deja la unidad pendiente de revisión de integración por Orquestación.
