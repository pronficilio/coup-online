# Reporte F2 — montaje y confirmación

**Estado:** `BLOCKED` — implementación y validación estática completas; falta el recorrido funcional manual del cliente para cerrar la fase.

## Cambios revisados

- `Coup.js` monta el panel lateral junto a `PlayerBoard`. Se habilita únicamente cuando hay un `g-chooseAction` válido, el jugador local está vivo y `currentPlayer === name`. Al cambiar el turno, quedar eliminado o terminar la partida, el panel deja de mostrar controles. Los controles de desafío, bloqueo, revelación, pérdida de influencia e intercambio siguen en su propia sección.
- `ActionDecision.js` conserva selección/confirmación de objetivos y la guarda contra doble envío. La lista sigue la referencia visual: tarjeta única de pergamino, personaje declarado junto al título, bloqueadores en su línea secundaria y cápsula de precio con moneda.
- `CoupStyles.css` amplía la barra lateral y compacta las filas para mostrar las siete acciones completas en escritorio. En viewports menores el panel se superpone sin reservar espacio ni desplazar la mesa. La transición usa `opacity`, `transform`, `visibility` y `pointer-events`; `prefers-reduced-motion` la desactiva. Al ocultarse, el wrapper queda `aria-hidden` y los controles se desmontan, por lo que no queda un control invisible enfocado.
- La selección de objetivo y confirmación conservan el comportamiento previo: cancelar no emite eventos; confirmar vuelve a validar fondos/objetivo y Coup/Assassinate descuentan solo al confirmar.

## Validación

- `npm run build`: **PASS**. CRA compiló. Permanecen avisos ESLint existentes: `logo` y `Link` sin uso en `src/App.js`, `ReactModal` sin uso en `src/components/game/Coup.js`; Browserslist reporta `caniuse-lite` desactualizado.
- `git diff --check`: **PASS**; Git solo avisó que normalizará LF a CRLF en archivos del checkout.
- Revisión estática del flujo: `server/game/coup.js` emite `g-updateCurrentPlayer` y luego dirige `g-chooseAction` al socket del jugador activo. El cliente valida el dueño del turno antes de habilitar el panel. Selección/cancelación no llama a `deductCoins` ni a `g-actionDecision`; confirmación válida envía ambos como máximo una vez, en ese orden.
- Captura visual desde una partida local de dos jugadores con Edge headless: `issue_6_f2_active_turn.png` (1570 × 1149). Muestra las siete acciones completas junto al tablero durante el turno local; valida la composición visual, no el recorrido de interacción.
- No se añadieron ni ejecutaron tests automatizados.
- El recorrido funcional manual sigue pendiente: Computer Use falló (`kernel exited unexpectedly`; `windows sandbox failed: helper_unknown_error: setup refresh had errors`). No se afirma evidencia de cambio de turno, cancelación/confirmación ni respuestas en ejecución.

## Límite del protocolo de cobro

El protocolo existente recibe `g-deductCoins` y `g-actionDecision` en manejadores Socket.IO distintos. El cliente los emite una vez, en orden, bajo una guarda de envío único; esto evita duplicados por clic rápido y conserva el orden del mismo socket, pero **no constituye una transacción atómica server-side**. Cambiar el protocolo o el servidor está fuera del alcance de F2.

## Siguiente paso

Completar el recorrido manual funcional de F2 cuando el helper de navegador esté disponible; verificar cambio de dueño/fin de turno, cancelación sin cobro/envío, confirmación de Coup/Assassinate, y accesibilidad de las decisiones de respuesta. F3 permanece pendiente y no se procesa en este reporte.
