# Plan: jugadores Codex y palanca de emergencia

Issue: #14 — Integrar jugadores IA con Codex y una palanca de emergencia
Estado: ACTIVE; F0 y F1 CLOSED (PHASE PASS); F2 App Server implementado y validado localmente; F3 implementado y cubierto por pruebas; release POC `5a13376` activa y saludable en Hetzner; el login device-code aún no emite código y espera que el propietario habilite esa opción; no hay sesión ni llamada a Luna; escenarios manuales y revisión final pendientes
Ejecución / riesgo / verificación: FULL / HIGH / PHASE
Branch / worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players
Merge target: master
Bitácora: docs/plans/log/issue-14.jsonl
Handoff: docs/plans/active/issue_14_codex_ai_players.md
Contrato F0: docs/plans/codex-ai-players/f0_contract.md

El cuerpo de la issue #14 contiene objetivo, criterios de aceptación, alcance, exclusiones, fases, criterios de cierre, riesgos y la pregunta adversarial. Esta copia se conserva como plan documental de la unidad y se mantendrá sincronizada con la issue.

## Hechos y dependencias confirmados

- Issue #3 está cerrada y su PR #4 contiene una revisión FINAL PASS, no correcciones. El informe halló difusión de influencias privadas, handlers que confían en datos/identidad del payload, roster de anfitrión no validado, CORS abierto y falta de límites visibles. Fuentes: docs/plans/active/report_issue_3_quick_security_check_F1.md y docs/plans/active/verifier_issue_3_final.md.
- El código actual envía influencias de todos los jugadores a toda la sala y devuelve al mazo cartas que las reglas dejan reveladas.
- La issue #13 sigue siendo la unidad del despliegue regular. Para esta prueba temporal, el usuario autorizó un release POC separado que conserva intacto el release actual como rollback.
- El checkout raíz contiene modificaciones locales sin commit. El worktree de #14 parte del origin/master limpio; no incorporar cambios raíz sin una decisión registrada.
- El usuario aprobó una prueba temporal con su login ChatGPT mediante Codex App Server, Luna como modelo inicial, acceso para él y amigos, y una palanca roja para apagar Codex. No se publicarán cambios al fork; el runner y el release se preparan aislados.
- Por instrucción del usuario, se conserva el acceso/lobby actual sin cuentas ni invitaciones. Solo el líder del lobby que validó el código compartido puede activar el apagado seguro; interfaz y servidor comprueban el permiso. Solo el propietario rearma Codex por SSH/consola.
- Se versionaron desde el checkout local las reglas completas y sus tres resúmenes en `docs/coup_transcription.md`, `docs/coup_play_reference.md`, `docs/coup_summary_card.md` y `docs/coup_llm_summary.md`. La transcripción es la autoridad; F1 alineó el motor con esas reglas.

## Compatibilidad de App Server y acceso al modelo

- La documentación oficial presenta Codex App Server como interfaz para integrar Codex dentro de un producto, con transporte stdio/socket. También marca el protocolo como experimental y no soportado para producción: esta prueba es temporal y se podrá retirar o migrar a API.
- El runner no monta el checkout público ni tiene acceso a la red interna de Coup. Recibe únicamente datos estructurados de una partida y solo la API conserva la sesión del juego; la auth queda en un volumen privado del sidecar.
- La disponibilidad de `gpt-6-luna` se confirmó mediante OAuth normal y una decisión real `low` a través de API → runner; la selección legal fue `steal:1`. No hay fallback ni API.
- Referencias: [Codex App Server](https://learn.chatgpt.com/docs/app-server), [modelos](https://learn.chatgpt.com/docs/models), [CLI y login de dispositivo](https://learn.chatgpt.com/docs/developer-commands).

## Bloqueos explícitos por fase

F0: bloquear ante una transición de reglas sin definir o una política de respuestas concurrentes sin decidir.
F1: bloquear si una decisión puede cambiar estado fuera de turno/fase o una vista revela cartas privadas.
F2: bloquear si el runner no puede aislarse o autenticarse con Plus; no sustituirlo por API.
F3: bloquear si se pueden saltar límites, el apagado o la reactivación de Codex desde HTTP/Socket.IO.
F4: bloquear la integración si queda un hallazgo de privacidad, permisos, gasto o reglas críticas, o si el Verifier no da PASS.

La primera fase F0 es análisis de contrato que produce evidencia documental y commit. F1 implementa privacidad/autoridad antes de F2. F2 integra Codex App Server en un sidecar aislado. F3 habilita asientos IA y kill switch conservando el lobby actual, sin cuentas ni invitaciones. F4 completa la prueba en Hetzner y la revisión final.
## Solicitud

Agregar jugadores automáticos controlados por GPT-6 Luna a Coup Online. El propietario y sus amigos podrán jugar partidas mixtas (por ejemplo, un humano contra dos IA) y partidas IA contra IA. Las llamadas al modelo usarán Codex CLI autenticado con la suscripción ChatGPT Plus del propietario, con el esfuerzo de razonamiento elegido para cada asiento. No se usará una API key ni se activará facturación API como alternativa.

## Objetivo operativo

Integrar jugadores Codex como participantes del mismo motor de partida que los jugadores humanos, preservando información privada, reglas y turnos. Permitir al propietario apagar inmediatamente el uso global de Codex desde una palanca administrativa roja.

## Éxito

1. Cada jugador IA recibe solo su mano, el estado público y su propio historial permitido; no recibe manos rivales ni estado interno del mazo.
2. El servidor deriva el actor del socket ligado al asiento actual y es autoridad para acciones permitidas, monedas, desafíos, bloqueos, pérdidas de influencia y avance del turno. Las decisiones humanas e IA se validan antes de ejecutarse.
3. Las partidas admiten humanos e IA en varios asientos, incluida una persona contra dos IA e IA contra IA. Cada asiento Codex permite seleccionar `low`, `medium` o `high`; GPT-6 Luna `medium` es el valor inicial recomendado.
4. Codex CLI usa el inicio de sesión ChatGPT del propietario y entrega una selección legible por máquina entre opciones de decisión preparadas por el servidor. Las respuestas inválidas, duplicadas, tardías o pertenecientes a un estado anterior no cambian la partida.
5. Se conserva el acceso/lobby actual: no se agregan cuentas, login ni invitaciones. Solo el líder que validó el código compartido puede ver y activar la palanca roja; la autorización se comprueba también en el servidor. Solo el propietario puede volver a encenderlo desde la consola/SSH del servidor.
6. Al activar la palanca roja, el servidor bloquea nuevas invocaciones, termina las invocaciones activas cuando sea posible, invalida sus respuestas y pausa las partidas que esperan una decisión IA. Rehabilitar Codex no reproduce respuestas antiguas: el propietario reanuda o solicita una decisión nueva.
7. Se limitan la concurrencia, el tiempo de espera y las llamadas por partida/ventana temporal. Un límite, fallo de login, proceso caído o cuota agotada pausa las partidas afectadas y muestra una causa; nunca cambia silenciosamente a API de pago.
8. Los registros operativos pueden incluir partida/decisión, modelo, esfuerzo, duración, salida de proceso y contadores de uso disponibles. No guardan credenciales, manos rivales, razonamiento interno ni entradas arbitrarias de jugadores.
9. La integración queda lista para desplegarse junto al cliente y servidor en Hetzner después de aprobar un commit de release. El despliegue mismo sigue la unidad canónica #13.

## Alcance

- Definir el contrato de observación privada, las decisiones del motor y la asociación de cada asiento con un controlador humano o Codex.
- Cerrar las filtraciones de cartas privadas y discrepancias de reglas que impidan un experimento válido; hacer que el servidor valide y resuelva las decisiones relevantes.
- Implementar un adaptador aislado para decisiones puntuales con Codex App Server, `gpt-6-luna`, esfuerzo configurable, esquema de salida y manejo de errores.
- Conservar el acceso/lobby existente sin autenticación nueva; añadir límites operativos y una palanca roja global de solo apagado, disponible solo para el líder que autorizó asientos IA con el código.
- Permitir configurar asientos humanos/IA y esfuerzo de cada IA en la creación de partidas.
- Dejar una guía de autenticación inicial en Hetzner mediante el flujo de inicio de sesión de Codex apropiado para un servidor remoto, sin guardar ni publicar credenciales.
- Producir evidencia de verificación independiente FINAL sobre privacidad, autenticación, costo/kill switch y reglas del juego.

## Fuera de alcance

- Llamadas a la API de OpenAI, API keys, fallback de pago o alojamiento local del modelo.
- Dar al agente Codex acceso al repositorio del juego, secretos de la aplicación, entradas libres de jugadores o herramientas que alteren el servidor.
- Agregar autenticación de cuentas, acceso por invitación, cambios al acceso actual del lobby o una forma de reactivar Codex desde un cliente web.
- Torneos masivos, aprendizaje entre partidas, coordinación secreta entre IA, conversación libre o una afirmación de que el agente es invencible.
- Comprar dominio o cambiar DNS/TLS/infraestructura compartida del servidor; esos cambios se tramitan en #13.

## Fases

### F0 — Fijar el contrato de privacidad y decisiones (`CLOSED`)

- **Pregunta:** ¿puede el juego producir para cada asiento una observación suficiente y privada, y representar todas las decisiones necesarias sin entregar autoridad de ejecución al modelo?
- **Entrada:** `docs/coup_transcription.md` como regla completa, `docs/coup_play_reference.md` y `docs/coup_summary_card.md` como referencias, `docs/coup_llm_summary.md` como resumen operativo, motor Socket.IO y análisis de seguridad.
- **Salida:** contrato de observación por asiento, decisiones válidas por fase, política para ventanas concurrentes y timeout/pausa; se conserva el lobby y la identidad efímera de socket actuales, sin cuentas ni invitaciones. La palanca permite apagar desde el juego; solo el propietario la rearma desde SSH/consola. Evidencia: `docs/plans/codex-ai-players/f0_contract.md`.
- **Estado:** el usuario decidió conservar el acceso actual sin autenticación y versionar las cuatro fuentes; aprobó desempatar varias respuestas con orden fijo de asientos en sentido horario desde quien declaró la acción/bloqueo, independientemente de latencia. El Verifier independiente emitió `PASS` para `b189cc0`; informe: `docs/plans/active/verifier_issue_14_F0.md`.
- **Pivote:** si la interfaz no asocia de forma inequívoca una respuesta al socket que ocupa el asiento, F1 ajusta esa asociación efímera sin agregar autenticación persistente.
- **Repetición:** una revisión de las fuentes de reglas y del motor; repetir solo para cerrar una ambigüedad identificada.
- **Commit:** contrato y reglas en `b189cc0`; cierre F0 registrado en este commit.
- **Validación:** inspección de cada evento/decisión y trazado de una partida mixta; no se inicia una llamada a Codex real desde F0.

### F1 — Hacer el estado y las decisiones privados y autoritativos (`CLOSED — PHASE PASS`)

- **Pregunta:** ¿puede el servidor aplicar una decisión humana o IA sin filtrar cartas ni aceptar una mutación de estado que el jugador no tiene derecho a realizar?
- **Entrada:** contrato F0.
- **Salida:** proyecciones públicas/privadas explícitas, decisiones asociadas a socket/jugador/partida/fase, validación de acción/costo/destino y flujo correcto de cartas reveladas/reemplazadas.
- **Cierre:** llamadas de cliente ya no determinan fuente, costo, carta revelada ni cartas de intercambio; mano y mazo no salen en eventos públicos; decisiones fuera de turno/fase, opciones inválidas o de otro socket se rechazan; repetición exacta es idempotente y una repetición con elección distinta se rechaza. El motor cumple las reglas versionadas, incluido inicio por ganador previo, una moneda inicial para quien empieza en dos jugadores y cartas de influencia reveladas fuera del mazo; sin ganador previo, el primer asiento se elige al azar. Ventanas de timeout reanudables solo por el líder con todos los sockets conectados; respuestas parciales se borran y se emiten IDs/versiones nuevos. Una desconexión obliga a recrear la partida. Verifier independiente debe emitir `PASS` sobre filtración, autoridad y reglas.
- **Estado/evidencia:** el PHASE inicial registró `FAIL` en `docs/plans/active/verifier_issue_14_F1.md`; las dos correcciones están implementadas y cubiertas por regresiones. La segunda revisión independiente dio `PASS` en `docs/plans/active/verifier_issue_14_F1_recheck.md`, en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`. `npm test`, las pruebas directas de motor y lobby, `node --check` y `git diff --check` pasan. `react-scripts` no está instalado, por lo que build/test del cliente no se ejecutaron. F1 quedó cerrada sin invocar Codex.
- **Pivote:** si el motor actual necesita una división mayor para preservar reglas, documentar y mantener dentro de esta fase solo los cambios necesarios para el contrato IA.
- **Repetición:** una corrección acotada por cada fallo demostrable de los criterios.
- **Commit:** implementación inicial `608089d4c839f367b9b0b0e92009d3daf536ce5c` devuelta; correcciones, regresiones y evidencia revisadas en `ceb9fee68d600c679ea1c58da2a805b3a91be4ee`.
- **Validación:** `npm test` en `server/`, pruebas directas `node test/coup.test.js` y `node test/lobby.test.js`, `node --check`, `git diff --check` y PHASE independiente `PASS`.

### F2 — Añadir el controlador Codex con el login del propietario (`IMPLEMENTADO; PRUEBA REAL PENDIENTE`)

- **Pregunta:** ¿puede un proceso separado ejecutar una decisión Codex acotada y devolver una opción válida sin recibir secretos ajenos ni acceso operativo al servidor?
- **Entrada:** proyecciones y decisiones autoritativas F1.
- **Salida:** runner lateral `codex app-server --listen stdio://`, hilo efímero, contexto de reglas + mano propia + estado público + opciones permitidas, esquema JSON, identificador/versionado de decisión, límites de tiempo/ejecución y tratamiento de errores.
- **Cierre:** usa `gpt-6-luna` y esfuerzo por asiento `low|medium|high`; no inyecta texto libre; corre en contenedor sin checkout ni secretos del API, sin herramientas y con rootfs de solo lectura; la respuesta se valida contra la decisión vigente; no hay fallback a API. La documentación del App Server lo marca experimental, de modo que se trata de prueba temporal.
- **Pivote:** si App Server no está disponible en la cuenta/CLI, retirar la conexión Plus y dejar registrada la limitación; no sustituir autenticación/proveedor.
- **Repetición:** máximo dos intentos de corrección por fallo de esquema, timeout o respuesta obsoleta antes de pausar la partida y registrar el fallo.
**F2 evidencia (2026-09-26):** `npm test` cubre App Server JSON-RPC, opciones legales, timeouts y cancelaciones; la CLI 0.157.1 completó localmente `initialize` y `thread/start` efímero sin login ni turno; imagen Docker construida; el contenedor pasa healthcheck y un proceso con UID/GID del API conecta al socket `0660` grupo 10002. F4 completó después el OAuth de navegador y la primera decisión real de GPT-6 Luna `low` en Hetzner.

### F3 — Añadir asientos IA y palanca roja (`IMPLEMENTADO; REVISIÓN F4 PENDIENTE`)

- **Pregunta:** ¿pueden los jugadores configurar asientos IA en el lobby actual y apagar Codex sin agregar autenticación ni permitir que un cliente lo reactive?
- **Entrada:** controlador Codex F2 y contratos del lobby/socket.
- **Salida:** selección de tipo de asiento/esfuerzo en el lobby actual, límites por partida/ventana y palanca roja global de solo apagado.
- **Cierre:** se crean partidas de una persona + dos IA y de varias IA; solo el socket líder autorizado con el código puede activar la palanca, y solo el propietario puede reactivar Codex por SSH/consola; apagar bloquea llamadas nuevas, intenta terminar las activas, invalida sus respuestas y pausa la decisión actual; tras reinicio Codex sigue apagado hasta habilitación explícita del propietario; Verifier refuta vías de bypass desde HTTP/Socket.IO.
- **Pivote:** si apagar Codex no invalida las respuestas en curso o si el cliente puede reactivar Codex, bloquear F3 hasta corregir la palanca.
- **Repetición:** una corrección acotada por vía de bypass demostrada.
- **Validación local:** pruebas cubren anfitrión + dos IA, IA contra IA con espectador, clave de lobby, apagado concurrente, marcador persistente y cuotas. Queda validar la operación tras login en Hetzner.

### F4 — Verificar la integración completa y preparar handoff de release (`PENDING`)

- **Pregunta:** ¿se puede completar una partida mixta y apagar/recuperar Codex sin violar reglas, privacidad o el límite de gasto?
- **Entrada:** F0–F3 implementadas localmente.
- **Salida:** guía de operación/auth, escenarios manuales reproducibles, resultados del Verifier y decisión de listo para integrar.
- **Cierre:** recorrido humano vs dos IA e IA vs IA en Hetzner; acciones/desafíos/bloqueos/intercambio/timeout y kill switch revisados; compilar cliente y servidor; revisión final; mantener release previo listo para rollback. No iniciar torneos masivos.
- **Pivote:** si falla una invariante de reglas, privacidad o kill switch, devolver a su fase propietaria.
- **Repetición:** una ronda de correcciones/revisión focalizada por criterio fallido.
- **Estado:** la validación local tras integrar la base activa `55be894` pasó: suite del servidor 36/36, `node --check` y build de cliente. El build conserva dos warnings existentes de imports sin uso en `src/App.js`. La release POC separada `5a13376` está activa; API y runner están healthy, la web responde HTTP 200, y el runner no comparte la red interna del juego ni publica puertos. El primer intento de login device-code falló antes de emitir código. OpenAI Docs indica que se debe habilitar el login por código de dispositivo en Settings > Security; el propietario tiene que hacerlo antes de reintentar. No hay sesión Codex ni llamada a Luna. Pendiente probar una decisión real y recorrer los escenarios manuales.

## Riesgos y mitigaciones

- **Plus/cuota compartida:** máximo de invocaciones activas y decisiones por partida/ventana; pausa al llegar a límite. Registrar contadores sin afirmar que hay acceso a un saldo exacto de Plus.
- **Acceso abierto del lobby actual:** no se agrega autenticación; toda conexión puede unirse al juego, pero agregar IA y activar la palanca roja requiere que el líder valide el código compartido. Se aplican límites globales conservadores y no existe opción web para reactivar Codex.
- **Secretos Codex:** login se realiza en Hetzner como usuario del proceso o flujo remoto documentado; auth cache con permisos de propietario, nunca en logs/cliente/repositorio.
- **Prompt injection:** no incluir chat libre; datos de juego estructurados; no abrir el modelo a archivos del proyecto ni a herramientas sobre el juego; opciones se generan y validan en servidor.
- **Latencia/caída:** decisión con id y vencimiento; descartar respuestas tardías; pausa visible y recuperación explícita.
- **Reglas/privacidad heredadas:** F1 cerró con PHASE `PASS`; F4 comprueba que las nuevas llamadas conservan el contrato y el kill switch durante la prueba.

## Operación

- Ejecución `FULL`; riesgo `HIGH`; pruebas de motor, runner, socket, cuotas y build completadas localmente; queda prueba real de cuenta y operación de Hetzner.
- Pregunta de falsificación: ¿puede otro socket, una respuesta tardía o un proceso Codex ya activo ejecutar una acción tras cambiar de fase o después de activar la palanca?
- Siguiente paso: el release POC privado ya está en `/opt/coup/releases/5a13376`; la release anterior `55be894` queda disponible para rollback. Esperar a que el propietario habilite device-code, iniciar un nuevo flujo y probar una sola jugada antes de invitar amigos. No se ha llamado al modelo.
- Branch esperado: `issue/<id>-codex-ai-players`.
- Worktree esperado: `.worktrees/issue-<id>-codex-ai-players`.
- Merge target: `master`.
- Release Hetzner: carpeta nueva con overlay runner; no tocar el release anterior ni publicar cambios al fork. Conservar rollback inmediato.
