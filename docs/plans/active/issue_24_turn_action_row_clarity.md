# Handoff para Agente Alquimista — issue #24

**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Plan exacto:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`
**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`.
**Fase activa:** corregir los hallazgos visuales de la tercera revisión de la usuaria y continuar F2.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`; Verifier independiente requerido en F3.
**Bitácora exacta:** `docs/plans/log/issue-24.jsonl`.
**Branch / worktree / merge target:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / `master` de `pronficilio/coup-online`.
**PR/MR:** ninguna; una sola PR cuando se completen las fases.

**Reanudación:** la usuaria inspecciona el cliente en `http://localhost:3006` con backend en `:18000`; F2 se reabrió para corregir el rail compartido y realizar una nueva inspección. Los servidores deben permanecer activos.

## Reclamo y aislamiento

Issue #24 sigue abierta y está asignada a `pronficilio`. El Alquimista registró el reclamo en https://github.com/pronficilio/coup-online/issues/24#issuecomment-5858619440 y confirmó la topología canónica. Al reclamar, la rama estaba limpia en `40cd6dd05a7d4897e9f88d7909d6b29e09122dce`; el checkpoint F2 publicado es `cfbbb7b` y esta reanudación ocurre sobre la misma rama/worktree, rebaseada sobre `origin/master@5de95ee`.

## F2 activa — correcciones visuales y recorrido

Las PR #23 de #14 y #22 de #19 ya están integradas. El renderer vigente está en `Coup.js`; `ActionDecision.js` no se monta. El servidor envía únicamente opciones legales y el diccionario ya contiene labels/descripciones/roles en `es`/`en`. No cambies reglas, formas de payload o el motor del servidor para lograr la apariencia.

**Implementa lo definido en:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`.

**Comportamiento clave:** agrupa `decision.options` por acción para dar una fila por acción, no una por destino. Renderiza la fila solo si tiene al menos una opción legal del servidor; las acciones omitidas no aparecen, no ocupan espacio y no reciben handler/ID. El código de disabled/hints y sus estilos se conserva, pero no se monta. La fila con destino abre solo objetivos legales y Cancelar vuelve al menú sin enviar nada; al escoger objetivo envía una vez el objeto original y su `choiceId`. Las acciones sin destino envían su opción legal. Otros tipos de decisión continúan con su renderer genérico.

**Criterio adversarial:** confirma que cada fila coincide con opciones legales del payload y las acciones omitidas no dejan huecos, IDs ni handlers. Haz scroll repetido para confirmar que rail+resumen siguen fijados al mismo punto del viewport y conservan alineación/gap. Comprueba saldos 2/3, 6/7 y 9/10, mouse/teclado/tacto, objetivos, cancelación, reduced motion y otros tipos de decisión.

**Hallazgos de inspección visual:** (1) los divisores parecen prolongaciones curvas del contorno hover; conservarlos en estructura propia. (2) feedback histórico: overlay derecho supersedido, ahora panel a la izquierda debajo/alineado con resumen. (3) feedback vigente: resumen y acciones se desplazan al hacer scroll; ambos deben permanecer fijados al viewport, juntos, en el mismo punto y con gap constante. La lista muestra solo acciones legales; no renderizar prohibidas ni dejar espacio. El grupo sigue superpuesto sobre PlayerBoard/cartas durante action.

**Responsive esperado:** rail fijo al viewport, portado a `document.body`, usando las coordenadas responsive previas de CheatSheet; resumen/acciones conservan la relación al hacer scroll. El filtro de filas legales reduce la altura inicial; el panel conserva su overflow interno y overlay. Solo `action` se porta/agrupa; otros decision types mantienen ubicación y flujo.

**Implementación/revisión actual:** el Agente Menor movió el rail action completo a un portal `document.body`, conservando el CSS `position: fixed`, y retorna `null` para acciones sin opciones. El markup/helpers de disabled/hint y CSS permanecen, sin montarse. El Alquimista confirmó por inspección que no hay transform/filter/perspective/contain/will-change en ancestros authored del rail; el portal lo aísla del árbol que contiene el juego. `git diff --check` pasa y `npm run build` exit 0 con warnings conocidos; no tests. El código se publicó en `3be921fc1be4db6537125ada0a0d0f76186b22f5`; el Orquestador recargará CRA una vez desde el HEAD final y confirmará el bundle. La inspección visual de esta nueva revisión sigue pendiente.

**Revisión y validación:** el Alquimista revisó el diff DOM/CSS; `git diff --check` pasa y `npm run build` terminó exit 0 con warnings conocidos. No tests automatizados. Checkpoint `b59bb022ee79e455fce3bfe281255cee359f034e` publicado. El Orquestador reinició CRA desde ese HEAD, confirmó `Compiled successfully` y bundle disponible en `http://localhost:3006` (HTTP 200, 2,393,146 bytes); backend `:18000` permanece activo. Preview listo para la usuaria.

**Siguiente acción:** Orquestador reinicia solo CRA desde el HEAD final y confirma el bundle. La usuaria inspecciona fijación real al viewport tras scroll, rail izquierdo alineado, lista solo permitidas, altura inicial menor, overlay, divider/hover y responsive en `http://localhost:3006` con backend `:18000`. Continuar el resto de F2 y solo al cerrarla entregar F3 a Verifier independiente.
