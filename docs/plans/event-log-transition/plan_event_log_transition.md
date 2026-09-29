# Plan — transición del registro de eventos

**Issue:** [#60 — Animar la expansión y el colapso del registro de eventos](https://github.com/pronficilio/coup-online/issues/60)  
**Estado:** `ACTIVE`; F1 `ACTIVE`  
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`  
**Branch / worktree / integración:** `issue/60-event-log-transition` / `.worktrees/issue-60-event-log-transition` / `master`  
**Handoff:** `docs/plans/active/issue_60_event_log_transition.md`  
**Bitácora:** `docs/plans/log/issue-60.jsonl`

## Solicitud y objetivo

Las referencias locales `fotos/log1.png` y `fotos/log2.png` muestran los estados expandido y colapsado del registro. Hoy el cuerpo pasa directamente a `display: none`, por lo que el panel pierde su altura sin transición. Animar ese cambio para que el borde superior y el encabezado permanezcan estables mientras el borde inferior llega suavemente al estado opuesto.

La animación debe sentirse rápida y clara: alrededor de 220 ms al abrir y 180 ms al cerrar, con opacidad y un desplazamiento vertical de pocos píxeles en el cuerpo. El tiempo podrá ajustarse en la revisión visual. El panel conserva sus límites actuales de alto y el scroll previsto al reabrir.

## Alcance

- Transicionar la altura real del panel entre expandido y colapsado sin fijar una altura de contenido arbitraria.
- Animar el cuerpo como una pieza, con movimiento y opacidad discretos; mantener encabezado y ancho visualmente estables.
- Conservar límites de pantalla en escritorio y móvil, y el límite reducido con decisión activa.
- Soportar inversión de la animación mediante pulsaciones rápidas, `prefers-reduced-motion` y contenido colapsado inaccesible al foco/interacción.
- Cuando el registro esté expandido en móvil, posicionar `.ActionDecisionRail.ActionDecisionRail--event-log-expanded` con `top: 15px` y `left: 15px`, alineado al margen superior y lateral de 15 px del registro de eventos.
- Mantener el rail y el registro utilizables durante la transición, sin saltos ni solapamientos que oculten controles.

Fuera de alcance: rediseño del registro, cambios a filas/reacciones, reglas o protocolo del juego, animaciones de otros paneles y dependencias de animación.

## Criterios de aceptación

1. Expandido y colapsado mantienen la apariencia actual de ambas referencias, con el borde superior anclado y el inferior interpolado.
2. El cuerpo entra y sale con opacidad y desplazamiento breve; no hay desbordamiento, destello ni salto al cambiar de estado.
3. Se respetan topes de altura existentes en escritorio, móvil y decisión activa; un cambio durante la transición no deja altura o estado visual incorrectos.
4. Reabrir conserva la posición de lectura prevista; durante el estado colapsado el contenido no recibe foco ni interacción y `aria-expanded`/`aria-controls` corresponden al panel.
5. `prefers-reduced-motion` convierte la transición en un cambio inmediato o equivalente de movimiento reducido.
6. En móvil, con el registro expandido, el rail de decisiones usa `top: 15px` y `left: 15px`; registro y decisiones permanecen utilizables, sin salto abrupto ni solapamiento que oculte controles.
7. No se añaden bibliotecas ni se altera el contenido, lógica del juego o comportamiento de reacciones.
8. `cd coup-client && npm run build` pasa y se revisan manualmente ambos estados, expansión/colapso rápidos y movimiento reducido en escritorio y móvil. No se agregan pruebas automatizadas para este ajuste visual.

## Supuestos y riesgos

- Issue #40 cerró el rediseño funcional del registro. Esta unidad es un seguimiento independiente limitado a la transición del panel.
- Las capturas están en `fotos/`, ignoradas por Git; sirven de referencia visual local y no se agregan al PR.
- La medición de altura puede interactuar con el scroll y el límite de alto. La revisión debe comprobar contenido corto/largo y decisión activa.
- Riesgo `LOW`: cambio localizado, reversible, sin impacto en reglas o datos.

## F1 — Transición del panel

**Pregunta:** ¿Puede el panel cambiar de estado con movimiento fluido y rápido, respetando límites, lectura y controles en escritorio y móvil?

- **Entrada:** componentes actuales `EventLog.js`, `EventLogStyles.css`; reglas vinculadas del rail en `CoupStyles.css`; capturas locales `fotos/log1.png` y `fotos/log2.png`.
- **Tareas:** implementar transición de altura medida y entrada/salida breve del cuerpo; preservar el alto máximo y scroll; gestionar interrupción/reversión y movimiento reducido; cambiar el rail expandido móvil a `top: 15px; left: 15px`; verificar build y recorrido visual descrito en aceptación.
- **Salida/evidencia:** código y reporte corto con resultado de build, tamaños/estados revisados, comportamiento al pulsar rápido y límites observados.
- **Avance:** criterios de aceptación satisfechos; la transición termina en el estado solicitado y no tapa contenido/decisiones.
- **Pivote:** si la técnica inicial afecta el scroll o el layout móvil, cambiar la medición/animación limitada al panel y volver a verificar los mismos casos.
- **Bloqueo:** solo si el panel de decisiones impide coordinar el estado móvil sin ampliar la decisión de producto.
- **Política de commit:** `COMMIT_REQUIRED`; incluir cambio, reporte y evento `phase_verdict` en el commit de cierre.
- **Commit previsto:** `fix(event-log): issue 60 F1 CLOSED`.

## Pregunta de falsificación

¿Existe una secuencia de pulsaciones rápidas o una vista móvil con decisión activa donde el panel quede a mitad de altura, pierda el scroll, oculte un control o solape el panel de decisiones?

## Historial de decisiones

- 2026-09-29: issue #60 creada en el fork; se fijan como referencia `fotos/log1.png` y `fotos/log2.png` y la cadencia objetivo inicial 220/180 ms.
- 2026-09-29: unidad clasificada `LIGHT` / `LOW` / `NONE`; una fase F1 implementa y valida la transición.
