# Reporte F3 — revisión responsiva, accesibilidad y movimiento

**Estado:** `ACTIVE / PARTIAL`. No se registra `PASS` ni se cierra F3: faltan los estados de 3–5 participantes, eliminación local y respuestas en móvil. PR #11 continúa draft.

## Entorno y método

- Cliente React local en `localhost:3200`, servidor Socket.IO en `localhost:8000`; Edge headless con CDP en perfiles propios 9237–9242. Se interactuó con los formularios reales para crear las salas; no se usó CUA ni se ejecutaron tests automatizados.
- Sala `C1H821`: dos jugadores (`F3Host`, `F3Guest`), turno del host. Capturas activas post-fix: [escritorio 1600 × 900](issue_6_f3_desktop_1600x900.jpg) y [móvil 390 × 844](issue_6_f3_mobile_390x844.jpg).
- Sala `H51JU1`: seis jugadores listos antes de pulsar Start Game (`F3SixHost`, `F3P1`–`F3P5`). El DOM mostró 6 asientos y turno inicial del host. [Distribución a 1600 × 900](issue_6_f3_six_player_1600x900.jpg).

## Hallazgos y cambios aplicados

La primera medición móvil encontró la bandeja absoluta encima de la mesa: a 390 × 844 el panel ocupaba `x=0,y=221,w=366,h=716` y tapaba parcialmente a Guest. Se movió el panel móvil a flujo debajo del tablero, con ancho centrado, `max-height: min(52vh, 440px)`, scroll interno y `overscroll-behavior: contain`; `.ActionList` no añade un segundo scroll. La medición post-fix dejó la mesa en `x=0,y=236.1,w=390,h=390` y el panel en `x=12,y=638.1,w=366,h=438.9`, con 12 px de separación. Las cartas de ambos participantes y el mazo quedan visibles antes de la bandeja.

En escritorio, a 1600 × 900, el panel lateral queda separado de la mesa por 16 px: panel `x=119.5,w=460`, mesa `x=595.5,w=870`. El panel usa `max-height: calc(100vh - 220px)` y scroll propio; medición: `scrollHeight=780`, `clientHeight=678`, 7 filas en DOM. La mesa conserva su posición al limitar la lista. El documento sigue desplazable verticalmente por la altura del tablero; no se midió el estado del panel en todos los tamaños intermedios.

En móvil el panel tiene scroll propio (`scrollHeight=912`, `clientHeight=437`). Al llevarlo al final (`scrollTop=475`), la última fila queda dentro del área del panel (`lastRowReachable=true`). El tablero mantiene su caja de 390 × 390 y el panel no la cubre.

Se añadió `aria-live="polite"` y `aria-atomic="true"` al mensaje existente `It is …'s turn`: antes no había nodos `aria-live`, `role=status` ni `role=alert`. Tras volver a crear la partida, el DOM expuso el nodo polite con `It is F3Host's turn`. El mensaje sigue derivándose del jugador actual.

## Observaciones manuales

| Caso | Resultado observado |
|---|---|
| Dos jugadores, dueño/no dueño del turno | Host→Guest→Host: el panel local pasó de 7 controles y `aria-hidden=false` a `aria-hidden=true`, 0 controles y 0 controles enfocables, y volvió a 7 acciones al recuperar el turno. Al ocultarse, el foco quedó en `BODY`, fuera del panel. |
| Teclado | Tab llegó de INCOME a FOREIGN AID; el botón activo reportó `:focus-visible=true`. El enfoque programático previo no activó `:focus-visible`, como corresponde al selector de teclado. |
| Movimiento reducido | CDP emuló `prefers-reduced-motion: reduce`; `matchMedia` fue `true`, `transition` fue `none` y `transform` fue `none`. |
| Scroll | La última fila se confirmó alcanzable en el scroll móvil. En escritorio el panel reportó overflow interno y las siete filas presentes; falta medir explícitamente el final del scroll allí. |
| Seis jugadores | Sala de seis Ready iniciada; DOM mostró 6 `PlayerBoardSeat` en una distribución alrededor del mazo, panel activo para F3SixHost. Captura vinculada arriba. |
| Respuestas | Challenge, Block y Pass se habían visto en el recorrido F2 documentado en `report_issue_6_F2.md`; no se volvió a reproducir una respuesta durante F3 ni en móvil. |

## Pendiente para completar F3

- Revisión de 3, 4 y 5 participantes; solo se observaron 2 y 6.
- Estado de jugador local eliminado; no se alcanzó naturalmente en esta revisión, que terminó con los jugadores todavía vivos.
- Recorrido móvil con decisión de Challenge/Block/Pass.
- Verificación del cambio de texto del nodo `aria-live` tanto en Host como en Guest después de su incorporación; el nodo se observó con el valor Host, mientras el ciclo de turnos se recorrió en DOM antes/después.
- Scroll hasta la última fila medido explícitamente también en escritorio.

El build de `coup-client` terminó correctamente con las advertencias ESLint preexistentes para `logo`, `Link` y `ReactModal`, además del aviso de `caniuse-lite` obsoleto. No se ejecutaron tests automatizados. F3 permanece `ACTIVE` a la espera de completar estos casos y revisión independiente.
