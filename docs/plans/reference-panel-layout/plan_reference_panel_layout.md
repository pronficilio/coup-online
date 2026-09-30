# Plan — corregir el espacio bajo el tablero y ubicar las referencias

**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED (PASS limitado a atribución estática + evidencia desktop previa)`; F2 `CLOSED (implementación y build; walkthrough visual pendiente)`; F3 `WAITING_VERIFIER`.
**Issue:** https://github.com/pronficilio/coup-online/issues/72
**Solicitud:** investigar el espacio en blanco debajo de las tarjetas y aprovechar el lateral libre para colocar los accesos de referencia a la altura del jugador.

## Objetivo y definición de éxito

El alto desplazable del documento debe seguir el borde visual inferior del tablero con una separación breve y estable. El desplazamiento CSS del tablero no debe dejar una caja de flujo vacía debajo de las cartas. Los accesos de reglas, carta y resumen de reglas deben quedar junto al tablero, a la altura de la fila de cartas, cuando haya espacio lateral; en viewports estrechos deben seguir accesibles sin añadir una fila debajo del tablero. Ningún acceso debe cubrir cartas, Event Log o decisiones.

## Hechos, inferencias y límites

- **Hecho, evidencia previa:** el reporte F1 de #44 documentó una medición aportada por el propietario en 1247×563. `.PlayerBoardContainer` conserva una caja cuadrada de 900×900 px; el `transform` calculado la mueve unos 102.45 px hacia arriba, pero no reduce su caja de flujo. Su borde visual inferior queda unos 118 px antes de `.DecisionsSection`.
- **Hecho, evidencia previa:** en ese mismo ancho los triggers de `ReferencePanel` permanecen en la misma coordenada de viewport pese al scroll, consistente con `position: fixed`; no aportan altura al documento. Su posición al final del árbol DOM no indica su posición visual.
- **Hecho, código actual:** `ReferencePanel.css` los cambia a `position: static` con `max-width: 1199px`. En una fila de 52 px con márgenes verticales de 8 y 12 px añaden unos 72 px al flujo. Si hacen wrap, pueden añadir más.
- **Inferencia que debe verificarse:** en escritorio, el hueco bajo las cartas se explica principalmente por la diferencia entre la posición pintada y el límite de flujo del tablero; en tablet/móvil se suman los triggers estáticos.
- **Límite conocido:** el reporte #44 no midió los breakpoints menores de 1200 px. En este entorno no se detectó Chromium; cualquier métrica dinámica que no pueda reproducirse debe marcarse como pendiente y no inventarse.

## Perfil operativo

- Repositorio/tracker: `pronficilio/coup-online` / GitHub; merge target: `master`.
- Ejecutor: Agente Alquimista. Verifier independiente requerido en F3.
- Modo/riesgo/verificación: `FULL` / `MEDIUM` / `FINAL`.
- Branch/worktree únicos: `issue/72-reference-panel-layout` / `.worktrees/issue-72-reference-panel-layout`.
- Base confirmada: `origin/master@ce53c286155c054bc4c50defeb5ec19cc04fd5fb`.
- Topología: una rama, un worktree y una PR hacia `master`.
- Bitácora append-only: `docs/plans/log/issue-72.jsonl`.
- Plan: esta ruta. Handoff: `docs/plans/inbox/issue_72_reference_panel_layout.md`.

## Alcance y exclusiones

Incluir el layout de `.PlayerBoardContainer`, el contenedor compartido que pueda necesitar `Coup.js`, y la ubicación responsive de `ReferencePanel`. El Ejecutor puede ajustar la estructura CSS/DOM si la inspección demuestra que es necesaria para alinear los accesos con las cartas propias.

No cambiar lógica del servidor, reglas, tipos/opciones de decisión, comportamiento de los modales, imágenes, destinos ni traducciones. No ampliar la auditoría de decisiones de #44 ni reabrir #44; reutilizar su diagnóstico solo como evidencia causal.

## F1 — atribución geométrica por breakpoint (`CLOSED — PASS limitado`)

**Pregunta única:** ¿qué cajas y desplazamientos explican la altura del documento y qué ubicación de triggers cabe sin solaparse?

- **Entrada:** fuente en `PlayerBoardStyles.css`, `ReferencePanel.css`, `Coup.js`; reporte `docs/plans/player-decisions-layout/report_issue_44_F1.md`; issue #72.
- **Subtareas:**
  1. Trazar la caja de flujo del tablero, cada `transform`/`translate` responsive y la caja pintada; considerar el desplazamiento adicional de mesas de cinco jugadores.
  2. Medir o calcular el efecto de `.reference-panel__triggers` para 390, 720, 1024, 1199 y 1200+ px; cubrir orientación/alto corto y flex-wrap.
  3. Identificar la franja lateral disponible frente a las cartas propias y al Event Log, incluidos tamaños donde no cabe un rail lateral.
  4. Registrar separadamente evidencia dinámica, cálculos derivados y observaciones del propietario en `report_issue_72_F1.md`.
- **Salida:** `docs/plans/reference-panel-layout/report_issue_72_F1.md`. Reutiliza la medición aportada en #44 y evalúa aritméticamente las fórmulas CSS para breakpoints inferiores a 1200 px; no hay rectángulos dinámicos nuevos ni navegador local.
- **Veredicto:** la caja cuadrada y sus desplazamientos explican el hueco desktop; los triggers `static` aportan nominalmente 72 px bajo 1200 px. La propuesta responsive queda en el reporte; posibles solapamientos de la cuadrícula estrecha se verifican en F3/propietario.
- **Avanzar:** cada contribución está aislada, y existe una opción de layout para desktop/tablet y otra segura para pantallas estrechas.
- **Pivotar:** si compensar el flujo con márgenes dependientes de transform recorta el tablero o genera overflow, preferir un wrapper/layout que modele la caja visible.
- **Repetición acotada:** repetir una medición solo para el breakpoint cuyo valor cambie la decisión del layout.
- **Bloquear/cancelar:** bloquear si no hay manera de observar en runtime un riesgo de solapamiento que no pueda resolverse con geometría estática; cancelar si el problema desaparece en la base vigente.
- **Commit:** requerido; `docs(plans): close issue 72 F1 layout diagnosis`.
- **Validación:** revisión estática de selectores/cálculos; no añadir ni ejecutar tests.

## F2 — compactar el flujo y acoplar accesos (`CLOSED — estático/build; visual pendiente`)

**Pregunta única:** ¿puede el layout final seguir las cajas visibles y mantener accesibles las referencias sin cubrir contenido?

- **Entrada:** veredicto F1 y propuesta de geometría.
- **Tareas:** implementar la estrategia elegida; conservar tres destinos y modales; hacer que los triggers no agreguen altura bajo 1200 px; colocar el grupo a la altura de las cartas en el lateral cuando quepa; definir una alternativa corta y alcanzable para móvil; conservar tooltip, foco visible y safe areas.
- **Criterios:**
  1. El final de scroll deja solo una separación breve (máximo 16 px) después del contenido visual inferior del tablero, fuera de overlays/rails activos.
  2. Compensar la caja de flujo considera todos los desplazamientos responsive, incluido el asiento de cinco jugadores, sin recortar cartas ni crear scroll horizontal.
  3. En anchos con carril lateral suficiente, los tres triggers se alinean con la fila de cartas propias y no invaden asientos/Event Log/decisiones.
  4. En anchos estrechos no hay fila estática debajo del tablero; todos los triggers permanecen visibles y operables con touch y teclado.
  5. Los modales, destinos, tooltips y retorno de foco siguen funcionando según el contrato actual.
- **Avanzar:** todos los criterios pasan en la matriz acordada en F1; documentar el diff en `report_issue_72_F2.md`.
- **Pivotar:** si la rail junto a cartas colisiona, usar el siguiente borde libre documentado; no ocultar controles ni reservar una fila de página.
- **Repetir:** una variante por breakpoint que falle, con diff/commit atribuible.
- **Bloquear/cancelar:** bloquear si el viewport crítico no permite conservar controles alcanzables sin tapar contenido; cancelar solo con evidencia de que no hace falta un cambio.
- **Commit:** requerido; `fix(game-ui): reclaim space under board and dock reference controls`.
- **Validación:** build del cliente, `git diff --check` y walkthrough manual solicitado en F3. No agregar/ejecutar pruebas automatizadas.

## F3 — refutación final independiente (`FINAL`)

**Pregunta única:** ¿existe un viewport o conteo de jugadores donde el cambio vuelva a alargar la página, tape una carta/control o deje una referencia inaccesible?

- **Verifier:** agente independiente del implementador. Debe intentar refutar la alineación, el alto de documento y la accesibilidad en 2, 3, 5 y 6 jugadores; desktop amplio, 1024 px y móvil (incluido alto corto); navegación por teclado, hover y apertura/cierre de cada referencia.
- **Salida:** `report_issue_72_F3_verifier.md` con `PASS`, `FAIL` o `BLOCKED`, evidencia y límites. El implementador resuelve cada FAIL antes de re-verificación.
- **Verificación propietaria:** solicitar walkthrough visual del preview si no hay navegador/runtime disponible en el entorno. No declarar cobertura dinámica sin observación.
- **Commit:** requerido para el reporte/veredicto; `docs(plans): record issue 72 final verification`.

## Evidencia y pregunta de falsificación

Guardar F1–F3 y capturas verificables en `docs/plans/reference-panel-layout/`. Pregunta: ¿queda una combinación de breakpoint, alto de viewport o cantidad de jugadores donde `scrollHeight` conserve el desplazamiento invisible, el grupo de referencias se envuelva bajo el tablero, o un trigger tape una carta, el registro o las decisiones?

## Historial de decisiones

- La inspección de solo código no considera que “último hijo en DOM” equivale a “elemento que determina el final visual”.
- El diagnóstico desktop de #44 se reutiliza: allí los triggers ya eran `fixed`; el espacio principal venía del `transform` del tablero.
- El comportamiento bajo 1200 px debe medirse aparte: los triggers pasan a `static` y sí añaden altura de flujo.
- F2 deja 9.5 px horizontales calculados a 320 px; bajo 301 px predice cruce horizontal. F3 debe validar el dock frente a cartas bajas de 5/6 jugadores y decisiones, sin PASS visual previo.
