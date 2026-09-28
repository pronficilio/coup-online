# Plan — disolución al desconectarse un jugador activo durante la pausa

## Estado vigente

- Issue: [#46](https://github.com/pronficilio/coup-online/issues/46), `OPEN`.
- Estado operativo: `WAITING_ORCHESTRATOR`; F1–F3 `CLOSED (PASS)`.
- Modo / riesgo / verificación: `FULL` / `HIGH` / `FINAL` independiente.
- Branch / worktree únicos: `issue/46-paused-disconnect` / `.worktrees/issue-46-paused-disconnect`.
- Destino: `master` de `pronficilio/coup-online`; PR [#48](https://github.com/pronficilio/coup-online/pull/48) abierta.
- Handoff activo: `docs/plans/active/issue_46_paused_disconnect.md`.
- Bitácora append-only: `docs/plans/log/issue-46.jsonl`.

## Solicitud y objetivo

El usuario reporta que, con tres jugadores, una partida pausada queda inutilizable cuando se desconecta quien estaba pendiente de responder: los demás siguen viendo «Partida en pausa» y tienen que recargar. Quiere una salida visible para la sala y conservar la continuidad cuando se desconecta alguien que ya perdió.

Definición operativa: la desconexión de cualquier participante vivo termina la partida de forma terminal y visible a quienes siguen conectados, tanto en `running` como en `paused`. La desconexión de un participante eliminado no cambia el juego ni invalida una pausa reanudable. No se reasignan asientos ni se transfiere identidad.

## Hechos y diagnóstico inicial

- `server/game/coup.js:onDisconnect()` pausa ante cualquier desconexión mientras no sea `gameover`; estando ya pausado, invalida `pausedDecision` y vuelve a emitir `g-gamePaused`.
- `resume()` rechaza si encuentra desconectado a cualquier humano, sin distinguir participantes vivos de eliminados.
- `Coup.js` recibe pausa, reanudación y `g-gameOver`, pero no tiene estado visual terminal por disolución.
- El lobby impide nuevos sockets después de comenzar. `server/index.js` y `server/game/lobby.js` limpian namespace cuando la sala queda vacía; hay que comprobar que esa ruta no se anticipe a la emisión terminal.
- No se identificó issue previa duplicada; #26 resolvió visibilidad/reanudación por timeout y está cerrada.

### F1 — veredicto `CLOSED (PASS)`

La namespace sigue viva mientras quede un socket conectado: `openLobby()` revisa cada 10 s y llama `cleanup()` únicamente si `gameSocket.sockets` está vacío. Por tanto, el servidor puede emitir un evento terminal al resto sin cerrar la namespace en esa misma transición. Al desconectarse el último socket, la limpieza existente quita namespace y juego.

| Fase al desconectar | Asiento | Resultado decidido |
|---|---|---|
| `running` | jugador vivo | transición a `dissolved`, invalidar trabajo pendiente y emitir evento terminal |
| `paused` | jugador vivo | misma transición terminal; no volver a emitir pausa ni ofrecer resume |
| `running` | jugador eliminado | ignorar disconnect; el loop actual ya omite asientos muertos |
| `paused` | jugador eliminado | conservar pausa/ownership; la comprobación de resume debe ignorar humanos muertos sin socket |
| `gameover` | cualquiera | conservar ganador y flujo de revancha normal |
| cualquier fase | espectador | no controla la partida; recibe estado terminal si sigue conectado |

La fase de servidor debe cambiar a terminal antes del broadcast. Esto hace que respuestas tardías fallen por la guardia de fase y que `resume()` falle porque requiere `paused`. El cliente puede reemplazar el tablero por un estado terminal traducido sin forzar `disconnect`; así la señal se ve antes de que la limpieza periódica elimine la namespace. Evidencia completa: `docs/plans/paused-disconnect/report_issue_46_F1.md`.

## Alcance

- Definir/implementar un único cierre coherente para la desconexión de jugador vivo en las fases `running` y `paused`.
- Comunicar el estado terminal a participantes conectados y espectadores; retirar capa/aviso de pausa, decisiones y controles obsoletos.
- Limpiar timers, decisiones y solicitudes Codex pendientes; coordinar la vida de la namespace con el evento terminal.
- Ignorar la desconexión de jugador ya eliminado y permitir que participantes restantes sigan, incluida una reanudación autorizada si la pausa sigue vigente.
- Inspeccionar la carrera entre desconexión, timeout, reanudación, evento terminal y limpieza de sala.

## Fuera de alcance

- Reconexión, reasignación de asiento, reemplazo de jugador o transferencia de líder/identidad.
- Cambiar la regla de autorización para reanudar decisiones pausadas.
- Rediseñar el flujo de revancha después de `gameover` normal.

## Criterios de aceptación

1. En una sala de tres, una desconexión de participante vivo durante pausa termina la partida para quienes siguen conectados con una señal clara de partida/sala disuelta; no queda el overlay «Partida en pausa» ni se exige recarga para salir del estado.
2. La desconexión de participante vivo mientras corre la partida usa el mismo resultado terminal coherente y no deja una pausa no reanudable.
3. La desconexión de jugador eliminado mientras corre la partida no pausa ni termina la partida.
4. La desconexión de jugador eliminado mientras otro jugador tiene una decisión pausada conserva `pausedDecision`; no bloquea la reanudación permitida por las reglas existentes.
5. Participantes y espectadores conectados reciben un estado terminal consistente. El cliente deja de mostrar decisiones, CTA de reanudar y estado de espera de pausa obsoletos.
6. La terminación invalida decisiones/versiones, timers y solicitudes Codex pendientes; una respuesta o reanudación tardía no puede reactivar la partida.
7. La sala limpia su namespace una vez que ya no quedan conexiones, sin quitar a los clientes la oportunidad de recibir/renderizar el estado terminal.
8. No se agrega reconexión ni reasignación de asiento. La revisión documenta matriz `running`/`paused`/`gameover` × vivo/eliminado × humano/espectador y distingue inspección estática de cobertura dinámica.

## Fases

### F1 — cerrar contrato y reconstruir rutas de terminación

- Pregunta: ¿qué estado y ciclo de vida de namespace hacen falta para terminar una partida visible sin interrumpir el flujo de desconexión de eliminados?
- Entrada: issue #46, `CoupGame.onDisconnect`, `resume`, `pause`, listeners de `Coup.js`, limpieza lobby/namespace.
- Salida: matriz de estados/eventos y ruta terminal elegida, actualizadas en este plan.
- Avance: cubre desconexión repetida/tardía, jugador muerto, espectadores y carrera con resume/timeout.
- Pivote: si la infraestructura no puede enviar el evento antes de limpiar la namespace, definir primero el orden mínimo seguro.
- Repetición acotada: una relectura de todos los emisores/consumidores de la señal terminal.
- Bloqueo: contradicción con el contrato de socket o ausencia de una salida de cliente alcanzable; informar al Orquestador.
- Artefactos: este plan y reporte F1.
- Política: `COMMIT_REQUIRED`; `docs/plans/paused-disconnect/report_issue_46_F1.md` y plan actualizado juntos.
- Validación: inspección estática; no añadir ni ejecutar tests automatizados.

### F2 — implementar terminación visible y continuidad de eliminados

- Estado: `CLOSED (PASS)`.
- Pregunta: ¿el estado terminal disuelve partidas con jugador vivo desconectado y deja continuar partidas si se desconecta un eliminado?
- Entrada: contrato aprobado en F1.
- Salida: manejador server-side terminal, proyección/evento cliente localizado y limpieza coordinada; reporte F2.
- Avance: criterios 1–7 implementados sin cambiar ownership de pausa ni introducir reconexión.
- Pivote: si reutilizar `g-gameOver` confunde ganador real con partida abandonada, añadir un evento/estado terminal explícito y su copy bilingüe.
- Repetición acotada: una corrección acotada ante hallazgo en revisión estática.
- Bloqueo: interacción no resoluble con ciclo de vida de namespace o contrato existente; documentar evidencia y esperar Orquestador.
- Artefactos: código server/client, traducciones si hacen falta, reporte F2 y plan.
- Política: `COMMIT_REQUIRED`; `fix(paused-disconnect): issue 46 F2 CLOSED advance_f3`.
- Validación: inspección estática/diff; no añadir ni ejecutar tests automatizados.

**Veredicto F2:** `PASS` estático. `onDisconnect()` ignora asientos eliminados y disuelve con jugador vivo; `dissolve()` pone fase terminal antes de invalidar trabajos y difundir `g-gameDissolved`; `resume()` solo bloquea por jugadores vivos desconectados; el cliente terminal limpia overlay/decisiones y muestra copy ES/EN también al espectador, que comparte `Coup`. Evidencia: `docs/plans/paused-disconnect/report_issue_46_F2.md`. No se ejecutaron pruebas ni recorrido dinámico.

### F3 — revisión independiente final

- Estado: `CLOSED (PASS)` por Verifier FINAL independiente.
- Pregunta: ¿puede una desconexión de jugador muerto bloquear o una carrera tardía resucitar la partida, y quedan todos informados al disolver?
- Entrada: commit F2 y diff completo de #46.
- Salida: reporte FINAL independiente que intenta refutar los criterios 1–8.
- Avance: Verifier emite `PASS` con evidencia o se devuelve a F2 con contraejemplo concreto.
- Pivote: reporte `BLOCKED` si requiere runtime inaccesible; separar cobertura faltante de revisión estática y no afirmar pruebas dinámicas.
- Repetición acotada: una ronda de corrección y relectura del hallazgo.
- Bloqueo: un fallo concurrente no corregible en una ronda; `WAITING_ORCHESTRATOR` con pasos reproducibles.
- Artefactos: reporte F3 y actualización de plan/bitácora.
- Política: `COMMIT_REQUIRED`; `fix(paused-disconnect): issue 46 F3 CLOSED advance_review`.
- Validación: revisión de diff independiente; no añadir ni ejecutar tests automatizados.

**Veredicto F3:** `PASS` estático sobre commit `b67d7c242fefc66050840c3a45ed045f3f7afe23`. El Verifier no encontró intercalaciones que resuciten o atasquen la partida, confirmó el tratamiento de muertos/desconectados, Codex tardío, prioridad de `gameover`, emisión a espectadores y copy bilingüe. No se ejecutaron pruebas ni build. Reporte: `docs/plans/paused-disconnect/report_issue_46_F3.md`.

**Entrega:** PR #48 está `OPEN` hacia `master`; unidad `WAITING_ORCHESTRATOR`, siguiente dueño Orquestador. No se integró ni cerró.

## Supuestos, preguntas y riesgos

- Supuesto conservador: una sala con un humano vivo desconectado no puede continuar de forma justa y tampoco puede recuperar su identidad; por tanto se termina toda la partida, no solo el overlay.
- Los participantes muertos pueden estar desconectados sin impedir la partida; su proyección puede permanecer como asiento histórico.
- Riesgo alto: evento final, cambio de fase y limpieza pueden competir con respuestas de decisión/timers. El server debe volver terminal primero e invalidar operaciones tardías.
- El juego puede llegar a `gameover` normal antes de procesar una desconexión. El plan no debe sobreescribir un ganador ya declarado.
- No se ejecutarán pruebas automatizadas ni se declarará cobertura dinámica no observada.

## Pregunta de falsificación FINAL

¿Existe una intercalación alcanzable entre disconnect, timeout, `g-resume`, respuesta Codex o respuesta humana que deje vivos a los conectados en un overlay eterno, bloquee reanudación tras desconectarse un eliminado, o reactive una partida ya disuelta?

## Historial de decisiones

- 2026-09-28: se elige estado terminal visible para jugador vivo desconectado en ambas fases activas; desconexión de eliminado se ignora, incluso durante pausa. No se requiere recargar ni se crea mecanismo de reconexión.
