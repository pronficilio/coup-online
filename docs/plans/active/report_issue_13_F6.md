# Reporte independiente F6 — staging de Coup en Hetzner

**Veredicto de staging:** `BLOCKED` para cierre completo. **Pasan (`PASS`) las sondas de TLS, health, CORS HTTP, Socket.IO polling y WebSocket**; faltan confirmar un juego real, restart y rollback.
**Issue / PR:** [#13](https://github.com/pronficilio/coup-online/issues/13) / [#15](https://github.com/pronficilio/coup-online/pull/15), tracker `pronficilio/coup-online`.
**Worktree / branch:** `.worktrees/issue-13-hetzner-deployment` / `issue/13-hetzner-deployment`.
**HEAD examinado:** `ff840d17427317685522512b536fc31c13a9c5f6`.
**Objetivo:** staging `https://st-coup.ejele.net`, origen permitido esperado `https://st-coup.ejele.net`.
**Fecha de las sondas de staging:** 2026-10-04 UTC.

## Resultado de staging

Las pruebas externas fueron de solo lectura, excepto por dos salas temporales creadas con `GET /createNamespace` para el intento de flujo real. No se tocó producción, DNS, Nginx, Docker ni configuración. Los handshakes WebSocket se cerraron al terminar la sonda.

| Criterio | Resultado | Evidencia |
|---|---|---|
| TLS, vhost y app | **PASS** | `curl` validó el certificado TLS sin error. `GET https://st-coup.ejele.net/` devolvió 200. |
| Health del API | **PASS** | `GET https://st-coup.ejele.net/exists/healthcheck` devolvió 200 y `{"exists":false}`. ACAO fue exactamente `https://st-coup.ejele.net`. |
| Preflight HTTP, origen permitido | **PASS** | `OPTIONS /createNamespace` con `Origin: https://st-coup.ejele.net` devolvió 204 y `Access-Control-Allow-Origin: https://st-coup.ejele.net`. |
| Preflight HTTP, origen arbitrario | **PASS** | La misma preflight con `Origin: https://attacker.invalid` devolvió 403; no incluyó ACAO. |
| Socket.IO polling, origen permitido | **PASS** | `EIO=3&transport=polling` con origen de staging devolvió 200 y ACAO exacto `https://st-coup.ejele.net`. |
| Socket.IO polling, origen arbitrario | **PASS** | Polling con `Origin: https://attacker.invalid` devolvió 403. |
| Socket.IO WebSocket, origen permitido | **PASS** | Handshake TLS/WebSocket con origen de staging devolvió 101 Switching Protocols y paquete de apertura Engine.IO. La sonda terminó por timeout, esperado para una conexión persistente. |
| Socket.IO WebSocket, origen arbitrario | **PASS** | Mismo handshake con `Origin: https://attacker.invalid` devolvió 400 y `Origin not allowed`. |
| Dos jugadores y juego | **No verificado** | Se crearon dos salas temporales. La sonda Python de dos jugadores no obtuvo el ACK de namespace dentro del timeout; no se confirmó `joinSuccess`, `startGame` ni `g-updatePlayers`. El fallo del parser/sonda no se atribuye al servicio. No hubo cambios persistentes. |
| Restart del stack staging | **No verificado** | No se reinició ningún contenedor. |
| Rollback | **No verificado** | No se ejecutó rollback. Requiere autorización aparte porque cambia servicios/versiones. |

### Comandos reproducibles

```sh
curl -sS -D - https://st-coup.ejele.net/exists/healthcheck
curl -sS -D - -o /dev/null -X OPTIONS https://st-coup.ejele.net/createNamespace \
  -H 'Origin: https://st-coup.ejele.net' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: content-type'
curl -sS -D - -o /dev/null -X OPTIONS https://st-coup.ejele.net/createNamespace \
  -H 'Origin: https://attacker.invalid' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: content-type'
curl -sS -D - -o /dev/null --get https://st-coup.ejele.net/socket.io/ \
  --data-urlencode 'EIO=3' --data-urlencode 'transport=polling' \
  -H 'Origin: https://attacker.invalid'
```

Para WebSocket se usó `/socket.io/?EIO=3&transport=websocket`, versión 13, key válida y `Upgrade: websocket`, primero con Origin permitido y luego arbitrario. Los resultados fueron 101 y 400, respectivamente.

## Evidencia histórica de producción

En la revisión del 2026-10-03 se confirmó por SSH que la publicación vigente intencional era `ce53c28`, con API healthy, y el usuario aclaró que `55be894` en el plan era obsoleto. Las sondas públicas de producción de esa fecha refutaron el límite de origen: preflight con origen arbitrario devolvió ACAO `*`; polling Socket.IO reflejó `https://attacker.invalid` con `Access-Control-Allow-Credentials: true`; WebSocket desde ese origen respondió 101. Este hallazgo histórico no se volvió a probar durante la revisión de staging. Staging ahora rechaza ese origen en las pruebas descritas arriba; no se hizo rollout a producción.

El plan/handoff y PR #15 conservan referencias de releases antiguos; deben actualizarse por su responsable para reflejar el estado actual. Esa deuda documental queda separada de los resultados de los probes de staging.

## Cierre

Las sondas de staging para TLS, health, CORS HTTP, Socket.IO polling y WebSocket **pasan** y rechazan el origen arbitrario. El flujo de dos jugadores no se pudo confirmar, y restart y rollback no se probaron. Por eso F6 de staging queda `BLOCKED` para cierre completo; el estado de producción conserva el fallo histórico de CORS hasta una validación/rollout posterior.

No se modificó código de producto, configuración remota, plan, handoff, log, issue ni PR. `git diff --check` se ejecutó tras escribir este reporte.
