# Reporte independiente F6 — despliegue de Coup en Hetzner

**Veredicto:** `FAIL` — se refuta la restricción documentada para CORS y orígenes de Socket.IO.
**Issue / PR:** [#13](https://github.com/pronficilio/coup-online/issues/13) / [#15](https://github.com/pronficilio/coup-online/pull/15), consultados explícitamente en `pronficilio/coup-online`.
**Branch / worktree:** `issue/13-hetzner-deployment` / `.worktrees/issue-13-hetzner-deployment`.
**Commit del worktree:** `ce2e04f2b66daead3e48d2c36286568549e64051`.
**Release vigente confirmado por el usuario:** `ce53c28`.
**Fechas de verificación:** 2026-09-30 y revalidación 2026-10-03 UTC.

## Claim y alcance

**CLAIM:** el release actualmente publicado e intencional está activo tras el proxy compartido, limita CORS/Socket.IO al origen de Coup, sirve API y juego por HTTPS/WebSocket, conserva Mochila/Minecraft y tiene rollback operativo. El usuario confirmó que `ce53c28` es el despliegue vigente; issue #13 es histórica y el plan que identifica `55be894` quedó obsoleto.

La prueba fue de caja negra y de solo lectura, salvo una sala temporal creada con la API. No se modificó configuración ni versión en producción. No se ejecutaron build o tests locales porque la evidencia remota ya refuta el claim.

## Matriz de evidencia

| Criterio | Resultado | Evidencia |
|---|---|---|
| Release vigente y salud | Pasa con aclaración | El usuario confirma `ce53c28` como versión actualmente publicada e intencional. Revisión SSH 2026-10-03: API/web `coup-api:ce53c28` / `coup-web:ce53c28`, API `Up 3 days (healthy)`, directorio activo `/opt/coup/releases/ce53c28/deploy`; también corre `codex-ai.compose.yml` y su runner está healthy. Esto coincide con la aclaración del usuario. El plan/handoff que señala `55be894` debe corregirse; su obsolescencia no se cuenta como fallo del despliegue. |
| API y rutas | Pasa parcialmente | `GET https://coup.ejele.net/exists/healthcheck` devolvió 200. `GET /createNamespace` devolvió una sala temporal y `GET /exists/<id>` devolvió `{"exists":true}` al consultarla inmediatamente. |
| CORS HTTP | **Falla** | Revalidado 2026-10-03: preflight `OPTIONS /createNamespace` con `Origin: https://attacker.invalid` devolvió 204, `Access-Control-Allow-Origin: *` y permitió GET, HEAD, PUT, PATCH, POST y DELETE. En 2026-09-30 healthcheck/exists también respondieron con `*`. |
| Socket.IO / origen | **Falla de aislamiento; upgrade disponible** | Revalidado 2026-10-03: handshake `EIO=3&transport=polling` con `Origin: https://attacker.invalid` devolvió 200, `Access-Control-Allow-Origin: https://attacker.invalid` y `Access-Control-Allow-Credentials: true`. Un handshake WebSocket con el mismo Origin devolvió `101 Switching Protocols` y paquete de apertura. El probe cerró por timeout tras recibir ese paquete; el 101 sí confirma que se aceptó el upgrade desde un origen externo. |
| Juego real mediante Socket.IO | No confirmado | La API creó una sala y el endpoint `exists` la confirmó. No se completó `setName`/`joinSuccess`: el intento de cliente WebSocket temporal falló por un error de quoting en el comando Python antes de abrir la conexión. No se afirma que un jugador haya entrado. |
| TLS/vhosts y coexistencia observada | Pasa en comprobaciones limitadas | `curl` validó TLS sin error. `GET https://coup.ejele.net/exists/healthcheck` devolvió 200; `GET https://ejele.net/` devolvió 200; `GET https://www.ejele.net/` devolvió 301 a `https://ejele.net/`. Reinspección SSH 2026-10-03 mostró `mochila-api-1`, `mochila-worker-1`, `mochila-proxy-1` y `mc-forge` activos; Minecraft reportó healthy. |
| Salud tras restart | No repetido durante esta verificación | En 2026-10-03 el API figuraba `Up 3 days (healthy)`. No se reinició producción para probar recuperación. |
| Rollback | No probado | El procedimiento publicado invoca `docker compose up -d` desde el release `1e4685f`, lo que cambia servicios/versión en producción. No se ejecutó: falta autorización específica para ese cambio y para restaurar el release previo tras la prueba. |

## Reproducción mínima

Comprobaciones públicas efectuadas:

```sh
curl -sS -D - https://coup.ejele.net/exists/healthcheck
curl -sS -D - -X OPTIONS https://coup.ejele.net/createNamespace \
  -H 'Origin: https://attacker.invalid' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: content-type'
curl -sS -D - --get https://coup.ejele.net/socket.io/ \
  --data-urlencode 'EIO=3' --data-urlencode 'transport=polling' \
  -H 'Origin: https://attacker.invalid'
```

El 2026-10-03 se repitieron preflight CORS, polling y WebSocket; resultados: 204 con ACAO `*`, 200 con ACAO reflejado y credenciales, y 101 respectivamente. Para WebSocket se enviaron `Upgrade: websocket`, `Sec-WebSocket-Version: 13`, una key válida y el mismo header `Origin`. La conexión se cerró por timeout de la sonda después de recibir el paquete de apertura; no se contó como join de sala.

Inspección del servidor, solo lectura, revalidada el 2026-10-03:

```sh
ssh sqf-hetzner 'docker ps --format "{{.Names}} {{.Image}} {{.Status}}"'
ssh sqf-hetzner 'docker inspect deploy-coup-api-1 --format "{{.Config.Image}} {{index .Config.Labels \"com.docker.compose.project.working_dir\"}}"'
```

La inspección confirmó `coup-api:ce53c28`, `coup-web:ce53c28`, API healthy por tres días y Compose activo en `/opt/coup/releases/ce53c28/deploy`. Esto concuerda con la aclaración del usuario de que `ce53c28` es el release vigente intencional. El plan/handoff de issue #13 y el cuerpo de PR #15 conservan referencias antiguas (`55be894` y `1e4685f…`); deben actualizarse para reflejar el estado actual, pero esa documentación obsoleta no es un fallo del runtime para este veredicto.

## Aprobaciones y límites

- Se obtuvo aprobación de acceso externo para consultar issue/PR del fork y hacer SSH/curl de lectura y pruebas HTTP/Socket.IO no destructivas.
- No se pidió ni recibió aprobación para cambiar la versión activa o hacer rollback en producción; esa validación queda pendiente.
- El usuario confirmó que el runtime `ce53c28` observado es la publicación vigente e intencional; el plan/handoff histórico queda pendiente de corrección por su responsable.
- No se revelan cookies, SID ni otros valores de sesión. No se modificó el producto, plan, handoff, log, issue o PR.

## Cierre

**F6 = `FAIL`.** El release vigente y sus servicios fueron confirmados y están saludables, pero la restricción de CORS/Socket.IO declarada no coincide con las respuestas reproducidas desde `https://attacker.invalid`. No se confirmó join de juego con un cliente real, no se probó reinicio controlado y rollback real sigue sin verificarse ni autorizarse. El plan/handoff necesita actualizar su SHA histórico, pero esa discrepancia no se contabiliza como fallo tras la aclaración del usuario.
