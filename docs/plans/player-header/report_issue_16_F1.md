# Reporte issue #16 — F1 inicial y reorquestación F2

**Unidad:** https://github.com/pronficilio/coup-online/issues/16
**Worktree / rama:** `.worktrees/issue-16-player-header` / `issue/16-player-header`
**F1 inicial:** `FAILED`; las capturas originales mostraron cruces entre encabezados y cartas rivales.
**F2 reorquestada:** aprobada por el usuario; pasa la revisión visual de capturas en 2–6 jugadores, el build del cliente y `git diff --check`; build con advertencias preexistentes.
**PR integrada:** https://github.com/pronficilio/coup-online/pull/17 — merge commit `ffcca7b8cd3006d86c68f9830fa7fb615b2cc6ca` en `master`.
**Issue:** cerrada el 2026-09-26 (UTC−06:00) después de la integración.

## Cambios revisados

- `coup-client/src/components/game/PlayerBoard.js`: presenta icono y nombre junto al contador de monedas en una fila; conserva `player.money` y la señal existente `props.currentPlayer` para el turno activo.
- `coup-client/src/components/game/PlayerBoardStyles.css`: estilos de barras, texto completo sin elipsis, resplandor activo, fila móvil más baja y cartas rivales reducidas proporcionalmente. No cambia la posición de asientos ni controles.
- `coup-client/src/assets/player.webp` y `coin.webp`: copias de las fuentes WebP solicitadas.

## Resultado F1 inicial (histórico)

| Criterio | Resultado | Evidencia |
|---|---|---|
| 1. Icono, nombre y saldo en una fila | Pasa en las fixtures inspeccionadas. | Capturas actuales de 2–6 jugadores abajo. |
| 2. Neón solo en nombre activo; saldo neutro | Pasa en las fixtures con Jugador 2 activo y los demás inactivos. | Capturas actuales de 2–6 jugadores. |
| 3. Color inactivo e iconos proporcionados | Pasa en las fixtures inspeccionadas. | Capturas actuales de 2–6 jugadores. |
| 4. Fila móvil, nombre truncado y saldo íntegro a 320 CSS px | Pasa: los valores `0`, `2` y `10` se conservan y el pill de monedas queda dentro del viewport. | Capturas CDP válidas de 320×900; métricas focales abajo. |
| 5. Sin recortes ni colisiones con encabezados, cartas o controles para 2–6 jugadores | **Falla en la implementación inicial**: en 5p y 6p móviles las cartas laterales cruzaban el encabezado del observador. El baseline también mostraba la geometría saturada. | Capturas iniciales en el commit `c64551b` y baseline comparable. |
| 6. Cambios limitados a encabezado, estilos y assets | Pasa: no se modificó layout de asientos, reglas, servidor ni controles. | Diff de la rama. |

## Método y evidencia visual

Las fixtures prerenderizan el `PlayerBoard` real con `playerBoardLayout.js`, CSS y assets del cliente, con props sintéticas: 2–6 jugadores, nombre largo, saldos `0`/`2`/`10`, Jugador 2 activo y Jugador 4 eliminado en las partidas de 4–6. No son partidas conectadas ni incluyen los controles reales del shell.

Las capturas iniciales se hicieron mediante CDP con DPR 1; los PNG móviles son de 320×900 y el escritorio de 1280×1000. Las capturas comparables de baseline son del mismo tamaño. El set inicial se generó el 2026-09-26 a las 16:43 (UTC−06:00); quedó preservado en el commit `c64551b`.

| Jugadores | Escritorio F1 inicial, 1280×1000 | Móvil F1 inicial, 320×900 CSS | Baseline comparable |
|---|---|---|---|
| 2 | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_2p_desktop_cdp_final.png) | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_2p_mobile_320_cdp_final.png) | — |
| 3 | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_3p_desktop_cdp_final.png) | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_3p_mobile_320_cdp_final.png) | — |
| 4 | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_4p_desktop_cdp_final.png) | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_4p_mobile_320_cdp_final.png) | — |
| 5 | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_5p_desktop_cdp_final.png) | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_5p_mobile_320_cdp_final.png) | [escritorio](evidence/issue16_5p_desktop_cdp_baseline.png), [móvil](evidence/issue16_5p_mobile_320_cdp_baseline.png) |
| 6 | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_6p_desktop_cdp_final.png) | [captura CDP](https://github.com/pronficilio/coup-online/blob/c64551b/docs/plans/player-header/evidence/issue16_6p_mobile_320_cdp_final.png) | [escritorio](evidence/issue16_6p_desktop_cdp_baseline.png), [móvil](evidence/issue16_6p_mobile_320_cdp_baseline.png) |

### Medición focal en móvil

En ambos casos el viewport CDP medido es 320×900 CSS px, `devicePixelRatio=1` y `documentElement.clientWidth=320`. El pequeño desbordamiento lateral reportado por `innerWidth`/`scrollWidth` coincide con el borde de la geometría previa del asiento; no oculta el contador.

- **5 jugadores, cambio F1 inicial:** encabezado del observador `x=99.5…220.5`, `y=267.5…294.5`; pill de monedas `x=183.4…220.5`, completamente dentro del viewport. Los grupos laterales de Player 2 (`x=201.1…322.1`, `y=201.9…287.2`) y Player 5 (`x=−2.1…118.9`, `y=201.9…287.2`) se cruzaban con el encabezado aproximadamente 19.4 px en horizontal por 19.7 px en vertical. Métricas del documento: `innerWidth=323`, `innerHeight=909`, `scrollWidth=323`.
- **5 jugadores, baseline:** el nombre del observador ocupa `x=83.2…254.8`, `y=258.9…281.3`; la barra de monedas queda debajo, `y=285.3…303.1`. La captura también muestra el cruce con grupos laterales.
- **6 jugadores, cambio F1 inicial:** encabezado del observador `x=99.5…220.5`, `y=267.5…294.5`; pill de monedas `x=183.4…220.5`, completamente visible. Los grupos laterales estaban en `x=−0.3…120.7` y `x=199.3…320.3`, `y=212.0…297.2`; cada uno cruzaba el encabezado aproximadamente 21 px × 27 px. Métricas del documento: `innerWidth=321`, `innerHeight=903`, `scrollWidth=321`.
- **6 jugadores, baseline:** las cartas laterales ocupan `y=220.6…305.8` y se cruzan con los encabezados apilados de nombre/monedas, mostrando el mismo problema geométrico.

La primera iteración limitó el ancho del encabezado. El saldo permanecía entero, pero las cartas rivales se cruzaban con la barra móvil; ese resultado motivó la reorquestación aprobada por el usuario.

## F2 reorquestada tras feedback del usuario

- El nombre usa letra mucho menor y se muestra completo sin `…`; la barra se centra respecto al asiento para conservar el texto largo dentro del viewport. A 320 CSS px la fila mide 18 px de alto.
- Las cartas rivales se escalan proporcionalmente con `aspect-ratio: 0.68`: ancho de 29–42 CSS px en móvil y 48–70 px en escritorio; su altura resulta de la proporción. Las cartas del observador mantienen su tamaño completo.
- En la composición móvil de 6 jugadores, las cartas rivales terminan en `y=269.4` y la barra propia inicia en `y=274.0`, con 4.6 CSS px de separación.
- Revisión manual de las capturas CDP de 2–6 jugadores: nombres completos, monedas visibles y sin cruce visible de barras con cartas rivales en 5p/6p. La medición focal de 4p móvil confirma nombre `x=29.0…274.8`, pill `x=281.8…310.0`, ambos dentro del viewport CSS 320 px; la fila completa mide 18 px.
- El set actualizado, generado el 2026-09-26 a las 17:49 (UTC−06:00), está en la tabla nueva. El tablero conserva el viewport y las barras del nombre/saldo quedan dentro de él en los casos revisados.

| Jugadores | Escritorio F2, 1280×1000 | Móvil F2, 320×900 CSS |
|---|---|---|
| 2 | [captura CDP](evidence/issue16_2p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_2p_mobile_320_cdp_final.png) |
| 3 | [captura CDP](evidence/issue16_3p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_3p_mobile_320_cdp_final.png) |
| 4 | [captura CDP](evidence/issue16_4p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_4p_mobile_320_cdp_final.png) |
| 5 | [captura CDP](evidence/issue16_5p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_5p_mobile_320_cdp_final.png) |
| 6 | [captura CDP](evidence/issue16_6p_desktop_cdp_final.png) | [captura CDP](evidence/issue16_6p_mobile_320_cdp_final.png) |

## Validaciones

- `BUILD_PATH=/tmp/issue16_final_build npm run build` desde `coup-client/`: **código 0**, `Compiled with warnings`. Avisos reportados: imports sin uso en `src/App.js` (`logo`, `Link`) y `src/components/game/Coup.js` (`ReactModal`), más `caniuse-lite` desactualizado. Bundle gzip reportado: 110.94 kB JS y 3.35 kB CSS.
- `BUILD_PATH=/tmp/issue16_ratio_verified npm run build` desde `coup-client/`: **código 0**, compiló con las mismas advertencias de imports sin uso y `caniuse-lite` desactualizado. Bundle gzip: 110.94 kB JS y 3.4 kB CSS.
- `git diff --check`: pasó sin salida.
- No se añadieron ni ejecutaron tests automatizados.
- Las primeras capturas CLI que pedían ventana física de 320 px no fijaban un viewport CSS de 320 px; se descartaron y se retiraron. Este reporte solo enlaza el set CDP validado.

## Cierre

F1 inicial queda `FAILED`; F2 resuelve los problemas visuales dentro del alcance. Tras la aprobación del usuario, la implementación se integró a `master` y la issue #16 se cerró. La inspección visual, el build y `git diff --check` pasan. No se ejecutaron tests automatizados conforme al handoff.
