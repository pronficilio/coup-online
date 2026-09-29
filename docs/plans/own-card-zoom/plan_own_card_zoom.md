# Ampliar una influencia propia desde el tablero — issue #61

- **Issue:** [#61 — Ampliar las influencias propias desde el tablero con una transición fluida](https://github.com/pronficilio/coup-online/issues/61)
- **Estado:** `BLOCKED`; F1 `BLOCKED`
- **Modo / riesgo / verificación:** `LIGHT` / `MEDIUM` / `NONE`
- **Branch / worktree / integración:** `issue/61-own-card-zoom` / `.worktrees/issue-61-own-card-zoom` / `master`
- **Handoff:** `docs/plans/active/issue_61_own_card_zoom.md`
- **Bitácora:** `docs/plans/log/issue-61.jsonl`
- **Reporte F1:** `docs/plans/own-card-zoom/report_issue_61_F1.md`

## Solicitud y objetivo

Las influencias propias se muestran pequeñas al pie del tablero. Permitir que el jugador abra una de sus cartas activas en tamaño cómodo y la cierre con una transición que vuelva a su posición original. La interacción debe sentirse continua, rápida y funcionar con mouse, teclado y toque.

Éxito significa que el jugador lee la ilustración y el texto de la carta ampliada, entiende de qué carta del tablero proviene y puede volver al juego sin perder el foco ni una decisión activa. Las influencias ocultas de otros jugadores no se vuelven accesibles a través del control ni de la vista ampliada.

## Fuentes y hechos confirmados

- `PlayerBoard.js` renderiza las influencias propias activas y las oculta de rivales por separado; es el límite de privacidad que debe conservarse.
- Las reglas de agentes `docs/agentes/ORQUESTADOR.md` y `docs/agentes/ALQUIMISTA.md` están ignoradas por Git en este proyecto. El ejecutor debe leer las copias locales del checkout raíz (`../../docs/agentes/` desde este worktree); no se copiarán al branch.
- Las ilustraciones de personaje ya son assets WebP del cliente. La referencia de pantalla compartida es `fotos/pantalla.png` en el checkout raíz; es una entrada local ignorada por Git y no debe añadirse al PR.
- `react-modal` ya se utiliza para las referencias y puede aportar portal, cierre por Escape, foco contenido y retorno del foco.
- El tablero tiene transformaciones y contextos de apilado. La vista ampliada debe vivir en una capa portada en `document.body` para que no quede recortada ni debajo de otros controles.
- El rail de decisiones se porta a `document.body`; la pausa usa una capa de prioridad superior. El modal debe cerrarse al comenzar una pausa o una ventana de respuesta que requiera acción.
- La selección visual de una carta no debe enviar eventos al servidor ni alterar reglas o decisiones.

## Diseño de interacción y transición

1. Convertir únicamente cada influencia propia activa en un botón semántico. Mantener las cartas rivales ocultas como elementos no interactivos. En mouse, usar `cursor: zoom-in`; en hover elevar unos píxeles y resaltar el borde en ~120 ms. En teclado, aplicar `:focus-visible`. En táctil, el botón de la carta basta como objetivo de toque.
2. Al activar, medir el botón con `getBoundingClientRect()` y montar una vista ampliada en un portal/modal. Mantener el espacio de origen estable y mostrar la copia visual desde esas mismas coordenadas.
3. Animar la copia desde el rectángulo de origen al rectángulo objetivo centrado. Usar una transición FLIP basada en `transform` y `opacity`, con `transform-origin: top left`, una curva de desaceleración breve y sin giro ni desenfoque. Punto inicial: 210–220 ms para abrir y 160–180 ms para cerrar; ajustar al revisar visualmente.
4. Atenuar el juego con un fondo negro translúcido en ~150 ms. El tamaño final conserva la proporción de la carta y cabe en el viewport: ancho objetivo aproximado de 340–390 px, limitado por el ancho y la altura disponible; usar `100dvh` con fallback para viewport compacto.
5. Cerrar con botón visible, Escape o clic en el fondo. Para cerrar, medir de nuevo el origen y recorrer la transición inversa. Si el origen ya no está en el DOM o la influencia cambió, desvanecer la vista en ~100–140 ms.
6. El diálogo toma el foco, lo mantiene dentro y devuelve el foco al botón de origen. Si origen ya no existe, devolverlo a un control seguro del tablero. Respetar `prefers-reduced-motion` eliminando escala/traslación y usando un cambio inmediato o un fundido breve.

La técnica concreta de interpolación puede cambiar si los navegadores soportados o el ciclo de `ReactModal` exigen otro orden de montaje, pero la carta debe arrancar y terminar en los rectángulos medidos y animar principalmente propiedades compuestas.

## Alcance

- Interacción de ampliación para las influencias propias activas.
- Modal accesible, controles de cierre, traducciones ES/EN y transiciones adaptables a movimiento reducido.
- Cierre seguro ante pausa, aparición de una decisión que requiere respuesta o invalidación de la influencia de origen.
- Validación visual en escritorio y móvil.

Fuera de alcance: revelar cartas rivales, permitir abrir cartas ocultas/eliminadas de otros jugadores, modificar reglas/servidor, rediseñar el tablero o incorporar otra biblioteca de animación.

## Criterios de aceptación

1. Solo las cartas propias activas abren la vista; una carta oculta de rival y un espacio inactivo no presentan el control.
2. La apertura parte de la posición y tamaño visibles de la carta y llega al centro sin mover el tablero. El cierre vuelve al origen. Los tiempos iniciales son 210–220 ms al abrir y 160–180 ms al cerrar, con ajuste según la revisión visual.
3. La ilustración conserva proporción, es legible, queda dentro del viewport en escritorio y móvil, y el fondo oscurece el juego sin ocultar la carta.
4. Botón, Escape y clic en el fondo cierran la vista; el foco se contiene y luego regresa a su origen o a un control seguro.
5. Una pausa, una nueva decisión respondible o una influencia de origen invalidada cierra el modal con rapidez y no impide continuar la partida.
6. Hover, foco visible y toque tienen indicaciones adecuadas a su dispositivo. No hay una acción dependiente exclusivamente del mouse.
7. El modo de movimiento reducido elimina desplazamiento y escala.
8. Las etiquetas accesibles están traducidas al español e inglés. No se añade información privada de rivales al DOM ni se altera el protocolo del juego.
9. `cd coup-client && npm run build` pasa y se hace revisión visual manual en escritorio y móvil, incluyendo cierre rápido, teclado, movimiento reducido y decisión/pausa. No se añaden pruebas automatizadas para este ajuste.

## Clasificación y riesgos

- **Ejecución:** `LIGHT`; el cambio es localizado y reversible.
- **Riesgo:** `MEDIUM`; el modal puede cubrir controles durante una partida y requiere coordinación con el foco y decisiones activas.
- **Verificación independiente:** `NONE`, según política predeterminada del proyecto. El Ejecutor presenta evidencia y el Orquestador revisa el resultado antes de integrar.
- **Riesgos concretos:** desajuste del origen al redimensionar/actualizar el tablero, cierre/foco al cambiar el estado del juego, y solapamiento con el modal de pausa o decisiones. Resolverlos con medición al abrir/cerrar, invalidación explícita y orden de capas documentado.

## F1 — Ampliación fluida y segura

**Pregunta única:** ¿puede una influencia propia abrirse y cerrarse mediante una transición continua y rápida, manteniendo legibilidad, privacidad, foco y disponibilidad de decisiones en escritorio y móvil?

- **Entrada:** issue #61, este plan, `PlayerBoard.js`, `PlayerBoardStyles.css`, traducciones, `ReferencePanel.js`/CSS y referencia local `fotos/pantalla.png`.
- **Tareas:** añadir activadores solo a cartas propias activas; montar la vista grande en portal/modal; medir origen/destino y animar entrada/salida; gestionar cierres, foco, pausa/decisión y movimiento reducido; añadir textos ES/EN; hacer build y recorrido visual.
- **Áreas permitidas:** `coup-client/src/components/game/PlayerBoard.js`, `PlayerBoardStyles.css`, componente/estilo localizado para la vista de carta, `coup-client/src/i18n/translations.json` y, si se requiere para estado/foco de la partida, cambios mínimos en `Coup.js`. No cambiar servidor, protocolo o reglas. Evidencia solo en `docs/plans/own-card-zoom/`.
- **Salida/evidencia:** implementación y reporte F1 con build, matriz de escritorio/móvil, transiciones de apertura/cierre, teclado, movimiento reducido y respuesta a pausa/decisión.
- **Avance:** criterios de aceptación cubiertos y pregunta de falsificación respondida con evidencia.
- **Pivote:** si la animación por `transform` pierde precisión en un tamaño, conservar la medición FLIP y ajustar el tamaño final o la técnica, repitiendo los casos afectados.
- **Repetición acotada:** una ronda para corregir tiempos, encuadre o foco con evidencia visual.
- **Bloqueo/cancelación:** bloquear y volver al Orquestador si el modal exige alterar reglas/servidor o interfiere con decisiones de una forma que no se pueda resolver dentro de las áreas permitidas; cancelar solo si el propietario cancela la idea.
- **Política de commit:** `COMMIT_REQUIRED` para F1, incluyendo código, reporte y evento `phase_verdict`.
- **Commit previsto:** `feat(card-zoom): issue 61 F1 CLOSED`.
- **Validación:** build de cliente y revisión manual descrita arriba; no ejecutar ni agregar pruebas automatizadas.

## Pregunta de falsificación

¿Puede una secuencia de aperturas/cierres rápidos, pérdida de la carta, aparición de decisión o pausa, uso de teclado o viewport móvil dejar el modal atascado, perder el foco, exponer una identidad rival o impedir una acción de la partida?

## Historial

- 2026-09-29: intake autorizado; issue #61 abierta en el fork. Se acuerdan alcance inicial solo para cartas propias activas, transición medida desde/hacia el tablero y cierre seguro al cambiar el estado de la partida.
