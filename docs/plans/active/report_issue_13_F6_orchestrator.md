# Evidencia complementaria del Orquestador — F6 staging

**Fecha:** 2026-10-04 UTC  
**Release probado:** `ff840d1`, staging `https://st-coup.ejele.net`  
**Alcance:** prueba funcional complementaria posterior al reporte independiente; solo staging.

## Prueba de juego

Se creó un namespace con la ruta API de staging. Desde el contenedor aislado
`st-coup-api`, dos clientes `socket.io-client` se conectaron a la aplicación
del API en loopback con `Origin: https://st-coup.ejele.net` y transporte
polling. Los nombres `StageOne` y `StageTwo` recibieron `joinSuccess`; el
segundo se marcó ready; el primero emitió `startGameSignal`. Ambos clientes
recibieron `g-updatePlayers` con dos jugadores y el juego quedó en marcha.

Resultado observado:

```json
{"result":"PASS","joinedPlayers":2,"gameStarted":true,"playerCounts":[2,2],"transport":["polling","polling"]}
```

Esta prueba confirma creación, entrada de dos jugadores e inicio de partida a
través del API con el origen válido. El transporte de ambos clientes fue
polling; el upgrade permitido a WebSocket se confirmó por separado con la
sonda independiente, no como upgrade de estos dos clientes.

## Limpieza y recuperación

Tras desconectar a ambos clientes, se reinició solo `st-coup-api` para limpiar
el estado en memoria de la partida temporal. El API volvió a `running healthy`.
Después del reinicio, `https://st-coup.ejele.net/` y
`/exists/healthcheck` respondieron 200. El healthcheck de producción también
respondió 200. En ese momento, antes de la autorización posterior del
propietario, sus contenedores continuaban con `ce53c28`.

No se cambió el Compose de producción ni se modificó ningún otro servicio
durante esta prueba. Posteriormente el propietario autorizó activar
`ff840d1`; la activación y las sondas públicas están documentadas en el plan y
en `report_issue_13_F6.md`.

## Hallazgo posterior: creación falla con Origin ausente

El 2026-10-04, los logs de Nginx/API asociados al cliente del propietario
mostraron `/createNamespace` con HTTP 200, seguido de intentos repetidos de
`/socket.io/?EIO=3&transport=polling` con HTTP 403. El cuerpo del API fue
`Origin not allowed`. El navegador no envía `Origin` en este polling; Socket.IO
2.5 usa `Referer` como alternativa, y la petición incluía
`https://coup.ejele.net/create`. El callback comparaba ese URL completo con el
origen y lo rechazaba. Una llamada directa sin Origin ni Referer también da
403 (se conserva ese rechazo); con Origin Coup devuelve 200 y con origen hostil
403.

La verificación anterior solo había enviado cabeceras `Origin` explícitas y
omitió el caso del navegador same-origin con Referer. La rama de trabajo sí
contiene `origin/master@02bcf3e`; en cambio, producción usa el snapshot
`ce53c28` más el fix de CORS, empaquetado como `ff840d1`. La animación `home-coin`
se añadió en `2bbf11f` el 2026-09-27 y ya estaba presente en `ce53c28` del
2026-09-29, así que no identifica el snapshot de `master` del 2026-10-03.

Corrección local: la política acepta URL cuyo `origin` coincide exactamente
con el configurado (incluido el Referer same-origin con path), niega ausencia
total y sigue rechazando cualquier URL/origen hostil. El test unitario pasa.
Pendiente: probar en staging el polling con Referer same-origin, el rechazo de
Origin hostil y una partida real antes de cualquier actualización adicional
de producción.
