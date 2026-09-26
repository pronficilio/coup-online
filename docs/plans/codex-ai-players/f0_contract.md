# Issue #14 — contrato F0 de observación y decisiones

**Estado de unidad:** `ACTIVE`.
**Estado F0:** `CLOSED`; revisión PHASE independiente `PASS` en `b189cc0`.
**F1:** `RETURNED` tras PHASE `FAIL`; corregir dos discrepancias de reglas documentadas en `docs/plans/active/verifier_issue_14_F1.md`.
**Base inspeccionada:** `origin/master` `64593af5cff7ff80863c3fc175067eb49fc4b5ad`; branch `issue/14-codex-ai-players`.

## Contrato mínimo

Se conserva el acceso, lobby, nombres y conexión efímera por socket actuales: no se agregan cuentas, login, invitaciones ni recuperación persistente de identidad. Dentro de una partida el servidor asocia cada socket conectado a su asiento y deriva de ahí el actor; eso es validación de turno, no una capa de autenticación. El servidor mantiene estado, fase, ventana, mano, mazo, costos y resultados. Cliente y modelo solo eligen una opción preparada por el servidor; no envían acción ejecutable, actor, costo, objetivo o carta arbitrarios.

La observación de cada asiento contiene el estado público (asientos, nombres, monedas, cartas reveladas, jugadores activos, turno/fase y sucesos públicos), su propia mano oculta, datos privados de su decisión (como las cartas recibidas al intercambiar) y sus opciones válidas. Excluye manos ocultas ajenas, estado/orden del mazo, IDs de socket, credenciales operativas, texto libre y razonamiento del modelo. `g-updatePlayers` no puede ser proyección pública mientras incluya influencias de todos; F1 debe separar estado público y mano propia por socket.

La respuesta es `{ decisionId, stateVersion, choiceId }`: ID único por decisión/ventana, versión monotónica que cambia con estado/fase, y opción creada por el servidor. El servidor deriva asiento de la sesión/socket asociado, no de `source`, `playerName`, `challenger` ni campos similares. Respuestas fuera de fase, repetidas con otra opción, de otra ventana o con versión vieja no tienen efecto; una repetición exacta es idempotente. El servidor valida y aplica una sola vez costos, acción, destino, pérdidas, intercambio y avance.

Para prompts individuales solo el asiento decisor recibe opciones/mano privada. En ventanas, cada asiento activo con derecho recibe su propio `challenge|pass` o `block|pass`. Las reglas consultadas permiten desafiar a cualquier reclamante desde los demás asientos; cualquiera puede bloquear Foreign Aid; solo el objetivo bloquea Assassinate o Steal; pérdidas de influencia las elige quien las sufre. Los efectos y costos siguen el resumen de reglas, nunca el payload.

## Matriz evento × actor × información/acción

| Evento | Actor autorizado | Información/acción permitida; control del servidor |
|---|---|---|
| `setName` | Socket que reclama asiento libre | Nombre de presentación; validar y ligar asiento. El nombre no autentica ni recupera asiento. |
| `setReady` | Socket de ese asiento, antes de iniciar | Cambia su propia disponibilidad; roster público sin IDs de socket. |
| `startGameSignal` | Socket líder del lobby actual | Solicita inicio; servidor valida/construye roster desde asientos conectados, ignora roster cliente. No hay login. |
| `disconnect` | Transporte del asiento | Conserva el comportamiento actual del lobby; una respuesta pendiente de ese socket no se inventa ni aplica como acción. No se agrega recuperación de identidad. |
| `g-playAgain` | Socket líder actual, tras game over | Solicita reinicio; servidor crea nuevo estado/mazo. El servidor valida el rol actual del socket, sin login. |
| `g-deductCoins` | Nadie como comando independiente | Cliente/modelo no cambia monedas. El costo se deriva de la acción legal y se aplica atómicamente en servidor. |
| `g-actionDecision` | Asiento cuyo turno está activo | Selecciona opción legal (acción/objetivo); servidor impone coup con 10+, costo, turno y objetivo vivo. |
| `g-challengeDecision` | Socket de cada jugador activo distinto del autor del reclamo | `challenge|pass`; una respuesta por asiento. Si varios desafían el mismo reclamo en la ventana común, solo se resuelve el primero según el orden fijo de asientos aprobado. |
| `g-blockDecision` | Cualquiera para Foreign Aid; objetivo para Assassinate/Steal | `block|pass` solo donde las reglas lo permiten; servidor valida reclamo/personaje. Si más de un asiento declara un bloqueo válido en la ventana común, solo se resuelve el primero según el orden fijo aprobado. |
| `g-blockChallengeDecision` | Cada jugador activo distinto del autor del bloqueo | `challenge|pass` contra el reclamo de bloqueo; si varios lo desafían en la misma ventana común, solo se resuelve el primero según el orden fijo aprobado. |
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

**Arbitraje aprobado por el usuario (2026-09-26):** cada fase de respuesta tiene una ventana común: se cierra cuando todos los asientos elegibles respondieron o al vencer el plazo compartido. Si varios jugadores desafían el mismo reclamo, bloquean la misma acción o desafían el mismo bloqueo, el servidor resuelve una sola respuesta según el orden fijo de asientos en sentido horario desde quien declaró la acción/bloqueo; omite a ese actor y a jugadores eliminados. No usa la hora de llegada. Las demás respuestas de esa ventana se descartan sin efecto. Ejemplo: si B y C desafían la misma acción casi a la vez y B va antes en el orden desde quien actuó, se resuelve solo el challenge de B aunque el paquete de C llegue primero. Las reglas impresas no definen este desempate digital; esta es la decisión de producto aprobada para el juego.

Al vencer una decisión/ventana, faltar un actor requerido, desconectarse un proceso o agotarse tiempo/cuota, la partida se pausa con causa visible. El silencio no se convierte en `pass`, acción automática, pérdida o avance sin regla aprobada. Se rechazan respuestas tardías. Reanudar crea un ID/versión nuevos y usa el lobby existente; no se agrega método de login/reclamo de identidad.

**Aclaración de ejecución F1 (Orquestador, 2026-09-26):** `g-resume` solo puede solicitarlo el socket del líder actual, únicamente después de un timeout recuperable y mientras todos los sockets del roster sigan conectados. Reemitirá las mismas opciones vigentes con `decisionId` y `stateVersion` nuevos, borrando las respuestas parciales; la decisión original queda inválida. Una desconexión invalida la reanudación in-place: no reasigna asientos ni recupera identidad, y requiere recrear la partida como en el lobby actual.

Codex inicia deshabilitado, incluso tras reinicio. La palanca roja del juego es solo de apagado y cualquier jugador conectado puede usarla: cierra nuevas invocaciones, intenta terminar procesos activos, invalida sus IDs/versiones y pausa las partidas afectadas aunque no pueda matar un proceso. Ningún cliente puede reactivar Codex; solo el propietario lo habilita desde la consola/SSH del servidor. Rehabilitar permite nuevas invocaciones, pero no reanuda partidas ni reproduce salidas; hace falta una decisión nueva.

El acceso a partidas IA sigue el lobby actual; no se agrega invitación ni login. La palanca web solo puede apagar Codex y, por tanto, conceder esa acción a cualquier jugador solo puede reducir uso. No se exponen en clientes controles que permitan reactivar Codex o modificar límites. El propietario rearma Codex desde SSH/consola.

## Reglas versionadas y decisiones elevadas

Se copiaron sin alterar desde el checkout local `master` (`1e4685f0d079448fb6ca5df0aa0380632ffc2c7e`) las cuatro reglas existentes: `docs/coup_transcription.md`, `docs/coup_play_reference.md`, `docs/coup_summary_card.md` y `docs/coup_llm_summary.md`. La transcripción es la fuente normativa completa; tarjetas/resumen son referencias derivadas. La transcripción dice que el ganador anterior empieza y que en partidas de dos jugadores quien empieza recibe una moneda. El motor actual inicia por índice 0 y entrega dos monedas a cada jugador. F1 corregirá el motor para concordar con las reglas versionadas, definiendo también un comienzo reproducible para la primera partida sin ganador previo.

## Evidencia y decisión elevada

Verificado estáticamente en el worktree: `server/index.js` acepta `startGameSignal` y el roster del cliente sin comprobar líder; `server/game/coup.js` recibe actor/acción/costo del payload, cuenta votos con un contador compartido, cierra al primer desafío y difunde `g-updatePlayers`; `server/game/utils.js` conserva `influences` al exportar jugadores. El reporte/veredicto de #3 confirma la difusión de manos y la falta de asociación actor/socket. `disconnect` solicita recrear la partida y el líder borra la namespace; no hay reconexión definida. No se cambió código.

Las decisiones de producto de F0 están resueltas: conservar acceso actual sin autenticación nueva; versionar las cuatro fuentes (transcripción normativa); desempatar respuestas simultáneas por orden fijo de asientos. La discrepancia de preparación y la conservación de cartas reveladas pasan a F1.

Validación F0: lectura estática del contrato, reglas, reportes y eventos. No se escribieron/ejecutaron pruebas, no se inició Codex ni llamada de juego, y no se comprobó comportamiento en vivo. El informe PHASE independiente concluye `PASS`; queda guardado en `docs/plans/active/verifier_issue_14_F0.md`. F0 cerró y F1 está `RETURNED` tras el informe `FAIL` de `docs/plans/active/verifier_issue_14_F1.md`.
