# Reporte F2 — issue #24

**Veredicto del checkpoint inicial:** `BLOCKED`; **estado actual:** `ACTIVE`

**Issue:** [#24](https://github.com/pronficilio/coup-online/issues/24), sigue `OPEN` y asignada a `pronficilio`.

**Fase siguiente:** F3 permanece `PENDING`; requiere que F2 complete su recorrido manual.

**Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`.

## Trabajo del checkpoint inicial (histórico; véanse las revisiones posteriores para el comportamiento vigente)

- `Coup.js` limita el nuevo renderer a `decision.type === 'action'`; los demás tipos siguen por la ruta genérica existente.
- El menú agrupa las opciones que contiene `decision.options` por el prefijo de `choiceId`. Las filas disponibles usan los objetos originales del servidor y `submitActionChoice` comprueba que el objeto siga presente en `decision.options` antes de enviarlo. Esta revisión es estática; no se observó tráfico Socket.IO en un navegador.
- Coup, Assassinate y Steal abren únicamente destinos contenidos en las opciones agrupadas. La cancelación vuelve al menú sin llamar al emisor; el código usa un cerrojo local para evitar doble envío.
- Las filas sin opciones no reciben handler de acción ni selector de destino, no construyen un `choiceId` y exponen el motivo con `aria-describedby`. El hint se presenta como bubble al hover/foco y queda visible para dispositivos con `hover: none` o puntero grueso. Estilos incluyen estado de foco y `prefers-reduced-motion`.
- Se añadieron entradas paralelas `es`/`en` para precios y disponibilidad. El diff de producto se limita a `Coup.js`, `CoupStyles.css` y `translations.json`.

Estos puntos son observaciones del código y no confirman el comportamiento en navegador.

## Comprobaciones ejecutadas

- `npm run build` desde `coup-client`: **exit 0**, “Compiled with warnings”; artefactos de producción generados. Tamaños reportados: 108.14 kB JS y 6.75 kB CSS gzip.
- Warnings del build: imports `logo` y `Link` sin usar en `src/App.js`; `postcss-calc` no interpreta las unidades `dvh` existentes en `src/components/game/ReferencePanel.css` (líneas 100 y 106); `caniuse-lite` está desactualizado. El reporte de lint no señala los archivos modificados.
- `git diff --check`: **pasa**.
- No se ejecutaron tests automatizados, según el handoff.
- La inspección de disponibilidad de navegador no encontró Playwright, Puppeteer, `@playwright/test`, Chromium, `chromium-browser` ni `google-chrome` disponibles en este entorno. El Chrome instalado en Windows, ejecutado desde WSL, falla antes de abrir con `/bin/bash: ... WSL (2 - ) ERROR: UtilBindVsockAnyPort:307: socket failed 1`.

## Evidencia pendiente

No se hizo recorrido manual ni se generaron capturas. Quedan sin observarse en ejecución:

- Estado normal, hover/foco y disabled comparados visualmente con las tres referencias, incluidos contraste, redondeo, calidez y ausencia de desplazamiento de filas.
- Explicación disabled al apuntar/enfocar, legibilidad en táctil, recorte en primera/última fila y posible solapamiento con objetivos o respuestas.
- Umbrales 2/3, 6/7 y 9/10 monedas; teclado (Enter/Espacio/Escape), foco restaurado al cancelar, toque y lector de pantalla.
- Selección de destinos legales, cancelación sin emisión, envío único del `choiceId` original y ausencia de emisiones al activar/enfocar filas prohibidas.
- `prefers-reduced-motion` y continuidad del renderer para otros tipos de decisión.

## Motivo y siguiente paso

En el checkpoint inicial, F2 no pudo recibir `CLOSED / PASS` porque no se pudo abrir la aplicación en un navegador. El 2026-09-27 la usuaria inspeccionó el cliente local y reanudó F2 con dos hallazgos concretos:

1. Los divisores entre filas se perciben como extremos curvos del contorno de hover. Separar cada divisor a su propia caja/regla, conservarlo al hover y evitar colisión con filas deshabilitadas.
2. Mientras exista una decisión `action`, el panel debe estar a la derecha y por debajo de la altura del control “Resumen de reglas”, ocupando gran parte del viewport como overlay sobre PlayerBoard y cartas. Mantener responsive y no cambiar otras decisiones.

El Agente Menor implementó los ajustes en `Coup.js`/`CoupStyles.css`. El divisor es un hermano decorativo que solo se inserta entre acciones disponibles contiguas; el panel queda fixed a la derecha desde 1200 px, debajo de la banda vertical de CheatSheet, con max-height/scroll, y en tablet/móvil vuelve al flujo normal. El renderer de otros tipos de decisión y el control de reglas no cambian.

La nueva inspección visual y el recorrido restante siguen pendientes; esta reanudación no cambia criterios ni declara F2 cerrada. Issue abierta, sin PR ni integración.

## Validación del checkpoint visual

- `npm run build` desde `coup-client`: **exit 0**, compilado con los mismos warnings del checkpoint previo (imports sin uso en `App.js`, parser `postcss-calc` para `dvh` en `ReferencePanel.css`, `caniuse-lite` desactualizado). Ninguno señala archivos de este cambio.
- `git diff --check`: **pasa**.
- `curl -I http://localhost:3006`: **200 OK** antes del reinicio. El watcher HMR no detectó las ediciones en `/mnt/e`; el Orquestador reinició solo la sesión CRA del worktree, confirmó compilación exitosa del nuevo HEAD y volvió a verificar HTTP 200. La usuaria ya puede inspeccionar el checkpoint.
- No se ejecutaron tests automatizados. El resultado visual de esta corrección aún no fue revisado por la usuaria.

## Segunda revisión visual — corrección de anclaje en curso

Después de revisar el checkpoint anterior en `http://localhost:3006`, la usuaria pidió que la tabla quede en el lado izquierdo, alineada horizontalmente con el control “Resumen de reglas” y directamente debajo. Observó que el panel separado se alejaba del control al hacer scroll. El requisito vigente es agrupar resumen + acciones en un rail/ancla compartido que mantenga fija su distancia vertical durante el scroll; el grupo debe superponerse al PlayerBoard durante la decisión. Esto reemplaza la colocación a la derecha descrita en la revisión anterior.

La corrección acotada se delegó al Agente Menor para modificar el montaje DOM/CSS del tipo `action`. En el nuevo diff, `Coup.js` monta `CheatSheetModal` y el renderer action juntos en `ActionDecisionRail` solo durante una acción. CSS fija el rail en las coordenadas ya usadas por el control (`left: 10px; top: 110px` en mobile/tablet, `left: 10vw; top: 22vh` desde 1024 px), con un gap de 10 px; el panel tiene ancho limitado, máximo de altura, scroll vertical propio y `z-index: 40` sobre el tablero. Fuera de ese caso, `CheatSheetModal` queda en su posición previa y los demás tipos de decisión permanecen en `.DecisionsSection`. No cambian `choiceId`, envío ni protocolo. Los divisores siguen como elementos hermanos rectos, únicamente entre acciones disponibles contiguas.

Revisé el diff y `git diff --check` pasa. `npm run build` desde `coup-client` terminó con **exit 0**, “Compiled with warnings”; produce 108.22 kB JS y 6.91 kB CSS gzip. Warnings: `logo`/`Link` sin uso en `src/App.js`; `postcss-calc` no parsea `dvh` en `ReferencePanel.css:100,106`; caniuse-lite desactualizado. El build no señala los archivos editados. No ejecuté tests automatizados.

El checkpoint de producto/documentación se publicó en `b59bb022ee79e455fce3bfe281255cee359f034e`. El Orquestador reinició CRA desde ese HEAD y confirmó `Compiled successfully`; `/static/js/bundle.js` respondió HTTP 200 y pesa 2,393,146 bytes. Confirmó que se creó con el nuevo `ActionDecisionRail`. El cliente está listo en `http://localhost:3006` con backend `:18000`. La usuaria aún debe inspeccionar el rail izquierdo, alineación/espaciado al scroll, overlay, divider/hover y responsive; build y carga exitosa no sustituyen su revisión visual.

## Tercera revisión visual — portal y solo opciones legales

La usuaria señaló que tanto el resumen como las acciones todavía se desplazaban al hacer scroll y pidió que ambos queden inmóviles en el viewport, juntos, en la misma posición y con alineación/separación constante. También cambió el contenido visible del panel: solo se muestran acciones para las que `decision.options` contiene una o más opciones; las acciones no permitidas deben desaparecer sin ocupar espacio. Se preservan en el código las ramas/estilos/hints disabled para posible reactivación, pero no se muestran ahora. El objetivo es reducir la altura inicial del panel.

Revisé la cadena authored JoinGame/CreateGame → Coup y CSS. No encontré `transform`, `filter`, `perspective`, `contain` ni `will-change` en ancestros de `ActionDecisionRail`; `.GameContainer` usa `position: relative` e `isolation: isolate`, que no crean por sí solos un containing block para fixed. Para sacar el rail del árbol del juego y fijarlo al viewport real, el Agente Menor usó `createPortal(..., document.body)` solo durante una decisión action. El control se omite del header durante ese caso para evitar duplicado; las demás decisiones conservan renderer/posición previos.

El renderer recorre las filas existentes y retorna `null` cuando no hay opciones, sin montar markup/handlers/IDs y conservando las ramas disabled/hint y el CSS en el código. Las opciones legales originales, destinos/cancelación y protocolo quedan intactos. Ajusté el divisor para buscar la siguiente acción legal: conserva la regla entre filas permitidas contiguas aunque entre ellas se omitan acciones; sigue como hermano separado del botón/hover. Revisé el diff; `git diff --check` pasa. Repetí `npm run build` desde `coup-client` tras ese ajuste; terminó **exit 0**, compilado con warnings conocidos: imports sin uso `logo`/`Link` en `src/App.js`, `postcss-calc` no parsea unidades `dvh` de `ReferencePanel.css:100,106`, y caniuse-lite desactualizado. Tamaños gzip: 108.26 kB JS y 6.91 kB CSS. No ejecuté tests automatizados.

El checkpoint completo se publicó en `4be6ace7c5d345ca0068c21cc77120cfa3cc6694`. El Orquestador reiniciará solo CRA desde ese HEAD y verificará bundle/HTTP antes de que la usuaria haga su siguiente revisión. F2 permanece `ACTIVE` y la revisión visual aún no se ha aprobado.
