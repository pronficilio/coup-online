# Issue #26 — reporte F1: causas de pausa y permisos

- **Pregunta:** ¿cada causa de `g-gamePaused` comunica coherentemente si se puede reanudar y quién está autorizado?
- **Base inspeccionada:** `origin/master` `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`.
- **Worktree:** `.worktrees/issue-26-paused-game-overlay`; branch `issue/26-paused-game-overlay`.
- **Método:** lectura estática de todas las llamadas a `pause()`, las emisiones directas de `g-gamePaused`, el handler `g-resume` y sus listeners/presentación en el cliente. No se ejecutaron tests.
- **Resultado:** F1 `CLOSED`; avanzar a F2. El timeout normal mantiene una ruta recuperable; no hace falta cambiar el servidor ni su contrato de permisos.

## Matriz de pausas

| Ruta y causa | `canResume` | Actor autorizado | Consecuencia visible actual |
| --- | --- | --- | --- |
| `start()`, persona desconectada antes de iniciar (`server/game/coup.js:90-94`) | `false` por omisión | Nadie; hay que recrear la partida | La causa se localiza como desconexión previa al inicio. |
| Desconexión mientras la partida corre (`:207-219`) | `false` por omisión | Nadie; hay que recrear la partida | La causa identifica a quien se desconectó. |
| Timeout de cualquier decisión activa (`:363-367`) | `true` si sigue activa la decisión: esta es la única llamada que pasa `{ recoverable: true }` | Solo `leaderSocketID`; además todos los asientos humanos deben seguir conectados | La causa se localiza como timeout y el líder actual recibe el único CTA. |
| Codex ausente/deshabilitado (`:427-430`, `:467-471`), decisión inválida/obsoleta (`:445-448`), opción no disponible (`:449-455`) o error de solicitud (`:456-464`) | `false` por omisión | Nadie | La pausa informa del problema de Codex; no debe ofrecer reanudar una decisión inválida. |
| Acción, reclamación, pérdida de influencia o intercambio sin respuesta en la resolución (`:574-577`, `:789-792`, `:842-846`, `:924-927`) | `false` por omisión | Nadie | Son salvaguardas de resolución sin decisión recuperable; no son el timeout normal de `openDecision`. |
| Influencia cambió durante la decisión de pérdida (`:844-847`) | `false` por omisión | Nadie | Estado inconsistente; no hay una decisión segura que restaurar. |
| No queda jugador activo (`:945-949`) | `false` por omisión | Nadie | La partida queda pausada con causa genérica/no activa; no existe una decisión que reanudar. |
| Un asiento se desconecta mientras ya estaba pausada (`onDisconnect`, `:207-216`) | Emisión directa `g-gamePaused` con `false`; se invalida `pausedDecision` | Nadie | Todos reciben la nueva causa de desconexión y el estado deja de ser recuperable. |
| El líder intenta reanudar después de desconectarse alguien (`resume`, `:487-499`) | Emisión directa `g-gamePaused` con `false`; se invalida `pausedDecision` y se rechaza el intento | Nadie | El servidor envía el rechazo al solicitante y difunde la pausa no recuperable. |

Todas las demás llamadas a `pause()` pasan por el valor predeterminado `recoverable = false` (`server/game/coup.js:221-243`). `g-gamePaused` se emite en los tres puntos identificados: pausa común (`:237-242`), desconexión durante una pausa (`:214`) y reanudación rechazada por desconexión (`:493-498`).

## Contrato de reanudación confirmado

- El handler `g-resume` se registra para los sockets del juego al iniciar (`server/game/coup.js:74-87`). El permiso se valida en el servidor; no depende del botón del cliente.
- Solo el socket líder (`leaderSocketID`) puede reanudar. El servidor requiere fase pausada, payload vacío, una `pausedDecision` conservada y presencia de todos los asientos humanos (`:474-500`).
- La reanudación vuelve a activar las mismas opciones con una identidad/versión nuevas y luego emite `g-gameResumed` (`:501-507`). El contrato coincide con F0 de #14 (`docs/plans/codex-ai-players/f0_contract.md:43-49`). Una respuesta de la versión anterior ya no corresponde a la decisión activa.
- Al faltar conectividad, el servidor rechaza la acción, elimina la decisión conservada y actualiza a todos a pausa no recuperable. La interfaz no debe sugerir que el líder puede recuperar ese estado.

## Estado visible actual y hallazgos para F2

- El cliente recibe `g-gamePaused`, borra la decisión y conserva causa/`canResume`; `g-gameResumed` limpia la pausa (`coup-client/src/components/game/Coup.js:228-235`).
- El aviso actual vive dentro de `DecisionsSection`, no cubre tablero/ventana; el líder ve un botón si `canResume` es verdadero (`:316-324`). Los demás no reciben una indicación de que esperan al líder.
- El botón puede emitir `g-resume` en cada clic mientras sigue disponible (`:261-263`). F2 debe impedir emisiones duplicadas mientras espera.
- Un `g-decisionRejected` se guarda como `decisionError`, pero se renderiza solo dentro del bloque que requiere una decisión (`:224-227`, `:325-340`). `g-gamePaused` deja la decisión en `null`, de modo que un rechazo al reanudar no se ve. F2 debe mantener la pausa visible y mostrar el rechazo en el overlay.
- El listener de `g-decision` también limpia `pausedCause` (`:207-213`). Al reactivar, el servidor emite el nuevo `g-decision` antes de `g-gameResumed`; F2 debe conservar la capa hasta recibir `g-gameResumed`, según los criterios de aceptación.
- El diccionario bilingüe ya localiza la causa y el botón (`coup-client/src/i18n/translations.json:231-232,274-299,540-541,584-608`). Los mensajes nuevos de líder en espera, reconexión/rechazo y espera de reanudación deben añadirse en ambos idiomas con paridad de claves/parámetros.

## Conclusión sobre el caso reportado

Una decisión que vence por falta de respuesta activa el timeout común, conserva esa decisión y anuncia `canResume: true`. El líder puede pedir que se vuelva a presentar si nadie perdió la conexión. Por tanto, el timeout normal no está marcado como irrecuperable. Esta inspección estática no identifica qué causa concreta pausó una sesión reportada; F2 mejorará la señalización sin afirmar que toda pausa, incluidas desconexiones y fallos internos, admite reanudación.

**Veredicto F1:** `CLOSED`, `advance_f2`. No se requiere reorquestación del contrato del servidor.
