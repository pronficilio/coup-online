# Plan: jugadores Codex y palanca de emergencia

Issue: #14 — Integrar jugadores IA con Codex y una palanca de emergencia
Estado: ACTIVE; F0 CLOSED (PHASE PASS); F1 CLOSED (PHASE PASS tras correcciones); F2 ACTIVE
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
- La issue #13 es la unidad canónica de despliegue. Está abierta, F0 quedó cerrado y el commit de release sigue por definir. #14 integra la funcionalidad; el despliegue la consume después.
- El checkout raíz contiene modificaciones locales sin commit. El worktree de #14 parte del origin/master limpio; no incorporar cambios raíz sin una decisión registrada.
- El usuario aprobó jugar con su login ChatGPT Plus mediante Codex CLI, Luna como modelo inicial, acceso para él y amigos, y una palanca roja para apagar el uso de Codex.
- Por instrucción del usuario, se conserva el acceso/lobby actual sin cuentas ni invitaciones. Cualquier jugador conectado puede activar el apagado seguro; solo el propietario rearma Codex por SSH/consola.
- Se versionaron desde el checkout local las reglas completas y sus tres resúmenes en `docs/coup_transcription.md`, `docs/coup_play_reference.md`, `docs/coup_summary_card.md` y `docs/coup_llm_summary.md`. La transcripción es la autoridad; F1 alineó el motor con esas reglas.

## Compatibilidad Codex/Plus y límite operativo (verificado 2026-09-26)

- La documentación oficial describe `codex exec`, `--output-schema` y GPT-6 Luna (`gpt-6-luna`) en Codex, pero dice que la disponibilidad depende del plan, inicio de sesión, cliente y rollout; no garantiza Luna para esta cuenta Plus. Mantener el modelo Luna fijo y verificar disponibilidad antes de habilitarlo; si no está disponible, pausar, sin sustituir modelo ni usar API. El uso de Codex comparte una cuota limitada del plan y varía con modelo, contexto y trabajo; no es un presupuesto API ni una capacidad ilimitada. Fuente: [Models](https://learn.chatgpt.com/docs/models).
- La guía oficial de automatización indica que `codex exec` puede reutilizar autenticación guardada de ChatGPT, que `~/.codex/auth.json` debe tratarse como una contraseña y que este flujo no debe usarse con repositorios públicos o open source. `pronficilio/coup-online` es público.
- Por tanto, F2 no puede tratar el login Plus como un backend ya aprobado para servicio: antes de conectar asientos de amigos, el Verifier debe confirmar que el runner local de juego queda fuera del código/repositorio público y del proceso web no confiable, y que este uso autenticado es compatible con la guía vigente. Si no se puede confirmar esa frontera/compatibilidad, F2 queda bloqueada; no se elude con una cuenta/API alternativa.
- Fuentes: [precios y límites de Codex](https://learn.chatgpt.com/docs/pricing), [modelos y CLI](https://learn.chatgpt.com/docs/models), [modo no interactivo y autenticación](https://learn.chatgpt.com/docs/non-interactive-mode).

## Bloqueos explícitos por fase

F0: bloquear ante una transición de reglas sin definir o una política de respuestas concurrentes sin decidir.
F1: bloquear si una decisión puede cambiar estado fuera de turno/fase o una vista revela cartas privadas.
F2: bloquear si el runner no puede aislarse o autenticarse con Plus; no sustituirlo por API.
F3: bloquear si se pueden saltar límites, el apagado o la reactivación de Codex desde HTTP/Socket.IO.
F4: bloquear la integración si queda un hallazgo de privacidad, permisos, gasto o reglas críticas, o si el Verifier no da PASS.

La primera fase F0 es análisis de contrato que produce evidencia documental y commit. F1 implementa privacidad/autoridad antes de F2. F2 agrega Codex CLI. F3 habilita asientos IA y kill switch conservando el lobby actual, sin cuentas ni invitaciones. F4 cierra revisión y prepara el handoff de release a #13. La issue contiene el detalle y el criterio verificable de cada fase.
## Solicitud

Agregar jugadores automáticos controlados por GPT-6 Luna a Coup Online. El propietario y sus amigos podrán jugar partidas mixtas (por ejemplo, un humano contra dos IA) y partidas IA contra IA. Las llamadas al modelo usarán Codex CLI autenticado con la suscripción ChatGPT Plus del propietario, con el esfuerzo de razonamiento elegido para cada asiento. No se usará una API key ni se activará facturación API como alternativa.

## Objetivo operativo

Integrar jugadores Codex como participantes del mismo motor de partida que los jugadores humanos, preservando información privada, reglas y turnos. Permitir al propietario apagar inmediatamente el uso global de Codex desde una palanca administrativa roja.

## Éxito

1. Cada jugador IA recibe solo su mano, el estado público y su propio historial permitido; no recibe manos rivales ni estado interno del mazo.
2. El servidor deriva el actor del socket ligado al asiento actual y es autoridad para acciones permitidas, monedas, desafíos, bloqueos, pérdidas de influencia y avance del turno. Las decisiones humanas e IA se validan antes de ejecutarse.
3. Las partidas admiten humanos e IA en varios asientos, incluida una persona contra dos IA e IA contra IA. Cada asiento Codex permite seleccionar `low`, `medium` o `high`; GPT-6 Luna `medium` es el valor inicial recomendado.
4. Codex CLI usa el inicio de sesión ChatGPT del propietario y entrega una selección legible por máquina entre opciones de decisión preparadas por el servidor. Las respuestas inválidas, duplicadas, tardías o pertenecientes a un estado anterior no cambian la partida.
5. Se conserva el acceso/lobby actual: no se agregan cuentas, login ni invitaciones. Cualquier jugador conectado puede apagar Codex con la palanca roja; solo el propietario puede volver a encenderlo desde la consola/SSH del servidor.
6. Al activar la palanca roja, el servidor bloquea nuevas invocaciones, termina las invocaciones activas cuando sea posible, invalida sus respuestas y pausa las partidas que esperan una decisión IA. Rehabilitar Codex no reproduce respuestas antiguas: el propietario reanuda o solicita una decisión nueva.
7. Se limitan la concurrencia, el tiempo de espera y las llamadas por partida/ventana temporal. Un límite, fallo de login, proceso caído o cuota agotada pausa las partidas afectadas y muestra una causa; nunca cambia silenciosamente a API de pago.
8. Los registros operativos pueden incluir partida/decisión, modelo, esfuerzo, duración, salida de proceso y contadores de uso disponibles. No guardan credenciales, manos rivales, razonamiento interno ni entradas arbitrarias de jugadores.
9. La integración queda lista para desplegarse junto al cliente y servidor en Hetzner después de aprobar un commit de release. El despliegue mismo sigue la unidad canónica #13.

## Alcance

- Definir el contrato de observación privada, las decisiones del motor y la asociación de cada asiento con un controlador humano o Codex.
- Cerrar las filtraciones de cartas privadas y discrepancias de reglas que impidan un experimento válido; hacer que el servidor valide y resuelva las decisiones relevantes.
- Implementar un adaptador aislado para invocaciones puntuales de `codex exec`, con `gpt-6-luna`, esfuerzo configurable, esquema de salida y manejo de errores.
- Conservar el acceso/lobby existente sin autenticación nueva; añadir límites operativos y una palanca roja global de solo apagado.
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

### F2 — Añadir el controlador Codex con la suscripción del propietario (`ACTIVE`)

- **Pregunta:** ¿puede un proceso separado ejecutar una decisión Codex acotada y devolver una opción válida sin recibir secretos ajenos ni acceso operativo al servidor?
- **Entrada:** proyecciones y decisiones autoritativas F1.
- **Salida:** invocador `codex exec` autenticado con ChatGPT, contexto pequeño de reglas + mano propia + estado público + opciones permitidas, esquema JSON, identificador/versionado de decisión, límites de tiempo/ejecución y tratamiento de errores.
- **Cierre:** usa `gpt-6-luna` y esfuerzo por asiento `low|medium|high`; no inyecta texto libre de clientes; corre en un usuario/directorio de trabajo aislado y de solo lectura, sin montar el repo de Coup ni secretos de aplicación; no ejecuta shell pedido por jugadores; respuesta se valida contra la decisión vigente; no hay fallback a API. La documentación oficial de autenticación en automatización advierte contra este flujo con repositorios públicos/open source; como este repo es público, Verifier debe resolver compatibilidad y aislamiento del runner antes de habilitar asientos IA. También prueba de forma independiente la barrera del proceso y del gasto.
- **Pivote:** si Codex CLI no permite una ejecución acotada y segura para una decisión de juego, bloquear F2 y presentar la limitación en lugar de sustituir autenticación/proveedor.
- **Repetición:** máximo dos intentos de corrección por fallo de esquema, timeout o respuesta obsoleta antes de pausar la partida y registrar el fallo.
- **Commit:** `COMMIT_REQUIRED`; `feat(codex-player): issue 14 F2 plus-auth runtime`.
- **Validación:** verificación local bajo el login del propietario; registrar éxito/error, esfuerzo, latencia y uso disponible; no lanzar simulaciones masivas.
- **Acotación OpenAI Docs (2026-09-26):** `codex exec` está documentado para uso no interactivo, acepta `--output-schema` y reutiliza autenticación CLI guardada. La primera prueba demostró que el sandbox antiguo `read-only` permitía leer un archivo señuelo fuera del workspace; F2 lo reemplaza por un perfil inline que deniega el filesystem por defecto, restringe lectura al workspace vacío y a paths mínimos, y deshabilita herramientas locales. La página de perfiles de permisos los marca Beta; PHASE debe probar la política con la versión fijada de Codex en Linux antes de habilitar asientos. La guía avanzada de autenticación además advierte no usar ese flujo con repositorios públicos/open source. El runner no enviará el checkout público: solo JSON de runtime; el Verifier debe resolver si esa separación satisface la guía. La CLI exige un Git repo salvo `--skip-git-repo-check`; se usa ese modo junto con `--ephemeral`. Referencias: [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [Permissions](https://learn.chatgpt.com/docs/permissions).

### F3 — Añadir asientos IA y palanca roja (`PENDING`)

- **Pregunta:** ¿pueden los jugadores configurar asientos IA en el lobby actual y apagar Codex sin agregar autenticación ni permitir que un cliente lo reactive?
- **Entrada:** controlador Codex F2 y contratos del lobby/socket.
- **Salida:** selección de tipo de asiento/esfuerzo en el lobby actual, límites por partida/ventana y palanca roja global de solo apagado.
- **Cierre:** se crean partidas de una persona + dos IA y de varias IA; cualquier jugador puede activar la palanca y solo el propietario puede reactivar Codex por SSH/consola; apagar bloquea llamadas nuevas, intenta terminar las activas, invalida sus respuestas y pausa la decisión actual; tras reinicio Codex sigue apagado hasta habilitación explícita del propietario; Verifier refuta vías de bypass desde HTTP/Socket.IO.
- **Pivote:** si apagar Codex no invalida las respuestas en curso o si el cliente puede reactivar Codex, bloquear F3 hasta corregir la palanca.
- **Repetición:** una corrección acotada por vía de bypass demostrada.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-lobby): issue 14 F3 AI seats and kill switch`.
- **Validación:** recorrido con el acceso actual y lectura del control de gasto/kill switch por el Verifier.

### F4 — Verificar la integración completa y preparar handoff de release (`PENDING`)

- **Pregunta:** ¿se puede completar una partida mixta y apagar/recuperar Codex sin violar reglas, privacidad o el límite de gasto?
- **Entrada:** F0–F3 cerradas.
- **Salida:** guía de operación/auth, escenarios manuales reproducibles, resultados del Verifier y decisión de listo para integrar.
- **Cierre:** recorrido documentado humano vs dos IA e IA vs IA; acciones/desafíos/bloqueos/intercambio/timeout y kill switch revisados; el Verifier independiente emite `PASS`; configuración de release y dependencia con #13 documentadas. No iniciar torneos de rendimiento dentro de esta issue.
- **Pivote:** si falla una invariante de reglas, privacidad o kill switch, devolver a su fase propietaria.
- **Repetición:** una ronda de correcciones/revisión focalizada por criterio fallido.
- **Commit:** `COMMIT_REQUIRED`; `feat(codex-ai): issue 14 F4 READY_FOR_REVIEW`.
- **Validación:** revisión FINAL independiente y salida manual de los escenarios previstos.

## Riesgos y mitigaciones

- **Plus/cuota compartida:** máximo de invocaciones activas y decisiones por partida/ventana; pausa al llegar a límite. Registrar contadores sin afirmar que hay acceso a un saldo exacto de Plus.
- **Acceso abierto del lobby actual:** no se agrega autenticación; toda conexión puede usar IA, así que se aplican límites globales conservadores y cualquier jugador puede apagar Codex, sin opción web para reactivarlo.
- **Secretos Codex:** login se realiza en Hetzner como usuario del proceso o flujo remoto documentado; auth cache con permisos de propietario, nunca en logs/cliente/repositorio.
- **Prompt injection:** no incluir chat libre; datos de juego estructurados; no abrir el modelo a archivos del proyecto ni a herramientas sobre el juego; opciones se generan y validan en servidor.
- **Latencia/caída:** decisión con id y vencimiento; descartar respuestas tardías; pausa visible y recuperación explícita.
- **Reglas/privacidad heredadas:** F1 cerró con PHASE `PASS`; no habilitar asientos IA desde el lobby hasta cerrar F2/F3 y sus revisiones independientes.

## Operación

- Ejecución `FULL`; riesgo `HIGH`; verificación independiente `PHASE` obligatoria en F0–F3 y `FINAL` al cierre, por permisos de socket, privacidad y concurrencia.
- Pregunta de falsificación: ¿puede otro socket, una respuesta tardía o un proceso Codex ya activo ejecutar una acción tras cambiar de fase o después de activar la palanca?
- Siguiente dueño: Verifier F2; revisión PHASE independiente antes de F3.
- Branch esperado: `issue/<id>-codex-ai-players`.
- Worktree esperado: `.worktrees/issue-<id>-codex-ai-players`.
- Merge target: `master`.
- Release Hetzner: unidad #13; no desplegar desde este issue.
