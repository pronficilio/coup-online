# Issue #26 — reporte independiente F3 FINAL (follow-up)

- **Unidad:** issue #26 — Hacer visible la pausa de partida y guiar la reanudación.
- **Checkpoint:** F3 FINAL, conservación de respuestas aceptadas.
- **Branch / commit:** `issue/26-paused-game-overlay` / `9276e0a67ee20844bc04a08804217c0e6acd8650`.
- **Base / target:** `1ff478c308478af3be61131daa1bd88652bdc77f` / `master` de `pronficilio/coup-online` (`origin`).
- **Modo / riesgo / política:** FULL / HIGH / FINAL.

## Veredicto

**BLOCKED**

## CLAIM

El servidor deriva por asiento a los actores humanos que no respondieron; solo esos asientos reciben overlay/CTA y pueden reanudar. La pausa conserva las respuestas aceptadas, reactiva solo a actores aún pendientes con una nueva identidad/versión, y rechaza decisiones antiguas. Los demás esperan sin overlay; una pausa sin responsable humano muestra overlay sin CTA a todos.

## CI_GATES / ADVERSARIAL_CHECK

- **CI_GATES: PASS.** `npm run build` terminó con código 0 y generó el bundle. Avisos: imports `logo`/`Link` sin uso en `src/App.js`, `postcss-calc` no interpreta `dvh` en `ReferencePanel.css` y `caniuse-lite` está desactualizado. `node --check server/game/coup.js` pasó. `git diff --check` pasó. Comparación independiente de `translations.json`: `ES=313 EN=313`, sin diferencias de claves ni placeholders.
- **ADVERSARIAL_CHECK: BLOCKED.** La inspección adversarial del diff/servidor no encontró una refutación estática de los permisos ni de la conservación de respuestas. No hay Chromium, Chrome, Firefox ni Playwright en `PATH`, ni herramienta de navegador expuesta; el recorrido visual, teclado/foco y lector de pantalla no pudo completarse.
- **OVERALL: BLOCKED.** El plan exige walkthrough visual y de accesibilidad para F3, así que las comprobaciones estáticas y el build no bastan para PASS global.

## Criterios

- **Responsables por `allowed - responses`: PASS estático —** `server/game/coup.js:221-229` ignora actores con respuesta aceptada, resuelve `actorKey` contra los jugadores del roster y agrega únicamente asientos `human`. `actorKey()` usa el socket guardado del asiento humano o `codex:<seat>` para Codex (`:185-187`).
- **Conservación de respuestas aceptadas: PASS estático —** `pause()` clona `decision.responses` a `pausedDecision.responses` (`server/game/coup.js:253-269`). `activateDecision()` clona ese mapa al nuevo `activeDecision` (`:366-380`).
- **No reemitir decisión ni consultar Codex para respondedores: PASS estático —** el bucle de emisión humana omite actores presentes en `activeDecision.responses` (`server/game/coup.js:381-394`); el bucle de Codex aplica el mismo filtro antes de `requestCodexDecision()` (`:400-404`).
- **Resolución al completar pendientes, sin cambio de respuesta ni doble cierre: PASS estático —** `submitChoice()` comprueba la respuesta previa por `actorKey`: la misma opción es idempotente y una distinta se rechaza (`server/game/coup.js:323-331`). Solo inserta una respuesta nueva y llama `closeDecision()` cuando `responses.size === allowed.size` (`:332-335`). El cierre limpia `activeDecision` antes de resolver con los valores ya guardados y los recién recibidos (`:540-555`), por lo que una llegada posterior no vuelve a cerrar esa decisión.
- **ID/versión nuevos y decisión antigua rechazada: PASS estático —** cada `activateDecision()` aumenta versión y crea otro ID (`server/game/coup.js:366-379`). `submitChoice()` requiere fase running, decisión activa y coincidencia de ambos campos antes de evaluar la respuesta (`:298-310`); mientras pausada no hay `activeDecision` (`:253-272`).
- **Solo asiento responsable autorizado; líder/respondedor/tercero rechazado: PASS estático —** `resume()` rechaza payload y exige que el asiento obtenido de `seatForSocket(socketID)` pertenezca a `resumeOwnerSeats` (`server/game/coup.js:507-519`). La identidad proviene del listener servidor conectado al `socketID` real (`:74-87`), no de un campo del cliente. `seatForSocket()` solo resuelve asientos humanos (`:339-340`).
- **Emisión por socket, espera sin overlay y overlay no recuperable: PASS estático —** `emitGamePaused()` emite individualmente a jugadores y espectadores; en timeout recuperable solo owners reciben `showOverlay/canResume`, los demás reciben `waitingForOwner`, y sin owners todos reciben overlay sin CTA (`server/game/coup.js:232-250`). El cliente convierte esos campos en overlay o estado no modal accesible (`coup-client/src/components/game/Coup.js:237-253,406-438`).
- **Codex-only: PASS estático —** si ningún actor humano queda pendiente, el conjunto de owners es vacío, `pausedDecision` no se conserva y la pausa se emite no recuperable a todos (`server/game/coup.js:253-272`). No se consulta de nuevo un Codex que ya figure en `responses` (`:400-404`).
- **Desconexión/reconexión: PASS estático —** `onDisconnect()` invalida `pausedDecision` en pausa (`server/game/coup.js:207-218`), y el intento de resume vuelve a comprobar que todos los asientos humanos sigan conectados (`:521-529`). El lobby rechaza conexiones nuevas después del inicio (`server/game/lobby.js:41-45`); no encontré una ruta para reasignar identidad o propiedad desde el cliente.
- **Payload manipulado/espectador: PASS estático —** un payload incluso vacío como objeto se rechaza porque la API exige `undefined`; luego cualquier socket sin asiento humano propietario, incluido espectador, se rechaza mediante `requesterSeat < 0` (`server/game/coup.js:507-519`). Ninguna rama usa campos de identidad remitidos por el cliente.
- **Build, sintaxis e i18n: PASS —** producción compilada con warnings arriba; el servidor pasa `node --check`; el diccionario conserva paridad de claves/placeholders, `313/313`.
- **Walkthrough visual y accesibilidad: BLOCKED —** no se pudo comprobar la cobertura del viewport, el bloqueo real del tablero, escritorio/móvil, teclado/foco, lector de pantalla ni el estado no modal en navegador.

## Refutaciones intentadas

1. **Mapa por actor, no por número de respuestas:** contrasté claves de `allowed` y `responses`, su normalización por `actorKey`, y el lookup al roster. La propiedad de resume se calcula de esas mismas claves y se guarda por seat.
2. **Respuesta previa tras reactivación:** comprobé que `responses` se copia al objeto pausado y vuelve a clonarse en el nuevo decision. La persona respondida no recibe otra solicitud; un intento repetido con la misma opción no muta el mapa, y una opción distinta se rechaza.
3. **Varios pendientes y cierre:** cada actor pendiente conserva una única entrada pendiente. Cada nueva respuesta ocupa su clave; el cierre requiere tamaño exactamente igual a `allowed.size`. Una solicitud duplicada no agrega otra entrada y, tras el cierre, no existe decisión activa para cerrarla de nuevo.
4. **Codex pendiente/respondido:** Codex respondido permanece en el mapa y no recibe nueva consulta. Codex pendiente tampoco obtiene ownership humano; si no hay humanos pendientes no hay resume recuperable. Si aún hay humano pendiente, el nuevo activation vuelve a solicitar únicamente al Codex que seguía sin responder.
5. **Socket/identidad/payload/espectador:** el servidor enlaza el socket real a la función, rechaza payload, calcula el seat del roster, y exige ownership. No encontré una ruta para elevar permiso con campos manipulados.
6. **Desconexión y decisión obsoleta:** desconexión borra ownership; en pausa `submitChoice()` falla por ausencia de decisión activa y tras resume la nueva versión/ID no coincide con envelopes anteriores.

## Defectos

No encontré una refutación funcional estática en los criterios de servidor entregados. No se declara PASS porque faltan los criterios dinámicos de F3 indicados arriba.

## Comandos y evidencia

- `git rev-parse HEAD` → `9276e0a67ee20844bc04a08804217c0e6acd8650`; `origin` apunta a `pronficilio/coup-online`.
- `git diff --check 1ff478c308478af3be61131daa1bd88652bdc77f..9276e0a67ee20844bc04a08804217c0e6acd8650` → sin errores.
- `node --check server/game/coup.js` → código 0.
- `npm run build` en `coup-client` → código 0, bundle generado con warnings indicados.
- Comparación ES/EN de claves y placeholders → `313/313`, sin diferencias.
- `command -v chromium chromium-browser google-chrome firefox playwright` → ninguno disponible; las herramientas expuestas no incluyen navegador.
- No se ejecutaron tests automatizados. Las conclusiones se reconstruyeron desde `server/game/coup.js`, `server/game/lobby.js`, el diff contra la base exacta, el cliente y el diccionario; los informes previos se trataron como históricos.

## Limitaciones y siguiente dueño

Falta recorrer en navegador al responsable pendiente, líder no responsable, respondedor previo, varios pendientes, Codex-only, espectador, payload manipulado, desconexión, error, reanudación, teclado/foco, lector de pantalla, viewport móvil/escritorio y bloqueo del tablero. El Orquestador debe facilitar el navegador y completar ese walkthrough antes de cerrar F3 o declarar PASS global.
