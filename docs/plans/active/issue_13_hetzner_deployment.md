# Issue #13 — Desplegar Coup Online en Hetzner

- **Issue:** https://github.com/pronficilio/coup-online/issues/13
- **Estado:** `IN_PROGRESS` — F0–F5 cerradas; producción sigue en `ce53c28`; staging aislado pasa las sondas de seguridad y recovery; PR #15 está en borrador y limpio; candidato `ff840d1` empaquetado/construido, no activado; falta partida completa y autorización de rollout.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` independiente.
- **Branch / worktree:** `issue/13-hetzner-deployment` / `.worktrees/issue-13-hetzner-deployment`
- **Integración:** un PR hacia `master`.
- **Solicitud original:** montar el repo en `sqf-hetzner`; comprobar lo necesario antes de comprar un dominio y explicar cómo apuntar el subdominio desde GoDaddy cuando exista.

## Objetivo y definición de éxito

Desplegar la versión aprobada con cliente React y backend Express/Socket.IO en el servidor Hetzner existente, publicar `coup.ejele.net` por HTTPS y reparar el certificado de Mochila en `ejele.net`, sin interferir con los servicios existentes.

Se considera terminado cuando la versión aprobada responde y permite crear/unirse a una partida, sobrevive a reinicios de contenedor, funciona con HTTPS y WebSocket detrás del proxy compartido, no interrumpe los servicios previos y hay pasos documentados para DNS/GoDaddy y rollback.

## Alcance y límites

Incluye identificar el artefacto de lanzamiento, preparar Docker Compose y configuración del proxy, desplegar y verificar Coup, configurar DNS/TLS una vez que exista el dominio, y documentar operación/rollback.

No incluye comprar un dominio, cambiar nameservers, desplegar cambios sin commit/tag aprobado, ni reemplazar o reconfigurar ampliamente Mochila, Minecraft, Nginx, SSH o firewall.

## Hechos confirmados

- Perfil operativo: repo `coup-online`; tracker GitHub; rama base y target `master`; control en `docs/plans`; ejecutor `alchemist`; verificador `verifier`; aislamiento Git worktree; logging JSONL append-only.
- El servidor accesible como `sqf-hetzner` es Debian 13, usuario remoto `root`, con Docker instalado y 17 GB libres en `/`. Node/NPM no están instalados en el host.
- Docker publica Nginx en 80/443. Su config vive en `/opt/mochila/deploy/nginx.conf`; el original se respaldó como `/opt/mochila/deploy/nginx.conf.bak-20260926`. Nginx conserva el fallback al certificado `mochila-ip` y el upstream Mochila en 8080. El vhost de `ejele.net` usa el nuevo certificado SAN; `www` redirige al apex; `coup` enruta al frontend/API.
- Coup usa backend Node en el puerto 8000 por defecto o `PORT`; cliente CRA obtiene URL del backend al compilar mediante `REACT_APP_BACKEND_URL`. Las rutas API son `/createNamespace` y `/exists/:namespace`, además de Socket.IO.
- F6 detectó CORS abierto y Socket.IO accesible desde un origen arbitrario en producción el 2026-10-03. La corrección está en `server/index.js`; el overlay de producción antiguo se eliminó para que no reemplace el código actual al empaquetar. El verificador confirmó en staging que HTTP, polling y WebSocket rechazan orígenes ajenos.
- El usuario confirmó que el único despliegue hecho desde que se abrió #13 es el que sigue activo: `ce53c28`, en `/opt/coup/releases/ce53c28`. La referencia anterior a `55be894` era histórica y quedó obsoleta; no es una discrepancia del runtime.
- GitHub no tenía una issue previa de despliegue. Issue #5 está cerrada; issue #6 permanece abierta.
- El usuario confirmó que compró `ejele.net`. La IP pública efectiva del servidor se verificó desde el host y un servicio externo: `178.105.138.91`.
- Nameservers públicos: `ns19.domaincontrol.com` y `ns20.domaincontrol.com` (GoDaddy). Cloudflare y Google DNS confirman `coup.ejele.net` → `178.105.138.91` (TTL 600 s), la IP pública Hetzner.
- No hay conexión habilitada a GoDaddy desde esta sesión; el usuario creó los A records y su propagación quedó verificada. No se cambiaron nameservers.

## Supuestos, preguntas y riesgos

- **Paso inmediato:** confirmar el flujo de juego en el entorno aislado `st-coup.ejele.net`, después acordar y planear un rollout/rollback de producción. Preservar la versión publicada y los demás servicios hasta esa decisión.
- **Versión desplegada aprobada por el propietario:** `ce53c28`, confirmada por el usuario y por inspección SSH el 2026-10-03. Esta confirmación reemplaza el supuesto histórico de `55be894`.
- El server de esa revisión tenía dependencias vulnerables. El artefacto de producción actualiza solo dependencias compatibles por lockfile y restringe el origen CORS a `https://coup.ejele.net`; permanecen cuatro avisos moderados del stack Socket.IO 2.x, cuya remediación automática requeriría una migración mayor.
- El árbol de build frontend reporta 81 advisories (incluye 35 high y 6 critical); el contenedor final de frontend contiene Nginx y archivos estáticos, no `node_modules`. Se requiere una actualización separada de esa toolchain.
- El usuario compró `ejele.net`; los A/CNAME ya resuelven y los tres hosts validaron HTTP-01.
- Riesgo alto: el proxy es compartido; conservar catch-all y certificado actuales. La config original tiene copia de seguridad y cada recarga pasó `nginx -t`.
- Riesgo alto: verificar origen permitido en CORS, rutas HTTP y upgrade WebSocket por hostname.
- No almacenar secretos en Git. El flujo desplegado debe usar configuración no versionada cuando aplique.

## Fases

### F0 — Inventario de preparación (`CLOSED`)

- **Pregunta:** ¿qué estado tienen el repo, el acceso al servidor y los puertos/servicios actuales?
- **Evidencia:** inspección Git local/remota, SSH de solo lectura, Docker y listeners; hechos confirmados listados arriba.
- **Veredicto:** `avanzar`; no se cambió el servidor.
- **Política de commit:** `COMMIT_REQUIRED` (este plan, handoff y evento de bitácora quedan en el commit de planificación).
- **Cierre previsto:** `docs(deploy): issue 13 F0 CLOSED readiness inventory`.

### F1 — Conectar el subdominio en DNS (`CLOSED`)

- **Pregunta:** ¿puede `coup.<dominio>` resolver a la IP pública correcta sin alterar otros registros del dominio?
- **Entrada:** dominio comprado `ejele.net`, DNS que el usuario administra en GoDaddy, estado observado de los registros e IP pública verificada `178.105.138.91`.
- **Salida:** registro A `coup → 178.105.138.91`, verificado por Cloudflare y Google DNS.
- **Criterio de avance:** `coup.ejele.net` resuelve a `178.105.138.91`; el registro raíz de `ejele.net` permanece intacto.
- **Veredicto:** `avanzar`; F1 cerrada.
- **Criterio de bloqueo:** si el A record cambia de nuevo, verificar el valor en GoDaddy antes de tocar el proxy.
- **Nota de publicación:** DNS solo apunta al host. Hasta desplegar Coup y configurar el vhost/certificado, el Nginx catch-all actual responderá al hostname; no anunciar ni usar el subdominio todavía.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Cierre previsto:** `docs(deploy): issue 13 F1 CLOSED connect coup dns`.

### F2 — Fijar el artefacto de lanzamiento (`CLOSED`)

- **Pregunta:** ¿qué commit/tag limpio se construirá y publicará?
- **Entrada:** `HEAD`, `origin/master`, diferencias locales y elección del usuario.
- **Salida:** SHA/tag aprobado y reproducible; si no existe, una tarea de consolidación de release acordada antes de continuar.
- **Criterio de avance:** un SHA/tag que se pueda hacer checkout sin modificaciones y que incluya el trabajo de producto que el usuario quiere publicar.
- **Criterio de bloqueo:** no poder separar cambios deseados de cambios experimentales o no aprobados.
- **Validación:** checkout limpio y SHA documentado; build reproducible en CI/local conforme al repo.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Cierre previsto:** `docs(deploy): issue 13 F2 CLOSED pin release source`.
- **Veredicto original:** `avanzar`; inicialmente se publicó el SHA `1e4685f0d079448fb6ca5df0aa0380632ffc2c7e`. El usuario pidió después sincronizar y montar la versión moderna; la versión activa ahora es `55be894` (ver actualización F4).

### F3 — Preparar despliegue aislado y reproducible (`CLOSED`)

- **Pregunta:** ¿puede la versión fijada construirse y ejecutarse en contenedores sin instalar Node en el host ni ocupar 80/443?
- **Salida:** Dockerfile(s)/Compose y guía que mantengan frontend/backend en puertos locales dedicados; cliente configurado para el hostname final sin hardcodear localhost; backend restringido según origen de producción; health/operación y rollback documentados.
- **Criterio de avance:** build correcto desde el SHA fijado y comprobaciones HTTP/API/Socket.IO en entorno local; puertos sin colisión con Mochila/Minecraft.
- **Pivote:** si no se puede construir offline, documentar dependencias/Node requeridos y usar build reproducible de CI, sin copiar el working tree sucio.
- **Política de commit:** `COMMIT_REQUIRED`.
- **Cierre:** `avanzar`; Compose y Dockerfiles construyen Node 24 y React estático desde el artefacto limpio; `docker compose config` valida; `npm ci` y build remoto pasan. CORS acepta Coup y rechaza otro origen en el API Socket.IO local.
- **Cierre previsto:** `feat(deploy): issue 13 F3 CLOSED containerize coup`.
- **Limitación:** el backend queda con cuatro avisos npm moderados en Socket.IO 2.x. Resolverlos requeriría migrar el protocolo cliente/servidor; no se hizo en esta publicación.

### F4 — Desplegar en Hetzner (`CLOSED`)

- **Pregunta:** ¿funciona el stack en el host aislado y sobrevive a reinicio sin interferir con servicios actuales?
- **Salida:** release moderno bajo `/opt/coup/releases/55be894`, solo en `mochila_default`, sin puertos del host publicados; release anterior `1e4685f` conservado para rollback.
- **Criterio de avance:** front/API/crear/unirse a sala/WebSocket comprobados; API reiniciada y recuperada `healthy`; Mochila, Nginx y Minecraft siguieron `Up`.
- **Criterio de bloqueo:** requiere abrir un puerto público adicional o cambiar el proxy existente sin un plan reversible.
- **Política de commit:** `COMMIT_AFTER_REVIEW` (código/guía/evidencia en Git; estado remoto no se versiona).
- **Veredicto inicial:** `avanzar`; el primer release estuvo saludable y una prueba creó/unió una sala con upgrade a WebSocket.
- **Actualización moderna (2026-09-27 UTC):** `coup-api:55be894` y `coup-web:55be894` construidos y activos. API `healthy`; `https://coup.ejele.net/` y `/exists/healthcheck` responden 200; se sirve el bundle `main.3e4eee39.js`. Mochila `https://ejele.net/` responde 200 por GET y Mochila/Minecraft siguen activos. La compilación React completó con warnings de imports sin uso y Browserslist desactualizado.
- **Cierre previsto:** `ops(deploy): issue 13 F4 CLOSED stage on hetzner`.

### F5 — Vhost público y TLS (`CLOSED`)

- **Pregunta:** ¿puede servirse `coup.<dominio>` por HTTPS y enrutar API/Socket.IO sin alterar el tráfico existente?
- **Dependencia:** F1 resuelto; `ejele.net` comprado y DNS a `178.105.138.91`.
- **Salida:** añadir un vhost TLS, proxy `/` al cliente y API/Socket.IO al backend, manteniendo el host default y certificado existentes.
- **Criterio de avance:** HTTPS sirve app, endpoints API responden y negociación Socket.IO/WebSocket funciona; host anterior sigue respondiendo.
- **Bloqueo:** cambiar nameservers o tocar otros registros no es necesario; no hacerlo sin decisión explícita.
- **Política de commit:** `COMMIT_AFTER_REVIEW`.
- **Veredicto:** `avanzar`; Certbot emitió SAN `ejele.net`, `www.ejele.net`, `coup.ejele.net`, válido hasta 2026-12-25. HTTP redirige, `www` redirige al apex, los tres hosts pasan validación TLS y Coup sirve API/cliente/Socket.IO. Renovación automática systemd activada; staging dry-run y servicio systemd ejecutados con éxito. Mochila y Minecraft siguieron activos.
- **Cierre previsto:** `ops(deploy): issue 13 F5 CLOSED domain and tls`.
- **Cambio de alcance aprobado por el usuario:** reparar TLS de Mochila en `ejele.net` y servir Coup en `coup.ejele.net`, compartiendo el Nginx ya activo.

### F6 — Verificación adversarial y cierre (`PENDING`)

- **Pregunta:** ¿puede un origen arbitrario obtener acceso CORS o establecer Socket.IO, y sigue funcionando el juego válido tras bloquearlo?
- **Verifier:** independiente; probó `st-coup.ejele.net` contra CORS HTTP/Socket.IO y WebSocket, además de TLS y health. No implementó fixes.
- **Criterio de cierre:** staging acepta `https://st-coup.ejele.net`, rechaza origen ajeno en API, polling y WebSocket, y un cliente completa una partida; la instancia sobrevive restart. Coup producción, Mochila y Minecraft permanecen sanos; el rollout y rollback de producción quedan acordados y documentados antes de cerrar #13.
- **Estado del verifier:** reporte independiente actualizado el 2026-10-04: staging `PASS` en TLS, health, CORS HTTP, polling y WebSocket. Su intento de dos jugadores expiró por un problema de parser en la sonda, no atribuido al servicio. Después, el Orquestador conectó dos clientes Socket.IO con el Origin de staging y ambos recibieron `joinSuccess` por polling; esto confirma entrada a lobby, no el inicio de una partida ni el upgrade del cliente a WebSocket. El fallo observado en producción el 2026-10-03 permanece como evidencia histórica; no se hizo rollout.
- **Staging:** el usuario autorizó usar `st-coup.ejele.net`, cuyo A apunta a `178.105.138.91`. Compose separado `st-coup`, imágenes/contendores únicos, sin puertos publicados ni runner Codex; certificado separado y timer propio. El API y web están healthy/Up tras reinicio de staging realizado el 2026-10-04; HTTPS y health volvieron a responder 200.
- **PR:** #15 en borrador, listo para revisión pero no para integrar.
- **Política de commit:** `COMMIT_REQUIRED`.
- **Cierre previsto:** `docs(deploy): issue 13 F6 CLOSED deployment verified`.

## Registro de decisiones

1. El usuario confirmó el 2026-10-03 que `ce53c28` es el último despliegue y release intencional desde la apertura histórica de #13; no se considera que la app deba retroceder a `55be894`.
2. El usuario aprobó usar `st-coup.ejele.net` como staging reutilizable. El A record resuelve al mismo host `178.105.138.91`; Coup producción permanece en el vhost e imagen actuales.
3. No instalar Caddy; mantener el Nginx compartido que ya ocupa 80/443.
4. Preservar el catch-all/mochila-ip; el cambio añade un vhost dedicado de staging, con backup, `nginx -t` y reload validado.
5. El stack de staging no publica puertos del host; Nginx enruta por la red externa existente.

## Estado actual / siguiente acción

El release público vigente es `ce53c28`; no se modificó. El fix está desplegado solo en `st-coup.ejele.net`. El verificador independiente confirmó TLS, health, origen permitido y rechazo de origen hostil en HTTP, polling y WebSocket; Certbot dry-run pasó y el timer está habilitado. Dos clientes Socket.IO de staging recibieron `joinSuccess` al entrar al lobby por polling (prueba del Orquestador; no inició una partida ni confirmó WebSocket de extremo a extremo). Un reinicio de los dos contenedores de staging recuperó API `healthy`, web `Up`, home 200 y health 200. El candidato de producción `ff840d1` está en `/opt/coup/releases/ff840d1` y sus imágenes están construidas, pero producción continúa con `ce53c28`. La reversión está documentada; volver a `ce53c28` reabre CORS, así que sería solo para recuperar disponibilidad. Falta validar el juego completo y la autorización para activar el candidato. PR #15 continúa en borrador.

## Fuentes

- Issue: https://github.com/pronficilio/coup-online/issues/13
- PR: https://github.com/pronficilio/coup-online/pull/15
- Proyecto: `docs/plans/PROJECT_ORCHESTRATION.yaml`
- Log: `docs/plans/log/issue-13.jsonl`
- Handoff: `docs/plans/inbox/issue_13_hetzner_deployment.md`
