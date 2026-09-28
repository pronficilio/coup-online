# Reporte F4 — Falsificación y entrega

**Issue:** #40 — rediseñar el registro de eventos y añadir reacciones efímeras
**Estado:** `ACTIVE`; dos revisiones independientes devolvieron `FAIL`; los defectos reproducibles se corrigieron y el E2E live pasó. Tercera revisión independiente `FINAL` pendiente. La publicación/integración de la PR de AC12 requiere autorización del propietario.
**Branch/worktree:** `issue/40-event-log-reactions` / `.worktrees/issue-40-event-log-reactions`
**Base:** `origin/master@db1d22c11fc78dcd91b5f4242b1ae1591f9ba16b`

## Primera revisión independiente

El primer Verifier `FINAL` devolvió `FAIL`:

- **AC7 — FAIL:** `Coup` conservaba `reactionPresence`, pero el montaje real de `<PlayerBoard>` no recibía el prop; los globos vistos en pruebas aisladas no aparecían en la partida.
- **AC8 — dependiente:** la presentación de los globos en la ruta real fallaba por el cableado ausente.
- **AC9 — parcial:** los objetivos táctiles medían entre 25 y 36 px.
- **AC10 — parcial:** se había documentado el escenario de seis asientos, pero faltaba la matriz de 2–6 jugadores.
- **AC12 — no verificado:** faltaba walkthrough funcional de reemplazo, retiro y caducidad.

La revisión también encontró aprobados los controles estáticos de cronología sin horas, IDs tipados, catálogo contextual, selección única autoritativa del servidor, conteos, y ausencia de mapeo público persistente. No se ejecutaron pruebas automatizadas, de acuerdo con la instrucción del Orquestador de no añadir ni ejecutar tests.

## Correcciones y evidencia repetida

- `Coup.js` ahora pasa `reactionPresence` a `PlayerBoard` en el montaje de la partida.
- En viewports móviles y dispositivos coarse, los controles del registro y las opciones tienen áreas de 44×44 px. Chromium midió las cuatro opciones del selector en 44×44 px.
- Se quitó la escala de la animación de entrada de la bandeja: el primer recorrido midió 43.12 px porque el contenedor comenzaba en `scale(0.98)`. La bandeja conserva la entrada suave de opacidad y desplazamiento; el control táctil ya no se reduce al abrir.
- El build de producción (`npm run build` en `coup-client/`) terminó correctamente antes y después del rebase sobre `origin/master@db1d22c`. Permanecen avisos preexistentes de imports sin uso en `App.js`, precedencia `&&`/`||` en `Coup.js:451` de #46, `dvh` en `ReferencePanel.css:100,106` y la base Browserslist desactualizada.
- El recorrido Chromium integrado pasó sin errores de página: una nueva reacción reemplaza la anterior y reinicia los 3.5 s; dos asientos coexisten; retirar una selección quita solo su globo; los globos vencen; el movimiento reducido produce duraciones `0.001s`; los asientos quedan dentro del viewport en layouts de 2, 3, 4, 5 y 6 participantes, escritorio 1440×960 y móvil 390×844.
- El recorrido monta el `Coup` y `PlayerBoard` reales con un `PreviewSocket` local que simula mensajes de servidor. Prueba la integración del cliente, pero no es una partida live multi-cliente. El estado autoritativo, concurrencia y privacidad se revisan con el contrato y las verificaciones de F1.

Capturas de este recorrido en `evidence_issue_40_F4/`:

- [Reemplazo y presencia concurrente en escritorio](evidence_issue_40_F4/desktop-presence-replaced-concurrent.jpg).
- [Retiro de una reacción](evidence_issue_40_F4/desktop-presence-withdrawn.jpg) y [globos expirados](evidence_issue_40_F4/desktop-presence-expired.jpg).
- [Bandeja abierta en móvil con seis jugadores](evidence_issue_40_F4/mobile-reaction-tray-six-players.jpg); [dos jugadores en móvil](evidence_issue_40_F4/mobile-presence-two-players.jpg).
- Matriz 2–6 jugadores de escritorio y móvil, incluyendo [tres](evidence_issue_40_F4/mobile-seat-count-3.jpg), [cuatro](evidence_issue_40_F4/mobile-seat-count-4.jpg), [cinco](evidence_issue_40_F4/mobile-seat-count-5.jpg) y [seis](evidence_issue_40_F4/mobile-seat-count-6.jpg) en móvil.
- [Movimiento reducido](evidence_issue_40_F4/mobile-reduced-motion.jpg).

## Segunda revisión independiente

El segundo Verifier independiente (`Curie`) también devolvió `FAIL`:

- **AC9 — parcial:** seleccionar una reacción retiraba el menú y dejaba el foco perdido.
- **AC10 — FAIL:** en móvil, cerrar y reabrir el registro desplazaba la lista hasta el final.
- **AC12 — parcial:** aún no se había probado una partida real con dos clientes y tampoco existía la PR.
- **AC1–8 y AC11 — PASS**; no se registraron defectos nuevos en privacidad, contratos ni datos de las filas.

### Correcciones desde el segundo `FAIL`

- `EventLog` devuelve el foco al control de reacción del mismo evento cuando se elige o retira una reacción. Se añadió el anclaje `data-event-id` para recuperar el control correcto.
- En móvil, el panel conserva `scrollTop` al cerrarse y abrirse. Los eventos nuevos recibidos mientras estaba plegado solo fuerzan seguimiento si el usuario estaba siguiendo el final.
- El fixture móvil con 30 eventos confirmó: bottom gap inicial `0`; scroll `172` antes de cerrar y `172` al reabrir; un evento añadido mientras el panel estaba plegado también conservó `172`. La selección por teclado restauró el foco al botón del evento correcto. Sin errores de página.
- Recorrido live con Chromium contra el cliente y servidor reales, dos sesiones conectadas como Alicia y Bruno: se generó un evento de partida real; Alicia cambió `Me gusta` por `Bravo` tras 2.6 s y la burbuja seguía visible 1.3 s después (reset de 3.5 s); Bruno reaccionó al mismo evento y ambas burbujas coexistieron; retirar la reacción de Alicia dejó solo la de Bruno; después expiraron ambas. Se comprobó foco restaurado y no hubo errores de página.
- `npm run build` pasó tras las correcciones. Se mantienen los avisos preexistentes descritos arriba.

Capturas del E2E live:

- [Dos reacciones concurrentes en móvil](evidence_issue_40_F4/mobile-live-two-player-concurrent.jpg).
- [Dos reacciones concurrentes en escritorio](evidence_issue_40_F4/desktop-live-two-player-concurrent.jpg).
- [Retiro de la reacción de Alicia](evidence_issue_40_F4/desktop-live-withdrawal.jpg) y [expiración de las burbujas](evidence_issue_40_F4/desktop-live-expiration.jpg).

La partida live satisface la evidencia funcional pendiente de AC12. La PR única hacia `master` y su integración siguen pendientes; no se publicarán sin autorización del propietario. La tercera revisión independiente debe comparar AC1–AC12 contra el issue actualizado, código, reportes y capturas; no modificar archivos ni ejecutar tests. Registrar aquí su dictamen y defectos reproducibles antes de cerrar F4.
