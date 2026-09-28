# Reporte F1 — issue #46: contrato y rutas de terminación

- **Estado:** `CLOSED (PASS)`.
- **Branch / worktree:** `issue/46-paused-disconnect` / `.worktrees/issue-46-paused-disconnect`.
- **Método:** inspección estática de desconexión, pausa, resume, decisiones, listeners de Coup, lobby y limpieza de namespace. No se ejecutaron pruebas automatizadas ni recorrido dinámico.

## Hallazgos

| Fase | Estado del asiento | Código actual / resultado esperado |
|---|---|---|
| `running` | vivo | `onDisconnect()` llama a `pause()`; reemplazar por disolución terminal |
| `paused` | vivo | invalida `pausedDecision` y repite `g-gamePaused`; reemplazar por evento terminal |
| `running` | eliminado | actualmente pausa; ignorar para que `advanceTurn()` siga omitiendo `isDead` |
| `paused` | eliminado | actualmente invalida la decisión; ignorar y excluirlo de la validación de conectividad de `resume()` |
| `gameover` | cualquiera | `onDisconnect()` ya retorna; conservar ganador y revancha |
| cualquier fase | espectador | no tiene listener de jugador; emitirle el mismo evento terminal cuando siga conectado |

## Contrato y ciclo de vida

- `openLobby()` rechaza nuevas conexiones cuando `started` es verdadero.
- `CoupGame.start()` registra `disconnect` para sockets de jugadores humanos. Si alguien desapareció antes del registro, encuentra el asiento sin socket y actualmente pausa antes del primer turno; F2 debe terminar también ese arranque incompleto de forma terminal.
- La limpieza de `server/game/lobby.js` sondea cada 10 segundos y llama `cleanup()` solo cuando `gameSocket.sockets` no tiene sockets. No hay que invocar cleanup al disolver mientras los otros sockets esperan el evento terminal.
- `server/index.js` elimina la namespace y la referencia al juego en `cleanup()`. El evento terminal se transmite primero a la namespace; una pantalla terminal local permite que los clientes vean la razón, y el cleanup normal ocurrirá cuando todos salgan.
- `submitChoice()` requiere `phase === 'running'`; `resume()` requiere `phase === 'paused'`. Poner una fase terminal antes de emitir hace obsoletas respuestas y resumes tardíos. También se deben abortar Codex requests, borrar el timer y limpiar decisiones.
- `resume()` actualmente exige socket para todo asiento humano; F2 debe hacer esa comprobación solo para jugadores vivos. Se conserva la lista de `resumeOwnerSeats` y la política de #26.

## Decisión

Desconectar un jugador vivo en `running` o `paused` disuelve la partida. Desconectar un jugador eliminado no cambia el estado ni bloquea una reanudación válida. Una partida que ya llegó a `gameover` conserva su ganador. El aviso de disolución debe reemplazar la UI de juego/pausa para humanos y espectadores; no se forzará la desconexión antes de que el cliente lo pinte.

## Veredicto

`PASS`: el alcance y orden de eventos son ejecutables sin cambiar ownership de resume, sin reusar `g-gameOver` como victoria y sin interferir con la limpieza de namespace. F2 puede comenzar.
