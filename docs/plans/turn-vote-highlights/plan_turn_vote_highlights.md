# Plan — Resaltado del turno y de las respuestas pendientes (#43)

**Estado:** `WAITING_ORCHESTRATOR`; F1 `BLOCKED`; issue `OPEN`.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/43
**Handoff:** `docs/plans/active/issue_43_turn_vote_highlights.md`
**Bitácora:** `docs/plans/log/issue-43.jsonl` (append-only).
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
**Branch / worktree:** `issue/43-turn-vote-highlights` / `.worktrees/issue-43-turn-vote-highlights`.
**Base / destino:** `origin/master` vigente al reclamar / `master` de `pronficilio/coup-online`.
**Integración:** una PR para el issue; todavía no existe.

## Estado operativo al reclamar

- Claim visible publicado en [issue #43](https://github.com/pronficilio/coup-online/issues/43#issuecomment-5866556131); worktree confirmado en `.worktrees/issue-43-turn-vote-highlights`, branch `issue/43-turn-vote-highlights`, base `origin/master` (`f900c0947a0b27ac9c6e0372e3c1871a883be7e6`).
- F1 queda `BLOCKED` antes de editar producto: el worktree de #40 está en F2, cuatro commits adelante de `origin/master`, y tiene cambios staged/unstaged en `coup-client/src/components/game/Coup.js`, requerido para recibir y propagar el estado de pendientes. El diff observado de #40 ya cambia la integración del registro y el listener de logs en ese mismo componente.
- Para reanudar hace falta que el Orquestador secuencie #40 y #43, o acuerde explícitamente un contrato/punto de integración que permita cambios sin pisar F2. #44 F1 es solo lectura y no bloquea hoy; no hay branch/worktree local de #44 ni #45.
- No se modificó producto ni se ejecutaron pruebas automatizadas.

## Solicitud y definición de éxito

Separar dos señales simultáneas del tablero: qué jugador conserva el turno formal y qué jugadores siguen teniendo una respuesta pendiente. Durante la acción de A y la posterior ventana de voto, todos mantienen resaltadas las cartas de A. Los nombres de todos los asientos que aún deben responder se resaltan en vivo para toda la mesa y pierden ese estado al responder o al cerrarse la ventana.

## Hechos y coordinación

- `PlayerBoard.js` actualmente aplica `PlayerBoardSeat--current` solo cuando `!responseWindowOpen`; `--respondable` depende del observador local y de `responseAvailable`.
- `server/game/coup.js` conserva `activeDecision.allowed` y `activeDecision.responses`; `unansweredHumanSeats()` calcula solo los asientos humanos pendientes para su uso actual, pero la proyección pública de `updatePlayers()` no envía un estado de pendiente. El indicador de tablero debe cubrir cualquier asiento participante elegible aún sin respuesta, incluido Codex, no solo humanos.
- La issue #28 documentó el resaltado local cuando el observador tiene una opción. #43 amplía ese comportamiento para que todos vean todos los participantes pendientes y conserva el resaltado formal de cartas durante la votación.
- La issue #40 está abierta y trabaja en `server/game/coup.js` y `Coup.js`. Al reclamar, releer su tracker/worktree y coordinar el solapamiento; no integrar ni editar esas superficies en paralelo sin secuenciación explícita.
- La issue #44 acaba de abrirse para auditar y reubicar opciones de decisión; su F1 es de solo lectura, pero su F2 puede tocar `PlayerBoard.js`/`Coup.js`. Secuenciar esos cambios después de revisar el estado actual de #43 y evitar ediciones concurrentes.
- El checkout raíz ya contiene cambios locales de documentación para #42. No descartarlos, copiarlos selectivamente al branch #43 ni incluirlos en la integración de este issue.

## Alcance y criterios de aceptación

Incluye la publicación de estado público mínimo para asientos humanos pendientes, la actualización en vivo al abrir/cambiar/cerrar una decisión y su representación separada en `PlayerBoard`.

1. Durante la selección de acción se resaltan las cartas y el nombre de A. Al enviar su acción, se apaga el resaltado de su nombre porque ya no debe decidir; sus cartas permanecen resaltadas como turno formal hasta que el turno avance.
2. Todos los clientes participantes reciben el conjunto actual de asientos que todavía deben responder, incluidos asientos Codex si tienen una decisión en curso. Cada nombre pendiente se resalta para todos; tras responder un asiento deja de aparecer como pendiente y los demás continúan resaltados.
3. La decisión y controles locales siguen habilitados solo para quien tiene una opción disponible. Espectadores, jugadores eliminados y jugadores fuera de la decisión no se indican como pendientes.
4. Al terminar o invalidarse la decisión, no quedan nombres pendientes y las cartas siguen el jugador formal actualizado. Se cubren respuestas escalonadas, un solo respondiente y el cierre por una respuesta que resuelve la ventana.
5. Reglas, elegibilidad, prioridad y resolución de decisiones no cambian. No se exponen identificadores de socket, opciones privadas ni estado distinto al indicador de pendientes necesario.

## F1 — Separar turno formal y respuestas pendientes (`BLOCKED`)

**Pregunta única:** ¿todos los clientes distinguen correctamente el turno formal de cada respuesta todavía pendiente, durante cada transición de una ventana de decisión?

- Inspeccionar el estado más reciente del servidor/cliente y coordinar el solapamiento vigente de #40 antes de editar.
- Elegir y documentar la proyección pública mínima y sus eventos/instantáneas, incluyendo respuestas aceptadas y cierre de decisión.
- Implementar el indicador público de asientos pendientes y representarlo de forma independiente de la clase de turno formal y del indicador local de controles disponibles.
- **Salida/evidencia:** diff, recorrido A/B/C con respuesta escalonada y caso de un único respondiente; validación del cliente/servidor pertinente y resultado de la pregunta de falsificación.
- **Avanzar:** criterios 1–5 satisfechos sin cambios a reglas ni filtración de estado privado.
- **Pivotar:** mantener el contrato visible intacto y ajustar el transporte/derivación si una instantánea o emisión incremental deja estado obsoleto.
- **Bloquear:** si la integración de #40 impide una edición segura concurrente, registrar la dependencia y esperar su sincronización; no crear una segunda integración.
- **Commit:** `COMMIT_REQUIRED`; cierre previsto `feat(turn-vote-highlights): issue 43 F1 CLOSED ready_review`.
- **Verifier independiente:** `FINAL`; intentar refutar los indicadores en respuestas fuera de orden, ventana cerrada y asiento no elegible.

## Verificación y falsificación

Recorrer A, B y C: turno de A resalta sus cartas/nombre; al declarar, el nombre de A deja de brillar, sus cartas siguen resaltadas, y los nombres de B/C indican pendiente en todas las pantallas; tras responder B solo C sigue pendiente; al responder C se cierra la ventana; al avanzar, el nuevo turno recibe el resaltado de cartas/nombre. Incluir ventana con un solo respondiente y confirmar que observador/jugador eliminado no queda marcado. Verificar que las actualizaciones concurrentes y la instantánea tras cierre no revivan un asiento pendiente.

**Pregunta adversarial:** ¿puede un cliente mostrar cartas del actor sin resaltar durante una votación, ocultar un respondiente ajeno, o conservar como pendiente a alguien que ya votó/cuya decisión se cerró?

## Operación

El claim de #43 y el worktree aislado ya están confirmados desde `origin/master`. F1 no puede comenzar hasta secuenciar la superficie compartida con #40. Una sola PR hacia `master`. No trabajar en la rama base. El Verifier es independiente del implementador y opera al final. No agregar ni ejecutar tests automatizados salvo que el handoff/proyecto los exija; aquí se pide recorrido manual más las validaciones mínimas apropiadas al cambio.
