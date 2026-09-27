# Handoff para Agente Alquimista — issue #24

**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Plan exacto:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`
**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`.
**Fase activa:** corregir dos hallazgos visuales de la revisión de la usuaria y continuar F2.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`; Verifier independiente requerido en F3.
**Bitácora exacta:** `docs/plans/log/issue-24.jsonl`.
**Branch / worktree / merge target:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / `master` de `pronficilio/coup-online`.
**PR/MR:** ninguna; una sola PR cuando se completen las fases.

**Reanudación:** la usuaria inspecciona el cliente en `http://localhost:3006` con backend en `:18000`; F2 se reabrió para responder al feedback visual y realizar una nueva inspección.

## Reclamo y aislamiento

Issue #24 sigue abierta y está asignada a `pronficilio`. El Alquimista registró el reclamo en https://github.com/pronficilio/coup-online/issues/24#issuecomment-5858619440 y confirmó la topología canónica. Al reclamar, la rama estaba limpia en `40cd6dd05a7d4897e9f88d7909d6b29e09122dce`; el checkpoint F2 publicado es `cfbbb7b` y esta reanudación ocurre sobre la misma rama/worktree, rebaseada sobre `origin/master@5de95ee`.

## F2 activa — correcciones visuales y recorrido

Las PR #23 de #14 y #22 de #19 ya están integradas. El renderer vigente está en `Coup.js`; `ActionDecision.js` no se monta. El servidor envía únicamente opciones legales y el diccionario ya contiene labels/descripciones/roles en `es`/`en`. No cambies reglas, formas de payload o el motor del servidor para lograr la apariencia.

**Implementa lo definido en:** `docs/plans/turn-action-row-clarity/plan_turn_action_row_clarity.md`.

**Comportamiento clave:** agrupa `decision.options` por acción para dar una fila por acción, no una por destino. La fila disponible con destino abre un selector de los objetivos permitidos y Cancelar vuelve al menú sin enviar nada; al escoger objetivo envía una sola vez el objeto original y su `choiceId`. Las acciones sin destino envían su opción legal al seleccionarse. Presenta las acciones que el servidor omite por saldo/Coup obligatorio como disabled informativas sin fabricarles IDs u handlers. Otros tipos de decisión continúan con su renderer genérico.

**Criterio adversarial:** ¿puede una fila visualmente deshabilitada emitir `g-submitDecision`, abrir destinos o generar un ID que el servidor no ofreció? Comprueba saldos 2/3, 6/7 y 9/10, mouse/teclado/tacto, foco accesible, tooltip sin recorte, objetivos, cancelación, reduced motion y los otros tipos de decisión.

**Hallazgos de inspección visual:** (1) los divisores parecen prolongaciones curvas del contorno de hover; separar los separadores en estructura propia, evitando colisión con filas disabled y conservándolos durante hover. (2) el panel action debe estar a la derecha, por debajo de la altura del control “Resumen de reglas”, ocupando gran parte del viewport como overlay del PlayerBoard/cartas. No mover el control de reglas. El cambio solo debe afectar decisiones de tipo `action`; las demás conservan su flujo actual.

**Responsive esperado:** en pantallas amplias (1200 px o más) el panel action se fija a la derecha y superpone el tablero; en anchos menores conserva el flujo del documento para no tapar la partida ni las decisiones táctiles. Los otros tipos de decisión no cambian de posición ni renderer.

**Implementación y revisión del checkpoint:** el Agente Menor terminó el divider independiente y el panel overlay en `Coup.js`/`CoupStyles.css`. `git diff --check` pasa y `npm run build` exit 0 con warnings preexistentes. El overlay fixed se activa desde 1200 px, a la derecha bajo la banda vertical de CheatSheet; anchos menores conservan el flujo del documento y otras decisiones no se modifican. No se hicieron tests automatizados ni se declara aprobada la revisión visual.

**Siguiente acción:** el Orquestador reinició solo la sesión CRA del worktree porque HMR no detectó las ediciones en `/mnt/e`; confirmó compilación exitosa y HTTP 200. La usuaria ya puede revisar `http://localhost:3006` con backend `:18000`: divider durante hover, ubicación derecha bajo “Resumen de reglas”, overlay sobre PlayerBoard/cartas y fallback responsive. Luego continuar los criterios restantes de F2 y, solo al cerrarla, entregar F3 al Verifier independiente.
