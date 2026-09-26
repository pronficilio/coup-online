# Issue #14 — contrato F0 de observación y decisiones

**Estado de unidad:** `WAITING_USER`.
**Estado F0:** `BLOCKED` por tres decisiones no aprobadas; el checkpoint PHASE queda después de resolverlas.
**F1:** `PENDING`; no iniciar hasta las decisiones pendientes y revisión PHASE independiente.
**Base inspeccionada:** `origin/master` `64593af5cff7ff80863c3fc175067eb49fc4b5ad`; branch `issue/14-codex-ai-players`.

## Contrato mínimo

El servidor mantiene la identidad del asiento, estado, turno, fase, ventana, mano, mazo, costos y resultados. Cliente y modelo solo eligen una opción preparada por el servidor; no envían una acción ejecutable, identidad, costo, objetivo o carta arbitrarios.

La observación de cada asiento contiene el estado público (asientos, nombres, monedas, cartas reveladas, jugadores activos, turno/fase y sucesos públicos), su propia mano oculta, datos privados de su decisión (como las cartas recibidas al intercambiar) y sus opciones válidas. Excluye manos ocultas ajenas, estado/orden del mazo, IDs de socket, secretos de invitación/admin, texto libre y razonamiento del modelo. `g-updatePlayers` no puede ser proyección pública mientras incluya influencias de todos; F1 debe separar estado público y mano propia por socket.

La respuesta es `{ decisionId, stateVersion, choiceId }`: ID único por decisión/ventana, versión monotónica que cambia con estado/fase, y opción creada por el servidor. El servidor deriva asiento de la sesión/socket asociado, no de `source`, `playerName`, `challenger` ni campos similares. Respuestas fuera de fase, repetidas con otra opción, de otra ventana o con versión vieja no tienen efecto; una repetición exacta es idempotente. El servidor valida y aplica una sola vez costos, acción, destino, pérdidas, intercambio y avance.

Para prompts individuales solo el asiento decisor recibe opciones/mano privada. En ventanas, cada asiento activo con derecho recibe su propio `challenge|pass` o `block|pass`. Las reglas consultadas permiten desafiar a cualquier reclamante desde los demás asientos; cualquiera puede bloquear Foreign Aid; solo el objetivo bloquea Assassinate o Steal; pérdidas de influencia las elige quien las sufre. Los efectos y costos siguen el resumen de reglas, nunca el payload.

## Matriz evento × actor × información/acción

| Evento | Actor autorizado | Información/acción permitida; control del servidor |
|---|---|---|
| `setName` | Socket que reclama asiento libre | Nombre de presentación; validar y ligar asiento. El nombre no autentica ni recupera asiento. |
| `setReady` | Socket de ese asiento, antes de iniciar | Cambia su propia disponibilidad; roster público sin IDs de socket. |
| `startGameSignal` | Anfitrión autenticado | Solicita inicio; servidor valida/construye roster desde asientos conectados, ignora roster cliente. |
| `disconnect` | Transporte del asiento | Notifica y pausa la decisión afectada; no elige, elimina influencia ni avanza turno. Reanudar exige reautenticar ese asiento. |
| `g-playAgain` | Anfitrión autenticado, tras game over | Solicita reinicio; servidor crea nuevo estado/mazo. Permiso concreto depende de la identidad pendiente. |
| `g-deductCoins` | Nadie como comando independiente | Cliente/modelo no cambia monedas. El costo se deriva de la acción legal y se aplica atómicamente en servidor. |
| `g-actionDecision` | Asiento cuyo turno está activo | Selecciona opción legal (acción/objetivo); servidor impone coup con 10+, costo, turno y objetivo vivo. |
| `g-challengeDecision` | Cada jugador activo distinto del autor del reclamo | `challenge|pass`; una respuesta por asiento. El servidor cierra/resuelve según política determinista pendiente. |
| `g-blockDecision` | Cualquiera para Foreign Aid; objetivo para Assassinate/Steal | `block|pass` solo donde las reglas lo permiten; servidor valida reclamo/personaje. |
| `g-blockChallengeDecision` | Cada jugador activo distinto del autor del bloqueo | `challenge|pass` contra el reclamo de bloqueo. |
| `g-revealDecision` | Asiento cuyo reclamo se desafía | Elige probar un reclamo posible con su propia mano o no probarlo; servidor revela/resuelve la carta. |
| `g-chooseInfluenceDecision` | Asiento que pierde influencia | Elige una influencia propia; servidor resuelve revelación, eliminación y turno. Cada pérdida es una decisión separada. |
| `g-chooseExchangeDecision` | Asiento que reclamó Exchange | Elige qué cartas propias/con Court conserva o devuelve; servidor valida cantidades y actualiza mazo/mano. |
| `partyUpdate`, `g-updatePlayers`, `g-updateCurrentPlayer`, `g-addLog`, `g-gameOver` | Servidor → lobby/sala | Roster mínimo, proyección pública, turno, sucesos públicos y ganador; nunca manos ocultas, mazo ni socket IDs. |
| `g-chooseAction`, `g-openChallenge`, `g-openBlock`, `g-openBlockChallenge` | Servidor → asientos elegibles | Prompt/opciones solo para actores habilitados y contexto público necesario. |
| `g-chooseReveal`, `g-chooseInfluence`, `g-openExchange` | Servidor → asiento decisor | Prompt y solo su mano/draws privados necesarios. |
| `g-closeChallenge`, `g-closeBlock`, `g-closeBlockChallenge` | Servidor → sala | Señal de cierre sin secretos; todo response posterior queda obsoleto. |
| `partyUpdate`, `joinSuccess`, `leader` | Servidor → lobby | Estado/nombre de lobby; ID efímero no es credencial y permiso de líder se valida en servidor. |

Los nombres describen la interfaz observada. F1 puede sustituir eventos/payloads para cumplir este contrato sin cambiar las reglas.

## Ventanas, timeout, desconexión y kill switch

**Propuesta no aprobada:** el orden Socket.IO/latencia Codex no debe decidir quién desafía o bloquea; el servidor abre una ventana con ID/versión y deadline común, reúne una respuesta por asiento y aplica prioridad determinista basada en el orden de asientos. Las reglas no fijan el desempate ni qué hacer con múltiples challenges/blocks simultáneos. El usuario/Orquestador debe aprobar la prioridad y resolución; no se implementará como regla aprobada sin respuesta.

Al vencer una decisión/ventana, faltar un actor requerido, desconectarse un proceso o agotarse tiempo/cuota, la partida se pausa con causa visible. El silencio no se convierte en `pass`, acción automática, pérdida o avance sin regla aprobada. Se rechazan respuestas tardías. Reanudar requiere acción autorizada explícita y decisión con ID/versión nuevos. Una desconexión humana también pausa; el método para reautenticar/reclamar asiento está pendiente.

Codex inicia deshabilitado, incluso tras reinicio. Apagarlo cierra primero nuevas invocaciones, intenta terminar procesos activos, invalida sus IDs/versiones y pausa las partidas afectadas aunque no pueda matar un proceso. Rehabilitar solo permite nuevas invocaciones; no reanuda partidas ni reproduce salidas. El propietario solicita explícitamente una decisión nueva.

Una invitación del propietario permite acceso a partidas IA y nunca autoriza límites/admin/kill switch. La autorización administrativa se valida por separado en servidor para cada cambio; ningún booleano del cliente concede permiso. Invitación/admin no se incluyen en observación ni logs.

## Evidencia y decisiones elevadas

Verificado estáticamente en el worktree: `server/index.js` acepta `startGameSignal` y el roster del cliente sin comprobar líder; `server/game/coup.js` recibe actor/acción/costo del payload, cuenta votos con un contador compartido, cierra al primer desafío y difunde `g-updatePlayers`; `server/game/utils.js` conserva `influences` al exportar jugadores. El reporte/veredicto de #3 confirma la difusión de manos y la falta de asociación actor/socket. `disconnect` solicita recrear la partida y el líder borra la namespace; no hay reconexión definida. No se cambió código.

Decisiones pendientes de usuario/Orquestador; las propuestas no están aprobadas:

1. **Desempate:** aprobar una prioridad determinista y el tratamiento de múltiples challenges/blocks concurrentes; las reglas no especifican el empate.
2. **Identidad:** elegir mecanismo para identidad de propietario/admin, emisión/revocación de invitaciones y reconexión. La base inspeccionada solo tiene nombres elegidos por cliente e IDs efímeros de socket.
3. **Fuente de reglas:** confirmar si `docs/coup_llm_summary.md` es normativa y debe versionarse en la base de la issue. Se leyó desde el checkout raíz compartido, pero no existe en este worktree ni en `origin/master`; no se copió. Esa fuente dice que en partidas de dos jugadores quien empieza recibe una moneda y empieza el ganador anterior; el motor inspeccionado reparte dos monedas y empieza por índice 0 (revancha aleatoria).

Validación: lectura estática del contrato, reglas, reportes y eventos. No se escribieron/ejecutaron pruebas, no se inició Codex ni llamada de juego, y no se comprobó comportamiento en vivo. F0 sigue `BLOCKED`; el checkpoint PHASE y F1 esperan las tres respuestas pendientes. La unidad queda `WAITING_USER`.
