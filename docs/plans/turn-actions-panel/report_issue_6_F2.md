# Reporte F2 — montaje y confirmación

**Estado:** `CLOSED / PASS` — composición visual aprobada y recorrido funcional de F2 verificado con Edge headless/CDP. F3 permanece `PENDING`.

## Cambios revisados

- `Coup.js` monta el panel lateral junto a `PlayerBoard`. Se habilita únicamente cuando hay un `g-chooseAction` válido, el jugador local está vivo y `currentPlayer === name`. Al cambiar el turno, quedar eliminado o terminar la partida, el panel deja de mostrar controles. Los controles de desafío, bloqueo, revelación, pérdida de influencia e intercambio siguen en su propia sección.
- `ActionDecision.js` conserva selección/confirmación de objetivos y la guarda contra doble envío. La lista sigue la referencia visual: tarjeta única de pergamino, personaje declarado junto al título, bloqueadores en su línea secundaria y cápsula de precio con moneda.
- `CoupStyles.css` amplía la barra lateral y compacta las filas para mostrar las siete acciones completas en escritorio. En viewports menores el panel se superpone sin reservar espacio ni desplazar la mesa. La transición usa `opacity`, `transform`, `visibility` y `pointer-events`; `prefers-reduced-motion` la desactiva. Al ocultarse, el wrapper queda `aria-hidden` y los controles se desmontan, por lo que no queda un control invisible enfocado.
- La selección de objetivo y confirmación conservan el comportamiento previo: cancelar no emite eventos; confirmar vuelve a validar fondos/objetivo y Coup/Assassinate descuentan solo al confirmar.

## Validación

- `npm run build`: **PASS** en el cambio visual aprobado. CRA compiló; permanecen avisos ESLint previos (`logo`, `Link` y `ReactModal` sin uso) y `caniuse-lite` desactualizado.
- `git diff --check`: **PASS** para el cierre documental.
- Recorrido funcional asistido por CDP en Edge headless, sala local `WA5EGX`, cliente en `3200`, backend en `8000`; la sesión terminó y cerró su perfil temporal. Se registraron contadores de eventos Socket.IO y estados DOM, no solo una captura.

| Recorrido | Observación en ejecución | Resultado |
|---|---|---|
| Inicio/propiedad | Turno inicial Luna: panel activo; browser recibió 1 `g-chooseAction`, Guest 0. Tras Income, Guest fue el turno activo; el panel local quedó `aria-hidden=true` con 0 botones y Guest recibió 1 `g-chooseAction`. Al terminar Income de Guest, Luna volvió a recibir el turno y el panel se activó. | PASS |
| Cancelar Assassinate | Con 3 monedas apareció el selector con objetivo `Guest`. Antes y después: balance 3, `g-deductCoins` 0 y `g-actionDecision` 1 (el evento previo fue Income). | PASS; cancelar no cobró ni emitió acción. |
| Confirmar Assassinate | Se eligió Guest y se hizo doble clic en Confirm. El socket local emitió exactamente 1 `g-deductCoins` y 1 `g-actionDecision`; el saldo pasó de 3 a 0. Guest pasó el desafío y quedó con 1 influencia (de 2); el turno avanzó. | PASS; guard contra doble envío observado. |
| Respuestas | En la acción Steal de Guest contra Luna, con panel local oculto, la sección de respuesta mostró `Challenge`, `Block Steal` y `Pass`. | PASS; las respuestas no quedaron cubiertas por el panel. |
| Cancelar Coup | Con 7 monedas, cancelar el selector mantuvo balance 7 y los contadores en 1 cobro / 9 acciones; no hubo emisión adicional. | PASS |
| Confirmar Coup / game over | Doble clic en Confirm produjo deltas exactos de 1 `g-deductCoins` y 1 `g-actionDecision`; el servidor resolvió el Coup y anunció ganador Luna. El panel quedó `aria-hidden=true` al terminar la partida. | PASS |

- Evidencia visual complementaria desde una partida local de dos jugadores: [captura F2](issue_6_f2_active_turn.png), 1570 × 1149. Muestra la composición aprobada con las siete acciones y la mesa; los contadores anteriores documentan el recorrido funcional.
- Computer Use falló dos veces (`kernel exited unexpectedly`; `windows sandbox failed: helper_unknown_error: setup refresh had errors`) y no se reintentó. No se añadieron ni ejecutaron tests automatizados.
- No se simuló directamente la muerte del jugador local en su propia UI; el walkthrough sí comprobó la limpieza al perder el turno y al game over. La revisión de jugador local eliminado queda dentro de la matriz de F3.

## Límite del protocolo de cobro

El protocolo existente recibe `g-deductCoins` y `g-actionDecision` en manejadores Socket.IO distintos. El cliente los emite una vez, en orden, bajo una guarda de envío único; esto evita duplicados por clic rápido y conserva el orden del mismo socket, pero **no constituye una transacción atómica server-side**. Cambiar el protocolo o el servidor está fuera del alcance de F2.

## Siguiente paso

F2 queda cerrada con PASS y este reporte queda enlazado desde PR #11, que permanece draft. Iniciar F3 en el mismo branch, worktree y PR: revisión visual/accessibilidad de escritorio y móvil, reduced motion, foco y estados de jugador eliminado, con matriz y evidencia propias. No repetir Computer Use.
