# Reporte F3 — Globos efímeros de presencia

**Issue:** #40 — rediseñar el registro de eventos y añadir reacciones efímeras
**Estado:** F3 `PASS` tras la corrección AC7 y el recorrido integrado repetido el 2026-09-28. F4 sigue `ACTIVE` y requiere el segundo veredicto independiente `FINAL`.
**Branch/worktree:** `issue/40-event-log-reactions` / `.worktrees/issue-40-event-log-reactions`

## Implementación

- `Coup.js` escucha `g-reactionPresence` y guarda como máximo una entrada temporal por asiento. Una reacción nueva reemplaza la anterior y reinicia su ventana de 3.5 s; al terminar, el globo se desvanece durante 180 ms. El evento de retiro `reaction: null` quita el globo inmediatamente. Desmontar el juego retira el listener y limpia todos los timers.
- `Coup` pasa `reactionPresence` a `PlayerBoard`; el flujo integrado vuelve a mostrar los globos en el tablero real. `PlayerBoard` traduce el asiento del servidor al participante original aunque el tablero rote al observador. Cada globo muestra el emoji correspondiente y ningún avatar, ID de evento ni vínculo con una fila del registro.
- Los globos se posicionan junto al nombre, opuestos a las monedas, sin alterar el layout. La entrada y salida animan opacidad y escala; `prefers-reduced-motion` reduce ambas a `0.001s`.
- En móvil y dispositivos con puntero coarse, toggle, botón para abrir reacciones, contadores y opciones tienen objetivos de 44×44 px. La entrada de la bandeja usa solo opacidad y desplazamiento: escalar el contenedor reducía transitoriamente el área medible a 43.12 px.

## Recorrido integrado y evidencia

Se montó temporalmente el `Coup` y `PlayerBoard` reales con seis participantes y un `PreviewSocket` controlado desde Chromium. Así se comprobó el cableado real cliente y se simularon los eventos del servidor; no fue una partida con dos clientes ni un servidor de juego vivo. La autoridad, los agregados y la privacidad se cubren por separado en el contrato y las verificaciones F1.

El recorrido en escritorio y móvil no produjo errores de página y confirmó:

- Una reacción nueva del mismo asiento reemplaza la anterior y reinicia el vencimiento: después de esperar 2.6 s, la segunda seguía visible 1.3 s más tarde.
- Dos asientos pueden mostrar globos simultáneamente. Al retirar la selección propia, desaparece solo ese asiento; el otro sigue visible. Al vencer el plazo, ambos globos desaparecen.
- La bandeja contextual muestra cuatro opciones de 44×44 px durante su apertura. `prefers-reduced-motion` resuelve las duraciones del globo y emoji a `0.001s`.
- Los asientos quedan dentro del viewport con 2, 3, 4, 5 y 6 jugadores, a 1440×960 y 390×844 CSS px.

Capturas integradas de referencia, guardadas en `evidence_issue_40_F4/`:

- [Escritorio: reemplazo y dos participantes simultáneos](evidence_issue_40_F4/desktop-presence-replaced-concurrent.jpg).
- [Móvil: bandeja contextual abierta y seis asientos](evidence_issue_40_F4/mobile-reaction-tray-six-players.jpg).
- [Móvil: dos asientos y dos participantes](evidence_issue_40_F4/mobile-presence-two-players.jpg).
- [Escritorio: retiro de la reacción propia](evidence_issue_40_F4/desktop-presence-withdrawn.jpg) y [caducidad](evidence_issue_40_F4/desktop-presence-expired.jpg).
- [Matriz móvil de tres](evidence_issue_40_F4/mobile-seat-count-3.jpg), [cuatro](evidence_issue_40_F4/mobile-seat-count-4.jpg), [cinco](evidence_issue_40_F4/mobile-seat-count-5.jpg) y [seis asientos](evidence_issue_40_F4/mobile-seat-count-6.jpg); la misma matriz de 2–6 está capturada en escritorio.
- [Movimiento reducido](evidence_issue_40_F4/mobile-reduced-motion.jpg).

Las capturas históricas de `evidence_issue_40_F3/` muestran el componente aislado, no el flujo de `Coup`; las capturas F4 anteriores son la evidencia integrada vigente.

## Verificaciones

- `npm run build` en `coup-client/`: `PASS`. Build de producción completado. Avisos preexistentes: imports `logo` y `Link` sin uso en `src/App.js`; mezcla `&&`/`||` en `Coup.js:451` del cambio #46; `postcss-calc` no interpreta `dvh` en `ReferencePanel.css:100,106`; base Browserslist desactualizada.
- Recorrido Chromium integrado: `PASS`, sin errores de página; reemplazo, temporizador reiniciado, concurrencia, retiro, caducidad, targets touch y distribución 2–6 verificados.
- `git diff --check`: `PASS`; `translations.json`: parseo JSON `PASS`.
- No se ejecutaron pruebas automatizadas de cliente.

## Reapertura y cierre de F3

El primer veredicto F4 `FAIL` descubrió que `Coup` no pasaba `reactionPresence` a `PlayerBoard`; por eso los globos no aparecían en la ruta integrada (AC7 y AC8). También señaló targets táctiles insuficientes y falta de evidencia con dos asientos (AC9, AC10 y AC12). Se conectó el prop, se fijaron los controles a 44 px y se quitó el escalado del contenedor de la bandeja que reducía el hitbox durante la entrada. El walkthrough integrado ahora cubre esas rutas.

**Resultado F3:** `PASS` por revisión del Orquestador tras build y recorrido integrado. Este cierre de fase no sustituye el segundo veredicto independiente `FINAL` de F4. La decisión final de F4 queda registrada en `report_issue_40_F4.md`.
