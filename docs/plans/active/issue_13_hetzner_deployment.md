# Issue #13 — Desplegar Coup Online en Hetzner

- **Issue:** https://github.com/pronficilio/coup-online/issues/13
- **Estado:** `WAITING_USER` — seleccionar un commit/tag limpio de lanzamiento.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` independiente.
- **Branch / worktree:** `issue/13-hetzner-deployment` / `.worktrees/issue-13-hetzner-deployment`
- **Integración:** un PR hacia `master`.
- **Solicitud original:** montar el repo en `sqf-hetzner`; comprobar lo necesario antes de comprar un dominio y explicar cómo apuntar el subdominio desde GoDaddy cuando exista.

## Objetivo y definición de éxito

Desplegar una versión aprobada, identificada por commit/tag, con cliente React y backend Express/Socket.IO en el servidor Hetzner existente. El despliegue debe quedar aislado de los servicios actuales, verificable antes de comprar/configurar un dominio y listo para publicar `coup.<dominio>` por HTTPS después de que el usuario compre el dominio y configure DNS.

Se considera terminado cuando la versión aprobada responde y permite crear/unirse a una partida, sobrevive a reinicios de contenedor, funciona con HTTPS y WebSocket detrás del proxy compartido, no interrumpe los servicios previos y hay pasos documentados para DNS/GoDaddy y rollback.

## Alcance y límites

Incluye identificar el artefacto de lanzamiento, preparar Docker Compose y configuración del proxy, desplegar y verificar Coup, configurar DNS/TLS una vez que exista el dominio, y documentar operación/rollback.

No incluye comprar un dominio, cambiar nameservers, desplegar cambios sin commit/tag aprobado, ni reemplazar o reconfigurar ampliamente Mochila, Minecraft, Nginx, SSH o firewall.

## Hechos confirmados

- Perfil operativo: repo `coup-online`; tracker GitHub; rama base y target `master`; control en `docs/plans`; ejecutor `alchemist`; verificador `verifier`; aislamiento Git worktree; logging JSONL append-only.
- El servidor accesible como `sqf-hetzner` es Debian 13, usuario remoto `root`, con Docker instalado y 17 GB libres en `/`. Node/NPM no están instalados en el host.
- Docker publica Nginx en 80/443. Su config vive en `/opt/mochila/deploy/nginx.conf`, con `server_name _` y certificado existente `mochila-ip`; proxy actual hacia Mochila en 8080. También corren servicios de Mochila y Minecraft. Nada de eso se ha modificado.
- Coup usa backend Node en el puerto 8000 por defecto o `PORT`; cliente CRA obtiene URL del backend al compilar mediante `REACT_APP_BACKEND_URL`. Las rutas API son `/createNamespace` y `/exists/:namespace`, además de Socket.IO.
- El backend aplica CORS abierto con `app.use(cors())`; revisar antes de exponerlo.
- La copia compartida estaba en `master` con 67 entradas modificadas/no rastreadas. `origin/master` observado tras `git fetch` es `64593af`; la copia local `HEAD` es `1e4685f`, dos commits delante y dieciséis detrás, más cambios sin commit. Ninguno se asumirá como lanzamiento sin selección explícita.
- GitHub no tenía una issue previa de despliegue. Issue #5 está cerrada; issue #6 permanece abierta.
- El dominio no está comprado. La IP configurada en el alias SSH no se asume como IP pública final hasta comprobarla por DNS/red.

## Supuestos, preguntas y riesgos

- **Pregunta que bloquea implementación:** ¿qué commit/tag debe representar el lanzamiento? Alternativas: seleccionar un commit/tag existente o consolidar primero el checkout actual en una rama/PR y desplegar el commit integrado.
- El dominio no bloquea el despliegue privado ni la verificación previa. Sí bloquea TLS público válido para el subdominio.
- Confirmar la IP pública real del servidor y que los puertos 80/443 llegan desde Internet antes de solicitar certificado.
- Riesgo alto: el proxy es compartido; conservar catch-all y certificado actuales. Tener copia/rollback de su configuración antes de tocarla.
- Riesgo alto: verificar origen permitido en CORS, rutas HTTP y upgrade WebSocket por hostname.
- No almacenar secretos en Git. El flujo desplegado debe usar configuración no versionada cuando aplique.

## Fases

### F0 — Inventario de preparación (`CLOSED`)

- **Pregunta:** ¿qué estado tienen el repo, el acceso al servidor y los puertos/servicios actuales?
- **Evidencia:** inspección Git local/remota, SSH de solo lectura, Docker y listeners; hechos confirmados listados arriba.
- **Veredicto:** `avanzar`; no se cambió el servidor.
- **Política de commit:** `COMMIT_REQUIRED` (este plan, handoff y evento de bitácora quedan en el commit de planificación).
- **Cierre previsto:** `docs(deploy): issue 13 F0 CLOSED readiness inventory`.

### F1 — Fijar el artefacto de lanzamiento (`WAITING_USER`)

- **Pregunta:** ¿qué commit/tag limpio se construirá y publicará?
- **Entrada:** `HEAD`, `origin/master`, diferencias locales y elección del usuario.
- **Salida:** SHA/tag aprobado y reproducible; si no existe, una tarea de consolidación de release acordada antes de continuar.
- **Criterio de avance:** un SHA/tag que se pueda hacer checkout sin modificaciones y que incluya el trabajo de producto que el usuario quiere publicar.
- **Criterio de bloqueo:** no poder separar cambios deseados de cambios experimentales o no aprobados.
- **Validación:** checkout limpio y SHA documentado; build reproducible en CI/local conforme al repo.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Cierre previsto:** `docs(deploy): issue 13 F1 CLOSED pin release source`.

### F2 — Preparar despliegue aislado y reproducible (`PENDING`)

- **Pregunta:** ¿puede la versión fijada construirse y ejecutarse en contenedores sin instalar Node en el host ni ocupar 80/443?
- **Salida:** Dockerfile(s)/Compose y guía que mantengan frontend/backend en puertos locales dedicados; cliente configurado para el hostname final sin hardcodear localhost; backend restringido según origen de producción; health/operación y rollback documentados.
- **Criterio de avance:** build correcto desde el SHA fijado y comprobaciones HTTP/API/Socket.IO en entorno local; puertos sin colisión con Mochila/Minecraft.
- **Pivote:** si no se puede construir offline, documentar dependencias/Node requeridos y usar build reproducible de CI, sin copiar el working tree sucio.
- **Política de commit:** `COMMIT_REQUIRED`.
- **Cierre previsto:** `feat(deploy): issue 13 F2 CLOSED containerize coup`.

### F3 — Desplegar en Hetzner sin exposición pública (`PENDING`)

- **Pregunta:** ¿funciona el stack en el host aislado y sobrevive a reinicio sin interferir con servicios actuales?
- **Salida:** Compose desplegado bajo `/opt/coup` o ruta acordada, bind solo a loopback/bridge privado, instrucciones de arranque/parada/rollback y evidencia de pruebas vía SSH tunnel.
- **Criterio de avance:** front, API, creación de sala y Socket.IO verificados; contenedores saludables tras recreación/reinicio; Nginx/Mochila/Minecraft siguen sanos.
- **Criterio de bloqueo:** requiere abrir un puerto público adicional o cambiar el proxy existente sin un plan reversible.
- **Política de commit:** `COMMIT_AFTER_REVIEW` (código/guía/evidencia en Git; estado remoto no se versiona).
- **Cierre previsto:** `ops(deploy): issue 13 F3 CLOSED stage on hetzner`.

### F4 — DNS, subdominio y TLS con GoDaddy (`PENDING`, depende del usuario)

- **Pregunta:** ¿resuelve `coup.<dominio>` al host y puede añadirse un vhost TLS sin alterar el tráfico existente?
- **Dependencia:** dominio comprado; registrar usuario identifica dominio exacto y confirma acceso DNS; IP pública comprobada; puertos 80/443 accesibles.
- **Salida:** solo cuando se autorice aplicar DNS/proxy: registro `A` con nombre `coup` e IP del servidor, TLS válido, proxy `/` al cliente y API/Socket.IO a backend, manteniendo el host default existente.
- **Criterio de avance:** HTTPS sirve app, endpoints API responden y negociación Socket.IO/WebSocket funciona; host anterior sigue respondiendo.
- **Bloqueo:** cambiar nameservers o tocar otros registros no es necesario; no hacerlo sin decisión explícita.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Cierre previsto:** `ops(deploy): issue 13 F4 CLOSED domain and tls`.

### F5 — Verificación adversarial y cierre (`PENDING`)

- **Pregunta:** ¿hay una petición o fallo razonable que rompa el tráfico existente, filtre una versión distinta o impida el juego?
- **Verifier:** independiente; intentará falsar aislamiento/rollback, rutas API, CORS, upgrade WebSocket, persistencia del servicio y TLS/vhost. No implementa fixes.
- **Criterio de cierre:** veredicto `PASS`, pasos de rollback probados/documentados, versión y salud actual registradas, PR integrado a `master` y issue actualizada.
- **Política de commit:** `COMMIT_REQUIRED`.
- **Cierre previsto:** `docs(deploy): issue 13 F5 CLOSED deployment verified`.

## Registro de decisiones

1. No hacer compras ni cambios DNS en esta unidad.
2. El despliegue previo a compra será privado, accesible mediante túnel SSH; evita exponer HTTP plano sobre la IP.
3. Conservar el proxy Docker actual y agregar una ruta por hostname solo después de verificar dominio/IP y preparar rollback.
4. El punto de partida de código no está decidido; no desplegar `origin/master` ni la copia local por defecto.

## Estado actual / siguiente acción

El inventario F0 está completo. La primera fase técnica F1 espera que el usuario indique qué commit/tag quiere publicar o que autorice consolidar el estado local antes de fijarlo. Mientras tanto, no instalar, copiar ni desplegar código en el servidor.

## Fuentes

- Issue: https://github.com/pronficilio/coup-online/issues/13
- Proyecto: `docs/plans/PROJECT_ORCHESTRATION.yaml`
- Log: `docs/plans/log/issue-13.jsonl`
- Handoff: `docs/plans/inbox/issue_13_hetzner_deployment.md`
