# Handoff para Agente Alquimista — issue #24

**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Plan exacto:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`
**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`.
**Fase activa:** corregir los hallazgos visuales de la segunda revisión de la usuaria y continuar F2.
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

**Comportamiento clave:** agrupa `decision.options` por acción para dar una fila por acción, no una por destino. La fila disponible con destino abre un selector de los objetivos permitidos y Cancelar vuelve al menú sin enviar nada; al escoger objetivo envía una sola vez el objeto original y su `choiceId`. Las acciones sin destino envían su opción legal al seleccionarse. Presenta las acciones que el servidor omite por saldo/Coup obligatorio como disabled informativas sin fabricarles IDs u handlers. Otros tipos de decisión continúan con su renderer genérico.

**Criterio adversarial:** ¿puede una fila visualmente deshabilitada emitir `g-submitDecision`, abrir destinos o generar un ID que el servidor no ofreció? Comprueba saldos 2/3, 6/7 y 9/10, mouse/teclado/tacto, foco accesible, tooltip sin recorte, objetivos, cancelación, reduced motion y los otros tipos de decisión.

**Hallazgos de inspección visual:** (1) los divisores parecen prolongaciones curvas del contorno de hover; conservarlos en estructura propia, evitando colisión con filas disabled y manteniéndolos al hacer hover. (2) feedback inicial supersedido: el panel action se puso a la derecha como overlay. (3) feedback vigente: el rail completo debe estar a la izquierda; la tabla debe alinearse horizontalmente con “Resumen de reglas”, directamente debajo, manteniendo siempre una distancia vertical fija al hacer scroll. El control y la tabla deben quedar agrupados en una sola ancla/rail; no basta con reposicionar la tabla separada ni mover el control sin agruparlo. El panel continúa superpuesto sobre PlayerBoard/cartas durante la decisión.

**Responsive esperado:** el rail compartido sigue el punto de anclaje del control resumen en escritorio y mantiene resumen + acciones juntos al hacer scroll; reservar ancho/alto con overflow legible y sin tapar controles críticos. En anchos menores usar un layout agrupado que no cubra partida ni decisiones táctiles. Solo el tipo `action` se agrupa; otros tipos de decisión mantienen su renderer y flujo anteriores.

**Implementación y revisión del checkpoint anterior:** el Agente Menor terminó el divider independiente y el overlay action a la derecha en `Coup.js`/`CoupStyles.css`; la usuaria lo inspeccionó y pidió mover el grupo al lado izquierdo y preservar su relación con CheatSheet durante el scroll. Este nuevo requerimiento reemplaza la colocación derecha. La corrección del rail está delegada y aún no se revisa. No se hicieron tests automatizados ni se declara aprobada la revisión visual.

**Revisión y validación de fuente:** el Alquimista revisó el diff DOM/CSS; `git diff --check` pasa y `npm run build` terminó exit 0 con warnings conocidos. No tests automatizados. El bundle de `http://localhost:3006` responde pero no incluye aún `ActionDecisionRail`; el Orquestador reiniciará solo CRA después de que se publique el checkpoint. Backend `:18000` permanece activo.

**Siguiente acción:** publicar el checkpoint y avisar al Orquestador para reiniciar CRA desde este worktree. Después de verificar que el bundle contiene el rail, la usuaria inspecciona alineación y distancia fija al scroll, overlay, divider/hover y responsive. Continuar el resto de F2 y solo al cerrarla entregar F3 a Verifier independiente.
