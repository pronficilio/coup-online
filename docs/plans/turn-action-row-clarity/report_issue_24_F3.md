# Reporte F3 — verificación final de issue #24

**Veredicto:** `FAIL`
**Checkpoint:** F3, FINAL
**Commit revisado:** `6d63199910c5a0e3b24ed60c847eef1bb231f6f7`
**Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`
**Base:** `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`

## Hallazgo que bloquea PASS

`renderActionDecision()` se monta dos veces para una decisión `action`:

- El rail portado a `document.body` lo renderiza en `Coup.js:793-797`.
- `DecisionsSection` lo vuelve a renderizar en `Coup.js:838-846` (`:845`).

No hay una regla CSS que oculte la segunda instancia. Por tanto, el DOM contiene dos paneles y dos juegos de filas para la misma decisión. Ambos reutilizan los mismos IDs de accesibilidad y refs de filas/destinos; al abrir o cancelar una selección de objetivo, el foco puede acabar en la copia dentro de `DecisionsSection` en vez de permanecer en el rail. Esto incumple AC1/AC7 y la ubicación única solicitada para el rail. El hallazgo basta para devolver F3 a corrección; no modifiqué producto.

**Reproducción para el siguiente checkpoint:** al recibir `decision.type === 'action'`, inspeccionar el DOM y contar `.DecisionActionPanel`: se montan una instancia bajo `.ActionDecisionRail` y otra bajo `.DecisionsSection`. Revisar además el foco después de abrir un destino y cancelar.

## Validaciones ejecutadas

- `git status --short --branch` al inicio de la revisión: worktree limpio en `issue/24-turn-action-row-clarity`, siguiendo `origin/issue/24-turn-action-row-clarity`. Al entregar, el único cambio es este reporte F3 autorizado.
- `git rev-parse HEAD`: `6d63199910c5a0e3b24ed60c847eef1bb231f6f7`.
- `git rev-parse origin/master`: `45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`.
- `git diff --check origin/master...HEAD`: **exit 0**.
- `npm run build` en `coup-client`: **exit 0**, `Compiled with warnings`. Warnings de `App.js` (imports `logo`/`Link` sin uso), `ReferencePanel.css` (`postcss-calc` con `dvh`) y `caniuse-lite` desactualizado. El build produjo JS gzip de 109.82 kB y CSS gzip de 8.17 kB.
- No se agregaron ni ejecutaron tests automatizados.

## Límites de evidencia

La aprobación visual humana previa y el waiver explícito de AC9 para la desaparición sin animación se toman del handoff F2; no se reinterpretan como verificación del comportamiento duplicado ni como evidencia de interacciones tras el rebase. No hice recorrido de navegador en F3. La revisión estática confirma el montaje duplicado; scroll, foco y flujo de objetivos deben repetirse en navegador una vez corregido.

El handoff referencia `docs/agentes/VERIFICADOR_CI.md`, pero ese archivo no está presente en este worktree ni en `/mnt/e/dev/coup`; seguí los límites y criterios explícitos de `docs/plans/active/verifier_issue_24_F3.md` y del plan enlazado.

## Recheck F3 — renderer único en HEAD rebaseado

**Veredicto:** `BLOCKED` — la corrección estática y los gates pasan, pero queda pendiente observar el DOM y las interacciones del navegador. Se conserva arriba el `FAIL` histórico del primer F3.

- **Checkpoint:** F3, FINAL recheck
- **Commit:** `d7cb8f2f5a591f5671aee928e175b4ec875e3adb`
- **Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`
- **Base:** `origin/master@64c1b295fe9586ea05c4e7dc2a713faec948ec24`

### CLAIM

En una decisión `action`, el rail es el único propietario del panel; opciones, targets, envío y foco conservan el contrato existente, mientras pausa y ciclo compacto siguen intactos tras el rebase.

### CI_GATES: PASS

- Al inicio: worktree limpio, branch `issue/24-turn-action-row-clarity`, HEAD exacto `d7cb8f2f5a591f5671aee928e175b4ec875e3adb`; `origin/master` y `git merge-base HEAD origin/master` devuelven `64c1b295fe9586ea05c4e7dc2a713faec948ec24`.
- `git diff --check origin/master...HEAD`: **exit 0**.
- En `coup-client`, `npm run build`: **exit 0**, `Compiled with warnings`; gzip reportado: JS 109.81 kB, CSS 8.17 kB. Warnings: imports `logo`/`Link` sin uso en `src/App.js`, `postcss-calc` no interpreta `dvh` en `ReferencePanel.css:100,106`, `caniuse-lite` desactualizado y deprecación de Node `fs.F_OK`.
- No ejecuté tests automatizados, de acuerdo con el handoff.

### Revisión adversarial estática

- `git show c66c4ba -- coup-client/src/components/game/Coup.js` confirma que el fix elimina únicamente la segunda llamada a `renderActionDecision()` en `DecisionsSection`. `rg -n "renderActionDecision\(" coup-client/src/components/game/Coup.js` muestra la definición y una sola invocación, en `Coup.js:796`, dentro del `createPortal` de `.ActionDecisionRail` (`:793-797`). En `DecisionsSection` (`:838-878`) siguen Codex y el renderer condicionado a `decision.type !== 'action'`; no queda un segundo panel action.
- Con una sola instancia React, los IDs `action-decision-title` y `decision-action-*`, `actionRowRefs` y `firstActionTargetRef` tienen un solo propietario en el renderer. Abrir target enfoca el primer target (`:585-592`, `:641-651`); Cancelar/Escape vuelve a enfocar la fila original (`:595-608`). La unicidad real del DOM y el foco efectivo no se observaron en navegador.
- `actionOptionGroups()` agrupa las referencias de las opciones recibidas (`:190-197`); solo retorna markup para filas con opciones (`:660-721`). Targets salen del mismo grupo (`:619`, `:641-651`). `submitActionChoice()` rechaza opciones ausentes y usa cerrojo antes de emitir; `submitChoice()` envía el `choiceId`, `decisionId` y `stateVersion` (`:566-583`). Static pass; no inspeccioné un evento real ni una resolución en juego.
- Portal a `document.body` y `.ActionDecisionRail { position: absolute }` están en `:793-797` y `CoupStyles.css:1457-1467`. La medición usa `getBoundingClientRect()` más `scrollX/scrollY` y vuelve a medir en resize (`Coup.js:464-487`). La transición compacta espera 500 ms (`:542-563`), CSS reduce ancho a 50% y las etiquetas al 70% (`CoupStyles.css:1206-1219,1413-1419`). Reentrada restaura; touch/no-hover no inicia el ciclo; reduced-motion quita transiciones; cleanup está en `:497-509`, `:459-462` y al cambiar/cerrar/pausar/finalizar decisión. Estos resultados son inspección de código, no reproducción temporal ni DOM.
- Comparé pausa y retorno de foco con `origin/master@64c1b29`: `g-gamePaused`, `PauseOverlay`, el bloqueo de decisiones, la trampa de foco y el retorno al reanudar permanecen (`Coup.js:376-420,884-904`); el renderer action también marca submitted durante pausa (`:611-615`). No observé un timeout/pausa/resume en juego.

### Evidencia visual humana disponible

La usuaria revisó el preview `http://localhost:3006` en varias iteraciones, dijo que el diseño se veía muy bien y aprobó el preview para cerrar F2. También detectó que el desmontaje de detalles no tenía transición visible y aceptó explícitamente esa limitación (waiver acotado de AC9). Esto respalda la apariencia/layout y la excepción aceptada; no confirma que el DOM del nuevo HEAD tenga un solo panel ni el foco/flujo de targets tras el fix `c66c4ba`.

### Verificación dinámica pendiente y preview preparado

El Orquestador compiló el worktree exacto `d7cb8f2` y mantiene CRA en `http://localhost:3006` (HTTP 200; `/static/js/bundle.js` HTTP 200). En ese bundle encontré una llamada `this.renderActionDecision(decision` y `ACTION_PANEL_COMPACT_DELAY_MS = 500`. El handshake local Socket.IO de `http://localhost:18000/socket.io/?EIO=3&transport=polling` respondió HTTP 200. No hay Chromium, Chrome, Firefox ni Playwright instalados en esta sesión, así que no pude observar la interacción ni el DOM real. Los procesos pertenecen al Orquestador: CRA está en su sesión `46092`; el backend `:18000` ya estaba activo y debe permanecer levantado durante la revisión.

**Recorrido humano mínimo para desbloquear F3:** abre dos ventanas/perfiles en `http://localhost:3006`, crea una partida en una y únete con la otra; inicia y espera una decisión action. En esa pantalla:

1. En DevTools Console evalúa:

   ```js
   [document.querySelectorAll('.DecisionActionPanel').length,
    document.querySelectorAll('.ActionDecisionRail .DecisionActionPanel').length,
    document.querySelectorAll('.DecisionsSection .DecisionActionPanel').length]
   ```

   Resultado esperado: `[1, 1, 0]`. Para duplicados de IDs dentro del rail, evalúa:

   ```js
   const ids = [...document.querySelectorAll('.ActionDecisionRail [id]')].map(el => el.id);
   ids.filter((id, i) => ids.indexOf(id) !== i)
   ```

   Resultado esperado: `[]`.

2. Haz clic en una acción con destino legal (por ejemplo, Steal si el oponente tiene monedas). Confirma que se enfoca el primer destino; pulsa Escape o Cancelar y confirma que el foco vuelve a esa misma fila, el menú sigue activo y no se envió la decisión. Vuelve a elegir y selecciona un destino; confirma una sola resolución.

3. En la misma decisión prueba el ciclo de mouse: salir y volver antes de 500 ms debe mantener el panel expandido; salir por más de 500 ms lo compacta al 50%, reduce solo el título de cada fila al 70% y mantiene precios/controles; volver a entrar restaura los detalles. La transición visual al desmontar detalles no se debe volver a pedir (waiver AC9 aceptado).

4. Si el recorrido permite completar la cobertura responsive, comprueba scroll/resize manteniendo rail y Resumen de reglas alineados, modo touch/no-hover sin compactar y `prefers-reduced-motion`. Para el camino de pausa, dejar vencer una decisión (~60 s por timeout predeterminado) debe enfocar el overlay; reanudar como jugador autorizado debe devolver el foco al juego.

Mientras no llegue observación humana de los pasos 1–3, `ADVERSARIAL_CHECK=BLOCKED` y `OVERALL=BLOCKED`; el bundle/build no sustituyen la inspección del DOM ni del foco. La revisión visual previa y el waiver de AC9 permanecen vigentes.

**Siguiente dueño:** Orquestador; compartir el recorrido anterior con la usuaria y reabrir F3 cuando haya evidencia de DOM/foco/interacción. No se modificó código de producto ni el issue remoto.

## Recheck F3 final — capas de ReactModal y confirmación visual

**Veredicto:** `BLOCKED`. Se conservan los veredictos históricos `FAIL` del primer F3 y `BLOCKED` del recheck anterior.

- **Branch:** `issue/24-turn-action-row-clarity`
- **Base y merge-base:** `origin/master@64c1b295fe9586ea05c4e7dc2a713faec948ec24`
- **Código revisado:** HEAD `d7cb8f2f5a591f5671aee928e175b4ec875e3adb` más el diff local de `CheatSheetModal.js` y `RulesModal.js`. El diff de producto contiene únicamente una propiedad de estilo por archivo; no hay un commit nuevo para estos dos cambios todavía.

### Evidencia de esta vuelta

- `git status --short --branch` confirma la rama y el HEAD anteriores; el merge-base coincide con la base. Los únicos cambios de producto en el worktree son los dos componentes de modal. `git diff --check`: **exit 0**.
- Revisión del orden de capas: `.ActionDecisionRail` usa `z-index: 40` (`CoupStyles.css:1457-1460`); ambos `ReactModal` asignan `style.overlay.zIndex = 100` (`RulesModal.js:29`, `CheatSheetModal.js:45`); `.reference-panel__overlay` queda en `1000` (`ReferencePanel.css:64-68`) y `.PauseOverlay` en `2001` (`CoupStyles.css:285-288`). Así cada modal pedido supera el rail y las capas de panel de referencia/pausa conservan su prioridad.
- La usuaria comprobó en `localhost:3006` que hay un solo panel; al seleccionar una acción con destino, aparece Cancelar y funciona. Después revisó los modales actualizados de Reglas y Resumen y confirmó que se ven bien por encima del rail. No reportó inspección de DevTools ni prueba de foco de teclado; no las registro como observadas.
- El build de estos cambios de estilo terminó `npm run build` con exit 0 según la confirmación del Orquestador; conserva los warnings conocidos del cliente. No repetí el build ni ejecuté tests automatizados, conforme al encargo.
- La revisión de código anterior sigue confirmando el único montaje, el filtro por opciones legales, choiceId original, refs de target/cancelación, cerrojo de envío, portal absoluto, ciclo compacto y compatibilidad estática con pausa/no-action. La aprobación visual previa y el waiver AC9 para el desmontaje sin transición siguen vigentes.

### Único criterio dinámico pendiente

La usuaria confirmó que el panel único se ve, que Cancelar aparece y funciona, y que los modales actualizados quedan sobre el rail. La ruta de foco/refs se revisó en código; no registro que la usuaria haya probado o confirmado el foco de teclado. La única observación dinámica pendiente para este recheck es elegir un destino legal y ver que la acción se resuelve exactamente una vez; Cancelar por sí solo no recorre el envío.

**Recorrido mínimo para desbloquear:** en una partida de dos ventanas con una decisión action, elige una acción con destino legal (por ejemplo, Steal si el oponente tiene monedas), selecciona un destino y confirma que la decisión se resuelve una sola vez. No hace falta volver a revisar la ausencia de animación de desmontaje; el waiver AC9 sigue aceptado. Preview actual: `http://localhost:3006`, backend Socket.IO `:18000`.

**Siguiente dueño:** Orquestador/usuaria; registrar el resultado de ese recorrido y reemitir F3 si se confirma. No se modificó producto ni tracker remoto.

## Base drift y aprobación humana para checkpoint

Después de este recheck, `origin/master` avanzó de `64c1b29` a `951147234b6f8f640718ed945de5907140a724a9` al integrar PR #39/#28. La inspección del rango real desde `64c1b29` muestra cambios compartidos concretos: `courtCount`, atributos de ventana de respuesta y datos de layout para `PlayerBoard`, además de CSS del EventLog/tablero y actualización de `server/game/coup.js`. PR #39 no borró el action rail ni la documentación #24; su ausencia en el diff de `master` refleja que el trabajo #24 sigue solo en este branch. Se requiere rebase integrando los cambios de #28 y conservando el renderer action, pause overlay, CSS y documentos #24.

La usuaria aprobó el preview actual y autorizó preparar merge/cierre al completar la verificación final. Confirmó un panel, Cancelar funcional y los modales por encima del rail. Esta aprobación no cambia el veredicto: F3 permanece `BLOCKED` hasta que una selección de destino legal produzca exactamente una resolución observada. El rebase/checkpoint actual no abre PR, no integra ni cierra la issue.

## Sincronización posterior a `origin/master@9511472`

Después del rebase, `origin/master` avanzó a `a3d23f3c5f262fc02fe15ffbb554472b3d829aec`. En el rango `9511472..a3d23f3`, 13 rutas corresponden a README, planes/handoffs/log; el cambio de producto está acotado a `server/game/coup.js`, donde el commit `39fdd1d` cambia `DEFAULT_TIMEOUT_MS` de `60000` a `120000`. Orquestación autorizó integrar el target actual por merge sobre la rama ya rebaseada. Se conservaron la fila #24 en README y el registro/docs de #24; los handoffs de #19/#28/#36 siguen movidos a `docs/plans/completed/`, sin restaurar sus rutas activas. El F3 siguiente debe contemplar el timeout de dos minutos si comprueba esa ruta. La selección de target con una resolución sigue pendiente; no declarar F3 PASS.

## Recheck F3 final — HEAD 4241b667

**Veredicto:** `PASS`. Se conserva el `FAIL` histórico por renderer duplicado y los `BLOCKED` anteriores; este veredicto aplica al checkpoint exacto indicado.

- **Checkpoint:** F3, FINAL independiente.
- **Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`.
- **HEAD:** `4241b667b0ef66f5d75411f001b240c79262094a` (`docs(action-rows): record rebased F3 checkpoint`).
- **Base y merge-base:** `origin/master@a3d23f3c5f262fc02fe15ffbb554472b3d829aec`; el merge-base y `git merge-base --is-ancestor origin/master HEAD` confirman que esta base es ancestro.

### Claim y verificación adversarial

El action rail único conserva las opciones legales, targets y envío del renderer genérico; mantiene su posición/ciclo compacto y coexiste con la pausa, los modales y los datos de tablero del merge #28.

- **AC1, AC3–AC6 (renderer, elegibilidad, envío y cancelación):** `rg -n "renderActionDecision\\(" coup-client/src/components/game/Coup.js` da definición en `:605` y una única invocación en `:799`, bajo el portal `.ActionDecisionRail` (`:796-800`). `DecisionsSection` conserva Codex y el renderer no-action (`:835-874`). `actionOptionGroups()` agrupa las opciones recibidas y conserva objetos/choiceId originales (`:182-189`); solo se produce markup para grupos no vacíos (`:654-715`). El cerrojo de envío y la emisión de `choiceId`, `decisionId` y `stateVersion` se ven en `:560-577`. Los targets proceden del mismo grupo; cancelar no envía y Escape/cancel usan refs de retorno (`:579-603`). El servidor conserva límites/targets de 3, 7 y 10 monedas (`server/game/coup.js:614-632`).
- **AC2, AC6–AC7 (fila y acceso):** el divisor es hermano de la fila y solo se inserta entre filas permitidas consecutivas (`Coup.js:654-715`); botones nativos, Escape y manejadores de foco son visibles en fuente (`:579-603`), con estados de hover/foco en CSS (`CoupStyles.css:1223-1232`). La usuaria confirmó en preview un panel y Cancelar visible/funcional y aprobó el diseño. No informó conteo de DOM/IDs, inspección DevTools ni prueba de teclado/foco; no los atribuyo.
- **AC8 (rail y modales):** portal a `document.body`, `position:absolute`, medición `getBoundingClientRect()+scrollX/scrollY` y nueva medición en resize están en `Coup.js:458-481,792-800` y `CoupStyles.css:1429-1439`. El orden revisado es rail 40, ReactModal 100, panel de referencia 1000 y pausa 2001 (`CoupStyles.css:264-267,1429-1433`; `RulesModal.js:29`; `CheatSheetModal.js:45`; `ReferencePanel.css:64-68`). La usuaria confirmó que los modales de Reglas y Resumen aparecen por encima del rail. Hubo revisiones visuales previas de la relación con el resumen; no afirmo mediciones de scroll con DevTools.
- **AC9–AC10 (ciclo y pausa):** una decisión nueva restaura el modo expandido; mouseleave espera 500 ms, reentrada cancela timers y el filtro `matchMedia` excluye touch/no-hover (`Coup.js:323-337,483-557`). Cleanup cubre cambio/cierre/pausa y unmount (`:339-395,453-456`). CSS fija compacto a 50% y títulos de fila a 70% (`CoupStyles.css:1181-1190,1385-1391,1466-1468`); `prefers-reduced-motion` desactiva las transiciones (`:1416-1425`). Pausa/bloqueo/restauración de foco permanecen en fuente (`Coup.js:370-413,738-760,881-901`). La usuaria revisó previamente la compactación y aceptó el waiver limitado a la falta de animación al desmontar detalles; ese aspecto sigue exceptuado, no verificado.
- **Integración #28:** `Coup.js` pasa `responseWindowOpen`, `responseAvailable` y `courtCount` a `PlayerBoard` (`:771-779,824-832`); el servidor entrega `courtCount` y define timeout predeterminado de 120 s (`server/game/coup.js:26,156-172`).

### Gates y evidencia humana

- `git status --short --branch`: branch correcto y árbol limpio al iniciar esta vuelta.
- `git diff --check origin/master...HEAD`: exit 0, sin salida.
- `npm run build` en `coup-client`: exit 0, informado por Orquestación para el código tras integrar la base actual; warnings conocidos de imports sin uso en `App.js`, `dvh` en `ReferencePanel.css`, `caniuse-lite` desactualizado y deprecación `fs.F_OK`. No repetí build.
- No ejecuté tests automatizados, según el handoff.
- Orquestación confirmó preview del worktree en `http://localhost:3006` y backend `:18000`. Después de pedirle específicamente a la usuaria que escogiera un destino legal y comprobara que la acción se resolvía una sola vez, respondió «se ve bien, lo apruebo». Por el contexto directo tomo esa respuesta como aprobación humana del recorrido requerido. No describió target, conteo, DevTools ni foco de teclado; no los reporto como observados. La usuaria había confirmado por separado un panel, Cancelar funcional y modales sobre el rail.

### Alcance y limitaciones

El `PASS` se basa en revisión estática del HEAD exacto, gates documentados y aprobación humana contextual del recorrido final de target. No significa que esta sesión haya medido el DOM, probado cada umbral monetario ni interactuado personalmente con el navegador. La falta de animación al desmontar detalles conserva el waiver explícito de AC9. No modifiqué producto ni tracker, no abrí PR, no hice merge ni cerré la issue.
