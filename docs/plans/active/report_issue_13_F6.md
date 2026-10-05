# Reporte independiente F6 — despliegue de Coup en Hetzner

**Veredicto de seguridad de Origin/Referer:** `PASS` — staging y producción aceptan las combinaciones same-origin y rechazan Origin/Referer ajenos o ausentes.
**F6 completo:** `BLOCKED` para cierre: producción recuperó healthy tras recrear API/web en el rollout; falta confirmar el flujo desde el navegador y no se ensayó rollback.
**Issue / PR:** [#13](https://github.com/pronficilio/coup-online/issues/13) / [#15](https://github.com/pronficilio/coup-online/pull/15), tracker `pronficilio/coup-online`.
**Worktree / branch / commit:** `.worktrees/issue-13-hetzner-deployment` / `issue/13-hetzner-deployment` / `070c14f95f48ff9e12d56099c0a7cf6f934cbb44`.
**Fecha:** 2026-10-05 UTC.

## Producción — comprobación pública de solo lectura

Las solicitudes se ejecutaron en serie contra `https://coup.ejele.net`. No creé salas, no envié eventos de juego y no modifiqué ni reinicié servicios.

| Headers de petición | Polling | WebSocket | Resultado |
|---|---:|---:|---|
| Sin Origin; `Referer: https://coup.ejele.net/create` | 200; ACAO `*`, sin `Access-Control-Allow-Credentials` | 101 y paquete Engine.IO | **Aceptado.** |
| `Origin: https://coup.ejele.net` | 200; ACAO exacto y `Access-Control-Allow-Credentials: true` | 101 y paquete Engine.IO | **Aceptado.** |
| `Origin: https://attacker.invalid` | 403 | 400 `Origin not allowed` | **Rechazado.** |
| Sin Origin; `Referer: https://attacker.invalid/page` | 403 | 400 `Origin not allowed` | **Rechazado.** |
| Sin Origin ni Referer | 403 | 400 `Origin not allowed` | **Rechazado.** |

`GET /` validó TLS y devolvió 200. `GET /exists/healthcheck` con Referer same-origin y sin Origin devolvió 200; también devolvió 200 con Origin explícito permitido. En ambos casos ACAO fue `https://coup.ejele.net`.

Los WebSocket permitidos devolvieron `101 Switching Protocols` y un paquete Engine.IO; curl cerró el socket persistente al llegar al límite de 2 s. Los tres casos rechazados no negociaron upgrade.

### Reproducción mínima de producción

```sh
curl -sS -D - -o /dev/null https://coup.ejele.net/
curl -sS -D - https://coup.ejele.net/exists/healthcheck \
  -H 'Referer: https://coup.ejele.net/create'
curl -sS -D - -o /dev/null --get https://coup.ejele.net/socket.io/ \
  --data-urlencode 'EIO=3' --data-urlencode 'transport=polling' \
  -H 'Referer: https://coup.ejele.net/create'
curl -sS -D - -o /dev/null --get https://coup.ejele.net/socket.io/ \
  --data-urlencode 'EIO=3' --data-urlencode 'transport=polling' \
  -H 'Origin: https://attacker.invalid'
curl -sS -D - -o /dev/null --get https://coup.ejele.net/socket.io/ \
  --data-urlencode 'EIO=3' --data-urlencode 'transport=polling'
```

Se repitieron las cinco combinaciones para `/socket.io/?EIO=3&transport=websocket`, enviando `Upgrade: websocket`, versión 13 y una key válida.

## Runtime y coexistencia

La inspección SSH de solo lectura del 2026-10-05 confirmó:

- `deploy-coup-api-1`: `coup-api:070c14f`, `running (healthy)`.
- `deploy-coup-web-1`: `coup-web:070c14f`, `running`.
- `deploy-coup-codex-runner-1`: `ce53c28`, `running (healthy)`.
- `mochila-api-1`, `mochila-worker-1`, `mochila-proxy-1` y `mochila-redis-1`: activos.
- `mc-forge`: activo y healthy.
- `st-coup-api` y `st-coup-web`: `070c14f`; API healthy y web activo. La primera lectura breve vio `health: starting` tras recreación; una segunda lectura después de las sondas confirmó `healthy`.

Producción y staging usan contenedores separados. La excepción temporal observada se limitó a que staging acababa de recrearse cuando se tomó la primera lectura; quedó saludable en la comprobación posterior. Durante el rollout del Orquestador a `070c14f`, producción recreó API/web y `docker compose up --wait` confirmó ambos `healthy`/`running`. Esto demuestra recuperación durante el despliegue, no un reinicio deliberado posterior.

## Staging — evidencia funcional de `070c14f`

El 2026-10-05 probé en staging la misma matriz de Origin/Referer: polling permitió Referer same-origin sin Origin (200) y Origin exacto (200); rechazó Origin hostil, Referer hostil y ausencia total (403). WebSocket permitió los dos casos same-origin (101) y rechazó los tres hostiles/ausentes (400 `Origin not allowed`). TLS/home y health pasaron.

Además, creé una sala temporal y abrí dos clientes Engine.IO/Socket.IO HTTP polling manuales, ambos sin Origin y con `Referer: https://st-coup.ejele.net/create`. El servidor confirmó `joinSuccess` para ambos, `readyConfirm`, `startGame` y `g-updatePlayers`. Cerré las sesiones al terminar. Esto verifica el protocolo contra el servidor staging, pero no sustituye una prueba en el navegador con el bundle React.

## Regresión encontrada y corregida

La versión de producción anterior, `ff840d1`, hacía que el navegador recibiera
`/createNamespace` con HTTP 200 pero que el polling de Socket.IO fallara con
403. Socket.IO 2.5 entrega al callback el Origin o, si no existe, el Referer
completo (`https://coup.ejele.net/create`); la comparación literal rechazaba
esa URL same-origin. `070c14f` compara su `URL.origin`. La matriz anterior pasa
en staging y producción tras el cambio.

## Riesgos de política y objeciones al cierre

- No observé un fallo en la matriz solicitada. Origin/Referer limita navegadores; no es autenticación, ya que clientes no-browser pueden falsificar esos headers. El lobby debe seguir considerándose público.
- En polling sin Origin, Engine.IO devuelve ACAO `*` y no `Access-Control-Allow-Credentials`; same-origin funcionó en staging y producción. Conviene conservar una prueba en navegador real.
- El home no publica `Referrer-Policy` explícito. Si un navegador/extensión elimina Referer y no envía Origin, la conexión falla de forma cerrada. El cliente de polling probado sí mandó el Referer esperado.
- No hice un restart deliberado independiente tras el rollout. Este recreó API/web y la salud volvió; staging además pasó un reinicio deliberado. No probé rollback porque `ce53c28` vuelve a exponer CORS; su uso está documentado solo como recuperación temporal. La comprobación del navegador real sigue pendiente. No hay objeción a la política Origin/Referer validada.

## Conclusión

Las sondas públicas de producción pasan para TLS, health y los casos de polling/WebSocket permitidos y rechazados. SSH confirma `070c14f` saludable y coexistencia con Mochila, Minecraft, proxy y runner. El flujo de dos clientes pasó en staging; producción recuperó al reemplazar API/web durante el rollout. F6 completo sigue `BLOCKED` hasta confirmar el flujo desde el navegador y decidir si el rollback inseguro necesita una prueba separada.

Durante mis probes independientes hice solo lecturas; no reinicié ni cambié configuración. Este reporte se actualizó con los resultados. `git diff --check` pasó.
