# Issue #13 — Desplegar Coup Online en Hetzner

- **Issue:** https://github.com/pronficilio/coup-online/issues/13
- **Estado:** `WAITING_USER` — corregir el registro DNS de GoDaddy para `coup.ejele.net`.
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
- El usuario confirmó que compró `ejele.net`. La IP pública efectiva del servidor se verificó desde el host y un servicio externo: `178.105.138.91`.
- Consulta DNS desde el servidor: `ejele.net` → `15.197.148.33`; `ejele.ejele.net` → `178.108.138.91`; `coup.ejele.net` no resuelve. El registro añadido con nombre `ejele` apunta a un hostname duplicado y la IP observada no coincide con Hetzner.
- No hay conexión habilitada a GoDaddy desde esta sesión; la edición del registro se hará en su panel cuando tengamos el hostname exacto. No se han cambiado DNS ni nameservers.

## Supuestos, preguntas y riesgos

- **Paso inmediato:** en GoDaddy reemplazar/eliminar el registro `A` con nombre `ejele` que creó `ejele.ejele.net`; crear `A` con nombre `coup` y valor `178.105.138.91`. Preservar el registro raíz de `ejele.net` y cualquier otro servicio.
- **Pregunta que bloquea publicar código:** ¿qué commit/tag debe representar el lanzamiento? Alternativas: seleccionar un commit/tag existente o consolidar primero el checkout actual en una rama/PR y desplegar el commit integrado.
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

### F1 — Conectar el subdominio en DNS (`WAITING_USER`)

- **Pregunta:** ¿puede `coup.<dominio>` resolver a la IP pública correcta sin alterar otros registros del dominio?
- **Entrada:** dominio comprado `ejele.net`, DNS que el usuario administra en GoDaddy, estado observado de los registros e IP pública verificada `178.105.138.91`.
- **Salida:** un registro `A` con nombre `coup` y valor `178.105.138.91`; registrar TTL y resolver públicamente el hostname.
- **Criterio de avance:** `coup.ejele.net` resuelve a `178.105.138.91`; el registro raíz de `ejele.net` permanece intacto.
- **Criterio de bloqueo:** GoDaddy no es el DNS autoritativo, existe ya otro `coup` con propósito no claro, o `coup` sigue apuntando a otra IP.
- **Nota de publicación:** DNS solo apunta al host. Hasta desplegar Coup y configurar el vhost/certificado, el Nginx catch-all actual responderá al hostname; no anunciar ni usar el subdominio todavía.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Cierre previsto:** `docs(deploy): issue 13 F1 CLOSED connect coup dns`.

### F2 — Fijar el artefacto de lanzamiento (`WAITING_USER`)

- **Pregunta:** ¿qué commit/tag limpio se construirá y publicará?
- **Entrada:** `HEAD`, `origin/master`, diferencias locales y elección del usuario.
- **Salida:** SHA/tag aprobado y reproducible; si no existe, una tarea de consolidación de release acordada antes de continuar.
- **Criterio de avance:** un SHA/tag que se pueda hacer checkout sin modificaciones y que incluya el trabajo de producto que el usuario quiere publicar.
- **Criterio de bloqueo:** no poder separar cambios deseados de cambios experimentales o no aprobados.
- **Validación:** checkout limpio y SHA documentado; build reproducible en CI/local conforme al repo.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Cierre previsto:** `docs(deploy): issue 13 F1 CLOSED pin release source`.

### F3 — Preparar despliegue aislado y reproducible (`PENDING`)

- **Pregunta:** ¿puede la versión fijada construirse y ejecutarse en contenedores sin instalar Node en el host ni ocupar 80/443?
- **Salida:** Dockerfile(s)/Compose y guía que mantengan frontend/backend en puertos locales dedicados; cliente configurado para el hostname final sin hardcodear localhost; backend restringido según origen de producción; health/operación y rollback documentados.
- **Criterio de avance:** build correcto desde el SHA fijado y comprobaciones HTTP/API/Socket.IO en entorno local; puertos sin colisión con Mochila/Minecraft.
- **Pivote:** si no se puede construir offline, documentar dependencias/Node requeridos y usar build reproducible de CI, sin copiar el working tree sucio.
- **Política de commit:** `COMMIT_REQUIRED`.
- **Cierre previsto:** `feat(deploy): issue 13 F2 CLOSED containerize coup`.

### F4 — Desplegar en Hetzner sin exposición pública (`PENDING`)

- **Pregunta:** ¿funciona el stack en el host aislado y sobrevive a reinicio sin interferir con servicios actuales?
- **Salida:** Compose desplegado bajo `/opt/coup` o ruta acordada, bind solo a loopback/bridge privado, instrucciones de arranque/parada/rollback y evidencia de pruebas vía SSH tunnel.
- **Criterio de avance:** front, API, creación de sala y Socket.IO verificados; contenedores saludables tras recreación/reinicio; Nginx/Mochila/Minecraft siguen sanos.
- **Criterio de bloqueo:** requiere abrir un puerto público adicional o cambiar el proxy existente sin un plan reversible.
- **Política de commit:** `COMMIT_AFTER_REVIEW` (código/guía/evidencia en Git; estado remoto no se versiona).
- **Cierre previsto:** `ops(deploy): issue 13 F3 CLOSED stage on hetzner`.

### F5 — Vhost público y TLS (`PENDING`, depende de F1 y compra/DNS)

- **Pregunta:** ¿puede servirse `coup.<dominio>` por HTTPS y enrutar API/Socket.IO sin alterar el tráfico existente?
- **Dependencia:** F1 resuelto; dominio comprado; DNS apunta a la IP; puertos 80/443 accesibles.
- **Salida:** añadir un vhost TLS, proxy `/` al cliente y API/Socket.IO al backend, manteniendo el host default y certificado existentes.
- **Criterio de avance:** HTTPS sirve app, endpoints API responden y negociación Socket.IO/WebSocket funciona; host anterior sigue respondiendo.
- **Bloqueo:** cambiar nameservers o tocar otros registros no es necesario; no hacerlo sin decisión explícita.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Cierre previsto:** `ops(deploy): issue 13 F5 CLOSED domain and tls`.

### F6 — Verificación adversarial y cierre (`PENDING`)

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

El inventario F0 está completo; el dominio comprado es `ejele.net` y la IP pública es `178.105.138.91`. F1 está bloqueada por el registro actual: `ejele.ejele.net` resuelve a `178.108.138.91` y `coup.ejele.net` no resuelve. Corregir el nombre a `coup` y el valor a `178.105.138.91`, conservando la raíz. En paralelo, F2 espera elegir el commit/tag limpio. No instalar, copiar ni desplegar código hasta fijarlo.

## Fuentes

- Issue: https://github.com/pronficilio/coup-online/issues/13
- Proyecto: `docs/plans/PROJECT_ORCHESTRATION.yaml`
- Log: `docs/plans/log/issue-13.jsonl`
- Handoff: `docs/plans/inbox/issue_13_hetzner_deployment.md`
