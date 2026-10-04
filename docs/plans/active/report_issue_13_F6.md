# Reporte independiente F6 — despliegue de Coup en Hetzner

**Veredicto F6:** `BLOCKED` para cierre completo: las sondas de producción pasan, pero no se verificaron un juego real, restart ni rollback.
**Sondas de producción:** `PASS` para TLS/home/health, CORS HTTP y Socket.IO polling/WebSocket con origen permitido y arbitrario.
**Issue / PR:** [#13](https://github.com/pronficilio/coup-online/issues/13) / [#15](https://github.com/pronficilio/coup-online/pull/15), tracker `pronficilio/coup-online`.
**Worktree / branch / HEAD:** `.worktrees/issue-13-hetzner-deployment` / `issue/13-hetzner-deployment` / `44c468dcc5bbdc896e4df79574e25c13c45bf88a`.
**Producción verificada:** `https://coup.ejele.net`, imagen activa `ff840d1`.
**Fecha:** 2026-10-04 UTC.

## Evidencia de producción

Las peticiones públicas se ejecutaron secuencialmente después de que staging se aislara con nombres propios de servicio. No se creó ninguna sala, no se enviaron eventos de juego y no se cambió configuración ni versión.

| Criterio | Resultado | Evidencia |
|---|---|---|
| TLS, vhost y home | **PASS** | `GET https://coup.ejele.net/` validó TLS y devolvió 200. |
| Health | **PASS** | `GET /exists/healthcheck` con `Origin: https://coup.ejele.net` devolvió 200 y `Access-Control-Allow-Origin: https://coup.ejele.net`. |
| CORS HTTP permitido | **PASS** | `OPTIONS /createNamespace` con `Origin: https://coup.ejele.net` devolvió 204 y ACAO exacto. |
| CORS HTTP arbitrario | **PASS** | Misma preflight con `Origin: https://attacker.invalid` devolvió 403 sin ACAO. |
| Socket.IO polling permitido | **PASS** | `EIO=3&transport=polling` con el origen Coup devolvió 200, ACAO exacto y `Access-Control-Allow-Credentials: true`. |
| Socket.IO polling arbitrario | **PASS** | Polling con `Origin: https://attacker.invalid` devolvió 403. |
| Socket.IO WebSocket permitido | **PASS** | Handshake TLS/WebSocket con origen Coup devolvió 101 Switching Protocols y paquete Engine.IO. `curl` cerró la sonda persistente al cumplirse el límite de 2 s. |
| Socket.IO WebSocket arbitrario | **PASS** | Mismo handshake con `Origin: https://attacker.invalid` devolvió 400 `Origin not allowed`. |
| Runtime y coexistencia | **PASS** | Inspección SSH 2026-10-04 06:22 UTC: `deploy-coup-api-1` y `deploy-coup-web-1` usan `ff840d1`; API healthy. `mochila-api-1`, `mochila-worker-1`, `mochila-proxy-1`, `mc-forge` están activos; Minecraft healthy. `st-coup-api` y `st-coup-web` siguen separados y activos. |
| Juego real | **No verificado** | No se creó sala ni se conectaron jugadores, según el límite de esta revalidación. |
| Restart y rollback | **No verificados** | No se reinició ningún servicio ni se cambió versión. |

### Reproducción mínima

```sh
curl -sS -D - -o /dev/null https://coup.ejele.net/
curl -sS -D - https://coup.ejele.net/exists/healthcheck \
  -H 'Origin: https://coup.ejele.net'
curl -sS -D - -o /dev/null -X OPTIONS https://coup.ejele.net/createNamespace \
  -H 'Origin: https://coup.ejele.net' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: content-type'
curl -sS -D - -o /dev/null -X OPTIONS https://coup.ejele.net/createNamespace \
  -H 'Origin: https://attacker.invalid' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: content-type'
curl -sS -D - -o /dev/null --get https://coup.ejele.net/socket.io/ \
  --data-urlencode 'EIO=3' --data-urlencode 'transport=polling' \
  -H 'Origin: https://coup.ejele.net'
curl -sS -D - -o /dev/null --get https://coup.ejele.net/socket.io/ \
  --data-urlencode 'EIO=3' --data-urlencode 'transport=polling' \
  -H 'Origin: https://attacker.invalid'
```

WebSocket probes used `/socket.io/?EIO=3&transport=websocket`, `Upgrade: websocket`, version 13, a valid key and first the allowed, then arbitrary Origin. Results: 101 and 400.

Runtime inspection (read-only):

```sh
ssh sqf-hetzner 'docker ps --format "{{.Names}} {{.Image}} {{.Status}}"'
ssh sqf-hetzner 'docker inspect deploy-coup-api-1 --format "{{.Config.Image}} {{.State.Health.Status}} {{index .Config.Labels \"com.docker.compose.project.working_dir\"}}"'
```

## Historial de staging y sondas previas

En staging (`st-coup.ejele.net`, también con imagen `ff840d1`) las sondas del 2026-10-04 pasaron: home/TLS y health 200, preflight permitido 204 con ACAO exacto y origen arbitrario 403, polling permitido 200 y arbitrario 403, WebSocket permitido 101 y arbitrario 400. El intento previo de dos jugadores no confirmó ACK de namespace; por tanto juego, restart y rollback siguen sin verificar en staging.

Antes de aislar los aliases Docker de staging, una secuencia pública preliminar recibió 403 para los dos orígenes en preflight/polling y WebSocket; una preflight directa al API respondió 204 para el origen Coup y 403 para el arbitrario. Esos resultados fueron tomados durante la colisión de aliases identificada por el orquestador y quedan supersedidos por las sondas públicas secuenciales posteriores, ya reflejadas arriba. La revalidación actual se hizo después de que el orquestador confirmó servicios staging `st-coup-api`/`st-coup-web` y aliases productivos únicos.

La evidencia del 2026-10-03 en la que producción devolvía ACAO `*` y aceptaba un origen arbitrario también queda histórica: no coincide con el runtime `ff840d1` revalidado el 2026-10-04.

## Cierre

La superficie pública de producción pasa las pruebas de TLS, salud y restricción de origen para HTTP y ambos transportes Socket.IO. No se intentó demostrar el flujo de juego porque esta revalidación fue estrictamente de solo lectura; el test anterior de staging tampoco obtuvo un ACK de namespace. Restart y rollback no se probaron. Por ello el veredicto F6 completo permanece `BLOCKED`, aunque las sondas de producción indicadas pasan.

No se reinició ni mutó producción, no se crearon salas y no se modificó configuración remota, plan, handoff, log, issue o PR. `git diff --check` pasó tras actualizar este reporte.
