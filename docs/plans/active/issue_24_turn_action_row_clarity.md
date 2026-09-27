# Handoff para Agente Alquimista — issue #24

**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Plan exacto:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`
**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`.
**Fase activa:** aplicar el ajuste de la quinta revisión visual: títulos de filas al 70% al compactar, con transición breve; continuar F2.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`; Verifier independiente requerido en F3.
**Bitácora exacta:** `docs/plans/log/issue-24.jsonl`.
**Branch / worktree / merge target:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / `master` de `pronficilio/coup-online`.
**PR/MR:** ninguna; una sola PR cuando se completen las fases.

**Reanudación:** la usuaria inspeccionará el cliente en `http://localhost:3006` con backend en `:18000` después de que Orquestación reinicie solo CRA desde el commit checkpoint. Mantén ambos servidores activos; F2 sigue abierta a esa inspección.

## Reclamo y aislamiento

Issue #24 sigue abierta y está asignada a `pronficilio`. El Alquimista registró el reclamo en https://github.com/pronficilio/coup-online/issues/24#issuecomment-5858619440 y confirmó la topología canónica. Al reclamar, la rama estaba limpia en `40cd6dd05a7d4897e9f88d7909d6b29e09122dce`; el checkpoint F2 publicado es `cfbbb7b` y esta reanudación ocurre sobre la misma rama/worktree, rebaseada sobre `origin/master@5de95ee`.

## F2 activa — correcciones visuales y recorrido

Las PR #23 de #14 y #22 de #19 ya están integradas. El renderer vigente está en `Coup.js`; `ActionDecision.js` no se monta. El servidor envía únicamente opciones legales y el diccionario ya contiene labels/descripciones/roles en `es`/`en`. No cambies reglas, formas de payload o el motor del servidor para lograr la apariencia.

**Implementa lo definido en:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`.

**Comportamiento clave:** agrupa `decision.options` por acción para dar una fila por acción, no una por destino. Renderiza la fila solo si tiene al menos una opción legal del servidor; las acciones omitidas no aparecen, no ocupan espacio y no reciben handler/ID. El código de disabled/hints y sus estilos se conserva, pero no se monta. La fila con destino abre solo objetivos legales y Cancelar vuelve al menú sin enviar nada; al escoger objetivo envía una vez el objeto original y su `choiceId`. Las acciones sin destino envían su opción legal. Otros tipos de decisión continúan con su renderer genérico. Rail + CheatSheet están en portal a `document.body`; el rail es `position: absolute`, medido por `getBoundingClientRect()` más scroll y con coords documentales conservadas al scroll. Cada action empieza expandida; en dispositivo mouse, tras mouseenter, mouseleave espera 500 ms para compactar a 50% del ancho del rail y retirar prompt/descripciones/metadatos del DOM. Solo `.DecisionActionLabel` se reduce al 70% de su tamaño normal con transición de 120 ms; el título general del panel queda intacto. Reentrada cancela timer y restaura detalles, ancho y font-size; touch/no-hover no compacta. `prefers-reduced-motion` desactiva transiciones y timers se limpian al terminar/cambiar/unmount.

**Criterio adversarial:** confirma que cada fila coincide con opciones legales del payload y las acciones omitidas no dejan huecos, IDs ni handlers. Haz scroll repetido para confirmar que rail+resumen se mueven juntos y conservan coordenadas relativas/alineación/gap; confirma posición absolute document-coordinate y resize. En mouse verifica entrada inicial, salida 500 ms, reentrada antes del plazo, compactación tras el plazo y expansión con details montados; comprueba touch/no-hover y reduced-motion. Comprueba saldos 2/3, 6/7 y 9/10, teclado, objetivos, cancelación y otros tipos de decisión.

**Hallazgos de inspección visual:** (1) los divisores parecen prolongaciones curvas del contorno hover; conservarlos en estructura propia. (2) feedback histórico: overlay derecho supersedido, después tabla a la izquierda debajo/alineada con resumen. (3) revisión anterior pidió rail fixed al viewport, luego reemplazada. (4) feedback vigente: `.ActionDecisionRail` debe ser `absolute` (no fixed), usando coordenadas documentales del `.CheatSheet`; ambos se desplazan juntos con scroll sin cambiar alineación/gap. Solo aparecen acciones legales. El grupo sigue superpuesto sobre PlayerBoard/cartas durante action.

**Responsive esperado:** rail absoluto a coords documentales del ancla medida, portado a `document.body`; resumen/acciones conservan relación al scroll, y resize re-mide el anchor CSS responsive. El filtro de filas legales reduce la altura inicial; el panel conserva overflow interno y overlay. Compacto = 50% del ancho normal del panel/rail, no 50vw. Touch/no-hover permanece expandido. Solo `action` se porta/agrupa; otros decision types mantienen ubicación y flujo.

**Implementación/revisión actual:** el Agente Menor conserva el portal a `document.body`, usa `position:absolute` con `rect + scroll`, mantiene coords durante scroll y re-mide una sonda anclada a CheatSheet en resize. Cada action empieza expandida; mouse con hover/puntero fino habilita un timer de 500 ms tras la primera entrada; reentrada cancela/restaura y, tras vencimiento, el panel pasa a 50% del ancho normal y los detalles se desmontan después de 180 ms. Touch/no-hover no compacta; reduced-motion quita transiciones y espera. Temporizadores y frame se limpian al reentrar, cambiar/cerrar/pausar/finalizar y unmount. La lista sigue usando solo opciones legales y `choiceId` original; el separador es independiente y salta acciones omitidas. El Alquimista añadió medición en mount como respaldo de coordenadas iniciales. Código de producto en commit `e77415d`. Revisión del diff + `git diff --check`: PASS. `npm run build` exit 0, warnings conocidos sin referencias a archivos editados: `App.js` imports `logo`/`Link`, parser `postcss-calc` para `dvh` en `ReferencePanel.css:100,106`, caniuse-lite desactualizado; JS 109.37 kB / CSS 7.07 kB gzip. Sin tests ni recorrido visual. El bundle del nuevo checkpoint aún requiere reinicio CRA por Orquestación.

**Revisión y validación:** el Alquimista revisó el diff DOM/CSS; `git diff --check` pasa y `npm run build` terminó exit 0 con warnings conocidos. No tests automatizados. Checkpoint `b59bb022ee79e455fce3bfe281255cee359f034e` publicado. El Orquestador reinició CRA desde ese HEAD, confirmó `Compiled successfully` y bundle disponible en `http://localhost:3006` (HTTP 200, 2,393,146 bytes); backend `:18000` permanece activo. Preview listo para la usuaria.

**Siguiente acción:** Alquimista registra/push del checkpoint y Orquestación reinicia solo CRA desde su HEAD. La usuaria inspecciona en `http://localhost:3006` con backend `:18000`: coords absolutas y movimiento conjunto/alineación al scroll, inicio expandido, timer 500 ms, reentrada/cancelación/restauración, compacto (ancho 50%, detalles retirados), touch/no-hover, reduced-motion, overlay, divider y responsive. F2 sigue `ACTIVE`; solo al cerrar F2 se entrega F3 a Verifier independiente. No abrir PR ni integrar/cerrar issue.

## Quinta revisión visual — tamaño de títulos al compactar

Solo `.DecisionActionLabel` pasa a 70% del font-size normal mientras está compacto: 0.812rem frente a 1.16rem en escritorio, 0.728rem frente a 1.04rem hasta 560px. El cambio transiciona en 120 ms y queda dentro del selector compacto; `.ActionDecisionTitle` no cambia. La expansión devuelve los títulos a su tamaño normal junto con los detalles rehidratados. `prefers-reduced-motion` desactiva la transición. Build exit 0 y diff-check PASS; código en `9af435d`. No tests ni recorrido visual. Orquestación debe reiniciar CRA desde el checkpoint final y confirmar la carga para la usuaria.
