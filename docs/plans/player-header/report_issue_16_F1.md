# Reporte F1 — issue #16

**Unidad:** https://github.com/pronficilio/coup-online/issues/16
**Worktree / rama:** `.worktrees/issue-16-player-header` / `issue/16-player-header`
**Veredicto:** `FAILED` — requiere reorquestación por colisiones que exceden el alcance autorizado.
**PR de revisión (draft):** https://github.com/pronficilio/coup-online/pull/17
**Issue:** permanece abierta. El PR documenta este veredicto fallido y no está listo para integrar.

## Cambios revisados

- `coup-client/src/components/game/PlayerBoard.js`: presenta icono y nombre junto al contador de monedas en una fila; conserva `player.money` y la señal existente `props.currentPlayer` para el turno activo.
- `coup-client/src/components/game/PlayerBoardStyles.css`: estilos de barras, truncado del nombre, resplandor activo y ancho/inset local del encabezado. No cambia la posición de asientos, cartas ni controles.
- `coup-client/src/assets/player.webp` y `coin.webp`: copias de las fuentes WebP solicitadas.

## Resultado frente a criterios

| Criterio | Resultado | Evidencia |
|---|---|---|
| 1. Icono, nombre y saldo en una fila | Pasa en las fixtures inspeccionadas. | Capturas actuales de 2–6 jugadores abajo. |
| 2. Neón solo en nombre activo; saldo neutro | Pasa en las fixtures con Jugador 2 activo y los demás inactivos. | Capturas actuales de 2–6 jugadores. |
| 3. Color inactivo e iconos proporcionados | Pasa en las fixtures inspeccionadas. | Capturas actuales de 2–6 jugadores. |
| 4. Fila móvil, nombre truncado y saldo íntegro a 320 CSS px | Pasa: los valores `0`, `2` y `10` se conservan y el pill de monedas queda dentro del viewport. | Capturas CDP válidas de 320×900; métricas focales abajo. |
| 5. Sin recortes ni colisiones con encabezados, cartas o controles para 2–6 jugadores | **Falla**: en 5p y 6p móviles los grupos de cartas/asientos laterales cruzan el encabezado del jugador observador. El baseline también muestra la geometría saturada. | Capturas actuales y baseline de 5p/6p más rectángulos CDP. |
| 6. Cambios limitados a encabezado, estilos y assets | Pasa: no se modificó layout de asientos, reglas, servidor ni controles. | Diff de la rama. |

## Método y evidencia visual

Las fixtures prerenderizan el `PlayerBoard` real con `playerBoardLayout.js`, CSS y assets del cliente, con props sintéticas: 2–6 jugadores, nombre largo, saldos `0`/`2`/`10`, Jugador 2 activo y Jugador 4 eliminado en las partidas de 4–6. No son partidas conectadas ni incluyen los controles reales del shell.

Las capturas finales se hicieron mediante CDP con DPR 1 y `visualViewport` de 320×900 CSS px en móvil; los PNG móviles son de 320×900. El escritorio es 1280×1000. Las capturas comparables de baseline son del mismo tamaño. El set final focal se generó el 2026-09-26 a las 16:43 (UTC−06:00).

| Jugadores | Escritorio actual, 1280×1000 | Móvil actual, 320×900 CSS | Baseline comparable |
|---|---|---|---|
| 2 | [captura CDP](evidence/issue16_2p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_2p_mobile_320_cdp_final.png) | — |
| 3 | [captura CDP](evidence/issue16_3p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_3p_mobile_320_cdp_final.png) | — |
| 4 | [captura CDP](evidence/issue16_4p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_4p_mobile_320_cdp_final.png) | — |
| 5 | [captura CDP](evidence/issue16_5p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_5p_mobile_320_cdp_final.png) | [escritorio](evidence/issue16_5p_desktop_cdp_baseline.png), [móvil](evidence/issue16_5p_mobile_320_cdp_baseline.png) |
| 6 | [captura CDP](evidence/issue16_6p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_6p_mobile_320_cdp_final.png) | [escritorio](evidence/issue16_6p_desktop_cdp_baseline.png), [móvil](evidence/issue16_6p_mobile_320_cdp_baseline.png) |

### Medición focal en móvil

En ambos casos el viewport CDP medido es 320×900 CSS px, `devicePixelRatio=1` y `documentElement.clientWidth=320`. El pequeño desbordamiento lateral reportado por `innerWidth`/`scrollWidth` coincide con el borde de la geometría previa del asiento; no oculta el contador.

- **5 jugadores, cambio actual:** encabezado del observador `x=99.5…220.5`, `y=267.5…294.5`; pill de monedas `x=183.4…220.5`, completamente dentro del viewport. Los grupos laterales de Player 2 (`x=201.1…322.1`, `y=201.9…287.2`) y Player 5 (`x=−2.1…118.9`, `y=201.9…287.2`) se cruzan con el encabezado aproximadamente 19.4 px en horizontal por 19.7 px en vertical. Métricas del documento: `innerWidth=323`, `innerHeight=909`, `scrollWidth=323`.
- **5 jugadores, baseline:** el nombre del observador ocupa `x=83.2…254.8`, `y=258.9…281.3`; la barra de monedas queda debajo, `y=285.3…303.1`. La captura también muestra el cruce con grupos laterales.
- **6 jugadores, cambio actual:** encabezado del observador `x=99.5…220.5`, `y=267.5…294.5`; pill de monedas `x=183.4…220.5`, completamente visible. Los grupos laterales están en `x=−0.3…120.7` y `x=199.3…320.3`, `y=212.0…297.2`; cada uno cruza el encabezado aproximadamente 21 px × 27 px. Métricas del documento: `innerWidth=321`, `innerHeight=903`, `scrollWidth=321`.
- **6 jugadores, baseline:** las cartas laterales ocupan `y=220.6…305.8` y se cruzan con los encabezados apilados de nombre/monedas, mostrando el mismo problema geométrico.

El ancho del encabezado se limitó y los encabezados de borde se alinearon hacia el interior. El saldo permanece entero, pero la separación no basta para quitar los cruces en 5p/6p móviles. El baseline confirma que la saturación del tablero ya existe; el nuevo bloque de encabezado no puede eliminarla dentro del límite de CSS local sin mover asientos, cartas o controles. Esa geometría está fuera del alcance de #16 y requiere reorquestación. No se amplió el alcance.

## Validaciones

- `BUILD_PATH=/tmp/issue16_final_build npm run build` desde `coup-client/`: **código 0**, `Compiled with warnings`. Avisos reportados: imports sin uso en `src/App.js` (`logo`, `Link`) y `src/components/game/Coup.js` (`ReactModal`), más `caniuse-lite` desactualizado. Bundle gzip reportado: 110.94 kB JS y 3.35 kB CSS.
- `git diff --check`: pasó sin salida.
- No se añadieron ni ejecutaron tests automatizados.
- Las primeras capturas CLI que pedían ventana física de 320 px no fijaban un viewport CSS de 320 px; se descartaron y se retiraron. Este reporte solo enlaza el set CDP validado.

## Siguiente paso

F1 queda `FAILED` y requiere que el Orquestador reorqueste el problema de geometría si #5 debe cumplirse en 5p/6p móviles. Por solicitud explícita del usuario, el trabajo se publica en un PR draft para revisión de la evidencia, con este fallo señalado. Mantener la issue abierta; no integrar ni cerrar la issue.
