# Plan — continuar la partida tras una desconexión

## Estado vigente

- Issue: [#75](https://github.com/pronficilio/coup-online/issues/75), `OPEN`.
- Estado operativo: `WAITING_ORCHESTRATOR`; F1, F2 y F3 `CLOSED (PASS)`; F3 fue `PASS` estático independiente sobre `17864e8`. Falta revisión de integración y PR.
- Modo / riesgo / verificación: `FULL` / `HIGH` / `FINAL` independiente.
- Verifier requerido: F3 `PASS` estático; no quedan checkpoints independientes pendientes.
- Branch / worktree únicos: `issue/75-disconnect-elimination` / `.worktrees/issue-75-disconnect-elimination`.
- Destino: `master` de `pronficilio/coup-online`; PR única esperada para #75.
- Plan: `docs/plans/disconnect-elimination/plan_disconnect_elimination.md`.
- Handoff: `docs/plans/active/issue_75_disconnect_elimination.md`.
- Bitácora append-only: `docs/plans/log/issue-75.jsonl`.

## Solicitud y objetivo

**Solicitud original:** «si son al menos 3 personas, y una se desconecta, el jugador que se desconecta que se muera, evitando que los jugadores restantes se queden sin partida».

**Objetivo operativo:** cuando una partida tenga tres o más asientos de jugador, la desconexión de un jugador vivo debe eliminar ese asiento y permitir que el resto continúe. Si la eliminación deja a una sola persona viva, debe cerrarse por el flujo normal de victoria. En partidas de dos asientos se conserva la disolución terminal actual. La desconexión de alguien ya eliminado no cambia el estado.

**Supuesto de conteo:** «tres o más personas» significa tres o más asientos de jugador de la partida (`players.length`), aunque algunos ya estén eliminados; los espectadores no cuentan. Así se fija un umbral observable sin cambiarlo según las eliminaciones previas.

## Hechos confirmados

- La issue #46 está cerrada e implementó `dissolve()` para la desconexión de cualquier jugador vivo durante `running` o `paused`; `onDisconnect()` ignora asientos que ya están eliminados.
- `CoupGame` representa eliminación con `isDead`, influencias, dinero y eventos de juego; `checkEliminated()` y `advanceTurn()` contienen la ruta existente de eliminación y victoria.
- Las decisiones activas y pausadas, timers y solicitudes Codex pueden quedar pendientes al ocurrir una desconexión. El cambio toca transiciones compartidas y requiere falsificación independiente.
- El contrato del proyecto exige Verifier FINAL para concurrencia/consistencia. No se ejecutaron pruebas en esta preparación.
- Decisión de alcance F1: solo se recuperan pausas con `pausedDecision` presente. Si la partida ya estaba en `paused` con `pausedDecision === null` por una causa no reanudable de #26, la desconexión elimina y proyecta al asiento, pero conserva esa pausa; no reinicia ni reasigna decisiones ni cambia quién puede reanudar. La misma frontera se registró en el [issue #75](https://github.com/pronficilio/coup-online/issues/75#issuecomment-5905691402).

## Alcance

- Implementar la regla de eliminación para desconexiones de jugadores vivos con tres o más asientos, tanto durante `running` como `paused`.
- Hacer visible a los conectados el estado eliminado usando la representación existente del juego.
- Resolver, cancelar o reabrir de forma válida una acción/decisión que incluya al asiento desconectado, preservando el flujo para el resto.
- Mantener sin cambios la disolución para partidas de dos asientos, la regla de pausa/reanudación de #26, y la desconexión de asientos ya eliminados.
- Evitar que timers, respuestas tardías o trabajo Codex reactiven una decisión inválida o dejen la partida bloqueada.

## Fuera de alcance

- Reconexión, transferencia de identidad o reemplazo del asiento desconectado.
- Cambios generales a las reglas de Coup o al ownership para reanudar pausas.
- Cambios al comportamiento de desconexión de espectadores.

## Criterios de aceptación

1. En una partida con tres o más asientos, un jugador vivo que se desconecta queda eliminado; una desconexión de asiento ya eliminado no cambia la partida.
2. La eliminación usa el estado y la proyección/eventos existentes, no devuelve influencias perdidas a la Corte y actualiza a los jugadores conectados sin recarga.
3. En `running`, el turno o decisión afectada se resuelve o cancela según una ruta válida del juego. El jugador desconectado no puede responder ni volver a actuar.
4. En una pausa recuperable (`pausedDecision` presente), no se disuelve una partida de tres o más asientos por esta desconexión; se conserva el camino de reanudación actual para los asientos elegibles o se cancela la decisión afectada de forma segura. Una pausa preexistente no reanudable (`pausedDecision === null`, por ejemplo fallo/deshabilitación Codex) permanece pausada conforme a #26.
5. No quedan decisiones, timers, solicitudes Codex ni respuestas tardías que bloqueen, dupliquen o reactiven el flujo tras eliminar al jugador.
6. Si la eliminación deja un único jugador vivo, se declara ganador con el evento y estado normal de `gameover`.
7. Una partida de dos asientos conserva la disolución actual establecida por #46. No hay cambios a reconexión ni a espectadores.
8. La revisión documenta la matriz `running`/`paused`/`gameover` × asiento vivo/eliminado × actor/respondedor/objetivo, y diferencia revisión estática de evidencia dinámica.

## Fases

### F1 — definir la recuperación de la acción afectada

- **Estado:** `CLOSED (PASS)`.
- **Pregunta única:** ¿cómo se elimina el asiento y se recupera cada tipo de acción/decisión activa o pausada sin dejar al resto en un estado inválido?
- **Entrada:** issue #75; `server/game/coup.js` (`onDisconnect`, `dissolve`, `pause`, `resume`, decisiones, `checkEliminated`, `advanceTurn`); cliente `Coup.js`; plan e informes de #46.
- **Salida:** matriz de rutas `running`/`paused`/`gameover`, jugador actor/respondedor/objetivo, e invariantes para estado, eventos y continuación; reporte `docs/plans/disconnect-elimination/report_issue_75_F1.md`.
- **Avance:** cada combinación alcanzable tiene un resultado definido; no se cambia la disolución de dos asientos ni la autorización de reanudar.
- **Pivote:** si una decisión no se puede retomar con las respuestas existentes, definir una cancelación explícita que reabra la acción de forma segura.
- **Repetición acotada:** una relectura de emisores/consumidores y callbacks afectados.
- **Bloqueo:** la continuación requiere cambiar una regla fuera del alcance; elevar al Orquestador antes de implementarla.
- **Política de commit:** `COMMIT_REQUIRED`; plan y reporte F1 juntos.
- **Cierre previsto:** `docs(plans): issue 75 F1 CLOSED advance_f2`.
- **Validación:** inspección estática de la matriz y rutas afectadas.
- **Veredicto:** `CLOSED (PASS)` estático; sin evidencia dinámica ni pruebas automatizadas.

### F2 — eliminar al jugador y continuar la partida

- **Estado:** `CLOSED (PASS)` por revisión estática del diff y correcciones a los contraejemplos reportados en F3; sin evidencia dinámica. F3 falló en `d9fad75`; el Verifier debe repetirla sobre el nuevo commit antes de integración.
- **Pregunta única:** ¿la implementación elimina el asiento desconectado y deja al resto con una partida válida en todos los contextos alcanzables?
- **Entrada:** contrato cerrado en F1.
- **Salida:** cambio server-side y actualización de proyección cliente si hace falta; reporte `docs/plans/disconnect-elimination/report_issue_75_F2.md`.
- **Avance:** criterios 1–7 satisfechos por inspección del cambio; dos asientos conservan el resultado #46.
- **Pivote:** ante una ruta de decisión que no se pueda reanudar, aplicar la cancelación/reapertura fijada en F1; no degradar a disolución para tres o más.
- **Repetición acotada:** una ronda de corrección ante contraejemplo concreto.
- **Bloqueo:** no existe transición segura sin alterar una regla fuera de alcance; devolver con evidencia.
- **Artefactos:** `server/game/coup.js`, cliente/traducciones solo si hacen falta, este plan y reporte F2.
- **Política de commit:** `COMMIT_REQUIRED`.
- **Cierre previsto:** `fix(disconnect-elimination): issue 75 F2 CLOSED advance_f3`.
- **Validación:** revisión estática del flujo y diff. No agregar ni ejecutar pruebas automatizadas en esta unidad.

**Contrato F1 para decisiones afectadas:** en `running`, una desconexión antes de que el actor elija cancela su turno y avanza; si una acción ya declarada está en una ventana multi-asiento, la acción se cancela y avanza sin reembolso. Si el actor desconectado está en `prove_claim`, se registra `claim_not_proved` y la afirmación queda `failed`; `onConceded` solo reembolsa a un jugador vivo. Después de eliminar al actor, `loseInfluence` detecta `isDead`, no abre otra decisión y llama directamente a `onLost`, con lo que `money` permanece en 0 y el turno avanza. Si el actor de `currentAction` se desconecta durante una pérdida ya determinada que corresponde a otro asiento vivo, la decisión y pérdida de ese asiento continúan; el callback posterior cancela la acción del actor muerto en vez de continuarla. Si el blocker muere durante `block_challenge`, aunque no pertenezca a `decision.allowed`, se descarta esa decisión y su bloque queda cancelado; la acción original continúa sin bloqueo y `openProofDecision` no abre una decisión para un claimant muerto. Si el asiento pierde influencia en `lose_influence`, la muerte satisface esa pérdida y ejecuta `onLost`; nunca se llama al resolver con `[]`. Si el dueño de `exchange` desconecta, se cancela el intercambio, se devuelven al mazo y se mezclan las cartas robadas para el pool; las influencias originales del jugador muerto siguen fuera del mazo. En ventanas multi-asiento se elimina el asiento de `allowed` y `responses`, y los vivos restantes resuelven normalmente. En `paused` recuperable también se quita de `resumeOwnerSeats`; los propietarios restantes conservan la autorización existente. Si ya no queda un propietario, se resuelve una ventana solo cuando todas las respuestas vivas ya están completas; en otro caso se cancela la acción actual y se avanza el turno. Al intentar `resume`, se procesan primero el actor actual, el blocker pendiente y el objetivo offline; luego se eliminan los demás asientos humanos ausentes aunque la primera eliminación pase a `running`. Si el estado ya es terminal se detiene; si la partida ya volvió a `running`, no se envía un rechazo falso. Una desconexión que deja un solo vivo usa el `gameover` y `g-gameOver` normal. Las pausas `pausedDecision === null` conservan su estado no reanudable previo.

### F3 — revisión independiente FINAL

- **Estado:** `CLOSED (PASS)` por revisión estática independiente del commit `17864e899597f768fffd08dfc7acdde3f3fe8075`.
- **Pregunta única:** ¿puede una desconexión durante una acción, una pausa/timeout o una respuesta tardía bloquear a los conectados, duplicar resolución o reactivar un estado inválido?
- **Entrada:** commit F2 correctivo y diff completo de #75; checkpoint de hallazgos en `docs/plans/disconnect-elimination/report_issue_75_F3_checkpoint.md`.
- **Salida:** reporte independiente `docs/plans/disconnect-elimination/report_issue_75_F3_verifier.md` con veredicto `PASS`, `FAIL` o `BLOCKED` y evidencia estática/dinámica claramente separada.
- **Avance:** criterios 1–7 se intentaron refutar; F3 `PASS` estático permite revisión de integración. Las dos devoluciones previas fueron corregidas en F2 y reexaminadas.
- **Pivote:** si una afirmación exige ejecución dinámica no disponible, marcar la limitación; no declarar cobertura dinámica.
- **Repetición acotada:** una ronda de corrección y relectura del hallazgo.
- **Bloqueo:** fallo no resoluble en una ronda o falta de Verifier independiente; `WAITING_ORCHESTRATOR`.
- **Política de commit:** `COMMIT_REQUIRED`; el reporte/veredicto y el evento de cierre F3 se registran en el branch del issue.
- **Cierre previsto:** `fix(disconnect-elimination): issue 75 F3 CLOSED advance_review`.
- **Validación:** revisión independiente estática del diff; no se ejecutaron pruebas, build ni runtime, por lo que la entrega de eventos/callbacks Socket.IO no tiene evidencia dinámica.

## Branch, integración y validación

- Una unidad, un branch, un worktree y una PR: `issue/75-disconnect-elimination` → `master`.
- Worktree esperado: `.worktrees/issue-75-disconnect-elimination`.
- No se observó branch local/remoto ni worktree con este nombre al preparar la unidad; el Ejecutor debe volver a comprobar el tracker y refs antes de reclamar/crear.
- PR esperada: una PR hacia `master`, asociada solo a #75; al cierre de F3 no existe una PR candidata conocida.
- No se ejecutarán ni añadirán pruebas automatizadas porque el usuario pidió el cambio de comportamiento, no pruebas/verificación. Los reportes deben identificar esta limitación y no afirmar validación dinámica.

## Riesgos y preguntas

- Riesgo `HIGH`: el asiento puede desconectarse como actor, respondedor, objetivo o durante una pausa; una transición incompleta puede dejar decisiones/timers vivos.
- Mantener el cambio coordinado con el contrato terminal de #46; no editar la historia cerrada de #46.
- Preservar la prioridad de una victoria normal ya declarada y evitar un ganador doble.
- Pregunta de falsificación FINAL: ¿puede una intercalación entre desconexión, timeout, resume, respuesta humana/Codex y avance de turno dejar a los conectados sin una decisión válida, resolver una acción dos veces o reactivar una partida terminal?

## Historial de decisiones

- 2026-09-30: se registra como cambio nuevo #75; el contrato previo #46 sigue vigente para partidas de dos asientos y para la historia de su integración.
- 2026-09-30: el umbral de tres cuenta asientos de jugador de la partida, incluyendo asientos eliminados, y excluye espectadores.
- 2026-09-30: F1 limita la recuperación pausada a `pausedDecision` presente; si ya era `null`, #75 conserva la pausa no reanudable de #26 y no reinicia ni reasigna esa decisión.
- 2026-09-30: el primer F3 mostró que un blocker muerto no pertenece a `block_challenge.allowed`; F2 invalidó y descartó esa ventana al morir el blocker, y continúa sin bloqueo.
- 2026-09-30: el Verifier reportó `FAIL` en `d9fad75` por un segundo hallazgo: resume multi-socket resolvía foreign aid antes de procesar al actor offline. Ambos hallazgos están en `report_issue_75_F3_checkpoint.md`; el commit `17864e8` prioriza `currentAction.actor`, `pendingBlock.blocker`, luego `currentAction.target`, y limpia ausentes tras el paso a `running`.
- 2026-09-30: F3 se repitió independientemente sobre `17864e8` y obtuvo `PASS` estático. El Verifier no encontró otra refutación en blocker/actor/challenger/target offline, drenaje multi-socket, retorno de `resume()` ni terminalidad. El informe aclara que no hubo pruebas, build o runtime. Siguiente dueño: Orquestador para revisión del diff y PR.
