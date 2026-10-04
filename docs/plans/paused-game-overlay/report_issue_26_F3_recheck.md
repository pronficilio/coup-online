# Issue #26 — reporte independiente F3 FINAL (recheck)

- **Unidad:** issue #26 — Hacer visible la pausa de partida y guiar la reanudación.
- **Checkpoint:** F3 FINAL, criterio actualizado de ownership por asiento.
- **Branch / commit:** `issue/26-paused-game-overlay` / `46b08058096a97539bb2ffbaa52d032beed08ebf`.
- **Base / target:** `1ff478c308478af3be61131daa1bd88652bdc77f` / `master` de `pronficilio/coup-online` (`origin`).
- **Modo / riesgo / política:** FULL / HIGH / FINAL.

## Veredicto

**BLOCKED**

## CLAIM

El servidor calcula por asiento a las personas humanas que no respondieron la decisión vencida; solo ellas reciben overlay/CTA y pueden enviar `g-resume`. Los demás esperan sin overlay; las pausas no recuperables cubren a todos y no permiten reanudar.

## CI_GATES / ADVERSARIAL_CHECK

- **CI_GATES: PASS.** `npm run build` terminó con código 0. CRA compiló con warnings: imports `logo`/`Link` sin uso en `src/App.js`, `postcss-calc` no interpreta `dvh` de `ReferencePanel.css` y `caniuse-lite` está desactualizado. Esos archivos no forman parte del diff de este commit. `git diff --check` pasó. Comparación independiente de `translations.json`: `ES=313 EN=313`, sin diferencias de claves ni placeholders.
- **ADVERSARIAL_CHECK: BLOCKED.** Los ataques de autorización y estado se revisaron estáticamente desde el diff y las rutas del servidor; no encontré una evasión estática del permiso. No hay Chromium, Chrome, Firefox ni Playwright en `PATH`, ni herramienta de navegador expuesta. No pude recorrer visualmente el overlay, estados de espera, teclado/foco ni lector de pantalla.
- **OVERALL: BLOCKED.** El plan requiere walkthrough visual, móvil/escritorio y accesibilidad para cerrar F3. La ausencia de navegador impide PASS global.

## Criterios verificados

- **Responsables = `allowed - responses`, solo asientos humanos: PASS estático —** `server/game/coup.js:221-229` itera `decision.allowed`, excluye claves presentes en `decision.responses`, resuelve la clave mediante `actorKey()` contra el roster interno y solo agrega controladores `human`. `pause()` conserva la decisión únicamente si existe al menos un asiento humano pendiente (`:253-272`).
- **Solo responsables reciben overlay/CTA; los demás esperan sin overlay: PASS estático —** `emitGamePaused()` envía el evento individualmente al socket guardado del asiento (`:232-250`); para timeout recuperable asigna `showOverlay/canResume` solo a `resumeOwnerSeats` y `waitingForOwner` al resto. El cliente convierte esos flags en overlay o `role="status"` no modal (`Coup.js:237-253,406-438`).
- **Líder no responsable/respondedor previo/tercero no puede reanudar: PASS estático —** `resume()` resuelve el asiento desde el `socketID` recibido y exige que esté en `resumeOwnerSeats` (`server/game/coup.js:504-516`). Ser líder no participa en la condición. `seatForSocket()` solo empareja sockets del roster humano (`:338-340`).
- **Socket/payload manipulado: PASS estático —** los listeners capturan el socket del servidor al iniciar (`server/game/coup.js:74-87`); el cliente no envía identidad. `resume()` rechaza cualquier payload distinto de `undefined` antes de procesar ownership (`:504-511`). Alterar estado/UI del cliente no altera el asiento guardado en `pausedDecision`.
- **Espectador: PASS estático —** recibe `showOverlay:false`, `canResume:false` si existen responsables; aunque emita `g-resume`, `seatForSocket()` devuelve `-1` y el servidor lo rechaza (`server/game/coup.js:245-250,338-340,513-516`).
- **Solo Codex pendiente / pausa no recuperable: PASS estático —** al no haber asiento humano pendiente, `resumeOwnerSeats` queda vacío y `pausedDecision` es `null`; `emitGamePaused()` entonces asigna overlay a todos los sockets humanos y espectadores, sin CTA (`server/game/coup.js:253-272,232-250`). Las demás causas usan el valor no recuperable predeterminado de `pause()`.
- **Desconexión durante pausa: PASS estático —** `onDisconnect()` invalida `pausedDecision` antes de emitir el nuevo estado (`server/game/coup.js:207-218`); una carrera detectada durante `resume()` también lo invalida y emite la pausa degradada (`:518-526`). El lobby rechaza nuevas conexiones después de iniciar (`server/game/lobby.js:41-45`), por lo que no vi reasignación de un socket nuevo al asiento autorizado.
- **Error y CTA duplicado: PASS estático con límite dinámico —** el cliente evita solicitudes repetidas con `resumeRequestPending` y renderiza rechazos dentro del overlay como `role="alert"` (`Coup.js:228-235,300-306,436`). En la carrera donde el servidor rechaza por desconexión y emite además el estado degradado, el nuevo `g-gamePaused` limpia `decisionError` (`Coup.js:243-253`); el diálogo sí comunica que la pausa dejó de ser recuperable. No pude observar la secuencia real de eventos en navegador.
- **Decisión/versionado: PASS estático para el criterio de decisión antigua —** durante la pausa `activeDecision` se limpia (`server/game/coup.js:253-272`), por lo que `submitChoice()` rechaza elecciones mientras no hay decisión activa (`:297-309`). Al reanudar, `activateDecision()` aumenta `stateVersion`, crea un `decisionId` nuevo y emite esa nueva identidad antes de `g-gameResumed` (`:365-395,528-534`); envelopes antiguos no coinciden con el ID/versión activa (`:307-309`).
- **i18n ES/EN: PASS —** `translations.json` tiene 313 claves por idioma; no hay claves ausentes ni diferencias de placeholders.
- **Build y diff: PASS —** build de producción exit 0 con warnings indicados; `git diff --check` exit 0.
- **Walkthrough visual/teclado/accesibilidad: BLOCKED —** no existe navegador local ni herramienta de navegador disponible. El CSS de pantalla completa y el diálogo/trampa de foco pueden inspeccionarse estáticamente, pero no se comprobó su comportamiento visual, en móvil, con teclado o lector de pantalla.

## Refutaciones intentadas

1. **Actor correcto frente a líder/respondedor/tercero:** comparé cada socket entrante con el asiento del roster servidor y ese asiento con `resumeOwnerSeats`, derivado de respuestas presentes al timeout. No encontré ruta basada en liderazgo ni identidad enviada por cliente.
2. **Varios humanos pendientes:** cada asiento pendiente se guarda una vez en `resumeOwnerSeats` y cada uno recibe su propio evento/CTA. El primer `g-resume` aceptado consume `pausedDecision` y activa una nueva versión; una solicitud posterior ya no encuentra una pausa recuperable y no crea una segunda reanudación.
3. **Timeout Codex-only:** sin actor humano pendiente no se conserva `pausedDecision`; todos reciben la variante no recuperable.
4. **Espectador y payload falsificado:** el listener puede existir para espectador, pero el asiento resuelto es `-1`; cualquier payload no vacío se rechaza. No se confía en campos `seat`, `socketID` o `owner` del cliente.
5. **Desconexión/error:** tanto el evento de desconexión como la detección al reanudar invalidan el permiso. El cambio a no recuperable vuelve a emitir overlay sin CTA a todos.
6. **Respuesta/versión obsoleta:** la fase pausada no tiene `activeDecision`; la reanudación crea ID/versión nuevos y el servidor compara ambos al aceptar una respuesta.

## Observación de reactivación

Al conservar la pausa, `pausedDecision` incluye `allowed` y la función de resolución, pero no copia `responses` (`server/game/coup.js:260-268`). `activateDecision()` crea un `responses: new Map()` y emite la nueva decisión a todos los humanos de `template.allowed` (`:365-391`), incluidos quienes habían respondido antes del timeout. Por tanto, sus elecciones previas no se conservan y vuelven a recibir una decisión con ID/versión nuevos. El criterio recibido exige que la decisión antigua no acepte respuestas y que respondedores previos no puedan ejecutar `g-resume`; ambos quedan cubiertos estáticamente. No encontré en el criterio actual una regla expresa sobre conservar respuestas previas, así que registro este comportamiento para que el Orquestador confirme si el reinicio completo es intencional.

## Comandos y evidencia

- `git rev-parse HEAD` → `46b08058096a97539bb2ffbaa52d032beed08ebf`; `origin` apunta al fork `pronficilio/coup-online`.
- `git diff --check 1ff478c308478af3be61131daa1bd88652bdc77f..46b08058096a97539bb2ffbaa52d032beed08ebf` → sin errores.
- `npm run build` en `coup-client` → código 0; bundle de producción generado con los warnings descritos.
- Comparación de claves y placeholders ES/EN → 313/313, sin diferencias.
- `command -v chromium chromium-browser google-chrome firefox playwright` → ninguno disponible. El listado de herramientas expuestas no contiene navegador.
- No se ejecutaron tests automatizados ni se usaron los reportes del implementador como prueba. Fuentes reconstruidas: `server/game/coup.js`, `server/game/lobby.js`, `Coup.js`, `CoupStyles.css` y `translations.json` en el commit reclamado y su diff contra la base exacta.

## Limitaciones y siguiente dueño

No se pudo recorrer propietario pendiente, líder no propietario, respondedor previo, múltiples pendientes, Codex-only, espectador, desconexión, rechazo real del socket, reactivación visual, overlay móvil/escritorio, foco/teclado ni lector de pantalla en una partida. Tampoco se pudo observar directamente el bloqueo de controles bajo la capa. El Orquestador debe facilitar un navegador accesible y completar el walkthrough; debe valorar la observación sobre la nueva decisión antes de declarar cerrada F3.
