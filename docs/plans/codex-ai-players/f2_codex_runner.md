# Issue #14 — contrato del runner Codex F2

Estado: implementación local `PASS`; prueba de login y una decisión real pendientes. El runner conversa con Codex App Server por JSON-RPC sobre `stdio://`, inicia una conversación efímera y solicita `gpt-6-luna`. Se validó `initialize` + `thread/start` con la CLI 0.157.1 sin login ni llamada al modelo. App Server está documentado como interfaz para integrar Codex dentro de un producto, pero su protocolo sigue siendo experimental; esta es una prueba temporal, no una integración de producción.

## Protocolo

El cliente del API envía una línea JSON por socket Unix local. La solicitud contiene ID de petición/decisión, versión del estado, esfuerzo `low|medium|high`, asiento, mano propia, estado público resumido, historial público acotado y opciones legales preparadas por el servidor. El contrato rechaza campos desconocidos, nombres/texto libre, roles/acciones inválidos, IDs duplicados y contextos mayores de 48 KiB. GPT-6 Luna es fijo; no hay selección de modelo ni fallback.

El worker ejecuta `codex app-server --listen stdio://` con shell, apps, multi-agent, hooks y búsqueda web desactivados. Inicia un hilo `ephemeral` con `sandbox: read-only` y una decisión con `sandboxPolicy: { type: readOnly, networkAccess: false }`, `approvalPolicy: never`, esfuerzo por asiento y esquema JSON que enumera las opciones actuales. No admite solicitudes de herramientas del App Server. Devuelve solo `choiceId`; cliente y motor vuelven a validar decisión, versión, reglas y legalidad antes de aplicar una transición.

El prompt procesa únicamente los campos estructurados del juego, nunca carga Markdown ni checkout. Solo incluye la mano del asiento que decide. El historial conserva hechos públicos y las reglas de descarte/reemplazo; pide estrategia adaptable, no mentira permanente. Cada decisión es efímera y no comparte deliberadamente memoria entre asientos. Los límites iniciales son dos decisiones simultáneas, doce en cola, 120 por partida, 240 por hora y 45 segundos por decisión.

La versión de reglas embebida es `b189cc0`. Las ventanas concurrentes usan el orden horario fijo acordado en F0. Una salida inválida, obsoleta, de otra versión, fallo, timeout o apagado no cambia la partida; esta pausa y muestra la causa.

## Frontera de procesos

El API y la web nunca reciben `CODEX_HOME` ni la sesión de ChatGPT. El overlay de Compose despliega un sidecar runner dedicado, sin puertos publicados, sin acceso a la red Docker del juego y con salida de red para el servicio Codex. La imagen contiene únicamente worker/protocolo y la CLI fijada en `@openai/codex@0.157.1`; no monta ni contiene el checkout del juego.

El runner usa UID 10001 y GID compartido 10002 para el socket de grupo `0660`. El API añade ese GID y solo monta los volúmenes del socket y del marcador; no puede leer la autenticación. El rootfs del runner es de solo lectura, elimina capabilities, exige `no-new-privileges` y limita CPU, memoria y procesos. Auth y cuotas se guardan en `coup_codex_state`; el apagado persistente vive en el volumen separado `coup_codex_control`. Workspace, TMPDIR y runtime son directorios privados y temporales, distintos entre sí y del CODEX_HOME. El healthcheck local valida el canal de control sin requerir que Codex esté habilitado.

## Evidencia local

- `node --test` cubre el contrato sin texto arbitrario, el esquema de salida, el flujo JSON-RPC, respuesta de eventos antes del ACK, errores, timeout, aislamiento de paths, socket Unix, cancelación al desconectar, cuotas persistentes y marcador rojo.
- La prueba local con la CLI 0.157.1 completa `initialize` y `thread/start` efímero con sandbox de solo lectura, usando un CODEX_HOME vacío; no se hace login ni turno del modelo.
- La imagen `coup-codex-runner` construye localmente. El Compose de prueba inicia el runner con rootfs de solo lectura y lo deja `healthy`; un proceso de prueba con UID 1000 y GID adicional 10002 consulta `/run/coup-codex/runner.sock`. La inspección confirmó socket `0660`, UID 10001/GID 10002.
- La disponibilidad real de GPT-6 Luna y la autorización de la cuenta concreta solo se prueban al iniciar sesión y solicitar una decisión real. No se han usado credenciales ni invocado el modelo.

## Operación inicial

El `deploy/codex-ai.compose.yml` complementa el Compose base existente. La guía [poc-runbook.md](poc-runbook.md) describe la activación en una carpeta release independiente, el login device-code, el smoke test y la reversión al release previo. El usuario acordó acceso temporal para sí y sus amigos sin identidad nueva; una clave compartida del lobby habilita agregar asientos IA y nunca va en un URL. Cualquier conexión puede activar la palanca roja. Runner y API escriben un marcador compartido que mantiene el apagado tras reinicios; para rearmar se quita por SSH y se reinician los servicios. La prueba con modelo todavía no ha empezado.

Fuentes oficiales consultadas el 2026-09-27: [Codex App Server](https://learn.chatgpt.com/docs/app-server), [modelos](https://learn.chatgpt.com/docs/models), [CLI y login de dispositivo](https://learn.chatgpt.com/docs/developer-commands). App Server figura como experimental y sin soporte de producción.
