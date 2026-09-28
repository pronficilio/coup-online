# Reporte F2 — issue #46: disolución terminal y continuidad

- **Estado:** `CLOSED (PASS estático)`.
- **Branch / worktree:** `issue/46-paused-disconnect` / `.worktrees/issue-46-paused-disconnect`.
- **Verificación:** lectura del diff, `git diff --check`, JSON parse de traducciones ES/EN e inspección de emisores/consumidores. No se añadieron ni ejecutaron pruebas automatizadas ni se hizo recorrido dinámico.

## Evidencia por criterio

1. **Jugador vivo desconectado en pausa o ejecución: PASS estático.** `server/game/coup.js:209-228` filtra vivo/fase activa y `dissolve()` marca `phase = 'dissolved'`, incrementa versión y emite `g-gameDissolved`. Cliente `Coup.js:437-460` borra decisión y banderas de pausa y reemplaza la pantalla por un estado accesible «Partida disuelta» con nombre del jugador. No requiere reload.
2. **Invalidación de trabajo: PASS estático.** Antes del evento terminal se abortan Codex requests, se limpia timer, `activeDecision`, `pausedDecision` y `currentAction`; fase/version impiden submit/resume. Las rutas de `pause()` aceptan solo `running` (`coup.js:266`).
3. **Desconexión eliminada mientras corre: PASS estático.** `onDisconnect()` retorna ante `player.isDead`; `advanceTurn()` sigue omitiendo eliminados (`coup.js:209-213, 985-992`).
4. **Desconexión eliminada con pausa: PASS estático.** `onDisconnect()` no modifica `pausedDecision`; el guard de conectividad en `resume()` busca solo jugadores humanos vivos (`coup.js:530-540`). Ownership `resumeOwnerSeats` sigue intacto.
5. **Espectadores: PASS estático.** `publicEmit()` usa `gameSocket.emit`, por lo que el evento terminal llega a toda la namespace; espectadores montan el mismo `Coup` que consume el evento. ES/EN en `translations.json:237-238, 537-538`.
6. **Eventos tardíos/doble disolución: PASS estático.** `dissolve()` es idempotente por guard de fase (`coup.js:216-228`). `submitChoice`, `openDecision` y callbacks Codex requieren fase `running`; `resume()` requiere `paused`. El cliente ignora decisiones/pausas/resumes cuando está disuelto y evita que una victoria normal tardía sobreescriba el estado terminal (`Coup.js:325-327, 373-374, 400-401, 420-459`).
7. **Ciclo de namespace: PASS estático.** El lobby limpia solo cuando no hay sockets conectados; no hay limpieza inmediata en `dissolve()`, de modo que los conectados reciben el evento y ven su pantalla.
8. **Sin reconexión: PASS estático.** No se agregó ruta de asociación, reemplazo o transferencia de asiento.

## Revisión realizada

- `git diff --check`: sin errores.
- `translations.json`: JSON válido; claves y placeholder `playerName` presentes en ES/EN.
- Inspección de todos los listeners cliente de `g-gamePaused`, `g-gameResumed`, `g-gameOver` y `g-gameDissolved`, y rutas server-side de `pause`, `resume`, `onDisconnect`, `start`, timeout y Codex.
- No se declara verificación dinámica. Por política, no se ejecutaron pruebas automatizadas.

## Veredicto

`PASS` para avanzar a F3. El Verifier FINAL independiente debe intentar refutar la carrera disconnect/resume/timeout y la compatibilidad con el asiento muerto desconectado.
