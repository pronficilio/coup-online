# Reporte F1 — resaltado de turno y respuestas pendientes (#43)

**Estado:** `CLOSED (PASS)`; Verifier FINAL independiente.
**Issue:** [#43](https://github.com/pronficilio/coup-online/issues/43) (`CLOSED`).
**Integración:** [PR #57](https://github.com/pronficilio/coup-online/pull/57), merge commit `4731563a3678bfd23bac5f46c13ad763bd1484d1`.
**Branch / worktree:** `issue/43-turn-vote-highlights` / `.worktrees/issue-43-turn-vote-highlights`.
**Base:** `origin/master@0fa8e7a33319013d0aed8435403a5e8dad35e44a`, que incluye #40 por PR #54.
**Commit de implementación revisado:** `3406e10fb18ec9d15a85f069c98dd9df4ffc8b4a`.

## Validación visual del propietario

El propietario revisó el preview local de esta rama en una mesa de 3 y otra de 4 jugadores, y confirmó que el resaltado se comporta como esperaba. Esta comprobación visual complementa el recorrido estático del Verifier.

## Cambio

- `server/game/coup.js` deriva `pendingDecisionSeats` de `activeDecision.allowed` menos `activeDecision.responses`, ignorando asientos eliminados. Los snapshots `g-updatePlayers` incluyen únicamente los índices públicos de los asientos pendientes; no incluyen tipo/ID de decisión, opciones, choice IDs, claves de actor ni socket IDs.
- La misma proyección llega a jugadores humanos y espectadores. Incluye asientos Codex porque el cálculo recorre `allowed` sin filtrar por controlador. La ruta ya usada para determinar propietarios humanos de pausa permanece sin cambios.
- Se emite un snapshot al activar cada decisión, tras aceptar una respuesta que no cierra la ventana y al cerrar la última respuesta antes de resolverla. Pausa, disolución y reanudación ya llaman a `updatePlayers`, por lo que anulan o restauran los pendientes desde el estado canónico.
- `Coup.js` conserva los índices recibidos en estado del cliente y los pasa a `PlayerBoard`. `PlayerBoard--current` sigue al jugador formal sin depender de que haya una ventana de respuesta; `PlayerBoard--pending` marca el nombre de cada asiento pendiente. La clase local `--respondable` y los controles siguen derivándose de la decisión/opciones locales.
- No se cambiaron elegibilidad, prioridad, orden de resolución ni reglas.

## Recorrido manual de transiciones (trazado de código)

1. `playTurn` activa la decisión de acción de A; `activateDecision` publica `[A]`. Todos resaltan las cartas y el nombre de A.
2. A envía su elección. Al cerrarse la decisión de acción, el snapshot vacía los pendientes; la ventana de desafío de B/C publica `[B,C]`. El turno formal continúa en A, sus cartas conservan el resaltado y su nombre queda apagado.
3. B responde primero; `submitChoice` publica `[C]`, recibido por todos los clientes. C conserva el nombre resaltado.
4. C responde; `closeDecision` publica `[]` antes de ejecutar la resolución. La resolución y el siguiente `playTurn` actualizan el jugador formal y publican el nuevo asiento que debe actuar.
5. En una ventana con un solo respondiente, el snapshot inicial contiene su asiento y el cierre publica `[]`. Si Codex responde, usa el mismo `submitChoice` sin socket ID y produce la misma actualización pública; si A sigue elegible en `block_challenge`, su asiento aparece porque se deriva de `allowed`, no del turno formal.
6. Pausa o disolución borran `activeDecision` antes de llamar a `updatePlayers`; una reanudación vuelve a publicar solo los asientos no respondidos.

El recorrido enumerado arriba fue inicialmente estático. Después, el propietario comprobó el comportamiento en el preview local con 3 y 4 jugadores.

## Validaciones

- `node --check server/game/coup.js`: pasó.
- `git diff --check`: pasó.
- `npm ci` en `coup-client`: terminó correctamente.
- `npm run build` en `coup-client`: `Compiled with warnings`; compilación de producción generada. Warnings fuera de los cambios de #43: imports no usados en `App.js`, `no-mixed-operators` en `Coup.js:463` y `postcss-calc` con unidades `dvh` en `ReferencePanel.css`.
- No se agregaron ni ejecutaron tests automatizados.
- Verifier FINAL: `PASS` en los criterios 1–5; reporte independiente: `docs/plans/turn-vote-highlights/report_issue_43_F1_verifier.md`.

## Falsificación y límites

La lista de pendientes procede del mapa de elegibilidad/respuestas vigente en el servidor, y cada respuesta/cierre produce un snapshot nuevo; por ello la UI no infiere pendientes desde el turno formal ni desde las opciones privadas del cliente. El Verifier FINAL intentó refutar respuestas fuera de orden, respuestas Codex, actor formal elegible en una decisión encadenada, asiento eliminado, cierre y limpieza durante pausa/disolución; emitió `PASS`. El Verifier hizo una revisión estática; además, el propietario confirmó la sincronía visual en mesas vivas con 3 y 4 jugadores.
