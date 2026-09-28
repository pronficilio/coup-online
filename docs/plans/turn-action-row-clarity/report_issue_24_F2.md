# Reporte F2 — issue #24

**Veredicto del checkpoint inicial:** `BLOCKED` (histórico); **veredicto actual F2:** `CLOSED / PASS` con excepción aceptada en AC9.

**Issue:** [#24](https://github.com/pronficilio/coup-online/issues/24), sigue `OPEN` y asignada a `pronficilio`.

**Fase siguiente:** F3 `ACTIVE / READY` para Verifier independiente FINAL; brief en `docs/plans/active/verifier_issue_24_F3.md`.

**Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`.

**Comportamiento vigente:** rail `absolute` en portal a `document.body`, alineado con Resumen de reglas mediante coordenadas documentales; aparecen solo acciones legales. El panel inicia expandido y se compacta tras mouseleave de 500 ms, con títulos de fila al 70% y acciones/precios disponibles. La usuaria aprobó el preview y aceptó expresamente que el desmontaje de detalles no tiene animación/transición visible. Esta diferencia queda como waiver de la parte de transición de desmontaje en AC9, no como comportamiento verificado.

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

## Evidencia no disponible en el checkpoint inicial (histórico; el cierre vigente aparece al final)

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

El checkpoint completo de código se publicó en `4be6ace7c5d345ca0068c21cc77120cfa3cc6694`; los docs están en `f573e1ca1e0274b78e119480c4d0f9fa768deeee`. El Orquestador reinició CRA desde ese HEAD y confirmó `Compiled successfully`; `http://localhost:3006/static/js/bundle.js` responde HTTP 200 (2,393,674 bytes) y el backend `:18000` sigue activo. Preview listo para la usuaria. F2 permanece `ACTIVE`; la revisión visual aún no se ha aprobado.

## Cuarta revisión visual — rail absolute y ciclo de compactación

La usuaria pidió sustituir el `position: fixed` por `position: absolute` (explícitamente no fixed) y conservar el anclaje a la izquierda, debajo y alineado con “Resumen de reglas”. El rail mide el `.CheatSheet` mediante `getBoundingClientRect()` y guarda `rect.left + scrollX` / `rect.top + scrollY` como coordenadas del documento; no recalcula al hacer scroll, así que resumen y acciones se desplazan juntos conservando su relación. En resize re-mide una sonda invisible que conserva los estilos responsive del ancla. El portal a `document.body` se mantiene.

En cada nueva decisión action, el panel empieza expandido. En `(hover: hover) and (pointer: fine)`, una primera entrada del mouse habilita el ciclo: al salir comienza un timer de 500 ms; reentrar lo cancela. Al vencer, el ancho del panel baja a 50% del ancho normal del rail y, tras la transición breve, se desmontan del DOM prompt, descripciones, metadatos y chips de blockers, mientras nombres, precios y controles permanecen. Reentrar restaura ancho y detalles. Dispositivos touch/no-hover no compactan. `prefers-reduced-motion` elimina transiciones y espera para desmontar. Se limpian timers/frames al reentrar, iniciar/cerrar/pausar/finalizar decisión y desmontar el componente. Las opciones y `choiceId` del servidor, targets/cancelación, el filtro de acciones legales, separadores y otros tipos de decisión no cambian.

Revisé el diff de `Coup.js` / `CoupStyles.css` y añadí medición de recuperación en `componentDidMount` por si el evento action precediera al primer render medible. `git diff --check`: **pasa**. `npm run build` desde `coup-client`: **exit 0**, compilado con warnings. Warnings observados: `logo` y `Link` sin uso en `src/App.js`; `postcss-calc` no parsea unidades `dvh` en `ReferencePanel.css:100,106`; caniuse-lite desactualizado. Ningún warning apunta a los archivos de esta modificación. Tamaños gzip: 109.37 kB JS y 7.07 kB CSS. No se ejecutaron tests automatizados ni recorrido visual en navegador; el build no comprueba la relación al scroll ni los tiempos/reacción del mouse. El código de producto quedó en commit `e77415d`; el checkpoint principal de documentación quedó en `a9c9287`, con sincronización del tracker en commit posterior. El Orquestador debe recargar solo CRA desde el HEAD publicado y confirmar que el bundle nuevo está listo; backend `:18000` permanece activo.

F2 sigue `ACTIVE`; la usuaria aún debe revisar absolute/scroll, ancho y desmontaje/re-montaje de detalles, reentrada antes de 500 ms, touch/no-hover, reduced-motion y responsive. Issue abierta; no hay PR ni integración.

## Quinta revisión visual — escala de títulos compactos

La usuaria pidió reducir 30% el tamaño de los nombres de cada acción cuando el panel está compacto, con transición rápida, dejando intacto el encabezado general. Añadí únicamente estilos a `.DecisionActionLabel`: 0.812rem frente a 1.16rem normal en escritorio (70%) y 0.728rem frente a 1.04rem bajo 560px (70%). `font-size` transiciona en 120 ms; `prefers-reduced-motion: reduce` desactiva esa transición. Al quitar `DecisionActionPanel--compact`, los títulos regresan a tamaño normal junto con el ancho y los detalles rehidratados. No cambian renderer, ciclo de timers, opciones ni protocolo.

`git diff --check`: **pasa**. `npm run build` desde `coup-client`: **exit 0**, “Compiled with warnings”. Warnings preexistentes: `logo`/`Link` sin uso en `App.js`, `postcss-calc` no parsea `dvh` en `ReferencePanel.css:100,106`, caniuse-lite desactualizado; ninguno apunta a `CoupStyles.css`. Gzip: JS 109.37 kB, CSS 7.11 kB (+35 B). No se ejecutaron tests automatizados ni recorrido visual para esta corrección. En ese checkpoint de la quinta revisión, la inspección de tamaño/timing todavía estaba pendiente; la aprobación posterior y el waiver se registran abajo.

El cambio CSS de esta revisión está en commit de producto `9af435d`; el commit de sincronización documental sigue inmediatamente después. No afecta al resto del ciclo de compactación ni a los detalles que se remontan al expandir.

## Cierre F2 — aprobación humana y waiver explícito de AC9

La usuaria revisó el preview vigente en `http://localhost:3006`, aprobó el resultado para cerrar F2 y señaló que los detalles se desmontan sin animación/transición visible. Aceptó expresamente esa limitación. F2 queda `CLOSED / PASS` con un waiver acotado a la transición visual del desmontaje de prompt/descripciones/metadatos de AC9. El hallazgo permanece registrado aquí; no se afirma que la animación de desmontaje haya pasado. La transición rápida de ancho y font-size, el timer, la restauración de detalles al reentrar y los demás requisitos permanecen sujetos a la revisión adversarial de F3.

La aprobación de preview no sustituye la revisión independiente de opciones/`choiceId`, flujo de destino/cancelación, responsive, decisiones no-action, accesibilidad ni estado tras rebase. El Verifier recibe esos puntos en `docs/plans/active/verifier_issue_24_F3.md`. La issue permanece `OPEN`, asignada a `pronficilio`; no hay PR ni integración.

El branch se rebaseó sobre `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`. Al resolver conflictos en `Coup.js`, se conservaron pausa/overlay y retorno de foco de master, junto con los timers y estado compacto de #24; los conflictos funcionales se compilaron antes de continuar. El resultado final de `git diff --check` y del build de este HEAD rebaseado se registra al cierre del checkpoint abajo.

## Validación final del cierre y límites

- Rebase completado sobre `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe` (HEAD pre-cierre documental `5b618d22dbf3b596cae703555f1a7cb839ffea4d`). Conflictos funcionales de `Coup.js` se resolvieron preservando `gamePaused`, el pause overlay y retorno de foco de master, más limpieza/reinicio del ciclo compacto de #24.
- `git diff --check`: **exit 0**, sin errores.
- `npm run build` en `coup-client`: **exit 0**, `Compiled with warnings`. Warnings: `logo` y `Link` sin uso en `src/App.js`; `postcss-calc` no parsea unidades `dvh` en `ReferencePanel.css:100,106`; `caniuse-lite` desactualizado; deprecación Node `fs.F_OK`. Ninguno apunta a archivos del renderer de acciones. Gzip: JS 109.82 kB, CSS 8.17 kB.
- No se ejecutaron tests automatizados. El build valida integración/compilación, no reemplaza el recorrido del Verifier.
- La aprobación humana del preview se registró antes del rebase; no se repitió el recorrido visual después de integrar el pause overlay de master. El Verifier debe revisar esa integración además de los criterios del renderer.

F2 queda `CLOSED / PASS` por aprobación del preview y revisión/build de la unidad, con waiver explícito para la animación visual ausente al desmontar detalles. F3 está `ACTIVE / READY`; la issue sigue abierta, sin PR ni integración.
